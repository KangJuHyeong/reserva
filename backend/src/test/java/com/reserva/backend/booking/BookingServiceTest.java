package com.reserva.backend.booking;

import com.reserva.backend.booking.api.BookingCreateRequest;
import com.reserva.backend.booking.api.BookingCreateResponse;
import com.reserva.backend.booking.model.BookingStatus;
import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
import com.reserva.backend.common.model.UserRole;
import com.reserva.backend.common.security.CurrentUser;
import com.reserva.backend.event.EventEntity;
import com.reserva.backend.event.EventInventoryEntity;
import com.reserva.backend.event.EventInventoryRepository;
import com.reserva.backend.event.EventRepository;
import com.reserva.backend.event.model.EventCategory;
import com.reserva.backend.event.model.EventStatus;
import com.reserva.backend.event.model.EventVisibility;
import com.reserva.backend.user.UserEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.EnumSet;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private EventInventoryRepository eventInventoryRepository;

    @Mock
    private BookingAdmissionGuard bookingAdmissionGuard;

    private BookingService bookingService;
    private final CurrentUser currentUser = new CurrentUser("usr_1", "Alex Johnson");

    @BeforeEach
    void setUp() {
        lenient().when(bookingAdmissionGuard.acquireEventLock(any())).thenReturn(() -> { });
        bookingService = new BookingService(
                bookingRepository,
                eventRepository,
                eventInventoryRepository,
                bookingAdmissionGuard,
                "BK"
        );
    }

    @Test
    void createBookingRejectsInvalidTicketCount() {
        assertThatThrownBy(() -> bookingService.createBooking(currentUser, "evt_1", new BookingCreateRequest(0)))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> {
                    ApiException apiException = (ApiException) exception;
                    assertThat(apiException.getErrorCode()).isEqualTo(ErrorCode.VALIDATION_ERROR);
                    assertThat(apiException.getHttpStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                });

        verify(eventRepository, never()).findByIdAndStatusAndVisibility(any(), any(), any());
    }

    @Test
    void createBookingRejectsUnknownEvent() {
        when(eventRepository.findByIdAndStatusAndVisibility("evt_missing", EventStatus.PUBLISHED, EventVisibility.PUBLIC))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.createBooking(currentUser, "evt_missing", new BookingCreateRequest(1)))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> {
                    ApiException apiException = (ApiException) exception;
                    assertThat(apiException.getErrorCode()).isEqualTo(ErrorCode.EVENT_NOT_FOUND);
                    assertThat(apiException.getHttpStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                });

        verify(bookingAdmissionGuard).acquireEventLock("evt_missing");
    }

    @Test
    void createBookingRejectsWhenAnotherBookingIsAlreadyInProgress() {
        when(bookingAdmissionGuard.acquireEventLock("evt_1"))
                .thenThrow(new ApiException(
                        ErrorCode.BOOKING_IN_PROGRESS,
                        HttpStatus.CONFLICT,
                        "Another booking for this event is currently being processed. Please try again shortly."
                ));

        assertThatThrownBy(() -> bookingService.createBooking(currentUser, "evt_1", new BookingCreateRequest(1)))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> {
                    ApiException apiException = (ApiException) exception;
                    assertThat(apiException.getErrorCode()).isEqualTo(ErrorCode.BOOKING_IN_PROGRESS);
                    assertThat(apiException.getHttpStatus()).isEqualTo(HttpStatus.CONFLICT);
                });

        verify(eventRepository, never()).findByIdAndStatusAndVisibility(any(), any(), any());
    }

    @Test
    void createBookingRejectsReservationBeforeOpen() {
        when(eventRepository.findByIdAndStatusAndVisibility("evt_1", EventStatus.PUBLISHED, EventVisibility.PUBLIC))
                .thenReturn(Optional.of(event("evt_1", 10, 0, LocalDateTime.now().plusDays(1))));

        assertThatThrownBy(() -> bookingService.createBooking(currentUser, "evt_1", new BookingCreateRequest(1)))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> {
                    ApiException apiException = (ApiException) exception;
                    assertThat(apiException.getErrorCode()).isEqualTo(ErrorCode.VALIDATION_ERROR);
                    assertThat(apiException.getHttpStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                });
    }

    @Test
    void createBookingRejectsDuplicateConfirmedBooking() {
        when(eventRepository.findByIdAndStatusAndVisibility("evt_1", EventStatus.PUBLISHED, EventVisibility.PUBLIC))
                .thenReturn(Optional.of(event("evt_1", 10, 0, LocalDateTime.now().minusDays(1))));
        when(bookingRepository.existsByUserIdAndEventIdAndStatusIn(eq("usr_1"), eq("evt_1"), eq(EnumSet.of(BookingStatus.CONFIRMED))))
                .thenReturn(true);

        assertThatThrownBy(() -> bookingService.createBooking(currentUser, "evt_1", new BookingCreateRequest(1)))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> {
                    ApiException apiException = (ApiException) exception;
                    assertThat(apiException.getErrorCode()).isEqualTo(ErrorCode.ALREADY_BOOKED);
                    assertThat(apiException.getHttpStatus()).isEqualTo(HttpStatus.CONFLICT);
                });
    }

    @Test
    void createBookingRejectsSoldOutInventory() {
        EventEntity event = event("evt_1", 2, 2, LocalDateTime.now().minusDays(1));

        when(eventRepository.findByIdAndStatusAndVisibility("evt_1", EventStatus.PUBLISHED, EventVisibility.PUBLIC))
                .thenReturn(Optional.of(event));
        when(bookingRepository.existsByUserIdAndEventIdAndStatusIn(eq("usr_1"), eq("evt_1"), eq(EnumSet.of(BookingStatus.CONFIRMED))))
                .thenReturn(false);
        when(eventInventoryRepository.findByEventIdForUpdate("evt_1")).thenReturn(Optional.of(event.getInventory()));

        assertThatThrownBy(() -> bookingService.createBooking(currentUser, "evt_1", new BookingCreateRequest(1)))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> {
                    ApiException apiException = (ApiException) exception;
                    assertThat(apiException.getErrorCode()).isEqualTo(ErrorCode.EVENT_SOLD_OUT);
                    assertThat(apiException.getHttpStatus()).isEqualTo(HttpStatus.CONFLICT);
                });
    }

    @Test
    void createBookingRejectsTicketCountAbovePolicyLimit() {
        EventEntity event = event("evt_1", 20, 1, LocalDateTime.now().minusDays(1), 3);

        when(eventRepository.findByIdAndStatusAndVisibility("evt_1", EventStatus.PUBLISHED, EventVisibility.PUBLIC))
                .thenReturn(Optional.of(event));

        assertThatThrownBy(() -> bookingService.createBooking(currentUser, "evt_1", new BookingCreateRequest(4)))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> {
                    ApiException apiException = (ApiException) exception;
                    assertThat(apiException.getErrorCode()).isEqualTo(ErrorCode.BOOKING_QUANTITY_LIMIT_EXCEEDED);
                    assertThat(apiException.getHttpStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                });

        verify(eventInventoryRepository, never()).findByEventIdForUpdate(any());
    }

    @Test
    void createBookingRejectsMissingInventory() {
        EventEntity event = event("evt_1", 10, 0, LocalDateTime.now().minusDays(1));

        when(eventRepository.findByIdAndStatusAndVisibility("evt_1", EventStatus.PUBLISHED, EventVisibility.PUBLIC))
                .thenReturn(Optional.of(event));
        when(bookingRepository.existsByUserIdAndEventIdAndStatusIn(eq("usr_1"), eq("evt_1"), eq(EnumSet.of(BookingStatus.CONFIRMED))))
                .thenReturn(false);
        when(eventInventoryRepository.findByEventIdForUpdate("evt_1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.createBooking(currentUser, "evt_1", new BookingCreateRequest(1)))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> {
                    ApiException apiException = (ApiException) exception;
                    assertThat(apiException.getErrorCode()).isEqualTo(ErrorCode.EVENT_NOT_FOUND);
                    assertThat(apiException.getHttpStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                });
    }

    @Test
    void createBookingPersistsBookingAndReservesInventory() {
        EventEntity event = event("evt_1", 10, 1, LocalDateTime.now().minusDays(1));

        when(eventRepository.findByIdAndStatusAndVisibility("evt_1", EventStatus.PUBLISHED, EventVisibility.PUBLIC))
                .thenReturn(Optional.of(event));
        when(bookingRepository.existsByUserIdAndEventIdAndStatusIn(eq("usr_1"), eq("evt_1"), eq(EnumSet.of(BookingStatus.CONFIRMED))))
                .thenReturn(false);
        when(eventInventoryRepository.findByEventIdForUpdate("evt_1")).thenReturn(Optional.of(event.getInventory()));
        when(bookingRepository.save(any(BookingEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingCreateResponse response = bookingService.createBooking(currentUser, "evt_1", new BookingCreateRequest(2));

        assertThat(response.eventId()).isEqualTo("evt_1");
        assertThat(response.ticketCount()).isEqualTo(2);
        assertThat(response.status()).isEqualTo("confirmed");
        assertThat(response.unitPrice()).isEqualByComparingTo("45.00");
        assertThat(response.totalAmount()).isEqualByComparingTo("90.00");
        assertThat(response.bookingId()).startsWith("BK-");
        assertThat(event.getInventory().getReservedSlots()).isEqualTo(3);

        ArgumentCaptor<BookingEntity> captor = ArgumentCaptor.forClass(BookingEntity.class);
        verify(bookingRepository).save(captor.capture());
        assertThat(captor.getValue().getUserId()).isEqualTo("usr_1");
        assertThat(captor.getValue().getEventId()).isEqualTo("evt_1");
        assertThat(captor.getValue().getParticipantName()).isEqualTo("Alex Johnson");
        assertThat(captor.getValue().getTicketCount()).isEqualTo(2);
    }

    @Test
    void createBookingFailsWhenLockReleaseThrowsUnexpectedError() throws Exception {
        AutoCloseable brokenLock = () -> {
            throw new IOException("release failed");
        };
        when(bookingAdmissionGuard.acquireEventLock("evt_1")).thenReturn(brokenLock);
        EventEntity event = event("evt_1", 10, 1, LocalDateTime.now().minusDays(1));

        when(eventRepository.findByIdAndStatusAndVisibility("evt_1", EventStatus.PUBLISHED, EventVisibility.PUBLIC))
                .thenReturn(Optional.of(event));
        when(bookingRepository.existsByUserIdAndEventIdAndStatusIn(eq("usr_1"), eq("evt_1"), eq(EnumSet.of(BookingStatus.CONFIRMED))))
                .thenReturn(false);
        when(eventInventoryRepository.findByEventIdForUpdate("evt_1")).thenReturn(Optional.of(event.getInventory()));
        when(bookingRepository.save(any(BookingEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertThatThrownBy(() -> bookingService.createBooking(currentUser, "evt_1", new BookingCreateRequest(1)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Failed to release booking lock.");
    }

    @Test
    void cancelBookingMarksBookingCancelledAndReleasesInventory() {
        BookingEntity booking = BookingEntity.create(
                "booking-1",
                "BK-2026-ABC12345",
                "usr_1",
                "evt_1",
                "Alex Johnson",
                2,
                new BigDecimal("45.00"),
                new BigDecimal("90.00"),
                LocalDateTime.now().minusDays(1)
        );
        EventEntity event = event("evt_1", 10, 2, LocalDateTime.now().minusDays(2));
        ReflectionTestUtils.setField(event, "eventDateTime", LocalDateTime.now().plusDays(2));

        when(bookingRepository.findByBookingCodeAndUserIdForUpdate("BK-2026-ABC12345", "usr_1"))
                .thenReturn(Optional.of(booking));
        when(eventRepository.findById("evt_1")).thenReturn(Optional.of(event));
        when(eventInventoryRepository.findByEventIdForUpdate("evt_1")).thenReturn(Optional.of(event.getInventory()));

        bookingService.cancelBooking(currentUser, "BK-2026-ABC12345");

        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(event.getInventory().getReservedSlots()).isZero();
    }

    @Test
    void cancelBookingRejectsNonConfirmedStatus() {
        BookingEntity booking = BookingEntity.create(
                "booking-1",
                "BK-2026-CANCELLED",
                "usr_1",
                "evt_1",
                "Alex Johnson",
                2,
                new BigDecimal("45.00"),
                new BigDecimal("90.00"),
                LocalDateTime.now().minusDays(1)
        );
        ReflectionTestUtils.setField(booking, "status", BookingStatus.CANCELLED);

        when(bookingRepository.findByBookingCodeAndUserIdForUpdate("BK-2026-CANCELLED", "usr_1"))
                .thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancelBooking(currentUser, "BK-2026-CANCELLED"))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> {
                    ApiException apiException = (ApiException) exception;
                    assertThat(apiException.getErrorCode()).isEqualTo(ErrorCode.BOOKING_NOT_CANCELLABLE);
                    assertThat(apiException.getHttpStatus()).isEqualTo(HttpStatus.CONFLICT);
                });
    }

    @Test
    void cancelBookingRejectsAfterEventStarts() {
        BookingEntity booking = BookingEntity.create(
                "booking-1",
                "BK-2026-PAST",
                "usr_1",
                "evt_1",
                "Alex Johnson",
                2,
                new BigDecimal("45.00"),
                new BigDecimal("90.00"),
                LocalDateTime.now().minusDays(1)
        );
        EventEntity event = mock(EventEntity.class);
        when(event.getEventDateTime()).thenReturn(LocalDateTime.now(ZoneOffset.UTC).minusMinutes(5));

        when(bookingRepository.findByBookingCodeAndUserIdForUpdate("BK-2026-PAST", "usr_1"))
                .thenReturn(Optional.of(booking));
        when(eventRepository.findById("evt_1")).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> bookingService.cancelBooking(currentUser, "BK-2026-PAST"))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> {
                    ApiException apiException = (ApiException) exception;
                    assertThat(apiException.getErrorCode()).isEqualTo(ErrorCode.BOOKING_NOT_CANCELLABLE);
                    assertThat(apiException.getHttpStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                });

        verify(eventInventoryRepository, never()).findByEventIdForUpdate(any());
    }

    private EventEntity event(String id, int totalSlots, int reservedSlots, LocalDateTime reservationOpenDateTime) {
        return event(id, totalSlots, reservedSlots, reservationOpenDateTime, 10);
    }

    private EventEntity event(String id, int totalSlots, int reservedSlots, LocalDateTime reservationOpenDateTime, int maxTicketsPerBooking) {
        EventEntity event = EventEntity.create(
                id,
                user("usr_creator"),
                "Summer Jazz Night",
                EventCategory.CONCERT,
                "Experience an unforgettable evening of smooth jazz.",
                "https://example.com/image.jpg",
                "Blue Note Jazz Club, NYC",
                new BigDecimal("45.00"),
                LocalDateTime.now().plusDays(10),
                reservationOpenDateTime,
                maxTicketsPerBooking,
                EventStatus.PUBLISHED,
                EventVisibility.PUBLIC,
                LocalDateTime.now().minusDays(2),
                totalSlots
        );

        EventInventoryEntity inventory = event.getInventory();
        ReflectionTestUtils.setField(inventory, "reservedSlots", reservedSlots);
        return event;
    }

    private UserEntity user(String id) {
        UserEntity user = new UserEntity();
        ReflectionTestUtils.setField(user, "id", id);
        ReflectionTestUtils.setField(user, "email", "creator@example.com");
        ReflectionTestUtils.setField(user, "displayName", "Creator Name");
        ReflectionTestUtils.setField(user, "role", UserRole.USER);
        return user;
    }
}
