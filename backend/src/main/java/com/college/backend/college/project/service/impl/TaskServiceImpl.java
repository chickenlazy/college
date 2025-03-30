package com.college.backend.college.project.service.impl;

import com.college.backend.college.project.entity.Subtask;
import com.college.backend.college.project.entity.Task;
import com.college.backend.college.project.enums.TaskStatus;
import com.college.backend.college.project.exception.ResourceNotFoundException;
import com.college.backend.college.project.mapper.ProjectMapper;
import com.college.backend.college.project.mapper.TaskMapper;
import com.college.backend.college.project.repository.SubtaskRepository;
import com.college.backend.college.project.repository.TaskRepository;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.TaskResponse;
import com.college.backend.college.project.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final SubtaskRepository subtaskRepository;

    @Autowired
    public TaskServiceImpl(TaskRepository taskRepository, SubtaskRepository subtaskRepository) {
        this.taskRepository = taskRepository;
        this.subtaskRepository = subtaskRepository;
    }

    // Các phương thức khác

    @Override
    @Transactional
    public ApiResponse deleteTask(Integer taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        // Trước khi xóa task, cần đảm bảo tất cả các subtask đã được lưu
        // và không còn trạng thái transient
        if (task.getSubtasks() != null) {
            for (Subtask subtask : task.getSubtasks()) {
                // Đảm bảo tất cả subtask đã được lưu vào DB
                if (subtask.getId() == null) {
                    subtaskRepository.save(subtask);
                }
            }
        }

        // Xóa task và các subtask, comment liên quan (nhờ cascade)
        taskRepository.delete(task);

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
}