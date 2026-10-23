package com.oranexus.oranexus.controller;

import com.oranexus.oranexus.dto.ServerInput;
import com.oranexus.oranexus.dto.TableColumnInput;
import com.oranexus.oranexus.model.DashboardOverview;
import com.oranexus.oranexus.model.Server;
import com.oranexus.oranexus.model.ServerStatus;
import com.oranexus.oranexus.model.TableCreationResult;
import com.oranexus.oranexus.model.UserCreationResult;
import com.oranexus.oranexus.service.ConnectivityService;
import com.oranexus.oranexus.service.OracleDashboardService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.sql.SQLException;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

@Controller
public class ServerController {

    /**
     * In-memory store for now – replace with a repository-backed
     * implementation later.
     */
    private final List<Server> servers = new CopyOnWriteArrayList<>();
    private final ConnectivityService connectivityService;
    private final OracleDashboardService dashboardService;

    public ServerController(
            ConnectivityService connectivityService,
            OracleDashboardService dashboardService
    ) {
        this.connectivityService = connectivityService;
        this.dashboardService = dashboardService;
    }

    @QueryMapping
    public List<Server> servers() {
        return List.copyOf(servers);
    }

    @QueryMapping
    public DashboardOverview dashboard(@Argument String serverId, @Argument String range) throws SQLException {
        return dashboardService.getDashboard(serverId, range == null ? "1h" : range);
    }

    @MutationMapping
    public Server addServer(@Argument ServerInput input) {
        if (input.name() == null || input.name().isBlank()) {
            throw new IllegalArgumentException("Server name is required");
        }
        if (input.host() == null || input.host().isBlank()) {
            throw new IllegalArgumentException("Server host is required");
        }

        Server server = new Server(
                UUID.randomUUID().toString(),
                input.name(),
                input.host(),
                input.port(),
                input.serviceName(),
                input.username()
        );
        servers.add(server);
        dashboardService.registerConnection(server, input.username(), input.password());
        return server;
    }

    @MutationMapping
    public TableCreationResult createOracleTable(
            @Argument String serverId,
            @Argument String tableName,
            @Argument List<TableColumnInput> columns,
            @Argument String adminPassword
    ) throws SQLException {
        return dashboardService.createTable(serverId, tableName, columns, adminPassword);
    }

    @MutationMapping
    public UserCreationResult createOracleUser(
            @Argument String serverId,
            @Argument String username,
            @Argument String password,
            @Argument String adminPassword
    ) throws SQLException {
        return dashboardService.createUser(serverId, username, password, adminPassword);
    }

    @SchemaMapping(typeName = "Server")
    public ServerStatus status(Server server) {
        return connectivityService.testConnection(server.host(), server.port())
                ? ServerStatus.CONNECTED
                : ServerStatus.NOT_CONNECTED;
    }
}
