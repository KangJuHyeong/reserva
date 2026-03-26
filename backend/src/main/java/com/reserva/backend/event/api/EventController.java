package com.reserva.backend.event.api;

import com.reserva.backend.booking.BookingService;
import com.reserva.backend.booking.api.BookingCreateRequest;
import com.reserva.backend.booking.api.BookingCreateResponse;
import com.reserva.backend.common.api.PageResponse;
import com.reserva.backend.common.security.CurrentUser;
import com.reserva.backend.event.EventCommandService;
import com.reserva.backend.event.EventQueryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.http.HttpStatus.CREATED;

@Validated
@RestController
@RequestMapping("/api/v1/events")
public class EventController {

    private final EventQueryService eventQueryService;
    private final EventCommandService eventCommandService;
    private final BookingService bookingService;

    public EventController(EventQueryService eventQueryService, EventCommandService eventCommandService, BookingService bookingService) {
        this.eventQueryService = eventQueryService;
        this.eventCommandService = eventCommandService;
        this.bookingService = bookingService;
    }

    @GetMapping
    public PageResponse<EventSummaryResponse> getEvents(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String section,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size
    ) {
        return eventQueryService.getEvents(q, category, section, page, size);
    }

    @GetMapping("/{eventId}")
    public EventDetailResponse getEventDetail(@PathVariable String eventId) {
        return eventQueryService.getEventDetail(eventId);
    }

    @PostMapping
    @ResponseStatus(CREATED)
    public EventCreateResponse createEvent(@AuthenticationPrincipal CurrentUser currentUser,
                                           @Valid @RequestBody EventCreateRequest request) {
        return eventCommandService.createEvent(currentUser, request);
    }

    @PostMapping("/{eventId}/bookings")
    @ResponseStatus(CREATED)
    public BookingCreateResponse createBooking(@AuthenticationPrincipal CurrentUser currentUser,
                                               @PathVariable String eventId,
                                               @Valid @RequestBody BookingCreateRequest request) {
        return bookingService.createBooking(currentUser, eventId, request);
    }
}
