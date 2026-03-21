package com.reserva.backend.booking.api;

import java.time.OffsetDateTime;

public record BookingSummaryResponse(
        String bookingId,
        String eventId,
        String title,
        String imageUrl,
        String status,
        String location,
        OffsetDateTime eventDateTime,
        OffsetDateTime bookedAt,
        int ticketCount
) {
}
