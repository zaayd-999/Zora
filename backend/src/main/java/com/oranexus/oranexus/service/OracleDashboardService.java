package com.oranexus.oranexus.service;

import com.oranexus.oranexus.dto.TableColumnInput;
import com.oranexus.oranexus.model.DashboardOverview;
import com.oranexus.oranexus.model.Server;
import com.oranexus.oranexus.model.TableCreationResult;
import com.oranexus.oranexus.model.UserCreationResult;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Properties;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

@Service
public class OracleDashboardService {

    private static final Pattern ORACLE_IDENTIFIER = Pattern.compile("^[A-Za-z][A-Za-z0-9_]{0,29}$");
    private static final Set<String> ALLOWED_COLUMN_TYPES =
            Set.of("NUMBER", "VARCHAR2(255)", "DATE", "TIMESTAMP", "CLOB");
    private final ConcurrentHashMap<String, RegisteredConnection> connections = new ConcurrentHashMap<>();

    public void registerConnection(Server server, String username, String password) {
        connections.put(server.id(), new RegisteredConnection(server, username, password));
    }

    public TableCreationResult createTable(
            String serverId,
            String tableName,
            List<TableColumnInput> columns,
            String adminPassword
    ) throws SQLException {
        String safeTableName = validateIdentifier(tableName, "Table name");
        if (columns == null || columns.isEmpty() || columns.size() > 50) {
            throw new IllegalArgumentException("A table must have between 1 and 50 columns.");
        }

        List<String> definitions = new ArrayList<>();
        Set<String> names = new HashSet<>();
        for (TableColumnInput column : columns) {
            if (column == null) {
                throw new IllegalArgumentException("Table columns cannot be empty.");
            }
            String safeColumnName = validateIdentifier(column.name(), "Column name");
            if (!names.add(safeColumnName)) {
                throw new IllegalArgumentException("Column names must be unique.");
            }
            if (column.dataType() == null || !ALLOWED_COLUMN_TYPES.contains(column.dataType())) {
                throw new IllegalArgumentException("Unsupported Oracle column type.");
            }
            definitions.add(safeColumnName + " " + column.dataType());
        }

        RegisteredConnection registered = requireConnection(serverId);
        String sql = "CREATE TABLE " + safeTableName + " (" + String.join(", ", definitions) + ")";
        try (Connection connection = openAdminConnection(registered, adminPassword);
             Statement statement = connection.createStatement()) {
            statement.setQueryTimeout(10);
            statement.execute(sql);
        }
        return new TableCreationResult(safeTableName, true);
    }

    public UserCreationResult createUser(
            String serverId,
            String username,
            String password,
            String adminPassword
    ) throws SQLException {
        String safeUsername = validateIdentifier(username, "Username");
        if (password == null || password.length() < 12 || password.chars().anyMatch(Character::isISOControl)) {
            throw new IllegalArgumentException("Password must be at least 12 characters and contain no control characters.");
        }

        RegisteredConnection registered = requireConnection(serverId);
        String quotedPassword = "\"" + password.replace("\"", "\"\"") + "\"";
        try (Connection connection = openAdminConnection(registered, adminPassword);
             Statement statement = connection.createStatement()) {
            statement.setQueryTimeout(10);
            statement.execute("CREATE USER " + safeUsername + " IDENTIFIED BY " + quotedPassword);
            try {
                statement.execute("GRANT CREATE SESSION TO " + safeUsername);
                return new UserCreationResult(
                        safeUsername,
                        true,
                        true,
                        "User created with CREATE SESSION privilege only."
                );
            } catch (SQLException exception) {
                String message = exception.getMessage();
                return new UserCreationResult(
                        safeUsername,
                        true,
                        false,
                        "User was created, but CREATE SESSION could not be granted: "
                                + (message == null ? exception.getClass().getSimpleName() : message)
                );
            }
        }
    }

    public DashboardOverview getDashboard(String serverId, String range) throws SQLException {
        RegisteredConnection registered = requireConnection(serverId);

        try (Connection connection = openConnection(registered)) {
            List<DashboardOverview.MetricError> errors = new ArrayList<>();
            DatabaseIdentity identity = readMetric(
                    connection,
                    "database status",
                    errors,
                    this::readDatabaseIdentity,
                    DatabaseIdentity.empty()
            );
            Integer pdbCount = readMetric(connection, "pluggable databases", errors, this::readPdbCount, null);
            Integer activeSessions = readMetric(connection, "active sessions", errors, this::readActiveSessions, null);
            List<DashboardOverview.TablespaceUsage> tablespaces = readMetric(
                    connection,
                    "tablespace usage",
                    errors,
                    this::readTablespaces,
                    List.of()
            );
            Double cpuPercent = readMetric(connection, "CPU utilization", errors, this::readCpuPercent, null);
            Double sgaAllocatedMb = readMetric(connection, "SGA memory", errors, this::readSgaAllocatedMb, null);
            List<DashboardOverview.CpuSample> cpuSamples;
            if ("1h".equals(range)) {
                cpuSamples = readMetric(
                        connection,
                        "CPU history",
                        errors,
                        this::readCpuSamples,
                        List.of()
                );
            } else if ("24h".equals(range) || "7d".equals(range)) {
                cpuSamples = List.of();
                errors.add(new DashboardOverview.MetricError(
                        "CPU history",
                        "Oracle live metric history covers the last hour; longer history is not available from this connection."
                ));
            } else {
                throw new IllegalArgumentException("Unsupported dashboard range. Use 1h, 24h, or 7d.");
            }

            double allocatedMb = tablespaces.stream()
                    .map(DashboardOverview.TablespaceUsage::allocatedMb)
                    .filter(value -> value != null)
                    .mapToDouble(Double::doubleValue)
                    .sum();
            double usedMb = tablespaces.stream()
                    .map(DashboardOverview.TablespaceUsage::usedMb)
                    .filter(value -> value != null)
                    .mapToDouble(Double::doubleValue)
                    .sum();

            return new DashboardOverview(
                    registered.server(),
                    identity.databaseStatus(),
                    identity.instanceStatus(),
                    identity.databaseName(),
                    identity.containerDatabase(),
                    pdbCount,
                    activeSessions,
                    tablespaces.isEmpty() ? null : allocatedMb,
                    tablespaces.isEmpty() ? null : usedMb,
                    cpuPercent,
                    sgaAllocatedMb,
                    tablespaces,
                    cpuSamples,
                    errors
            );
        }
    }

    private Connection openConnection(RegisteredConnection registered) throws SQLException {
        return openConnection(registered, registered.password());
    }

    private Connection openAdminConnection(RegisteredConnection registered, String adminPassword) throws SQLException {
        if (registered.username() == null || registered.username().isBlank()) {
            throw new IllegalArgumentException("The registered Oracle server must include an administrator username.");
        }
        if (adminPassword == null || adminPassword.isBlank()) {
            throw new IllegalArgumentException("Re-enter the Oracle administrator password to authorize this operation.");
        }
        return openConnection(registered, adminPassword);
    }

    private Connection openConnection(RegisteredConnection registered, String password) throws SQLException {
        Server server = registered.server();
        if (server.serviceName() == null || server.serviceName().isBlank()) {
            throw new IllegalArgumentException("An Oracle service name is required to load dashboard information.");
        }

        int port = server.port() == null ? 1521 : server.port();
        if (port < 1 || port > 65535) {
            throw new IllegalArgumentException("Oracle server port must be between 1 and 65535.");
        }

        Properties properties = new Properties();
        if (registered.username() != null && !registered.username().isBlank()) {
            properties.setProperty("user", registered.username());
        }
        if (password != null) {
            properties.setProperty("password", password);
        }
        properties.setProperty("oracle.net.CONNECT_TIMEOUT", "5000");
        properties.setProperty("oracle.jdbc.ReadTimeout", "5000");

        String url = "jdbc:oracle:thin:@//" + server.host() + ":" + port + "/" + server.serviceName();
        return DriverManager.getConnection(url, properties);
    }

    private RegisteredConnection requireConnection(String serverId) {
        RegisteredConnection registered = connections.get(serverId);
        if (registered == null) {
            throw new IllegalArgumentException("Oracle server connection was not found. Add the server again to reconnect.");
        }
        return registered;
    }

    private String validateIdentifier(String value, String label) {
        if (value == null || !ORACLE_IDENTIFIER.matcher(value).matches()) {
            throw new IllegalArgumentException(
                    label + " must start with a letter and contain only letters, numbers, or underscores (up to 30 characters)."
            );
        }
        return value.toUpperCase(Locale.ROOT);
    }

    private DatabaseIdentity readDatabaseIdentity(Statement statement) throws SQLException {
        String sql = """
                SELECT d.open_mode, d.name, d.cdb, i.status
                FROM v$database d CROSS JOIN v$instance i
                """;
        try (ResultSet result = statement.executeQuery(sql)) {
            if (!result.next()) {
                throw new SQLException("Oracle returned no database identity row.");
            }
            return new DatabaseIdentity(
                    result.getString("open_mode"),
                    result.getString("status"),
                    result.getString("name"),
                    "YES".equalsIgnoreCase(result.getString("cdb"))
            );
        }
    }

    private Integer readPdbCount(Statement statement) throws SQLException {
        try (ResultSet result = statement.executeQuery("SELECT COUNT(*) FROM v$pdbs")) {
            return result.next() ? result.getInt(1) : null;
        }
    }

    private Integer readActiveSessions(Statement statement) throws SQLException {
        try (ResultSet result = statement.executeQuery(
                "SELECT COUNT(*) FROM v$session WHERE status = 'ACTIVE' AND type = 'USER'")) {
            return result.next() ? result.getInt(1) : null;
        }
    }

    private List<DashboardOverview.TablespaceUsage> readTablespaces(Statement statement) throws SQLException {
        String sql = """
                SELECT allocated.tablespace_name,
                       allocated.allocated_bytes,
                       allocated.allocated_bytes - NVL(free_space.free_bytes, 0) AS used_bytes
                FROM (
                    SELECT tablespace_name, SUM(bytes) AS allocated_bytes
                    FROM dba_data_files
                    GROUP BY tablespace_name
                ) allocated
                LEFT JOIN (
                    SELECT tablespace_name, SUM(bytes) AS free_bytes
                    FROM dba_free_space
                    GROUP BY tablespace_name
                ) free_space ON free_space.tablespace_name = allocated.tablespace_name
                ORDER BY allocated.tablespace_name
                """;
        List<DashboardOverview.TablespaceUsage> tablespaces = new ArrayList<>();
        try (ResultSet result = statement.executeQuery(sql)) {
            while (result.next()) {
                double allocatedMb = result.getDouble("allocated_bytes") / (1024d * 1024d);
                double usedMb = result.getDouble("used_bytes") / (1024d * 1024d);
                double usagePercent = allocatedMb == 0 ? 0 : usedMb / allocatedMb * 100;
                tablespaces.add(new DashboardOverview.TablespaceUsage(
                        result.getString("tablespace_name"),
                        allocatedMb,
                        usedMb,
                        usagePercent
                ));
            }
        }
        return tablespaces;
    }

    private Double readCpuPercent(Statement statement) throws SQLException {
        String sql = """
                SELECT value
                FROM v$sysmetric
                WHERE metric_name = 'Host CPU Utilization (%)'
                  AND group_id = 2
                  AND ROWNUM = 1
                """;
        try (ResultSet result = statement.executeQuery(sql)) {
            return result.next() ? result.getDouble(1) : null;
        }
    }

    private Double readSgaAllocatedMb(Statement statement) throws SQLException {
        try (ResultSet result = statement.executeQuery("SELECT SUM(value) FROM v$sga")) {
            return result.next() ? result.getDouble(1) / (1024d * 1024d) : null;
        }
    }

    private List<DashboardOverview.CpuSample> readCpuSamples(Statement statement) throws SQLException {
        String sql = """
                SELECT begin_time, value
                FROM v$sysmetric_history
                WHERE metric_name = 'Host CPU Utilization (%)'
                  AND group_id = 2
                  AND begin_time >= SYSDATE - (1 / 24)
                ORDER BY begin_time
                """;
        List<DashboardOverview.CpuSample> samples = new ArrayList<>();
        try (ResultSet result = statement.executeQuery(sql)) {
            while (result.next()) {
                Timestamp timestamp = result.getTimestamp("begin_time");
                if (timestamp != null) {
                    samples.add(new DashboardOverview.CpuSample(timestamp.toInstant().toString(), result.getDouble("value")));
                }
            }
        }
        return samples;
    }

    private <T> T readMetric(
            Connection connection,
            String metric,
            List<DashboardOverview.MetricError> errors,
            SqlMetric<T> reader,
            T unavailableValue
    ) {
        try (Statement statement = connection.createStatement()) {
            statement.setQueryTimeout(5);
            return reader.read(statement);
        } catch (SQLException exception) {
            String message = exception.getMessage();
            errors.add(new DashboardOverview.MetricError(
                    metric,
                    message == null ? exception.getClass().getSimpleName() : message
            ));
            return unavailableValue;
        }
    }

    @FunctionalInterface
    private interface SqlMetric<T> {
        T read(Statement statement) throws SQLException;
    }

    private record RegisteredConnection(Server server, String username, String password) {
    }

    private record DatabaseIdentity(
            String databaseStatus,
            String instanceStatus,
            String databaseName,
            Boolean containerDatabase
    ) {
        private static DatabaseIdentity empty() {
            return new DatabaseIdentity(null, null, null, null);
        }
    }
}
