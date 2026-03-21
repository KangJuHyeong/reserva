package com.reserva.backend.common.security;

import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
import com.reserva.backend.common.model.UserRole;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class CurrentUserProvider {

    public CurrentUser getCurrentUserOrThrow() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            throw unauthenticated();
        }

        HttpServletRequest request = attributes.getRequest();
        String userId = request.getHeader("X-User-Id");
        if (userId == null || userId.isBlank()) {
            throw unauthenticated();
        }

        String userName = request.getHeader("X-User-Name");
        String roleHeader = request.getHeader("X-User-Role");
        UserRole role = "creator".equalsIgnoreCase(roleHeader) ? UserRole.CREATOR : UserRole.USER;

        return new CurrentUser(userId, userName == null || userName.isBlank() ? "Guest User" : userName, role);
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
