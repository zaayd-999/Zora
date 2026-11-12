package com.zora.zora.controller;


import com.zora.zora.dto.input.*;
import com.zora.zora.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;
import com.zora.zora.dto.response.ApiResponse;
import com.zora.zora.dto.response.ApiResponseInfo;

@Controller
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @MutationMapping
    public ApiResponse<AuthPayload> register(@Argument @Valid RegisterInput input) {
        return authService.register(input);
    }

    @MutationMapping
    public ApiResponse<AuthPayload> login(@Argument @Valid LoginInput input) {
        return authService.login(input);
    }

    @MutationMapping
    public ApiResponse<Boolean> passwordRecovery(@Argument @Valid PasswordRecoveryInput input) {
        return authService.passwordRecovery(input);
    }

    @MutationMapping
    public ApiResponse<Boolean> verifyResetCode(@Argument @Valid VerifyResetCodeInput input) {
        return authService.verifyResetCode(input);
    }

}