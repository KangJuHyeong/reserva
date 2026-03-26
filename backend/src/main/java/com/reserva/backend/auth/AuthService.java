package com.reserva.backend.auth;

import com.reserva.backend.auth.api.CurrentUserResponse;
import com.reserva.backend.auth.api.LoginRequest;
import com.reserva.backend.auth.api.LoginResponse;
import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
import com.reserva.backend.common.security.CurrentUser;
import com.reserva.backend.common.security.CurrentUserProvider;
import com.reserva.backend.common.model.UserRole;
import com.reserva.backend.user.UserEntity;
import com.reserva.backend.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CurrentUserProvider currentUserProvider;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final GoogleOAuthClient googleOAuthClient;

    public AuthService(UserRepository userRepository,
                       CurrentUserProvider currentUserProvider,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       GoogleOAuthClient googleOAuthClient) {
        this.userRepository = userRepository;
        this.currentUserProvider = currentUserProvider;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.googleOAuthClient = googleOAuthClient;
    }

    public LoginResponse login(LoginRequest request) {
        UserEntity user = userRepository.findByEmail(request.email())
                .filter(found -> found.getPasswordHash() != null && passwordEncoder.matches(request.password(), found.getPasswordHash()))
                .orElseThrow(this::invalidCredentials);
        return new LoginResponse(
                jwtService.issueToken(user.getId(), user.getDisplayName()),
                toCurrentUserResponse(user)
        );
    }

    public CurrentUserResponse getCurrentUser() {
        CurrentUser currentUser = currentUserProvider.getCurrentUserOrThrow();
        UserEntity user = userRepository.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(ErrorCode.UNAUTHENTICATED, HttpStatus.UNAUTHORIZED, "The current user was not found."));
        return toCurrentUserResponse(user);
    }

    public void logout() {
    }

    public LoginResponse exchangeGoogleCode(String code, String redirectUri) {
        GoogleOAuthClient.GoogleUserProfile googleUser = googleOAuthClient.exchangeCode(code, redirectUri);
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);

        UserEntity user = userRepository.findByGoogleSubject(googleUser.subject())
                .or(() -> userRepository.findByEmail(googleUser.email())
                        .map(existing -> {
                            existing.linkGoogleSubject(googleUser.subject(), now);
                            return existing;
                        }))
                .orElseGet(() -> UserEntity.create(
                        UUID.randomUUID().toString(),
                        googleUser.email(),
                        null,
                        googleUser.subject(),
                        googleUser.name(),
                        UserRole.USER,
                        googleUser.picture(),
                        now
                ));

        UserEntity savedUser = userRepository.save(user);
        return new LoginResponse(
                jwtService.issueToken(savedUser.getId(), savedUser.getDisplayName()),
                toCurrentUserResponse(savedUser)
        );
    }

    private CurrentUserResponse toCurrentUserResponse(UserEntity user) {
        return new CurrentUserResponse(
                user.getId(),
                user.getDisplayName(),
                user.getEmail()
        );
    }

    private ApiException invalidCredentials() {
        return new ApiException(ErrorCode.UNAUTHENTICATED, HttpStatus.UNAUTHORIZED, "Invalid email or password.");
    }
}
