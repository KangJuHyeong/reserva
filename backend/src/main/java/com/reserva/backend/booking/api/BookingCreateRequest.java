package com.reserva.backend.booking.api;

import jakarta.validation.constraints.Min;

public record BookingCreateRequest(
        @Min(value = 1, message = "ticketCount must be at least 1")
        int ticketCount
) {
}
