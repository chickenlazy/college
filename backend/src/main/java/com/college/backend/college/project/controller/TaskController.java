package com.college.backend.college.project.controller;

import com.college.backend.college.project.request.TaskRequest;
import com.college.backend.college.project.response.ApiResponse;
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

}