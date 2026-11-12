package com.zora.zora.exception;
import org.springframework.graphql.execution.ErrorType;

public class ApiException extends RuntimeException {

    private final String code;
    private final ErrorType errorType;

    public ApiException(String message, String code, ErrorType errorType) {
        super(message);
        this.code = code;
        this.errorType = errorType;
    }

    public String getCode() {
        return code;
    }

    public ErrorType getErrorType() {
        return errorType;
    }
}
