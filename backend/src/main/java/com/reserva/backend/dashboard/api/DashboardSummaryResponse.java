package com.reserva.backend.dashboard.api;

import com.reserva.backend.booking.api.BookingSummaryResponse;
import com.reserva.backend.event.api.EventSummaryResponse;

import java.util.List;

public record DashboardSummaryResponse(
        DashboardStatsResponse stats,
        List<BookingSummaryResponse> recentBookings,
        List<EventSummaryResponse> upcomingOpenEvents,
        List<EventSummaryResponse> watchlistPreview,
        List<EventSummaryResponse> createdEventsPreview
) {
}
