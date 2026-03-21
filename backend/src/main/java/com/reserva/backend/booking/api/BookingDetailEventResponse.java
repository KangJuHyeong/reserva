package com.reserva.backend.booking.api;

import com.reserva.backend.event.api.EventHostResponse;

import java.time.OffsetDateTime;

public record BookingDetailEventResponse(
        String id,
        String title,
        String imageUrl,
        String category,
        String description,
        String location,
        OffsetDateTime eventDateTime,
        OffsetDateTime reservationOpenDateTime,
        EventHostResponse host
) {
}
