package com.zora.zora.service;

import com.zora.zora.dto.input.AuthPayload;
import com.zora.zora.dto.input.LoginInput;
import com.zora.zora.dto.input.PasswordRecoveryInput;
import com.zora.zora.dto.input.RegisterInput;
import com.zora.zora.dto.input.VerifyResetCodeInput;
import com.zora.zora.exception.ApiException;
import com.zora.zora.model.PasswordRecoveryCodes;
import com.zora.zora.model.User;
import com.zora.zora.repository.PasswordRecoveryCodesRepository;
import com.zora.zora.repository.UserRepository;
import com.zora.zora.util.RecoveryCodeUtils;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.zora.zora.dto.response.ApiResponse;
import com.zora.zora.dto.response.ApiResponseInfo;

import java.nio.charset.StandardCharsets;
import java.security.NoSuchAlgorithmException;
import java.security.MessageDigest;
import java.time.OffsetDateTime;
import java.util.HexFormat;


@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordRecoveryCodesRepository passwordRecoveryCodesRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final MailService mailService = MailService.getInstance();

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, PasswordRecoveryCodesRepository passwordRecoveryCodesRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.passwordRecoveryCodesRepository = passwordRecoveryCodesRepository;
    }

    public ApiResponse<AuthPayload> register(RegisterInput input) {
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

        MailService.getInstance().sendWelcomeMessage(user.getEmail(), user.getUsername());

        AuthPayload authPayload = issueTokens(user);

        return new ApiResponse<>(
                authPayload,
                new ApiResponseInfo(
                        "Register successful",
                        "AUTH_REGISTER_SUCCESS"
                )
        );
    }

    public ApiResponse<AuthPayload> login(LoginInput input) {
        String identifier = input.usernameOrEmail().trim();

        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier.toLowerCase()))
                .orElseThrow(() -> new ApiException("User not found.","USER_NOT_FOUND", ErrorType.NOT_FOUND));

        if(!passwordEncoder.matches(input.password(), user.getPasswordHash())) {
            throw new ApiException("Invalid credentials","INVALID_CREDENTIALS",ErrorType.BAD_REQUEST);
        }

        AuthPayload authPayload = issueTokens(user);

        return new ApiResponse<>(
                authPayload,
                new ApiResponseInfo(
                        "Login successful",
                        "AUTH_LOGIN_SUCCESS"
                )
        );
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



    public ApiResponse<Boolean> passwordRecovery(PasswordRecoveryInput input) {
        String identifier = input.usernameOrEmail().trim();
        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier.toLowerCase()))
                .orElseThrow(() -> new ApiException("User not found.","USER_NOT_FOUND", ErrorType.NOT_FOUND));
        OffsetDateTime now = OffsetDateTime.now();
        boolean cooldownActive = passwordRecoveryCodesRepository.existsByUserIdAndIssuedAtAfter(user.getId(), now.minusSeconds(60));
        if(cooldownActive) return new ApiResponse<>(
                false,
                new ApiResponseInfo(
                        "Please wait before requesting another recovery code.",
                        "PASSWORD_RECOVERY_COOLDOWN"
                )
        );
        String code = RecoveryCodeUtils.generateCode();
        String hash = RecoveryCodeUtils.hashCode(code);
        PasswordRecoveryCodes passwordRecoveryCodes = new PasswordRecoveryCodes();
        passwordRecoveryCodes.setUserId(user.getId());
        passwordRecoveryCodes.setCodeHash(hash);
        passwordRecoveryCodes.setIssuedAt(now);
        passwordRecoveryCodes.setExpiresAt(now.plusMinutes(15));
        passwordRecoveryCodes = passwordRecoveryCodesRepository.save(passwordRecoveryCodes);
        MailService.getInstance().sendRecoveryCode(user.getEmail(),code);
        return new ApiResponse<Boolean>(
                true,
                new ApiResponseInfo(
                        "Password recovery email sent successfully",
                        "PASSWORD_RECOVERY_SUCCESS"
                )
        );
    }

    public ApiResponse<Boolean> verifyResetCode(VerifyResetCodeInput input) {
        String identifier = input.usernameOrEmail().trim();
        User user = userRepository.findByEmail(identifier.toLowerCase())
                .or(() -> userRepository.findByUsername(identifier))
                .orElseThrow(() -> new ApiException("User not found.","USER_NOT_FOUND", ErrorType.NOT_FOUND));
        PasswordRecoveryCodes passwordRecoveryCodes = passwordRecoveryCodesRepository.findFirstByUserIdAndUsedAtIsNullAndExpiresAtAfterOrderByIssuedAtDesc(user.getId(), OffsetDateTime.now())
                .orElseThrow(() -> new ApiException("Invalid or expired recovery code.","INVALID_OR_EXPIRED_CODE", ErrorType.BAD_REQUEST));
        if(!RecoveryCodeUtils.verifyCode(input.code(), passwordRecoveryCodes.getCodeHash())) throw  new ApiException("Invalid or expired recovery code.","INVALID_OR_EXPIRED_CODE", ErrorType.BAD_REQUEST);
        passwordRecoveryCodes.setVerifiedAt(OffsetDateTime.now());
        passwordRecoveryCodes = passwordRecoveryCodesRepository.save(passwordRecoveryCodes);
        return new ApiResponse<Boolean>(
                true,
                new ApiResponseInfo(
                        "Verify code successful",
                        "VERIFY_CODE_SUCCESS")
        );
    }
}
