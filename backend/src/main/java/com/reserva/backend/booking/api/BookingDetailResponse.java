package com.reserva.backend.booking.api;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record BookingDetailResponse(
        String bookingId,
        String eventId,
        String status,
        String participantName,
        int ticketCount,
        OffsetDateTime bookedAt,
        BigDecimal unitPrice,
        BigDecimal totalAmount,
        BookingDetailEventResponse event
) {
}
