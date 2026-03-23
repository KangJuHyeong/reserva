package com.reserva.backend.dashboard.api;

import com.reserva.backend.dashboard.DashboardQueryService;
import com.reserva.backend.common.api.PageResponse;
import com.reserva.backend.event.EventQueryService;
import com.reserva.backend.event.api.EventSummaryResponse;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
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
    public DashboardSummaryResponse getDashboardSummary() {
        return dashboardQueryService.getDashboardSummary();
    }

    @GetMapping("/events")
    public PageResponse<EventSummaryResponse> getMyEvents(
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size
    ) {
        return eventQueryService.getMyEvents(page, size);
    }
}
