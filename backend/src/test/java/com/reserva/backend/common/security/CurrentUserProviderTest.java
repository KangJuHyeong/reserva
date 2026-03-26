package com.reserva.backend.common.security;

import com.reserva.backend.auth.JwtService;
import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CurrentUserProviderTest {

    @AfterEach
    void tearDown() {
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void bearerUserIsReturnedFromAuthorizationHeader() {
        JwtService jwtService = mock(JwtService.class);
        CurrentUserProvider provider = new CurrentUserProvider(jwtService);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer jwt-token");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
        when(jwtService.parseCurrentUser("jwt-token")).thenReturn(new CurrentUser("usr_jwt", "JWT User"));

        CurrentUser currentUser = provider.getCurrentUserOrThrow();

        assertThat(currentUser.id()).isEqualTo("usr_jwt");
        assertThat(currentUser.name()).isEqualTo("JWT User");
    }

    @Test
    void getCurrentUserOrNullReturnsNullWhenAuthorizationHeaderIsMissing() {
        JwtService jwtService = mock(JwtService.class);
        CurrentUserProvider provider = new CurrentUserProvider(jwtService);
        MockHttpServletRequest request = new MockHttpServletRequest();
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        assertThat(provider.getCurrentUserOrNull()).isNull();
    }

    @Test
    void missingBearerTokenIsUnauthenticated() {
        JwtService jwtService = mock(JwtService.class);
        CurrentUserProvider provider = new CurrentUserProvider(jwtService);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-User-Id", "usr_header");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        assertThatThrownBy(provider::getCurrentUserOrThrow)
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> assertThat(((ApiException) exception).getErrorCode()).isEqualTo(ErrorCode.UNAUTHENTICATED));
    }
}
