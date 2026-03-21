package com.reserva.backend.event.api;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record EventDetailResponse(
        String id,
        String title,
        String imageUrl,
        String category,
        String description,
        BigDecimal price,
        String location,
        OffsetDateTime eventDateTime,
        OffsetDateTime reservationOpenDateTime,
        int totalSlots,
        int reservedSlots,
        int remainingSlots,
        boolean isWatchlisted,
        EventHostResponse host
) {
}
