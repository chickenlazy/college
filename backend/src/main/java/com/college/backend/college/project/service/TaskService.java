package com.college.backend.college.project.service;

import com.college.backend.college.project.enums.TaskStatus;
import com.college.backend.college.project.request.TaskRequest;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.response.TaskResponse;

public interface TaskService {
    // Thêm vào interface TaskService
    TaskResponse updateTask(Integer taskId, TaskRequest taskRequest);
    ApiResponse deleteTask(Integer taskId);
    TaskResponse toggleTaskStatus(Integer taskId);
    TaskResponse createTaskForProject(TaskRequest taskRequest);
    PagedResponse<TaskResponse> getAllTasks(int pageNo, int pageSize, String search, TaskStatus status);
    TaskResponse getTaskById(Integer taskId);
    TaskResponse updateTaskStatus(Integer taskId, TaskStatus newStatus);
    PagedResponse<TaskResponse> getTasksByCreatedBy(Integer userId, int pageNo, int pageSize, TaskStatus status);
}