package com.zora.zora.dto.input;

import java.time.LocalDateTime;

public record User(
        Long id,
        String username,
        String email,
        LocalDateTime createdAt
) {}