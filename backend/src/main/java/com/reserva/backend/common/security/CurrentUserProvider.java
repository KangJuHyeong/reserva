package com.reserva.backend.common.security;

import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
import com.reserva.backend.common.model.UserRole;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class CurrentUserProvider {

    static final String SESSION_USER_ID = "AUTH_USER_ID";
    static final String SESSION_USER_NAME = "AUTH_USER_NAME";
    static final String SESSION_USER_ROLE = "AUTH_USER_ROLE";

    private final boolean devAuthHeadersEnabled;

    public CurrentUserProvider(@Value("${app.dev.auth-headers-enabled:true}") boolean devAuthHeadersEnabled) {
        this.devAuthHeadersEnabled = devAuthHeadersEnabled;
    }

    public CurrentUser getCurrentUserOrThrow() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            throw unauthenticated();
        }

        HttpServletRequest request = attributes.getRequest();
        HttpSession session = request.getSession(false);
        if (session != null) {
            String sessionUserId = stringAttribute(session, SESSION_USER_ID);
            String sessionUserName = stringAttribute(session, SESSION_USER_NAME);
            UserRole sessionUserRole = roleAttribute(session, SESSION_USER_ROLE);
            if (sessionUserId != null && !sessionUserId.isBlank() && sessionUserRole != null) {
                return new CurrentUser(
                        sessionUserId,
                        sessionUserName == null || sessionUserName.isBlank() ? "Guest User" : sessionUserName,
                        sessionUserRole
                );
            }
        }

        if (!devAuthHeadersEnabled) {
            throw unauthenticated();
        }

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

    private String stringAttribute(HttpSession session, String key) {
        Object value = session.getAttribute(key);
        return value instanceof String stringValue ? stringValue : null;
    }

    private UserRole roleAttribute(HttpSession session, String key) {
        Object value = session.getAttribute(key);
        return value instanceof UserRole userRole ? userRole : null;
    }
}
