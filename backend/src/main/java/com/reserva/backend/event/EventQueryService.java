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
import java.util.List;
import java.util.Locale;

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
        Specification<EventEntity> specification = Specification.allOf(
                EventSpecifications.discoverable(),
                EventSpecifications.matchesQuery(query),
                EventSpecifications.hasCategory(parseCategory(category))
        );

        CurrentUser currentUser = currentUserProvider.getCurrentUserOrNull();
        List<EventEntity> events = eventRepository.findAll(specification);

        if ("watchlist".equalsIgnoreCase(section)) {
            if (currentUser == null) {
                return new PageResponse<>(List.of(), page, size, 0);
            }
            events = events.stream()
                    .filter(event -> watchlistRepository.existsByUserIdAndEventId(currentUser.id(), event.getId()))
                    .toList();
        }

        List<EventEntity> sorted = sortBySection(events, section);
        int start = Math.max((page - 1) * size, 0);
        if (start >= sorted.size()) {
            return new PageResponse<>(List.of(), page, size, sorted.size());
        }

        int end = Math.min(start + size, sorted.size());
        List<EventSummaryResponse> items = sorted.subList(start, end).stream()
                .map(event -> toSummaryResponse(event, currentUser))
                .toList();
        return new PageResponse<>(items, page, size, sorted.size());
    }

    public EventDetailResponse getEventDetail(String eventId) {
        EventEntity event = eventRepository.findByIdAndStatusAndVisibility(eventId, EventStatus.PUBLISHED, EventVisibility.PUBLIC)
                .orElseThrow(() -> new ApiException(ErrorCode.EVENT_NOT_FOUND, HttpStatus.NOT_FOUND, "The event was not found."));
        return toDetailResponse(event, currentUserProvider.getCurrentUserOrNull());
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

    private List<EventEntity> sortBySection(List<EventEntity> events, String section) {
        if (section == null || section.isBlank()) {
            return events.stream()
                    .sorted(Comparator.comparing(EventEntity::getEventDateTime))
                    .toList();
        }

        String normalized = section.toLowerCase(Locale.ROOT);
        LocalDateTime now = LocalDateTime.now();

        return switch (normalized) {
            case "trending" -> events.stream()
                    .sorted(Comparator.comparingDouble(this::fillRate).reversed().thenComparing(EventEntity::getEventDateTime))
                    .toList();
            case "endingsoon" -> events.stream()
                    .sorted(Comparator.comparingInt(this::remainingSlots).thenComparing(EventEntity::getEventDateTime))
                    .toList();
            case "openingsoon" -> events.stream()
                    .filter(event -> event.getReservationOpenDateTime().isAfter(now))
                    .sorted(Comparator.comparing(EventEntity::getReservationOpenDateTime))
                    .toList();
            case "watchlist" -> events;
            default -> events.stream()
                    .sorted(Comparator.comparing(EventEntity::getEventDateTime))
                    .toList();
        };
    }

    private EventSummaryResponse toSummaryResponse(EventEntity event, CurrentUser currentUser) {
        boolean watchlisted = currentUser != null && watchlistRepository.existsByUserIdAndEventId(currentUser.id(), event.getId());
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
                fillRate(event) >= 0.7,
                remainingSlots(event) <= Math.max(5, (int) Math.ceil(event.getInventory().getTotalSlots() * 0.2)),
                event.getReservationOpenDateTime().isAfter(LocalDateTime.now()),
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

    private OffsetDateTime toOffsetDateTime(LocalDateTime localDateTime) {
        return localDateTime.atOffset(ZoneOffset.UTC);
    }
}
