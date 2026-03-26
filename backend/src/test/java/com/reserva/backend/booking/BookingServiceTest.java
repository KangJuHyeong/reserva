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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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

    private BookingService bookingService;
    private final CurrentUser currentUser = new CurrentUser("usr_1", "Alex Johnson");

    @BeforeEach
    void setUp() {
        bookingService = new BookingService(
                bookingRepository,
                eventRepository,
                eventInventoryRepository,
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

    private EventEntity event(String id, int totalSlots, int reservedSlots, LocalDateTime reservationOpenDateTime) {
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
