package com.zora.zora.dto.input;

import com.zora.zora.model.User;

public record LoginAuthPayload(
        User user
) {

}
