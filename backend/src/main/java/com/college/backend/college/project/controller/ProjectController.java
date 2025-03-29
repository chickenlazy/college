package com.college.backend.college.project.controller;

import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.response.ProjectResponse;
import com.college.backend.college.project.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*",allowedHeaders = "*")
public class ProjectController {

    private final ProjectService projectService;

    @Autowired
    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    // Phương thức GET để lấy tất cả các dự án với phân trang
    @GetMapping
    public ResponseEntity<PagedResponse<ProjectResponse>> getAllProjects(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {

        // Gọi service để lấy dữ liệu phân trang
        PagedResponse<ProjectResponse> response = projectService.getAllProjects(pageNo, pageSize);

        // Trả về response dưới dạng HTTP Response Entity
        return ResponseEntity.ok(response);
    }
}
