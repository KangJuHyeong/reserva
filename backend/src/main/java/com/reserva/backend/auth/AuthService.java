package com.reserva.backend.auth;

import com.reserva.backend.auth.api.CurrentUserResponse;
import com.reserva.backend.auth.api.LoginRequest;
import com.reserva.backend.auth.api.LoginResponse;
import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
import com.reserva.backend.common.security.CurrentUser;
import com.reserva.backend.common.security.CurrentUserProvider;
import com.reserva.backend.user.UserEntity;
import com.reserva.backend.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final String SESSION_USER_ID = "AUTH_USER_ID";
    private static final String SESSION_USER_NAME = "AUTH_USER_NAME";
    private final UserRepository userRepository;
    private final CurrentUserProvider currentUserProvider;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       CurrentUserProvider currentUserProvider,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.currentUserProvider = currentUserProvider;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        UserEntity user = userRepository.findByEmail(request.email())
                .filter(found -> passwordEncoder.matches(request.password(), found.getPasswordHash()))
                .orElseThrow(this::invalidCredentials);

        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(SESSION_USER_ID, user.getId());
        session.setAttribute(SESSION_USER_NAME, user.getDisplayName());

        return new LoginResponse(toCurrentUserResponse(user));
    }

    public CurrentUserResponse getCurrentUser() {
        CurrentUser currentUser = currentUserProvider.getCurrentUserOrThrow();
        UserEntity user = userRepository.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(ErrorCode.UNAUTHENTICATED, HttpStatus.UNAUTHORIZED, "The current user was not found."));
        return toCurrentUserResponse(user);
    }

    public void logout(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }
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
