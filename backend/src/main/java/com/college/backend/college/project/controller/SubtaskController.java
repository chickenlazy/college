package com.college.backend.college.project.controller;

import com.college.backend.college.project.request.SubtaskRequest;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.SubtaskResponse;
import com.college.backend.college.project.service.SubtaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subtasks")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class SubtaskController {

    private final SubtaskService subtaskService;

    @Autowired
    public SubtaskController(SubtaskService subtaskService) {
        this.subtaskService = subtaskService;
    }

    @PostMapping
    public ResponseEntity<SubtaskResponse> createSubtask(@RequestBody SubtaskRequest subtaskRequest) {
        SubtaskResponse subtaskResponse = subtaskService.createSubtask(subtaskRequest);
        return new ResponseEntity<>(subtaskResponse, HttpStatus.CREATED);
    }

    // Phương thức DELETE để xóa subtask
    @DeleteMapping("/{subtaskId}")
    public ResponseEntity<ApiResponse> deleteSubtask(@PathVariable Integer subtaskId) {
        ApiResponse apiResponse = subtaskService.deleteSubtask(subtaskId);
        return ResponseEntity.ok(apiResponse);
    }

    // Phương thức PATCH để chuyển đổi trạng thái subtask
    @PatchMapping("/{subtaskId}/toggle")
    public ResponseEntity<SubtaskResponse> toggleSubtaskStatus(@PathVariable Integer subtaskId) {
        SubtaskResponse subtaskResponse = subtaskService.toggleSubtaskStatus(subtaskId);
        return ResponseEntity.ok(subtaskResponse);
    }
}