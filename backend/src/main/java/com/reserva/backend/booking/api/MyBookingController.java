package com.reserva.backend.booking.api;

import com.reserva.backend.booking.BookingQueryService;
import com.reserva.backend.booking.BookingService;
import com.reserva.backend.common.api.PageResponse;
import com.reserva.backend.common.security.CurrentUser;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.http.HttpStatus.NO_CONTENT;

@Validated
@RestController
@RequestMapping("/api/v1/me/bookings")
public class MyBookingController {

    private final BookingQueryService bookingQueryService;
    private final BookingService bookingService;

    public MyBookingController(BookingQueryService bookingQueryService,
                               BookingService bookingService) {
        this.bookingQueryService = bookingQueryService;
        this.bookingService = bookingService;
    }

    @GetMapping
    public PageResponse<BookingSummaryResponse> getMyBookings(
            @AuthenticationPrincipal CurrentUser currentUser,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size
    ) {
        return bookingQueryService.getMyBookings(currentUser, status, page, size);
    }

    @GetMapping("/{bookingId}")
    public BookingDetailResponse getMyBookingDetail(@AuthenticationPrincipal CurrentUser currentUser,
                                                    @PathVariable String bookingId) {
        return bookingQueryService.getMyBookingDetail(currentUser, bookingId);
    }

    @PostMapping("/{bookingId}/cancel")
    @ResponseStatus(NO_CONTENT)
    public void cancelMyBooking(@AuthenticationPrincipal CurrentUser currentUser,
                                @PathVariable String bookingId) {
        bookingService.cancelBooking(currentUser, bookingId);
    }
}
