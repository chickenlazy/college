package com.college.backend.college.project.service;

import com.college.backend.college.project.request.TaskRequest;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.TaskResponse;

public interface TaskService {
    ApiResponse deleteTask(Integer taskId);
    TaskResponse toggleTaskStatus(Integer taskId);
    TaskResponse createTaskForProject(TaskRequest taskRequest);
}
