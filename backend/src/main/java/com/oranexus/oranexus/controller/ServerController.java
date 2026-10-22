package com.oranexus.oranexus.controller;

import com.oranexus.oranexus.dto.ServerInput;
import com.oranexus.oranexus.model.Server;
import com.oranexus.oranexus.model.ServerStatus;
import com.oranexus.oranexus.service.ConnectivityService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

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

    public ServerController(ConnectivityService connectivityService) {
        this.connectivityService = connectivityService;
    }

    @QueryMapping
    public List<Server> servers() {
        return List.copyOf(servers);
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
        return server;
    }

    @SchemaMapping(typeName = "Server")
    public ServerStatus status(Server server) {
        return connectivityService.testConnection(server.host(), server.port())
                ? ServerStatus.CONNECTED
                : ServerStatus.NOT_CONNECTED;
    }
}
