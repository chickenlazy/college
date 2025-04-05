package com.college.backend.college.project.controller;

import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.utils.ProjectTaskScheduler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ProjectTaskScheduler scheduler; // Đã đổi tên từ TaskScheduler

    @Autowired
    public AdminController(ProjectTaskScheduler scheduler) {
        this.scheduler = scheduler;
    }

    @PostMapping("/trigger-status-update")
    public ResponseEntity<ApiResponse> triggerStatusUpdate() {
        scheduler.updateOverdueStatus(); // Gọi phương thức trực tiếp
        return ResponseEntity.ok(new ApiResponse(true, "Status update triggered successfully"));
    }
}
