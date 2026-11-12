package com.zora.zora.dto.input;

import jakarta.validation.constraints.NotBlank;
public record PasswordRecoveryInput(
        @NotBlank String usernameOrEmail
) {
}