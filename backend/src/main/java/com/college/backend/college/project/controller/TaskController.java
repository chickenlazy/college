package com.college.backend.college.project.controller;

import com.college.backend.college.project.enums.TaskStatus;
import com.college.backend.college.project.request.TaskRequest;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.response.TaskResponse;
import com.college.backend.college.project.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class TaskController {

    private final TaskService taskService;

    @Autowired
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<ApiResponse> deleteTask(@PathVariable Integer taskId) {
        ApiResponse apiResponse = taskService.deleteTask(taskId);
        return ResponseEntity.ok(apiResponse);
    }

    // Phương thức PATCH để toggle trạng thái task
    @PatchMapping("/{taskId}/toggle")
    public ResponseEntity<TaskResponse> toggleTaskStatus(@PathVariable Integer taskId) {
        TaskResponse taskResponse = taskService.toggleTaskStatus(taskId);
        return ResponseEntity.ok(taskResponse);
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTaskForProject(@RequestBody TaskRequest taskRequest) {
        TaskResponse taskResponse = taskService.createTaskForProject(taskRequest);
        return new ResponseEntity<>(taskResponse, HttpStatus.CREATED);
    }

    /**
     * API để lấy danh sách tất cả các task với phân trang, tìm kiếm và lọc
     */
    @GetMapping
    public ResponseEntity<PagedResponse<TaskResponse>> getAllTasks(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) TaskStatus status) {

        PagedResponse<TaskResponse> taskResponse = taskService.getAllTasks(page, size, search, status);
        return ResponseEntity.ok(taskResponse);
    }

    /**
     * API để lấy chi tiết task theo ID
     */
    @GetMapping("/{taskId}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable Integer taskId) {
        TaskResponse taskResponse = taskService.getTaskById(taskId);
        return ResponseEntity.ok(taskResponse);
    }


    @PatchMapping("/{taskId}/status")
    public ResponseEntity<?> updateTaskStatus(
            @PathVariable Integer taskId,
            @RequestParam TaskStatus status) {
        TaskResponse taskResponse = taskService.updateTaskStatus(taskId, status);
        return ResponseEntity.ok(taskResponse);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<PagedResponse<TaskResponse>> getTasksByCreatedBy(
            @PathVariable Integer userId,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "status", required = false) TaskStatus status) {

        PagedResponse<TaskResponse> taskResponse = taskService.getTasksByCreatedBy(userId, page, size, status);
        return ResponseEntity.ok(taskResponse);
    }

}