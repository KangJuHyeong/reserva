package com.reserva.backend.dashboard;

import com.reserva.backend.booking.BookingEntity;
import com.reserva.backend.booking.BookingRepository;
import com.reserva.backend.booking.api.BookingSummaryResponse;
import com.reserva.backend.booking.model.BookingStatus;
import com.reserva.backend.common.security.CurrentUser;
import com.reserva.backend.dashboard.api.DashboardStatsResponse;
import com.reserva.backend.dashboard.api.DashboardSummaryResponse;
import com.reserva.backend.event.EventEntity;
import com.reserva.backend.event.EventRepository;
import com.reserva.backend.event.api.EventHostResponse;
import com.reserva.backend.event.api.EventSummaryResponse;
import com.reserva.backend.event.model.EventStatus;
import com.reserva.backend.event.model.EventVisibility;
import com.reserva.backend.watchlist.WatchlistRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import org.springframework.data.domain.PageRequest;
import java.util.Comparator;
import java.util.Locale;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class DashboardQueryService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final WatchlistRepository watchlistRepository;

    public DashboardQueryService(BookingRepository bookingRepository,
                                 EventRepository eventRepository,
                                 WatchlistRepository watchlistRepository) {
        this.bookingRepository = bookingRepository;
        this.eventRepository = eventRepository;
        this.watchlistRepository = watchlistRepository;
    }

    public DashboardSummaryResponse getDashboardSummary(CurrentUser currentUser) {
        String userId = currentUser.id();
        LocalDateTime now = LocalDateTime.now();

        List<BookingSummaryResponse> recentBookings = recentBookings(userId);
        List<String> watchlistEventIds = watchlistRepository.findEventIdsByUserIdOrderByCreatedAtDesc(userId);
        List<EventEntity> watchlistEvents = loadWatchlistEvents(watchlistEventIds);
        Set<String> watchlistedEventIds = Set.copyOf(watchlistEventIds);
        List<EventSummaryResponse> upcomingOpenEvents = watchlistEvents.stream()
                .filter(event -> event.getReservationOpenDateTime().isAfter(now))
                .sorted(Comparator.comparing(EventEntity::getReservationOpenDateTime))
                .limit(3)
                .map(event -> toEventSummaryResponse(event, watchlistedEventIds, now))
                .toList();

        return new DashboardSummaryResponse(
                new DashboardStatsResponse(
                        bookingRepository.countByUserId(userId),
                        watchlistEvents.stream().filter(event -> event.getReservationOpenDateTime().isAfter(now)).count(),
                        bookingRepository.countByUserIdAndStatus(userId, BookingStatus.COMPLETED),
                        watchlistRepository.countByUserId(userId),
                        eventRepository.countByCreator_Id(userId)
                ),
                recentBookings,
                upcomingOpenEvents,
                watchlistEvents.stream()
                        .limit(3)
                        .map(event -> toEventSummaryResponse(event, watchlistedEventIds, now))
                        .toList(),
                eventRepository.findRecentDetailsByCreatorId(userId, PageRequest.of(0, 3)).stream()
                        .map(event -> toEventSummaryResponse(event, watchlistedEventIds, now))
                        .toList()
        );
    }

    private List<BookingSummaryResponse> recentBookings(String userId) {
        List<BookingEntity> bookings = bookingRepository.findTop3ByUserIdOrderByBookedAtDesc(userId);
        Map<String, EventEntity> eventMap = eventRepository.findAllById(
                        bookings.stream().map(BookingEntity::getEventId).distinct().toList()
                ).stream()
                .collect(Collectors.toMap(EventEntity::getId, Function.identity()));

        return bookings.stream()
                .map(booking -> {
                    EventEntity event = eventMap.get(booking.getEventId());
                    if (event == null) {
                        return null;
                    }
                    return new BookingSummaryResponse(
                            booking.getBookingCode(),
                            booking.getEventId(),
                            event.getTitle(),
                            event.getImageUrl(),
                            booking.getStatus().name().toLowerCase(Locale.ROOT),
                            event.getLocation(),
                            toOffsetDateTime(event.getEventDateTime()),
                            toOffsetDateTime(booking.getBookedAt()),
                            booking.getTicketCount()
                    );
                })
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    private List<EventEntity> loadWatchlistEvents(List<String> watchlistEventIds) {
        if (watchlistEventIds.isEmpty()) {
            return List.of();
        }

        Map<String, EventEntity> eventMap = eventRepository.findDetailsByIdInAndStatusAndVisibility(
                        watchlistEventIds,
                        EventStatus.PUBLISHED,
                        EventVisibility.PUBLIC
                ).stream()
                .collect(Collectors.toMap(EventEntity::getId, Function.identity()));

        return watchlistEventIds.stream()
                .map(eventMap::get)
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    private EventSummaryResponse toEventSummaryResponse(EventEntity event, Set<String> watchlistedEventIds, LocalDateTime now) {
        int remainingSlots = event.getInventory().getRemainingSlots();
        double fillRate = (double) event.getInventory().getReservedSlots() / event.getInventory().getTotalSlots();

        return new EventSummaryResponse(
                event.getId(),
                event.getTitle(),
                event.getImageUrl(),
                event.getCategory().getLabel(),
                event.getPrice(),
                event.getLocation(),
                toOffsetDateTime(event.getEventDateTime()),
                toOffsetDateTime(event.getReservationOpenDateTime()),
                event.getInventory().getTotalSlots(),
                event.getInventory().getReservedSlots(),
                remainingSlots,
                watchlistedEventIds.contains(event.getId()),
                fillRate >= 0.7,
                remainingSlots <= Math.max(5, (int) Math.ceil(event.getInventory().getTotalSlots() * 0.2)),
                event.getReservationOpenDateTime().isAfter(now),
                new EventHostResponse(
                        event.getCreator().getId(),
                        event.getCreator().getDisplayName(),
                        event.getCreator().getProfileImageUrl()
                )
        );
    }

    private OffsetDateTime toOffsetDateTime(LocalDateTime localDateTime) {
        return localDateTime.atOffset(ZoneOffset.UTC);
    }
}
