package com.reserva.backend.auth.api;

import jakarta.validation.constraints.NotBlank;

public record GoogleExchangeRequest(
        @NotBlank String code,
        @NotBlank String redirectUri
) {
}
