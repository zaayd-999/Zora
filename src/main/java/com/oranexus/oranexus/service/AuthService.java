package com.oranexus.oranexus.service;

import com.oranexus.oranexus.dto.AuthPayload;
import com.oranexus.oranexus.dto.LoginInput;
import com.oranexus.oranexus.dto.RegisterInput;
import com.oranexus.oranexus.model.User;
import com.oranexus.oranexus.repository.UserRepository;
import io.jsonwebtoken.security.Message;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.NoSuchAlgorithmException;
import java.security.MessageDigest;
import java.time.OffsetDateTime;
import java.util.HexFormat;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthPayload register(RegisterInput input) {
        String username = input.username().trim();
        String email = input.email().trim().toLowerCase();

        if(userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username is already in use");
        }

        if((userRepository.existsByEmail(email))) {
            throw new IllegalArgumentException("Email is already in use");
        }

        OffsetDateTime now = OffsetDateTime.now();
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(input.password()));
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        user = userRepository.save(user);

        return issueTokens(user);
    }

    public AuthPayload login(LoginInput input) {
        String identifier = input.usernameOrEmail().trim();

        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier.toLowerCase()))
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if(!passwordEncoder.matches(input.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        return issueTokens(user);
    }

    private AuthPayload issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        user.setRefreshTokenHash(sha256(refreshToken));
        user.setUpdatedAt(OffsetDateTime.now());
        userRepository.save(user);

        return new AuthPayload(accessToken, refreshToken, user);
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
