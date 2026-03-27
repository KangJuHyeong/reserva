package com.reserva.backend.event;

import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
import com.reserva.backend.common.model.UserRole;
import com.reserva.backend.common.security.CurrentUser;
import com.reserva.backend.event.api.EventCreateRequest;
import com.reserva.backend.event.api.EventCreateResponse;
import com.reserva.backend.event.api.EventUpdateResponse;
import com.reserva.backend.event.model.EventStatus;
import com.reserva.backend.event.model.EventVisibility;
import com.reserva.backend.user.UserEntity;
import com.reserva.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventCommandServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private UserRepository userRepository;

    private EventCommandService eventCommandService;
    private final CurrentUser creatorUser = new CurrentUser("usr_creator", "Creator Name");
    private final CurrentUser standardUser = new CurrentUser("usr_1", "Alex Johnson");

    @BeforeEach
    void setUp() {
        eventCommandService = new EventCommandService(eventRepository, userRepository);
    }

    @Test
    void createEventCreatesPublishedPublicEventWithInventory() {
        when(userRepository.findById("usr_creator")).thenReturn(Optional.of(user("usr_creator", UserRole.CREATOR)));
        when(eventRepository.save(any(EventEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EventCreateResponse response = eventCommandService.createEvent(creatorUser, validRequest());

        assertThat(response.title()).isEqualTo("Summer Jazz Night");

        ArgumentCaptor<EventEntity> captor = ArgumentCaptor.forClass(EventEntity.class);
        verify(eventRepository).save(captor.capture());
        EventEntity saved = captor.getValue();
        assertThat(saved.getId()).isNotBlank();
        assertThat(saved.getCreator().getId()).isEqualTo("usr_creator");
        assertThat(saved.getStatus()).isEqualTo(EventStatus.PUBLISHED);
        assertThat(saved.getVisibility()).isEqualTo(EventVisibility.PUBLIC);
        assertThat(saved.getInventory().getTotalSlots()).isEqualTo(120);
        assertThat(saved.getMaxTicketsPerBooking()).isEqualTo(6);
        assertThat(saved.getInventory().getReservedSlots()).isZero();
    }

    @Test
    void createEventAllowsAnyAuthenticatedUser() {
        when(userRepository.findById("usr_1")).thenReturn(Optional.of(user("usr_1", UserRole.USER)));
        when(eventRepository.save(any(EventEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EventCreateResponse response = eventCommandService.createEvent(standardUser, validRequest());

        assertThat(response.title()).isEqualTo("Summer Jazz Night");
    }

    @Test
    void createEventRejectsInvalidSchedule() {
        EventCreateRequest request = new EventCreateRequest(
                "Summer Jazz Night",
                "Concert",
                "Experience an unforgettable evening of smooth jazz.",
                new BigDecimal("45.00"),
                "Blue Note Jazz Club, NYC",
                OffsetDateTime.of(2026, 4, 15, 18, 0, 0, 0, ZoneOffset.UTC),
                OffsetDateTime.of(2026, 4, 15, 18, 0, 0, 0, ZoneOffset.UTC),
                120,
                6,
                "https://example.com/image.jpg"
        );

        assertThatThrownBy(() -> eventCommandService.createEvent(creatorUser, request))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> {
                    ApiException apiException = (ApiException) exception;
                    assertThat(apiException.getErrorCode()).isEqualTo(ErrorCode.INVALID_SCHEDULE);
                    assertThat(apiException.getHttpStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                });

        verify(eventRepository, never()).save(any(EventEntity.class));
    }

    @Test
    void createEventRejectsUnsupportedCategory() {
        EventCreateRequest request = new EventCreateRequest(
                "Summer Jazz Night",
                "Festival",
                "Experience an unforgettable evening of smooth jazz.",
                new BigDecimal("45.00"),
                "Blue Note Jazz Club, NYC",
                OffsetDateTime.of(2026, 4, 15, 18, 0, 0, 0, ZoneOffset.UTC),
                OffsetDateTime.of(2026, 4, 10, 10, 0, 0, 0, ZoneOffset.UTC),
                120,
                6,
                "https://example.com/image.jpg"
        );

        assertThatThrownBy(() -> eventCommandService.createEvent(creatorUser, request))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> {
                    ApiException apiException = (ApiException) exception;
                    assertThat(apiException.getErrorCode()).isEqualTo(ErrorCode.VALIDATION_ERROR);
                    assertThat(apiException.getHttpStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                });

        verify(eventRepository, never()).save(any(EventEntity.class));
    }

    @Test
    void createEventRejectsMaxTicketsPerBookingAboveTotalSlots() {
        EventCreateRequest request = new EventCreateRequest(
                "Summer Jazz Night",
                "Concert",
                "Experience an unforgettable evening of smooth jazz.",
                new BigDecimal("45.00"),
                "Blue Note Jazz Club, NYC",
                OffsetDateTime.of(2026, 4, 15, 18, 0, 0, 0, ZoneOffset.UTC),
                OffsetDateTime.of(2026, 4, 10, 10, 0, 0, 0, ZoneOffset.UTC),
                5,
                6,
                "https://example.com/image.jpg"
        );

        assertThatThrownBy(() -> eventCommandService.createEvent(creatorUser, request))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> {
                    ApiException apiException = (ApiException) exception;
                    assertThat(apiException.getErrorCode()).isEqualTo(ErrorCode.VALIDATION_ERROR);
                    assertThat(apiException.getHttpStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                });

        verify(eventRepository, never()).save(any(EventEntity.class));
    }

    @Test
    void updateEventUpdatesOwnedEvent() {
        EventEntity event = EventEntity.create(
                "evt_1",
                user("usr_creator", UserRole.CREATOR),
                "Summer Jazz Night",
                com.reserva.backend.event.model.EventCategory.CONCERT,
                "Experience an unforgettable evening of smooth jazz.",
                "https://example.com/image.jpg",
                "Blue Note Jazz Club, NYC",
                new BigDecimal("45.00"),
                OffsetDateTime.of(2026, 4, 15, 18, 0, 0, 0, ZoneOffset.UTC).toLocalDateTime(),
                OffsetDateTime.of(2026, 4, 10, 10, 0, 0, 0, ZoneOffset.UTC).toLocalDateTime(),
                6,
                EventStatus.PUBLISHED,
                EventVisibility.PUBLIC,
                java.time.LocalDateTime.now(ZoneOffset.UTC),
                120
        );
        ReflectionTestUtils.setField(event.getInventory(), "reservedSlots", 4);
        when(eventRepository.findById("evt_1")).thenReturn(Optional.of(event));
        when(eventRepository.save(any(EventEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EventUpdateResponse response = eventCommandService.updateEvent(creatorUser, "evt_1", validRequest());

        assertThat(response.id()).isEqualTo("evt_1");
        assertThat(event.getTitle()).isEqualTo("Summer Jazz Night");
        assertThat(event.getInventory().getTotalSlots()).isEqualTo(120);
        assertThat(event.getMaxTicketsPerBooking()).isEqualTo(6);
    }

    @Test
    void updateEventRejectsDifferentCreator() {
        EventEntity event = EventEntity.create(
                "evt_1",
                user("usr_other", UserRole.CREATOR),
                "Summer Jazz Night",
                com.reserva.backend.event.model.EventCategory.CONCERT,
                "Experience an unforgettable evening of smooth jazz.",
                "https://example.com/image.jpg",
                "Blue Note Jazz Club, NYC",
                new BigDecimal("45.00"),
                OffsetDateTime.of(2026, 4, 15, 18, 0, 0, 0, ZoneOffset.UTC).toLocalDateTime(),
                OffsetDateTime.of(2026, 4, 10, 10, 0, 0, 0, ZoneOffset.UTC).toLocalDateTime(),
                6,
                EventStatus.PUBLISHED,
                EventVisibility.PUBLIC,
                java.time.LocalDateTime.now(ZoneOffset.UTC),
                120
        );
        when(eventRepository.findById("evt_1")).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> eventCommandService.updateEvent(creatorUser, "evt_1", validRequest()))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> {
                    ApiException apiException = (ApiException) exception;
                    assertThat(apiException.getErrorCode()).isEqualTo(ErrorCode.FORBIDDEN);
                    assertThat(apiException.getHttpStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                });
    }

    @Test
    void updateEventRejectsTotalSlotsBelowReservedSlots() {
        EventEntity event = EventEntity.create(
                "evt_1",
                user("usr_creator", UserRole.CREATOR),
                "Summer Jazz Night",
                com.reserva.backend.event.model.EventCategory.CONCERT,
                "Experience an unforgettable evening of smooth jazz.",
                "https://example.com/image.jpg",
                "Blue Note Jazz Club, NYC",
                new BigDecimal("45.00"),
                OffsetDateTime.of(2026, 4, 15, 18, 0, 0, 0, ZoneOffset.UTC).toLocalDateTime(),
                OffsetDateTime.of(2026, 4, 10, 10, 0, 0, 0, ZoneOffset.UTC).toLocalDateTime(),
                6,
                EventStatus.PUBLISHED,
                EventVisibility.PUBLIC,
                java.time.LocalDateTime.now(ZoneOffset.UTC),
                120
        );
        ReflectionTestUtils.setField(event.getInventory(), "reservedSlots", 8);
        when(eventRepository.findById("evt_1")).thenReturn(Optional.of(event));

        EventCreateRequest request = new EventCreateRequest(
                "Summer Jazz Night",
                "Concert",
                "Experience an unforgettable evening of smooth jazz.",
                new BigDecimal("45.00"),
                "Blue Note Jazz Club, NYC",
                OffsetDateTime.of(2026, 4, 15, 18, 0, 0, 0, ZoneOffset.UTC),
                OffsetDateTime.of(2026, 4, 10, 10, 0, 0, 0, ZoneOffset.UTC),
                7,
                6,
                "https://example.com/image.jpg"
        );

        assertThatThrownBy(() -> eventCommandService.updateEvent(creatorUser, "evt_1", request))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> {
                    ApiException apiException = (ApiException) exception;
                    assertThat(apiException.getErrorCode()).isEqualTo(ErrorCode.VALIDATION_ERROR);
                    assertThat(apiException.getHttpStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                });
    }

    @Test
    void updateEventRejectsWhenReservationAlreadyOpened() {
        EventEntity event = EventEntity.create(
                "evt_1",
                user("usr_creator", UserRole.CREATOR),
                "Summer Jazz Night",
                com.reserva.backend.event.model.EventCategory.CONCERT,
                "Experience an unforgettable evening of smooth jazz.",
                "https://example.com/image.jpg",
                "Blue Note Jazz Club, NYC",
                new BigDecimal("45.00"),
                OffsetDateTime.of(2026, 4, 15, 18, 0, 0, 0, ZoneOffset.UTC).toLocalDateTime(),
                OffsetDateTime.now(ZoneOffset.UTC).minusHours(1).toLocalDateTime(),
                6,
                EventStatus.PUBLISHED,
                EventVisibility.PUBLIC,
                java.time.LocalDateTime.now(ZoneOffset.UTC),
                120
        );
        when(eventRepository.findById("evt_1")).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> eventCommandService.updateEvent(creatorUser, "evt_1", validRequest()))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> {
                    ApiException apiException = (ApiException) exception;
                    assertThat(apiException.getErrorCode()).isEqualTo(ErrorCode.FORBIDDEN);
                    assertThat(apiException.getHttpStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                    assertThat(apiException.getMessage()).contains("before reservations open");
                });

        verify(eventRepository, never()).save(any(EventEntity.class));
    }

    private EventCreateRequest validRequest() {
        return new EventCreateRequest(
                "Summer Jazz Night",
                "Concert",
                "Experience an unforgettable evening of smooth jazz.",
                new BigDecimal("45.00"),
                "Blue Note Jazz Club, NYC",
                OffsetDateTime.of(2026, 4, 15, 18, 0, 0, 0, ZoneOffset.UTC),
                OffsetDateTime.of(2026, 4, 10, 10, 0, 0, 0, ZoneOffset.UTC),
                120,
                6,
                "https://example.com/image.jpg"
        );
    }

    private UserEntity user(String id, UserRole role) {
        UserEntity user = new UserEntity();
        ReflectionTestUtils.setField(user, "id", id);
        ReflectionTestUtils.setField(user, "displayName", "Creator Name");
        ReflectionTestUtils.setField(user, "role", role);
        return user;
    }
}
