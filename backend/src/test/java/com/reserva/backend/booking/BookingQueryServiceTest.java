package com.reserva.backend.booking;

import com.reserva.backend.booking.api.BookingDetailResponse;
import com.reserva.backend.booking.api.BookingSummaryResponse;
import com.reserva.backend.booking.model.BookingStatus;
import com.reserva.backend.common.api.PageResponse;
import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
import com.reserva.backend.common.security.CurrentUser;
import com.reserva.backend.event.EventEntity;
import com.reserva.backend.event.EventInventoryEntity;
import com.reserva.backend.event.EventRepository;
import com.reserva.backend.event.model.EventCategory;
import com.reserva.backend.user.UserEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingQueryServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private BookingQueryService bookingQueryService;

    @BeforeEach
    void setUp() {
        bookingQueryService = new BookingQueryService(bookingRepository, eventRepository);
    }

    @Test
    void getMyBookingsReturnsPagedBookingSummaries() {
        CurrentUser currentUser = new CurrentUser("usr_1", "Alex Johnson");
        BookingEntity booking = booking("BK-2026-ABC12345", "usr_1", "evt_1", BookingStatus.CONFIRMED);
        EventEntity event = event("evt_1");

        when(bookingRepository.findByUserIdOrderByBookedAtDesc("usr_1", PageRequest.of(0, 20)))
                .thenReturn(new PageImpl<>(List.of(booking), PageRequest.of(0, 20), 1));
        when(eventRepository.findAllById(List.of("evt_1"))).thenReturn(List.of(event));

        PageResponse<BookingSummaryResponse> response = bookingQueryService.getMyBookings(currentUser, null, 1, 20);

        assertThat(response.total()).isEqualTo(1);
        assertThat(response.items()).hasSize(1);
        BookingSummaryResponse item = response.items().getFirst();
        assertThat(item.bookingId()).isEqualTo("BK-2026-ABC12345");
        assertThat(item.eventId()).isEqualTo("evt_1");
        assertThat(item.title()).isEqualTo("Summer Jazz Night");
        assertThat(item.status()).isEqualTo("confirmed");
        assertThat(item.ticketCount()).isEqualTo(2);
    }

    @Test
    void getMyBookingsAppliesStatusFilter() {
        CurrentUser currentUser = new CurrentUser("usr_1", "Alex Johnson");

        when(bookingRepository.findByUserIdAndStatusOrderByBookedAtDesc("usr_1", BookingStatus.CANCELLED, PageRequest.of(0, 20)))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));
        when(eventRepository.findAllById(List.of())).thenReturn(List.of());

        PageResponse<BookingSummaryResponse> response = bookingQueryService.getMyBookings(currentUser, "cancelled", 1, 20);

        assertThat(response.items()).isEmpty();
        verify(bookingRepository).findByUserIdAndStatusOrderByBookedAtDesc("usr_1", BookingStatus.CANCELLED, PageRequest.of(0, 20));
    }

    @Test
    void getMyBookingsThrowsValidationErrorForUnsupportedStatus() {
        assertThatThrownBy(() -> bookingQueryService.getMyBookings(new CurrentUser("usr_1", "Alex Johnson"), "pending", 1, 20))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> {
                    ApiException apiException = (ApiException) exception;
                    assertThat(apiException.getErrorCode()).isEqualTo(ErrorCode.VALIDATION_ERROR);
                    assertThat(apiException.getHttpStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                });
    }

    @Test
    void getMyBookingDetailReturnsCurrentUsersBooking() {
        CurrentUser currentUser = new CurrentUser("usr_1", "Alex Johnson");
        BookingEntity booking = booking("BK-2026-ABC12345", "usr_1", "evt_1", BookingStatus.CONFIRMED);
        EventEntity event = event("evt_1");

        when(bookingRepository.findByBookingCodeAndUserId("BK-2026-ABC12345", "usr_1")).thenReturn(Optional.of(booking));
        when(eventRepository.findByIdWithCreator("evt_1")).thenReturn(Optional.of(event));

        BookingDetailResponse response = bookingQueryService.getMyBookingDetail(currentUser, "BK-2026-ABC12345");

        assertThat(response.bookingId()).isEqualTo("BK-2026-ABC12345");
        assertThat(response.participantName()).isEqualTo("Alex Johnson");
        assertThat(response.event().title()).isEqualTo("Summer Jazz Night");
        assertThat(response.event().host().name()).isEqualTo("Jazz Collective NYC");
    }

    @Test
    void getMyBookingDetailThrowsWhenBookingDoesNotExist() {
        CurrentUser currentUser = new CurrentUser("usr_1", "Alex Johnson");

        when(bookingRepository.findByBookingCodeAndUserId("BK-2026-MISSING", "usr_1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingQueryService.getMyBookingDetail(currentUser, "BK-2026-MISSING"))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> {
                    ApiException apiException = (ApiException) exception;
                    assertThat(apiException.getErrorCode()).isEqualTo(ErrorCode.BOOKING_NOT_FOUND);
                    assertThat(apiException.getHttpStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                });
    }

    @Test
    void getMyBookingDetailHidesOtherUsersBooking() {
        CurrentUser currentUser = new CurrentUser("usr_1", "Alex Johnson");

        when(bookingRepository.findByBookingCodeAndUserId("BK-2026-OTHER", "usr_1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingQueryService.getMyBookingDetail(currentUser, "BK-2026-OTHER"))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> assertThat(((ApiException) exception).getErrorCode()).isEqualTo(ErrorCode.BOOKING_NOT_FOUND));
    }

    private BookingEntity booking(String bookingCode, String userId, String eventId, BookingStatus status) {
        BookingEntity booking = BookingEntity.create(
                "booking-1",
                bookingCode,
                userId,
                eventId,
                "Alex Johnson",
                2,
                new BigDecimal("45.00"),
                new BigDecimal("90.00"),
                LocalDateTime.of(2026, 3, 5, 9, 30)
        );
        ReflectionTestUtils.setField(booking, "status", status);
        return booking;
    }

    private EventEntity event(String eventId) {
        UserEntity creator = new UserEntity();
        ReflectionTestUtils.setField(creator, "id", "usr_creator");
        ReflectionTestUtils.setField(creator, "displayName", "Jazz Collective NYC");
        ReflectionTestUtils.setField(creator, "profileImageUrl", "https://example.com/avatar.jpg");
        ReflectionTestUtils.setField(creator, "role", com.reserva.backend.common.model.UserRole.CREATOR);

        EventInventoryEntity inventory = new EventInventoryEntity();
        ReflectionTestUtils.setField(inventory, "eventId", eventId);
        ReflectionTestUtils.setField(inventory, "totalSlots", 100);
        ReflectionTestUtils.setField(inventory, "reservedSlots", 87);

        EventEntity event = new EventEntity();
        ReflectionTestUtils.setField(event, "id", eventId);
        ReflectionTestUtils.setField(event, "creator", creator);
        ReflectionTestUtils.setField(event, "title", "Summer Jazz Night");
        ReflectionTestUtils.setField(event, "category", EventCategory.CONCERT);
        ReflectionTestUtils.setField(event, "description", "Experience an unforgettable evening of smooth jazz.");
        ReflectionTestUtils.setField(event, "imageUrl", "https://example.com/image.jpg");
        ReflectionTestUtils.setField(event, "location", "Blue Note Jazz Club, NYC");
        ReflectionTestUtils.setField(event, "price", new BigDecimal("45.00"));
        ReflectionTestUtils.setField(event, "eventDateTime", LocalDateTime.of(2026, 3, 15, 20, 0));
        ReflectionTestUtils.setField(event, "reservationOpenDateTime", LocalDateTime.of(2026, 3, 8, 10, 0));
        ReflectionTestUtils.setField(event, "inventory", inventory);
        return event;
    }
}
