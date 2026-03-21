package com.reserva.backend.booking.api;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record BookingCreateResponse(
        String bookingId,
        String eventId,
        String status,
        int ticketCount,
        OffsetDateTime bookedAt,
        BigDecimal unitPrice,
        BigDecimal totalAmount
) {
}
