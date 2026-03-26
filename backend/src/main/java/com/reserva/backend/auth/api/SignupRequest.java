package com.reserva.backend.auth.api;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank(message = "must not be blank")
        @Size(max = 100, message = "must be at most 100 characters")
        String name,
        @NotBlank(message = "must not be blank")
        @Email(message = "must be a well-formed email address")
        String email,
        @NotBlank(message = "must not be blank")
        @Size(min = 8, max = 72, message = "must be between 8 and 72 characters")
        String password
) {
}
