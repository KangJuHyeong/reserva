package com.reserva.backend.dashboard.api;

public record DashboardStatsResponse(
        long totalBookings,
        long upcomingOpenEvents,
        long completedBookings,
        long watchlistCount,
        long createdEvents
) {
}
