package com.college.backend.college.project.service;

import com.college.backend.college.project.enums.TaskStatus;
import com.college.backend.college.project.request.TaskRequest;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.response.TaskResponse;

public interface TaskService {
    ApiResponse deleteTask(Integer taskId);
    TaskResponse toggleTaskStatus(Integer taskId);
    TaskResponse createTaskForProject(TaskRequest taskRequest);
    PagedResponse<TaskResponse> getAllTasks(int pageNo, int pageSize, String search, TaskStatus status);
    TaskResponse getTaskById(Integer taskId);
}
