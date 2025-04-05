package com.college.backend.college.project.controller;

import com.college.backend.college.project.response.DashboardResponse;
import com.college.backend.college.project.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    @Autowired
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboardData() {
        DashboardResponse dashboardData = dashboardService.getDashboardData();
        return ResponseEntity.ok(dashboardData);
    }
}