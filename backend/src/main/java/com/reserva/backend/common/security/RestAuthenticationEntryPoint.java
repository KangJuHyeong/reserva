package com.reserva.backend.common.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reserva.backend.common.api.ApiErrorResponse;
import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public RestAuthenticationEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException, ServletException {
        Object attribute = request.getAttribute("security.authentication.exception");
        ApiException apiException = attribute instanceof ApiException exception
                ? exception
                : new ApiException(ErrorCode.UNAUTHENTICATED, HttpStatus.UNAUTHORIZED, "Authentication is required.");

        response.setStatus(apiException.getHttpStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), new ApiErrorResponse(apiException.getErrorCode(), apiException.getMessage()));
    }
}
