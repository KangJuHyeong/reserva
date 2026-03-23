package com.reserva.backend.dashboard.api;

import com.reserva.backend.dashboard.DashboardQueryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me")
public class DashboardController {

    private final DashboardQueryService dashboardQueryService;

    public DashboardController(DashboardQueryService dashboardQueryService) {
        this.dashboardQueryService = dashboardQueryService;
    }

    @GetMapping("/dashboard-summary")
    public DashboardSummaryResponse getDashboardSummary() {
        return dashboardQueryService.getDashboardSummary();
    }
}
