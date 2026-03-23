package com.reserva.backend.common.security;

public record CurrentUser(
        String id,
        String name
) {
}
