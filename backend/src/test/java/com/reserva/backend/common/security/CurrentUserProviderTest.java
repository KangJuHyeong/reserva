package com.reserva.backend.common.security;

import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestContextHolder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CurrentUserProviderTest {

    @org.junit.jupiter.api.AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void currentUserIsReturnedFromSecurityContext() {
        CurrentUserProvider provider = new CurrentUserProvider();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        new CurrentUser("usr_jwt", "JWT User"),
                        "jwt-token",
                        List.of(new SimpleGrantedAuthority("ROLE_USER"))
                )
        );

        CurrentUser currentUser = provider.getCurrentUserOrThrow();

        assertThat(currentUser.id()).isEqualTo("usr_jwt");
        assertThat(currentUser.name()).isEqualTo("JWT User");
    }

    @Test
    void getCurrentUserOrNullReturnsNullWhenAuthenticationIsMissing() {
        CurrentUserProvider provider = new CurrentUserProvider();

        assertThat(provider.getCurrentUserOrNull()).isNull();
    }

    @Test
    void anonymousAuthenticationIsUnauthenticated() {
        CurrentUserProvider provider = new CurrentUserProvider();
        SecurityContextHolder.getContext().setAuthentication(
                new AnonymousAuthenticationToken("key", "anonymousUser", List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS")))
        );

        assertThatThrownBy(provider::getCurrentUserOrThrow)
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> assertThat(((ApiException) exception).getErrorCode()).isEqualTo(ErrorCode.UNAUTHENTICATED));
    }
}
