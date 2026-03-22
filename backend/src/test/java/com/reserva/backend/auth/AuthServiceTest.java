package com.reserva.backend.auth;

import com.reserva.backend.auth.api.CurrentUserResponse;
import com.reserva.backend.auth.api.LoginRequest;
import com.reserva.backend.auth.api.LoginResponse;
import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
import com.reserva.backend.common.model.UserRole;
import com.reserva.backend.common.security.CurrentUser;
import com.reserva.backend.common.security.CurrentUserProvider;
import com.reserva.backend.user.UserEntity;
import com.reserva.backend.user.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @Mock
    private PasswordEncoder passwordEncoder;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, currentUserProvider, passwordEncoder);
    }

    @Test
    void loginStoresSessionAndReturnsCurrentUser() {
        UserEntity user = user("usr_123", "alex@example.com", "Alex Johnson", UserRole.USER, "encoded");
        MockHttpServletRequest request = new MockHttpServletRequest();

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("dev-password", "encoded")).thenReturn(true);

        LoginResponse response = authService.login(new LoginRequest("alex@example.com", "dev-password"), request);

        assertThat(response.user().email()).isEqualTo("alex@example.com");
        HttpSession session = request.getSession(false);
        assertThat(session).isNotNull();
        assertThat(session.getAttribute("AUTH_USER_ID")).isEqualTo("usr_123");
        assertThat(session.getAttribute("AUTH_USER_NAME")).isEqualTo("Alex Johnson");
        assertThat(session.getAttribute("AUTH_USER_ROLE")).isEqualTo(UserRole.USER);
    }

    @Test
    void loginRejectsInvalidCredentials() {
        UserEntity user = user("usr_123", "alex@example.com", "Alex Johnson", UserRole.USER, "encoded");

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "encoded")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequest("alex@example.com", "wrong-password"), new MockHttpServletRequest()))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> {
                    ApiException apiException = (ApiException) exception;
                    assertThat(apiException.getErrorCode()).isEqualTo(ErrorCode.UNAUTHENTICATED);
                    assertThat(apiException.getHttpStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
                });
    }

    @Test
    void getCurrentUserLoadsEmailFromPersistence() {
        when(currentUserProvider.getCurrentUserOrThrow()).thenReturn(new CurrentUser("usr_123", "Alex Johnson", UserRole.USER));
        when(userRepository.findById("usr_123")).thenReturn(Optional.of(user("usr_123", "alex@example.com", "Alex Johnson", UserRole.USER, "encoded")));

        CurrentUserResponse response = authService.getCurrentUser();

        assertThat(response.email()).isEqualTo("alex@example.com");
        assertThat(response.role()).isEqualTo("user");
    }

    @Test
    void logoutInvalidatesExistingSession() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        HttpSession session = request.getSession(true);
        assertThat(session).isNotNull();

        authService.logout(request);

        assertThat(request.getSession(false)).isNull();
    }

    private UserEntity user(String id, String email, String displayName, UserRole role, String passwordHash) {
        UserEntity user = new UserEntity();
        ReflectionTestUtils.setField(user, "id", id);
        ReflectionTestUtils.setField(user, "email", email);
        ReflectionTestUtils.setField(user, "displayName", displayName);
        ReflectionTestUtils.setField(user, "role", role);
        ReflectionTestUtils.setField(user, "passwordHash", passwordHash);
        return user;
    }
}
