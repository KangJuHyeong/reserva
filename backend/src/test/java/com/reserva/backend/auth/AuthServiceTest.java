package com.reserva.backend.auth;

import com.reserva.backend.auth.api.CurrentUserResponse;
import com.reserva.backend.auth.api.LoginRequest;
import com.reserva.backend.auth.api.LoginResponse;
import com.reserva.backend.auth.api.SignupRequest;
import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
import com.reserva.backend.common.model.UserRole;
import com.reserva.backend.common.security.CurrentUser;
import com.reserva.backend.common.security.CurrentUserProvider;
import com.reserva.backend.user.UserEntity;
import com.reserva.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private GoogleOAuthClient googleOAuthClient;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, currentUserProvider, passwordEncoder, jwtService, googleOAuthClient);
    }

    @Test
    void loginReturnsJwtAndCurrentUser() {
        UserEntity user = user("usr_123", "alex@example.com", "Alex Johnson", UserRole.USER, "encoded");

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("dev-password", "encoded")).thenReturn(true);
        when(jwtService.issueToken("usr_123", "Alex Johnson")).thenReturn("jwt-token");

        LoginResponse response = authService.login(new LoginRequest("alex@example.com", "dev-password"));

        assertThat(response.accessToken()).isEqualTo("jwt-token");
        assertThat(response.user().email()).isEqualTo("alex@example.com");
    }

    @Test
    void loginRejectsInvalidCredentials() {
        UserEntity user = user("usr_123", "alex@example.com", "Alex Johnson", UserRole.USER, "encoded");

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "encoded")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequest("alex@example.com", "wrong-password")))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> {
                    ApiException apiException = (ApiException) exception;
                    assertThat(apiException.getErrorCode()).isEqualTo(ErrorCode.UNAUTHENTICATED);
                    assertThat(apiException.getHttpStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
                });
    }

    @Test
    void signupCreatesUserAndReturnsJwt() {
        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("safe-password")).thenReturn("encoded-password");
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtService.issueToken(any(String.class), org.mockito.ArgumentMatchers.eq("New User"))).thenReturn("jwt-token");

        LoginResponse response = authService.signup(new SignupRequest("New User", "new@example.com", "safe-password"));

        assertThat(response.accessToken()).isEqualTo("jwt-token");
        assertThat(response.user().email()).isEqualTo("new@example.com");
        verify(userRepository).save(any(UserEntity.class));
    }

    @Test
    void signupRejectsDuplicateEmail() {
        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user("usr_123", "alex@example.com", "Alex Johnson", UserRole.USER, "encoded")));

        assertThatThrownBy(() -> authService.signup(new SignupRequest("Alex Johnson", "alex@example.com", "safe-password")))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> {
                    ApiException apiException = (ApiException) exception;
                    assertThat(apiException.getErrorCode()).isEqualTo(ErrorCode.EMAIL_ALREADY_IN_USE);
                    assertThat(apiException.getHttpStatus()).isEqualTo(HttpStatus.CONFLICT);
                });
    }

    @Test
    void getCurrentUserLoadsEmailFromPersistence() {
        when(currentUserProvider.getCurrentUserOrThrow()).thenReturn(new CurrentUser("usr_123", "Alex Johnson"));
        when(userRepository.findById("usr_123")).thenReturn(Optional.of(user("usr_123", "alex@example.com", "Alex Johnson", UserRole.USER, "encoded")));

        CurrentUserResponse response = authService.getCurrentUser();

        assertThat(response.email()).isEqualTo("alex@example.com");
        assertThat(response.name()).isEqualTo("Alex Johnson");
    }

    @Test
    void exchangeGoogleCodeLinksExistingUserAndReturnsJwt() {
        UserEntity user = user("usr_123", "alex@example.com", "Alex Johnson", UserRole.USER, "encoded");

        when(googleOAuthClient.exchangeCode("google-code", "http://localhost:3000/auth/callback/google"))
                .thenReturn(new GoogleOAuthClient.GoogleUserProfile("google-subject", "alex@example.com", "Alex Johnson", "https://example.com/profile.jpg"));
        when(userRepository.findByGoogleSubject("google-subject")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);
        when(jwtService.issueToken("usr_123", "Alex Johnson")).thenReturn("jwt-token");

        LoginResponse response = authService.exchangeGoogleCode("google-code", "http://localhost:3000/auth/callback/google");

        assertThat(response.accessToken()).isEqualTo("jwt-token");
        assertThat(user.getGoogleSubject()).isEqualTo("google-subject");
        verify(userRepository).save(user);
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
