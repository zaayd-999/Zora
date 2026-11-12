package com.zora.zora.dto.input;

import jakarta.validation.constraints.NotBlank;
public record VerifyResetCodeInput(
        @NotBlank String usernameOrEmail,
        @NotBlank String code
) {
}
