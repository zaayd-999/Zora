package com.zora.zora.dto.response;

public record ApiResponse<T>(
        T data,
        ApiResponseInfo extras
) {}