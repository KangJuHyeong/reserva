package com.reserva.backend.dashboard.api;

import com.reserva.backend.dashboard.DashboardQueryService;
import com.reserva.backend.common.api.PageResponse;
import com.reserva.backend.common.security.CurrentUser;
import com.reserva.backend.event.EventQueryService;
import com.reserva.backend.event.api.EventDetailResponse;
import com.reserva.backend.event.api.EventSummaryResponse;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/me")
public class DashboardController {

    private final DashboardQueryService dashboardQueryService;
    private final EventQueryService eventQueryService;

    public DashboardController(DashboardQueryService dashboardQueryService,
                               EventQueryService eventQueryService) {
        this.dashboardQueryService = dashboardQueryService;
        this.eventQueryService = eventQueryService;
    }

    @GetMapping("/dashboard-summary")
    public DashboardSummaryResponse getDashboardSummary(@AuthenticationPrincipal CurrentUser currentUser) {
        return dashboardQueryService.getDashboardSummary(currentUser);
    }

    @GetMapping("/events")
    public PageResponse<EventSummaryResponse> getMyEvents(
            @AuthenticationPrincipal CurrentUser currentUser,
            @RequestParam(required = false) String filter,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size
    ) {
        return eventQueryService.getMyEvents(currentUser, filter, sort, page, size);
    }

    @GetMapping("/events/{eventId}")
    public EventDetailResponse getMyEventDetail(@AuthenticationPrincipal CurrentUser currentUser,
                                                @PathVariable String eventId) {
        return eventQueryService.getMyEventDetail(currentUser, eventId);
    }
}
