package com.oranexus.oranexus.model;

/**
 * A registered server connection. Returned by Query.servers and Mutation.addServer.
 */
public record Server(
        String id,
        String name,
        String host,
        Integer port,
        String serviceName,
        String username
) {
}
