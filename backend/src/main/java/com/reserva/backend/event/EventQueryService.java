package com.reserva.backend.event;

import com.reserva.backend.common.api.PageResponse;
import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
import com.reserva.backend.common.security.CurrentUser;
import com.reserva.backend.common.security.CurrentUserProvider;
import com.reserva.backend.event.api.EventDetailResponse;
import com.reserva.backend.event.api.EventHostResponse;
import com.reserva.backend.event.api.EventSummaryResponse;
import com.reserva.backend.event.model.EventCategory;
import com.reserva.backend.event.model.EventStatus;
import com.reserva.backend.event.model.EventVisibility;
import com.reserva.backend.watchlist.WatchlistRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class EventQueryService {

    private final EventRepository eventRepository;
    private final WatchlistRepository watchlistRepository;
    private final CurrentUserProvider currentUserProvider;

    public EventQueryService(EventRepository eventRepository,
                             WatchlistRepository watchlistRepository,
                             CurrentUserProvider currentUserProvider) {
        this.eventRepository = eventRepository;
        this.watchlistRepository = watchlistRepository;
        this.currentUserProvider = currentUserProvider;
    }

    public PageResponse<EventSummaryResponse> getEvents(String query, String category, String section, int page, int size) {
        DiscoverySection requestedSection = parseSection(section);
        CurrentUser currentUser = requestedSection == DiscoverySection.WATCHLIST
                ? currentUserProvider.getCurrentUserOrThrow()
                : currentUserProvider.getCurrentUserOrNull();
        LocalDateTime now = LocalDateTime.now();
        EventRepositoryCustom.SearchResult searchResult = eventRepository.searchDiscoverableEvents(
                query,
                parseCategory(category),
                requestedSection,
                currentUser == null ? null : currentUser.id(),
                now,
                page,
                size
        );
        List<EventEntity> events = searchResult.events();
        Set<String> watchlistedEventIds = requestedSection == DiscoverySection.WATCHLIST
                ? events.stream().map(EventEntity::getId).collect(java.util.stream.Collectors.toSet())
                : resolveWatchlistedEventIds(events, currentUser);
        List<EventSummaryResponse> items = events.stream()
                .map(event -> toSummaryResponse(event, watchlistedEventIds))
                .toList();
        return new PageResponse<>(items, page, size, searchResult.total());
    }

    public EventDetailResponse getEventDetail(String eventId) {
        EventEntity event = eventRepository.findByIdAndStatusAndVisibility(eventId, EventStatus.PUBLISHED, EventVisibility.PUBLIC)
                .orElseThrow(() -> new ApiException(ErrorCode.EVENT_NOT_FOUND, HttpStatus.NOT_FOUND, "The event was not found."));
        return toDetailResponse(event, currentUserProvider.getCurrentUserOrNull());
    }

    public PageResponse<EventSummaryResponse> getMyEvents(CurrentUser currentUser, int page, int size) {
        LocalDateTime now = LocalDateTime.now();
        Page<EventEntity> myEvents = eventRepository.findByCreator_IdOrderByCreatedAtDesc(
                currentUser.id(),
                PageRequest.of(page - 1, size)
        );
        Set<String> watchlistedEventIds = resolveWatchlistedEventIds(myEvents.getContent(), currentUser);
        List<EventSummaryResponse> items = myEvents.getContent().stream()
                .map(event -> toSummaryResponse(event, watchlistedEventIds, now))
                .toList();
        return new PageResponse<>(items, page, size, myEvents.getTotalElements());
    }

    public EventDetailResponse getMyEventDetail(CurrentUser currentUser, String eventId) {
        EventEntity event = eventRepository.findByIdAndCreator_Id(eventId, currentUser.id())
                .orElseThrow(() -> new ApiException(ErrorCode.EVENT_NOT_FOUND, HttpStatus.NOT_FOUND, "The event was not found for the current user."));
        return toDetailResponse(event, currentUser);
    }

    private DiscoverySection parseSection(String rawSection) {
        if (rawSection == null || rawSection.isBlank()) {
            return DiscoverySection.DEFAULT;
        }

        return switch (rawSection.trim().toLowerCase(Locale.ROOT)) {
            case "trending" -> DiscoverySection.TRENDING;
            case "endingsoon" -> DiscoverySection.ENDING_SOON;
            case "openingsoon" -> DiscoverySection.OPENING_SOON;
            case "watchlist" -> DiscoverySection.WATCHLIST;
            default -> throw new ApiException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Unsupported section: " + rawSection);
        };
    }

    private EventCategory parseCategory(String rawCategory) {
        if (rawCategory == null || rawCategory.isBlank()) {
            return null;
        }
        try {
            return EventCategory.fromLabel(rawCategory);
        } catch (IllegalArgumentException exception) {
            throw new ApiException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Unsupported category: " + rawCategory);
        }
    }

    private Set<String> resolveWatchlistedEventIds(List<EventEntity> events, CurrentUser currentUser) {
        if (currentUser == null || events.isEmpty()) {
            return Set.of();
        }

        List<String> eventIds = events.stream()
                .map(EventEntity::getId)
                .toList();
        return new HashSet<>(watchlistRepository.findEventIdsByUserIdAndEventIdIn(currentUser.id(), eventIds));
    }

    private EventSummaryResponse toSummaryResponse(EventEntity event, Set<String> watchlistedEventIds) {
        return toSummaryResponse(event, watchlistedEventIds, LocalDateTime.now());
    }

    private EventSummaryResponse toSummaryResponse(EventEntity event, Set<String> watchlistedEventIds, LocalDateTime now) {
        boolean watchlisted = watchlistedEventIds.contains(event.getId());
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
                remainingSlots(event),
                watchlisted,
                isTrending(event),
                isEndingSoon(event),
                isOpeningSoon(event, now),
                toHost(event)
        );
    }

    private EventDetailResponse toDetailResponse(EventEntity event, CurrentUser currentUser) {
        boolean watchlisted = currentUser != null && watchlistRepository.existsByUserIdAndEventId(currentUser.id(), event.getId());
        return new EventDetailResponse(
                event.getId(),
                event.getTitle(),
                event.getImageUrl(),
                event.getCategory().getLabel(),
                event.getDescription(),
                event.getPrice(),
                event.getLocation(),
                toOffsetDateTime(event.getEventDateTime()),
                toOffsetDateTime(event.getReservationOpenDateTime()),
                event.getInventory().getTotalSlots(),
                event.getInventory().getReservedSlots(),
                remainingSlots(event),
                event.getMaxTicketsPerBooking(),
                watchlisted,
                toHost(event)
        );
    }

    private EventHostResponse toHost(EventEntity event) {
        return new EventHostResponse(
                event.getCreator().getId(),
                event.getCreator().getDisplayName(),
                event.getCreator().getProfileImageUrl()
        );
    }

    private int remainingSlots(EventEntity event) {
        return event.getInventory().getRemainingSlots();
    }

    private double fillRate(EventEntity event) {
        return (double) event.getInventory().getReservedSlots() / event.getInventory().getTotalSlots();
    }

    private boolean isTrending(EventEntity event) {
        return fillRate(event) >= 0.7;
    }

    private boolean isEndingSoon(EventEntity event) {
        LocalDateTime now = LocalDateTime.now();
        return !event.getEventDateTime().isBefore(now)
                && !event.getEventDateTime().isAfter(now.plusHours(72));
    }

    private boolean isOpeningSoon(EventEntity event, LocalDateTime now) {
        return event.getReservationOpenDateTime().isAfter(now);
    }

    private OffsetDateTime toOffsetDateTime(LocalDateTime localDateTime) {
        return localDateTime.atOffset(ZoneOffset.UTC);
    }

}
