
package com.zora.zora.connector;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.List;

public class OracleDatabaseManager
        implements DatabaseConnector<QueryResult, QueryResults> {

    private final String host;
    private final int port;
    private final String serviceName;
    private final String username;
    private final String password;

    private Connection connection;

    public OracleDatabaseManager(
            String host,
            int port,
            String serviceName,
            String username,
            String password) {
        this.host = host;
        this.port = port;
        this.serviceName = serviceName;
        this.username = username;
        this.password = password;
    }

    @Override
    public void connect() {
        try {
            if (connection != null && !connection.isClosed()) {
                return;
            }

            String url = "jdbc:oracle:thin:@//"
                    + host + ":" + port + "/" + serviceName;

            connection = DriverManager.getConnection(
                    url, username, password);

        } catch (SQLException e) {
            throw new RuntimeException(
                    "Oracle connection failed: " + e.getMessage(), e);
        }
    }

    @Override
    public QueryResults query(String sql, Object... params) {
        ensureConnected();

        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            bind(ps, params);

            try (ResultSet rs = ps.executeQuery()) {
                QueryResults rows = new QueryResults();
                ResultSetMetaData meta = rs.getMetaData();

                while (rs.next()) {
                    QueryResult row = new QueryResult();

                    for (int i = 1; i <= meta.getColumnCount(); i++) {
                        row.put(meta.getColumnLabel(i), rs.getObject(i));
                    }

                    rows.add(row);
                }

                return rows;
            }
        } catch (SQLException e) {
            throw new RuntimeException(
                    "Oracle query failed: " + e.getMessage(), e);
        }
    }

    @Override
    public QueryResults query(String sql, List<Object> params) {
        return query(sql, params.toArray());
    }

    @Override
    public QueryResult fetchOne(String sql, Object... params) {
        QueryResults rows = query(sql, params);
        return rows.isEmpty() ? null : rows.get(0);
    }

    @Override
    public QueryResult fetchOne(String sql, List<Object> params) {
        return fetchOne(sql, params.toArray());
    }

    @Override
    public int execute(String sql, Object... params) {
        ensureConnected();

        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            bind(ps, params);
            return ps.executeUpdate();

        } catch (SQLException e) {
            throw new RuntimeException(
                    "Oracle execute failed: " + e.getMessage(), e);
        }
    }

    @Override
    public int execute(String sql, List<Object> params) {
        return execute(sql, params.toArray());
    }

    @Override
    public void disconnect() {
        try {
            if (connection != null && !connection.isClosed()) {
                connection.close();
            }
        } catch (SQLException e) {
            throw new RuntimeException(
                    "Oracle disconnect failed: " + e.getMessage(), e);
        }
    }

    private void bind(PreparedStatement ps, Object... params)
            throws SQLException {
        for (int i = 0; i < params.length; i++) {
            ps.setObject(i + 1, params[i]);
        }
    }

    private void ensureConnected() {
        try {
            if (connection == null || connection.isClosed()) {
                connect();
            }
        } catch (SQLException e) {
            throw new RuntimeException(
                    "Unable to check Oracle connection", e);
        }
    }
}
