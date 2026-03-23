package com.reserva.backend.common.security;

import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class CurrentUserProvider {

    static final String SESSION_USER_ID = "AUTH_USER_ID";
    static final String SESSION_USER_NAME = "AUTH_USER_NAME";

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
            if (sessionUserId != null && !sessionUserId.isBlank()) {
                return new CurrentUser(
                        sessionUserId,
                        sessionUserName == null || sessionUserName.isBlank() ? "Guest User" : sessionUserName
                );
            }
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

    private String stringAttribute(HttpSession session, String key) {
        Object value = session.getAttribute(key);
        return value instanceof String stringValue ? stringValue : null;
    }
}
