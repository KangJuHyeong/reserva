package com.reserva.backend.common.security;

import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
import com.reserva.backend.auth.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class CurrentUserProvider {

    private final JwtService jwtService;

    public CurrentUserProvider(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    public CurrentUser getCurrentUserOrThrow() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            throw unauthenticated();
        }

        HttpServletRequest request = attributes.getRequest();
        String authorizationHeader = request.getHeader("Authorization");
        if (StringUtils.hasText(authorizationHeader) && authorizationHeader.startsWith("Bearer ")) {
            return jwtService.parseCurrentUser(authorizationHeader.substring(7));
        }
        throw unauthenticated();
    }

    public CurrentUser getCurrentUserOrNull() {
        try {
            return getCurrentUserOrThrow();
        } catch (ApiException exception) {
            return null;
        }
    }

    private ApiException unauthenticated() {
        return new ApiException(ErrorCode.UNAUTHENTICATED, HttpStatus.UNAUTHORIZED, "Authentication is required.");
    }
}
