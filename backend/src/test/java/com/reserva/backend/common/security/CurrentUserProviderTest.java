package com.reserva.backend.common.security;

import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
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
        request.addHeader("X-User-Id", "usr_header");
        request.addHeader("X-User-Name", "Header User");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        CurrentUser currentUser = provider.getCurrentUserOrThrow();

        assertThat(currentUser.id()).isEqualTo("usr_session");
        assertThat(currentUser.name()).isEqualTo("Session User");
    }

    @Test
    void headerFallbackWorksWhenEnabledAndSessionMissing() {
        CurrentUserProvider provider = new CurrentUserProvider(true);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-User-Id", "usr_header");
        request.addHeader("X-User-Name", "Header User");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        CurrentUser currentUser = provider.getCurrentUserOrThrow();

        assertThat(currentUser.id()).isEqualTo("usr_header");
        assertThat(currentUser.name()).isEqualTo("Header User");
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
