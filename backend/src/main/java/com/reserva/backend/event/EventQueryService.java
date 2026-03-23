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
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Comparator;
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
        Specification<EventEntity> specification = Specification.allOf(
                EventSpecifications.discoverable(),
                EventSpecifications.matchesQuery(query),
                EventSpecifications.hasCategory(parseCategory(category))
        );

        CurrentUser currentUser = requestedSection == DiscoverySection.WATCHLIST
                ? currentUserProvider.getCurrentUserOrThrow()
                : currentUserProvider.getCurrentUserOrNull();
        List<EventEntity> events = eventRepository.findAll(specification);
        LocalDateTime now = LocalDateTime.now();
        Set<String> watchlistedEventIds = resolveWatchlistedEventIds(events, currentUser);
        List<EventEntity> filtered = filterBySection(events, requestedSection, watchlistedEventIds, now);
        List<EventEntity> sorted = sortBySection(filtered, requestedSection);
        int start = Math.max((page - 1) * size, 0);
        if (start >= sorted.size()) {
            return new PageResponse<>(List.of(), page, size, sorted.size());
        }

        int end = Math.min(start + size, sorted.size());
        List<EventSummaryResponse> items = sorted.subList(start, end).stream()
                .map(event -> toSummaryResponse(event, watchlistedEventIds))
                .toList();
        return new PageResponse<>(items, page, size, sorted.size());
    }

    public EventDetailResponse getEventDetail(String eventId) {
        EventEntity event = eventRepository.findByIdAndStatusAndVisibility(eventId, EventStatus.PUBLISHED, EventVisibility.PUBLIC)
                .orElseThrow(() -> new ApiException(ErrorCode.EVENT_NOT_FOUND, HttpStatus.NOT_FOUND, "The event was not found."));
        return toDetailResponse(event, currentUserProvider.getCurrentUserOrNull());
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

    private List<EventEntity> filterBySection(List<EventEntity> events,
                                              DiscoverySection section,
                                              Set<String> watchlistedEventIds,
                                              LocalDateTime now) {
        return switch (section) {
            case TRENDING -> events.stream()
                    .filter(this::isTrending)
                    .toList();
            case ENDING_SOON -> events.stream()
                    .filter(this::isEndingSoon)
                    .toList();
            case OPENING_SOON -> events.stream()
                    .filter(event -> isOpeningSoon(event, now))
                    .toList();
            case WATCHLIST -> events.stream()
                    .filter(event -> watchlistedEventIds.contains(event.getId()))
                    .toList();
            case DEFAULT -> events;
        };
    }

    private List<EventEntity> sortBySection(List<EventEntity> events, DiscoverySection section) {
        return switch (section) {
            case TRENDING -> events.stream()
                    .sorted(Comparator.comparingDouble(this::fillRate).reversed().thenComparing(EventEntity::getEventDateTime))
                    .toList();
            case ENDING_SOON -> events.stream()
                    .sorted(Comparator.comparingInt(this::remainingSlots).thenComparing(EventEntity::getEventDateTime))
                    .toList();
            case OPENING_SOON -> events.stream()
                    .sorted(Comparator.comparing(EventEntity::getReservationOpenDateTime))
                    .toList();
            case WATCHLIST, DEFAULT -> events.stream()
                    .sorted(Comparator.comparing(EventEntity::getEventDateTime))
                    .toList();
        };
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
        boolean watchlisted = watchlistedEventIds.contains(event.getId());
        LocalDateTime now = LocalDateTime.now();
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
        return remainingSlots(event) <= Math.max(5, (int) Math.ceil(event.getInventory().getTotalSlots() * 0.2));
    }

    private boolean isOpeningSoon(EventEntity event, LocalDateTime now) {
        return event.getReservationOpenDateTime().isAfter(now);
    }

    private OffsetDateTime toOffsetDateTime(LocalDateTime localDateTime) {
        return localDateTime.atOffset(ZoneOffset.UTC);
    }

    private enum DiscoverySection {
        DEFAULT,
        TRENDING,
        ENDING_SOON,
        OPENING_SOON,
        WATCHLIST
    }
}
