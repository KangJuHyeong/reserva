package com.reserva.backend.auth.api;

public record CurrentUserResponse(
        String id,
        String name,
        String email,
        String role
) {
}
