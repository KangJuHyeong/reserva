package com.reserva.backend.common.security;

import com.reserva.backend.common.model.UserRole;

public record CurrentUser(
        String id,
        String name,
        UserRole role
) {
}
