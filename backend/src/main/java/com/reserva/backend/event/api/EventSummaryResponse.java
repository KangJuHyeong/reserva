package com.reserva.backend.event.api;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record EventSummaryResponse(
        String id,
        String title,
        String imageUrl,
        String category,
        BigDecimal price,
        String location,
        OffsetDateTime eventDateTime,
        OffsetDateTime reservationOpenDateTime,
        int totalSlots,
        int reservedSlots,
        int remainingSlots,
        boolean isWatchlisted,
        boolean isTrending,
        boolean isEndingSoon,
        boolean isOpeningSoon,
        EventHostResponse host
) {
}
