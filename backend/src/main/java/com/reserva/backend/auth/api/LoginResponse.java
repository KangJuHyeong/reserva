package com.reserva.backend.auth.api;

public record LoginResponse(
        String accessToken,
        CurrentUserResponse user
) {
}
