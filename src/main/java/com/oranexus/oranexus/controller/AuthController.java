package com.oranexus.oranexus.controller;

import com.oranexus.oranexus.dto.AuthPayload;
import com.oranexus.oranexus.dto.LoginInput;
import com.oranexus.oranexus.dto.RegisterInput;

import com.oranexus.oranexus.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@Controller
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @MutationMapping
    public AuthPayload register(@Argument @Valid RegisterInput input) {
        return authService.register(input);
    }

    @MutationMapping
    public AuthPayload login(@Argument @Valid LoginInput input) {
        return authService.login(input);
    }
}
