package com.reserva.backend.event.api;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record EventCreateRequest(
        @NotBlank(message = "must not be blank")
        String title,
        @NotBlank(message = "must not be blank")
        String category,
        @NotBlank(message = "must not be blank")
        String description,
        @NotNull(message = "must not be null")
        @DecimalMin(value = "0.0", inclusive = true, message = "must be greater than or equal to 0")
        BigDecimal price,
        @NotBlank(message = "must not be blank")
        String location,
        @NotNull(message = "must not be null")
        OffsetDateTime eventDateTime,
        @NotNull(message = "must not be null")
        OffsetDateTime reservationOpenDateTime,
        @Min(value = 1, message = "must be greater than or equal to 1")
        int totalSlots,
        @NotBlank(message = "must not be blank")
        String imageUrl
) {
}
