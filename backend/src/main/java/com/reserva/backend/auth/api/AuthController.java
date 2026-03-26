package com.reserva.backend.auth.api;

import com.reserva.backend.auth.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/api/v1/auth/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/api/v1/auth/signup")
    public LoginResponse signup(@Valid @RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    @PostMapping("/api/v1/auth/oauth/google/exchange")
    public LoginResponse exchangeGoogleCode(@Valid @RequestBody GoogleExchangeRequest request) {
        return authService.exchangeGoogleCode(request.code(), request.redirectUri());
    }

    @PostMapping("/api/v1/auth/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout() {
        authService.logout();
    }

    @GetMapping("/api/v1/me")
    public CurrentUserResponse getCurrentUser() {
        return authService.getCurrentUser();
    }
}
