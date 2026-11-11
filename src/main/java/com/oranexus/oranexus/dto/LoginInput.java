package com.oranexus.oranexus.dto;

import jakarta.validation.constraints.NotBlank;
public record LoginInput(
        @NotBlank String usernameOrEmail,
        @NotBlank String password
) {
}
