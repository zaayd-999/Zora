package com.oranexus.oranexus.dto;

/**
 * Input for the addServer mutation. Mapped automatically from the graphql
 * input type ServerInput; the password field intentionally lives here only,
 * it is never part of the Server type returned to clients.
 */
public record ServerInput(
        String name,
        String host,
        Integer port,
        String serviceName,
        String username,
        String password
) {
}
