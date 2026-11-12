package com.zora.zora.dto.input;

import com.zora.zora.model.User;

public record AuthPayload(
    String accessToken,
    String refreshToken,
    User user
) {

}
