package com.reserva.backend.common.security;

import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
import com.reserva.backend.common.model.UserRole;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CurrentUserProviderTest {

    @AfterEach
    void tearDown() {
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void sessionUserTakesPrecedenceOverHeaderFallback() {
        CurrentUserProvider provider = new CurrentUserProvider(true);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.getSession(true).setAttribute("AUTH_USER_ID", "usr_session");
        request.getSession().setAttribute("AUTH_USER_NAME", "Session User");
        request.getSession().setAttribute("AUTH_USER_ROLE", UserRole.CREATOR);
        request.addHeader("X-User-Id", "usr_header");
        request.addHeader("X-User-Name", "Header User");
        request.addHeader("X-User-Role", "user");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        CurrentUser currentUser = provider.getCurrentUserOrThrow();

        assertThat(currentUser.id()).isEqualTo("usr_session");
        assertThat(currentUser.role()).isEqualTo(UserRole.CREATOR);
    }

    @Test
    void headerFallbackWorksWhenEnabledAndSessionMissing() {
        CurrentUserProvider provider = new CurrentUserProvider(true);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-User-Id", "usr_header");
        request.addHeader("X-User-Name", "Header User");
        request.addHeader("X-User-Role", "creator");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        CurrentUser currentUser = provider.getCurrentUserOrThrow();

        assertThat(currentUser.id()).isEqualTo("usr_header");
        assertThat(currentUser.role()).isEqualTo(UserRole.CREATOR);
    }

    @Test
    void missingSessionAndDisabledHeadersIsUnauthenticated() {
        CurrentUserProvider provider = new CurrentUserProvider(false);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-User-Id", "usr_header");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        assertThatThrownBy(provider::getCurrentUserOrThrow)
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> assertThat(((ApiException) exception).getErrorCode()).isEqualTo(ErrorCode.UNAUTHENTICATED));
    }
}
