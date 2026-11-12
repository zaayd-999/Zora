package com.zora.zora.dto.input;

import jakarta.validation.constraints.NotBlank;
public record LoginInput(
        @NotBlank String usernameOrEmail,
        @NotBlank String password
) {
}
