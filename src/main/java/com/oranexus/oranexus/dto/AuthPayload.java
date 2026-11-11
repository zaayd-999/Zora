package com.oranexus.oranexus.dto;

import com.oranexus.oranexus.model.User;

public record AuthPayload(
    String accessToken,
    String refreshToken,
    User user
) {

}
