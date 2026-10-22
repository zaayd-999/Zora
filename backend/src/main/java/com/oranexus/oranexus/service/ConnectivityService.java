package com.oranexus.oranexus.service;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Socket;

/**
 * Checks whether a TCP connection can be established with a given host/port.
 * Used by the GraphQL Server.status field to report Connected / Not connected.
 */
@Service
public class ConnectivityService {

    private static final int DEFAULT_ORACLE_PORT = 1521;
    private static final int CONNECT_TIMEOUT_MS = 1500;

    public boolean testConnection(String host, Integer port) {
        String target = (host == null || host.isBlank()) ? "localhost" : host.trim();
        int targetPort = (port == null || port <= 0) ? DEFAULT_ORACLE_PORT : port;

        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(target, targetPort), CONNECT_TIMEOUT_MS);
            return socket.isConnected();
        } catch (IOException | IllegalArgumentException exception) {
            return false;
        }
    }
}
