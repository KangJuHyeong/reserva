package com.reserva.backend.booking;

import com.reserva.backend.booking.api.BookingDetailEventResponse;
import com.reserva.backend.booking.api.BookingDetailResponse;
import com.reserva.backend.booking.api.BookingSummaryResponse;
import com.reserva.backend.booking.model.BookingStatus;
import com.reserva.backend.common.api.PageResponse;
import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
import com.reserva.backend.common.security.CurrentUser;
import com.reserva.backend.event.EventEntity;
import com.reserva.backend.event.EventRepository;
import com.reserva.backend.event.api.EventHostResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class BookingQueryService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;

    public BookingQueryService(BookingRepository bookingRepository,
                               EventRepository eventRepository) {
        this.bookingRepository = bookingRepository;
        this.eventRepository = eventRepository;
    }

    public PageResponse<BookingSummaryResponse> getMyBookings(CurrentUser currentUser, String status, int page, int size) {
        PageRequest pageable = PageRequest.of(page - 1, size);
        BookingStatus bookingStatus = parseStatus(status);

        Page<BookingEntity> bookingsPage = bookingStatus == null
                ? bookingRepository.findByUserIdOrderByBookedAtDesc(currentUser.id(), pageable)
                : bookingRepository.findByUserIdAndStatusOrderByBookedAtDesc(currentUser.id(), bookingStatus, pageable);

        Map<String, EventEntity> eventMap = eventRepository.findAllById(
                        bookingsPage.getContent().stream().map(BookingEntity::getEventId).distinct().toList()
                ).stream()
                .collect(Collectors.toMap(EventEntity::getId, Function.identity()));

        List<BookingSummaryResponse> items = bookingsPage.getContent().stream()
                .map(booking -> toSummaryResponse(booking, requireEvent(eventMap, booking.getEventId())))
                .toList();

        return new PageResponse<>(items, page, size, bookingsPage.getTotalElements());
    }

    public BookingDetailResponse getMyBookingDetail(CurrentUser currentUser, String bookingId) {
        BookingEntity booking = bookingRepository.findByBookingCodeAndUserId(bookingId, currentUser.id())
                .orElseThrow(() -> new ApiException(ErrorCode.BOOKING_NOT_FOUND, HttpStatus.NOT_FOUND, "The booking was not found."));

        EventEntity event = eventRepository.findById(booking.getEventId())
                .orElseThrow(() -> new ApiException(ErrorCode.BOOKING_NOT_FOUND, HttpStatus.NOT_FOUND, "The booking was not found."));

        return new BookingDetailResponse(
                booking.getBookingCode(),
                booking.getEventId(),
                toApiStatus(booking.getStatus()),
                booking.getParticipantName(),
                booking.getTicketCount(),
                toOffsetDateTime(booking.getBookedAt()),
                booking.getUnitPrice(),
                booking.getTotalAmount(),
                new BookingDetailEventResponse(
                        event.getId(),
                        event.getTitle(),
                        event.getImageUrl(),
                        event.getCategory().getLabel(),
                        event.getDescription(),
                        event.getLocation(),
                        toOffsetDateTime(event.getEventDateTime()),
                        toOffsetDateTime(event.getReservationOpenDateTime()),
                        new EventHostResponse(
                                event.getCreator().getId(),
                                event.getCreator().getDisplayName(),
                                event.getCreator().getProfileImageUrl()
                        )
                )
        );
    }

    private BookingSummaryResponse toSummaryResponse(BookingEntity booking, EventEntity event) {
        return new BookingSummaryResponse(
                booking.getBookingCode(),
                booking.getEventId(),
                event.getTitle(),
                event.getImageUrl(),
                toApiStatus(booking.getStatus()),
                event.getLocation(),
                toOffsetDateTime(event.getEventDateTime()),
                toOffsetDateTime(booking.getBookedAt()),
                booking.getTicketCount()
        );
    }

    private EventEntity requireEvent(Map<String, EventEntity> eventMap, String eventId) {
        EventEntity event = eventMap.get(eventId);
        if (event == null) {
            throw new ApiException(ErrorCode.BOOKING_NOT_FOUND, HttpStatus.NOT_FOUND, "The booking was not found.");
        }
        return event;
    }

    private BookingStatus parseStatus(String rawStatus) {
        if (rawStatus == null || rawStatus.isBlank()) {
            return null;
        }

        try {
            return BookingStatus.valueOf(rawStatus.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new ApiException(
                    ErrorCode.VALIDATION_ERROR,
                    HttpStatus.BAD_REQUEST,
                    "Unsupported booking status: " + rawStatus
            );
        }
    }

    private String toApiStatus(BookingStatus status) {
        return status.name().toLowerCase(Locale.ROOT);
    }

    private OffsetDateTime toOffsetDateTime(LocalDateTime localDateTime) {
        return localDateTime.atOffset(ZoneOffset.UTC);
    }
}
