package com.reserva.backend.event;

import com.reserva.backend.common.api.PageResponse;
import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
import com.reserva.backend.common.model.UserRole;
import com.reserva.backend.common.security.CurrentUser;
import com.reserva.backend.common.security.CurrentUserProvider;
import com.reserva.backend.event.api.EventDetailResponse;
import com.reserva.backend.event.api.EventSummaryResponse;
import com.reserva.backend.event.model.EventCategory;
import com.reserva.backend.event.model.EventStatus;
import com.reserva.backend.event.model.EventVisibility;
import com.reserva.backend.user.UserEntity;
import com.reserva.backend.watchlist.WatchlistRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventQueryServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private WatchlistRepository watchlistRepository;

    @Mock
    private CurrentUserProvider currentUserProvider;

    private EventQueryService eventQueryService;

    @BeforeEach
    void setUp() {
        eventQueryService = new EventQueryService(eventRepository, watchlistRepository, currentUserProvider);
    }

    @Test
    void getEventsMarksWatchlistedItemsForCurrentUser() {
        EventEntity first = event("evt_1", LocalDateTime.now().plusDays(1));
        EventEntity second = event("evt_2", LocalDateTime.now().plusDays(2));

        when(currentUserProvider.getCurrentUserOrNull()).thenReturn(new CurrentUser("usr_1", "Alex Johnson", UserRole.USER));
        when(eventRepository.findAll(org.mockito.ArgumentMatchers.<org.springframework.data.jpa.domain.Specification<EventEntity>>any()))
                .thenReturn(List.of(first, second));
        when(watchlistRepository.findEventIdsByUserIdAndEventIdIn("usr_1", List.of("evt_1", "evt_2"))).thenReturn(Set.of("evt_2"));

        PageResponse<EventSummaryResponse> response = eventQueryService.getEvents(null, null, null, 1, 20);

        assertThat(response.items()).hasSize(2);
        assertThat(response.items().get(0).isWatchlisted()).isFalse();
        assertThat(response.items().get(1).isWatchlisted()).isTrue();
    }

    @Test
    void getEventsReturnsOnlyWatchlistSectionItems() {
        EventEntity first = event("evt_1", LocalDateTime.now().plusDays(1));
        EventEntity second = event("evt_2", LocalDateTime.now().plusDays(2));

        when(currentUserProvider.getCurrentUserOrThrow()).thenReturn(new CurrentUser("usr_1", "Alex Johnson", UserRole.USER));
        when(eventRepository.findAll(org.mockito.ArgumentMatchers.<org.springframework.data.jpa.domain.Specification<EventEntity>>any()))
                .thenReturn(List.of(first, second));
        when(watchlistRepository.findEventIdsByUserIdAndEventIdIn("usr_1", List.of("evt_1", "evt_2"))).thenReturn(Set.of("evt_2"));

        PageResponse<EventSummaryResponse> response = eventQueryService.getEvents(null, null, "watchlist", 1, 20);

        assertThat(response.items()).hasSize(1);
        assertThat(response.items().getFirst().id()).isEqualTo("evt_2");
        assertThat(response.items().getFirst().isWatchlisted()).isTrue();
    }

    @Test
    void getEventsReturnsOnlyTrendingSectionItems() {
        EventEntity first = event("evt_1", LocalDateTime.now().plusDays(1), 100, 75, LocalDateTime.now().minusDays(1), "Creator One");
        EventEntity second = event("evt_2", LocalDateTime.now().plusDays(2), 100, 20, LocalDateTime.now().minusDays(1), "Creator Two");

        when(currentUserProvider.getCurrentUserOrNull()).thenReturn(null);
        when(eventRepository.findAll(org.mockito.ArgumentMatchers.<org.springframework.data.jpa.domain.Specification<EventEntity>>any()))
                .thenReturn(List.of(first, second));

        PageResponse<EventSummaryResponse> response = eventQueryService.getEvents(null, null, "trending", 1, 20);

        assertThat(response.items()).hasSize(1);
        assertThat(response.items().getFirst().id()).isEqualTo("evt_1");
        assertThat(response.items().getFirst().isTrending()).isTrue();
    }

    @Test
    void getEventsRequiresAuthenticationForWatchlistSection() {
        when(currentUserProvider.getCurrentUserOrThrow()).thenThrow(
                new ApiException(ErrorCode.UNAUTHENTICATED, HttpStatus.UNAUTHORIZED, "Authentication is required.")
        );

        assertThatThrownBy(() -> eventQueryService.getEvents(null, null, "watchlist", 1, 20))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> assertThat(((ApiException) exception).getErrorCode()).isEqualTo(ErrorCode.UNAUTHENTICATED));
    }

    @Test
    void getEventsRejectsUnsupportedSection() {
        assertThatThrownBy(() -> eventQueryService.getEvents(null, null, "featured", 1, 20))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> assertThat(((ApiException) exception).getErrorCode()).isEqualTo(ErrorCode.VALIDATION_ERROR));
    }

    void getEventDetailReflectsWatchlistState() {
        EventEntity event = event("evt_1", LocalDateTime.now().plusDays(1));

        when(eventRepository.findByIdAndStatusAndVisibility("evt_1", EventStatus.PUBLISHED, EventVisibility.PUBLIC))
                .thenReturn(Optional.of(event));
        when(currentUserProvider.getCurrentUserOrNull()).thenReturn(new CurrentUser("usr_1", "Alex Johnson", UserRole.USER));
        when(watchlistRepository.existsByUserIdAndEventId("usr_1", "evt_1")).thenReturn(true);

        EventDetailResponse response = eventQueryService.getEventDetail("evt_1");

        assertThat(response.isWatchlisted()).isTrue();
        verify(watchlistRepository).existsByUserIdAndEventId("usr_1", "evt_1");
    }

    private EventEntity event(String eventId, LocalDateTime eventDateTime) {
        return event(eventId, eventDateTime, 100, 20, LocalDateTime.now().minusDays(1), "Jazz Collective NYC");
    }

    private EventEntity event(String eventId,
                              LocalDateTime eventDateTime,
                              int totalSlots,
                              int reservedSlots,
                              LocalDateTime reservationOpenDateTime,
                              String creatorName) {
        UserEntity creator = new UserEntity();
        ReflectionTestUtils.setField(creator, "id", "usr_creator");
        ReflectionTestUtils.setField(creator, "displayName", creatorName);
        ReflectionTestUtils.setField(creator, "profileImageUrl", "https://example.com/avatar.jpg");
        ReflectionTestUtils.setField(creator, "role", UserRole.CREATOR);

        EventInventoryEntity inventory = new EventInventoryEntity();
        ReflectionTestUtils.setField(inventory, "eventId", eventId);
        ReflectionTestUtils.setField(inventory, "totalSlots", totalSlots);
        ReflectionTestUtils.setField(inventory, "reservedSlots", reservedSlots);

        EventEntity event = new EventEntity();
        ReflectionTestUtils.setField(event, "id", eventId);
        ReflectionTestUtils.setField(event, "creator", creator);
        ReflectionTestUtils.setField(event, "title", "Summer Jazz Night");
        ReflectionTestUtils.setField(event, "category", EventCategory.CONCERT);
        ReflectionTestUtils.setField(event, "description", "Experience an unforgettable evening of smooth jazz.");
        ReflectionTestUtils.setField(event, "imageUrl", "https://example.com/image.jpg");
        ReflectionTestUtils.setField(event, "location", "Blue Note Jazz Club, NYC");
        ReflectionTestUtils.setField(event, "price", new BigDecimal("45.00"));
        ReflectionTestUtils.setField(event, "eventDateTime", eventDateTime);
        ReflectionTestUtils.setField(event, "reservationOpenDateTime", reservationOpenDateTime);
        ReflectionTestUtils.setField(event, "status", EventStatus.PUBLISHED);
        ReflectionTestUtils.setField(event, "visibility", EventVisibility.PUBLIC);
        ReflectionTestUtils.setField(event, "inventory", inventory);
        return event;
    }
}
