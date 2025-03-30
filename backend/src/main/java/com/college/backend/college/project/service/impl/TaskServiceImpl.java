package com.college.backend.college.project.service.impl;

import com.college.backend.college.project.entity.Project;
import com.college.backend.college.project.entity.Subtask;
import com.college.backend.college.project.entity.Task;
import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.enums.TaskStatus;
import com.college.backend.college.project.exception.ResourceNotFoundException;
import com.college.backend.college.project.mapper.SubtaskMapper;
import com.college.backend.college.project.mapper.TaskMapper;
import com.college.backend.college.project.repository.ProjectRepository;
import com.college.backend.college.project.repository.SubtaskRepository;
import com.college.backend.college.project.repository.TaskRepository;
import com.college.backend.college.project.repository.UserRepository;
import com.college.backend.college.project.request.SubtaskRequest;
import com.college.backend.college.project.request.TaskRequest;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.SubtaskResponse;
import com.college.backend.college.project.response.TaskResponse;
import com.college.backend.college.project.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final SubtaskRepository subtaskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Autowired
    public TaskServiceImpl(TaskRepository taskRepository, SubtaskRepository subtaskRepository, ProjectRepository projectRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.subtaskRepository = subtaskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public ApiResponse deleteTask(Integer taskId) {
        // Kiểm tra xem Task có tồn tại hay không
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        // Xóa tất cả các Subtask liên quan đến Task này
        subtaskRepository.deleteAllByTask(task);

        // Xóa Task
        taskRepository.delete(task);

        // Trả về phản hồi thành công
        return new ApiResponse(Boolean.TRUE, "Task deleted successfully");
    }


    @Override
    @Transactional
    public TaskResponse toggleTaskStatus(Integer taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        // Chuyển đổi trạng thái task
        if (task.getStatus() == TaskStatus.COMPLETED) {
            // Nếu đã hoàn thành, chuyển sang trạng thái trước đó hoặc IN_PROGRESS
            task.setStatus(TaskStatus.IN_PROGRESS);
        } else {
            // Nếu chưa hoàn thành, chuyển sang COMPLETED
            task.setStatus(TaskStatus.COMPLETED);
        }

        // Cập nhật thời gian chỉnh sửa
        task.setLastModifiedDate(new Date());

        // Lưu task đã cập nhật
        Task updatedTask = taskRepository.save(task);

        // Chuyển đổi và trả về response
        return TaskMapper.INSTANCE.taskToTaskResponse(updatedTask);
    }

    public TaskResponse createTaskForProject(TaskRequest taskRequest) {
        // Validate project existence
        Project project = projectRepository.findById(taskRequest.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + taskRequest.getProjectId()));

        // Create new task from the request
        Task task = TaskMapper.INSTANCE.taskRequestToTask(taskRequest);

        // Set current date for creation and modification
        Date now = new Date();
        task.setCreatedDate(now);
        task.setLastModifiedDate(now);

        // Set the project for the task
        task.setProject(project);

        // Set default status if not provided
        if (task.getStatus() == null) {
            task.setStatus(TaskStatus.NOT_STARTED);
        }

        // Initialize empty sets for subtasks and comments if needed
        task.setSubtasks(new HashSet<>());
        task.setComments(new HashSet<>());

        // Save the task first to get task ID for subtasks
        Task savedTask = taskRepository.save(task);

        // Process and create subtasks if provided
        Set<Subtask> createdSubtasks = new HashSet<>();
        if (taskRequest.getSubtaskRequests() != null && !taskRequest.getSubtaskRequests().isEmpty()) {
            for (SubtaskRequest subtaskRequest : taskRequest.getSubtaskRequests()) {
                // Create Subtask entity
                Subtask subtask = new Subtask();
                subtask.setName(subtaskRequest.getName());
                subtask.setCompleted(subtaskRequest.getCompleted() != null ? subtaskRequest.getCompleted() : false);
                subtask.setTask(savedTask);

                // Handle assignee if provided
                User assignee = null;
                if (subtaskRequest.getAssigneeId() != null) {
                    assignee = userRepository.findById(subtaskRequest.getAssigneeId())
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + subtaskRequest.getAssigneeId()));
                    subtask.setAssignee(assignee);
                }

                // Save subtask
                Subtask savedSubtask = subtaskRepository.save(subtask);
                createdSubtasks.add(savedSubtask);
            }

            // Update task with created subtasks
            savedTask.setSubtasks(createdSubtasks);
            savedTask = taskRepository.save(savedTask);
        }

        // Map to response
        TaskResponse taskResponse = TaskMapper.INSTANCE.taskToTaskResponse(savedTask);

        // Set project details in the response
        taskResponse.setProjectId(project.getId());
        taskResponse.setProjectName(project.getName());

        // Calculate subtask statistics
        Set<Subtask> subtasks = savedTask.getSubtasks();
        int totalSubtasks = subtasks != null ? subtasks.size() : 0;
        int completedSubtasks = subtasks != null ?
                (int) subtasks.stream()
                        .filter(Subtask::getCompleted)
                        .count() : 0;

        // Set subtask-related fields
        taskResponse.setTotalSubtasks(totalSubtasks);
        taskResponse.setTotalCompletedSubtasks(completedSubtasks);

        // Calculate and set progress
        double progress = totalSubtasks > 0 ?
                ((double) completedSubtasks / totalSubtasks) * 100.0 : 0.0;
        taskResponse.setProgress(progress);

        // Map subtasks to SubtaskResponse with full user information
        if (subtasks != null) {
            Set<SubtaskResponse> subtaskResponses = subtasks.stream()
                    .map(subtask -> {
                        SubtaskResponse subtaskResponse = SubtaskMapper.INSTANCE.subtaskToSubtaskRes(subtask);

                        // Set assignee details if exists
                        if (subtask.getAssignee() != null) {
                            subtaskResponse.setAssigneeId(subtask.getAssignee().getId());
                            subtaskResponse.setAssigneeName(subtask.getAssignee().getFullName());
                            subtaskResponse.setAssigneeEmail(subtask.getAssignee().getEmail());
                        }

                        return subtaskResponse;
                    })
                    .collect(Collectors.toSet());
            taskResponse.setSubTasks(subtaskResponses);
        } else {
            taskResponse.setSubTasks(new HashSet<>());
        }

        // Ensure comments are initialized
        taskResponse.setComments(
                taskResponse.getComments() != null ?
                        taskResponse.getComments() : new HashSet<>()
        );

        return taskResponse;
    }
}