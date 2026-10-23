package com.oranexus.oranexus.model;

public record UserCreationResult(
        String username,
        boolean created,
        boolean sessionAccessGranted,
        String message
) {
}
