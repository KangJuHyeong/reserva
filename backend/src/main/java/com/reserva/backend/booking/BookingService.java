package com.reserva.backend.booking;

import com.reserva.backend.booking.api.BookingCreateRequest;
import com.reserva.backend.booking.api.BookingCreateResponse;
import com.reserva.backend.booking.model.BookingStatus;
import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
import com.reserva.backend.common.security.CurrentUser;
import com.reserva.backend.event.EventEntity;
import com.reserva.backend.event.EventInventoryEntity;
import com.reserva.backend.event.EventInventoryRepository;
import com.reserva.backend.event.EventRepository;
import com.reserva.backend.event.model.EventStatus;
import com.reserva.backend.event.model.EventVisibility;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.EnumSet;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final EventInventoryRepository eventInventoryRepository;
    private final BookingAdmissionGuard bookingAdmissionGuard;
    private final String bookingCodePrefix;

    public BookingService(BookingRepository bookingRepository,
                          EventRepository eventRepository,
                          EventInventoryRepository eventInventoryRepository,
                          BookingAdmissionGuard bookingAdmissionGuard,
                          @Value("${app.booking.code-prefix:BK}") String bookingCodePrefix) {
        this.bookingRepository = bookingRepository;
        this.eventRepository = eventRepository;
        this.eventInventoryRepository = eventInventoryRepository;
        this.bookingAdmissionGuard = bookingAdmissionGuard;
        this.bookingCodePrefix = bookingCodePrefix;
    }

    @Transactional
    public BookingCreateResponse createBooking(CurrentUser currentUser, String eventId, BookingCreateRequest request) {
        try (AutoCloseable ignored = bookingAdmissionGuard.acquireEventLock(eventId)) {
            return createBookingWithinLock(currentUser, eventId, request);
        } catch (ApiException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to release booking lock.", exception);
        }
    }

    private BookingCreateResponse createBookingWithinLock(CurrentUser currentUser, String eventId, BookingCreateRequest request) {
        if (request.ticketCount() < 1) {
            throw new ApiException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "ticketCount must be at least 1");
        }

        EventEntity event = eventRepository.findByIdAndStatusAndVisibility(eventId, EventStatus.PUBLISHED, EventVisibility.PUBLIC)
                .orElseThrow(() -> new ApiException(ErrorCode.EVENT_NOT_FOUND, HttpStatus.NOT_FOUND, "The event was not found."));

        if (event.getReservationOpenDateTime().isAfter(LocalDateTime.now())) {
            throw new ApiException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Reservation is not open yet.");
        }

        if (request.ticketCount() > event.getMaxTicketsPerBooking()) {
            throw new ApiException(
                    ErrorCode.BOOKING_QUANTITY_LIMIT_EXCEEDED,
                    HttpStatus.BAD_REQUEST,
                    "ticketCount must not exceed " + event.getMaxTicketsPerBooking() + " for a single booking."
            );
        }

        if (bookingRepository.existsByUserIdAndEventIdAndStatusIn(currentUser.id(), eventId, EnumSet.of(BookingStatus.CONFIRMED))) {
            throw new ApiException(ErrorCode.ALREADY_BOOKED, HttpStatus.CONFLICT, "The user already has an active booking for this event.");
        }

        EventInventoryEntity inventory = eventInventoryRepository.findByEventIdForUpdate(eventId)
                .orElseThrow(() -> new ApiException(ErrorCode.EVENT_NOT_FOUND, HttpStatus.NOT_FOUND, "Inventory was not found for this event."));

        if (inventory.getRemainingSlots() < request.ticketCount()) {
            throw new ApiException(ErrorCode.EVENT_SOLD_OUT, HttpStatus.CONFLICT, "The event is sold out.");
        }

        inventory.reserve(request.ticketCount());

        LocalDateTime bookedAt = LocalDateTime.now();
        BigDecimal totalAmount = event.getPrice().multiply(BigDecimal.valueOf(request.ticketCount()));
        BookingEntity booking = BookingEntity.create(
                UUID.randomUUID().toString(),
                generateBookingCode(),
                currentUser.id(),
                event.getId(),
                currentUser.name(),
                request.ticketCount(),
                event.getPrice(),
                totalAmount,
                bookedAt
        );

        bookingRepository.save(booking);

        return new BookingCreateResponse(
                booking.getBookingCode(),
                booking.getEventId(),
                booking.getStatus().name().toLowerCase(),
                booking.getTicketCount(),
                booking.getBookedAt().atOffset(ZoneOffset.UTC),
                booking.getUnitPrice(),
                booking.getTotalAmount()
        );
    }

    @Transactional
    public void cancelBooking(CurrentUser currentUser, String bookingId) {
        BookingEntity booking = bookingRepository.findByBookingCodeAndUserIdForUpdate(bookingId, currentUser.id())
                .orElseThrow(() -> new ApiException(ErrorCode.BOOKING_NOT_FOUND, HttpStatus.NOT_FOUND, "The booking was not found."));

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new ApiException(
                    ErrorCode.BOOKING_NOT_CANCELLABLE,
                    HttpStatus.CONFLICT,
                    "Only confirmed bookings can be cancelled."
            );
        }

        EventEntity event = eventRepository.findById(booking.getEventId())
                .orElseThrow(() -> new ApiException(ErrorCode.BOOKING_NOT_FOUND, HttpStatus.NOT_FOUND, "The booking was not found."));

        if (!LocalDateTime.now(ZoneOffset.UTC).isBefore(event.getEventDateTime())) {
            throw new ApiException(
                    ErrorCode.BOOKING_NOT_CANCELLABLE,
                    HttpStatus.FORBIDDEN,
                    "You can only cancel a booking before the event starts."
            );
        }

        EventInventoryEntity inventory = eventInventoryRepository.findByEventIdForUpdate(booking.getEventId())
                .orElseThrow(() -> new ApiException(ErrorCode.EVENT_NOT_FOUND, HttpStatus.NOT_FOUND, "Inventory was not found for this event."));

        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        inventory.release(booking.getTicketCount(), now);
        booking.cancel(now);
    }

    private String generateBookingCode() {
        int year = OffsetDateTime.now(ZoneOffset.UTC).getYear();
        return bookingCodePrefix + "-" + year + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
