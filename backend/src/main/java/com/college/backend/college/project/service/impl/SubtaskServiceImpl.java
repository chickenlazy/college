package com.college.backend.college.project.service.impl;

import com.college.backend.college.project.entity.Subtask;
import com.college.backend.college.project.entity.Task;
import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.exception.ResourceNotFoundException;
import com.college.backend.college.project.repository.SubtaskRepository;
import com.college.backend.college.project.repository.TaskRepository;
import com.college.backend.college.project.repository.UserRepository;
import com.college.backend.college.project.request.SubtaskRequest;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.SubtaskResponse;
import com.college.backend.college.project.service.SubtaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Service
public class SubtaskServiceImpl implements SubtaskService {

    private final SubtaskRepository subtaskRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Autowired
    public SubtaskServiceImpl(SubtaskRepository subtaskRepository, TaskRepository taskRepository, UserRepository userRepository) {
        this.subtaskRepository = subtaskRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public ApiResponse deleteSubtask(Integer subtaskId) {
        Subtask subtask = subtaskRepository.findById(subtaskId)
                .orElseThrow(() -> new ResourceNotFoundException("Subtask not found with ID: " + subtaskId));

        // Lấy task chứa subtask này
        Task task = subtask.getTask();

        // Xóa subtask
        subtaskRepository.delete(subtask);

        // Cập nhật thời gian chỉnh sửa của task
        if (task != null) {
            task.setLastModifiedDate(new Date());
            taskRepository.save(task);
        }

        return new ApiResponse(Boolean.TRUE, "Subtask deleted successfully");
    }

    @Override
    @Transactional
    public SubtaskResponse toggleSubtaskStatus(Integer subtaskId) {
        Subtask subtask = subtaskRepository.findById(subtaskId)
                .orElseThrow(() -> new ResourceNotFoundException("Subtask not found with ID: " + subtaskId));

        // Đảo ngược trạng thái completed
        subtask.setCompleted(!subtask.getCompleted());

        // Lấy task chứa subtask này
        Task task = subtask.getTask();

        // Cập nhật thời gian chỉnh sửa của task
        if (task != null) {
            task.setLastModifiedDate(new Date());
            taskRepository.save(task);
        }

        // Lưu subtask đã cập nhật
        Subtask updatedSubtask = subtaskRepository.save(subtask);

        // Tạo và trả về response
        SubtaskResponse response = new SubtaskResponse();
        response.setId(updatedSubtask.getId());
        response.setName(updatedSubtask.getName());
        response.setCompleted(updatedSubtask.getCompleted());

        // Thêm thông tin assignee vào response
        if (updatedSubtask.getAssignee() != null) {
            response.setAssigneeId(updatedSubtask.getAssignee().getId());
            response.setAssigneeName(updatedSubtask.getAssignee().getFullName());
            response.setAssigneeEmail(updatedSubtask.getAssignee().getEmail());
        }

        return response;
    }

    @Override
    @Transactional
    public SubtaskResponse createSubtask(SubtaskRequest subtaskRequest) {
        // Tìm task theo ID
        Task task = taskRepository.findById(subtaskRequest.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + subtaskRequest.getTaskId()));

        // Tìm User theo ID (thêm dòng này)
        User assignee = null;
        if (subtaskRequest.getAssigneeId() != null) {
            assignee = userRepository.findById(subtaskRequest.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + subtaskRequest.getAssigneeId()));
        }

        // Tạo subtask mới
        Subtask subtask = new Subtask();
        subtask.setName(subtaskRequest.getName());
        subtask.setCompleted(subtaskRequest.getCompleted() != null ? subtaskRequest.getCompleted() : false);
        subtask.setTask(task);
        subtask.setAssignee(assignee); // Thêm dòng này

        // Cập nhật thời gian chỉnh sửa của task
        task.setLastModifiedDate(new Date());
        taskRepository.save(task);

        // Lưu subtask
        Subtask savedSubtask = subtaskRepository.save(subtask);

        // Tạo và trả về response
        SubtaskResponse response = new SubtaskResponse();
        response.setId(savedSubtask.getId());
        response.setName(savedSubtask.getName());
        response.setCompleted(savedSubtask.getCompleted());

        // Thêm thông tin assignee vào response
        if (assignee != null) {
            response.setAssigneeId(assignee.getId());
            response.setAssigneeName(assignee.getFullName());
            response.setAssigneeEmail(assignee.getEmail());
        }

        return response;
    }
}