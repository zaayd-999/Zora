package com.zora.zora.exception;

import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import graphql.schema.DataFetchingEnvironment;

import org.springframework.graphql.execution.DataFetcherExceptionResolverAdapter;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.stereotype.Component;

import jakarta.validation.ConstraintViolationException;

import java.util.Map;

@Component
public class GraphQLExceptionHandler
        extends DataFetcherExceptionResolverAdapter {

    @Override
    protected GraphQLError resolveToSingleError(
            Throwable ex,
            DataFetchingEnvironment env) {

        if (ex instanceof ApiException apiException) {
            return GraphqlErrorBuilder.newError(env)
                    .message(apiException.getMessage())
                    .errorType(apiException.getErrorType())
                    .extensions(Map.of(
                            "code", apiException.getCode()
                    ))
                    .build();
        }

        if (ex instanceof ConstraintViolationException) {
            return GraphqlErrorBuilder.newError(env)
                    .message("Required fields are missing or invalid.")
                    .errorType(ErrorType.BAD_REQUEST)
                    .extensions(Map.of(
                            "code", "MISSING_REQUIRED_FIELD"
                    ))
                    .build();
        }

        return GraphqlErrorBuilder.newError(env)
                .message("An unexpected error occurred.")
                .errorType(ErrorType.INTERNAL_ERROR)
                .extensions(Map.of(
                        "code", "INTERNAL_SERVER_ERROR"
                ))
                .build();
    }
}