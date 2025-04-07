package com.college.backend.college.project.service.impl;

import com.college.backend.college.project.entity.Project;
import com.college.backend.college.project.entity.Subtask;
import com.college.backend.college.project.entity.Task;
import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.enums.ProjectStatus;
import com.college.backend.college.project.enums.TaskStatus;
import com.college.backend.college.project.exception.ResourceNotFoundException;
import com.college.backend.college.project.repository.ProjectRepository;
import com.college.backend.college.project.repository.SubtaskRepository;
import com.college.backend.college.project.repository.TaskRepository;
import com.college.backend.college.project.repository.UserRepository;
import com.college.backend.college.project.request.SubtaskRequest;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.response.SubtaskResponse;
import com.college.backend.college.project.service.SubtaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubtaskServiceImpl implements SubtaskService {

    private final SubtaskRepository subtaskRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    @Autowired
    public SubtaskServiceImpl(SubtaskRepository subtaskRepository, TaskRepository taskRepository, UserRepository userRepository, ProjectRepository projectRepository) {
        this.subtaskRepository = subtaskRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
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

        // Lưu subtask đã cập nhật
        Subtask updatedSubtask = subtaskRepository.save(subtask);

        // Cập nhật task nếu cần
        if (task != null) {
            // Cập nhật thời gian chỉnh sửa của task
            task.setLastModifiedDate(new Date());

            // Kiểm tra tất cả subtasks của task này
            boolean allCompleted = true;
            for (Subtask s : task.getSubtasks()) {
                if (!s.getCompleted()) {
                    allCompleted = false;
                    break;
                }
            }

            // Nếu tất cả subtasks đều hoàn thành, cập nhật task thành COMPLETED
            if (allCompleted && task.getStatus() != TaskStatus.COMPLETED) {
                task.setStatus(TaskStatus.COMPLETED);

                // Kiểm tra và cập nhật project nếu cần
                updateProjectStatusIfNeeded(task.getProject());
            } else if (!allCompleted && task.getStatus() == TaskStatus.COMPLETED) {
                // Nếu có ít nhất một subtask chưa hoàn thành mà task đang ở trạng thái COMPLETED
                // thì cập nhật task về IN_PROGRESS
                task.setStatus(TaskStatus.IN_PROGRESS);
            }

            taskRepository.save(task);
        }

        // Tạo và trả về response
        SubtaskResponse response = new SubtaskResponse();
        response.setId(updatedSubtask.getId());
        response.setName(updatedSubtask.getName());
        response.setCompleted(updatedSubtask.getCompleted());

        // Thêm các trường mới vào response
        response.setStartDate(updatedSubtask.getStartDate());
        response.setDueDate(updatedSubtask.getDueDate());
        response.setCreatedDate(updatedSubtask.getCreatedDate());
        response.setLastModifiedDate(updatedSubtask.getLastModifiedDate());

        // Thêm thông tin assignee vào response
        if (updatedSubtask.getAssignee() != null) {
            response.setAssigneeId(updatedSubtask.getAssignee().getId());
            response.setAssigneeName(updatedSubtask.getAssignee().getFullName());
            response.setAssigneeEmail(updatedSubtask.getAssignee().getEmail());
        }

        // Thêm thông tin task và project vào response
        if (task != null) {
            response.setTaskId(task.getId());
            response.setTaskName(task.getName());
            response.setTaskStatus(task.getStatus().toString());

            // Thêm thông tin project
            Project project = task.getProject();
            if (project != null) {
                response.setProjectId(project.getId());
                response.setProjectName(project.getName());
            }
        }

        return response;
    }
    /**
     * Kiểm tra và cập nhật trạng thái của project nếu cần
     */
    private void updateProjectStatusIfNeeded(Project project) {
        if (project == null) return;

        // Kiểm tra tất cả tasks của project
        boolean allTasksCompleted = true;
        List<Task> tasks = taskRepository.findByProjectId(project.getId());

        if (tasks.isEmpty()) {
            return; // Không có task nào, không cần cập nhật
        }

        for (Task t : tasks) {
            if (t.getStatus() != TaskStatus.COMPLETED) {
                allTasksCompleted = false;
                break;
            }
        }

        // Nếu tất cả tasks đều hoàn thành, cập nhật project thành COMPLETED
        if (allTasksCompleted && project.getStatus() != ProjectStatus.COMPLETED) {
            project.setStatus(ProjectStatus.COMPLETED);
            project.setLastModifiedDate(new Date());
            projectRepository.save(project);
        }
    }

    @Override
    @Transactional
    public SubtaskResponse createSubtask(SubtaskRequest subtaskRequest) {
        // Tìm task theo ID
        Task task = taskRepository.findById(subtaskRequest.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + subtaskRequest.getTaskId()));

        // Tìm User theo ID
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
        subtask.setAssignee(assignee);

        // Thêm các trường mới
        subtask.setStartDate(subtaskRequest.getStartDate());
        subtask.setDueDate(subtaskRequest.getDueDate());

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

        // Thêm các trường mới vào response
        response.setStartDate(savedSubtask.getStartDate());
        response.setDueDate(savedSubtask.getDueDate());
        response.setCreatedDate(savedSubtask.getCreatedDate());
        response.setLastModifiedDate(savedSubtask.getLastModifiedDate());

        // Thêm thông tin assignee vào response
        if (assignee != null) {
            response.setAssigneeId(assignee.getId());
            response.setAssigneeName(assignee.getFullName());
            response.setAssigneeEmail(assignee.getEmail());
        }

        return response;
    }

    @Override
    @Transactional
    public List<SubtaskResponse> getSubtasksByAssignee(Integer userId) {
        // Kiểm tra xem user có tồn tại không
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Tìm tất cả subtasks được gán cho user này
        List<Subtask> subtasks = subtaskRepository.findByAssigneeId(userId);

        // Chuyển đổi danh sách subtasks thành danh sách SubtaskResponse
        return subtasks.stream().map(subtask -> {
            SubtaskResponse response = new SubtaskResponse();
            response.setId(subtask.getId());
            response.setName(subtask.getName());
            response.setCompleted(subtask.getCompleted());

            // Thêm các trường mới
            response.setStartDate(subtask.getStartDate());
            response.setDueDate(subtask.getDueDate());
            response.setCreatedDate(subtask.getCreatedDate());
            response.setLastModifiedDate(subtask.getLastModifiedDate());

            // Thêm thông tin của task
            Task task = subtask.getTask();
            if (task != null) {
                response.setTaskId(task.getId());
                response.setTaskName(task.getName());
                response.setTaskStatus(task.getStatus().toString());

                // Thêm thông tin của project
                Project project = task.getProject();
                if (project != null) {
                    response.setProjectId(project.getId());
                    response.setProjectName(project.getName());
                }
            }

            // Thêm thông tin assignee
            User assignee = subtask.getAssignee();
            if (assignee != null) {
                response.setAssigneeId(assignee.getId());
                response.setAssigneeName(assignee.getFullName());
                response.setAssigneeEmail(assignee.getEmail());
            }

            return response;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<SubtaskResponse> getSubtasksByAssigneeWithPagination(Integer userId, int pageNo, int pageSize) {
        // Kiểm tra xem user có tồn tại không
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Tạo Pageable để phân trang
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize); // pageNo - 1 vì Spring Data JPA bắt đầu từ 0

        // Tìm tất cả subtasks được gán cho user này với phân trang
        Page<Subtask> subtaskPage = subtaskRepository.findByAssigneeId(userId, pageable);

        // Chuyển đổi danh sách subtasks thành danh sách SubtaskResponse
        List<SubtaskResponse> subtaskResponses = subtaskPage.getContent().stream().map(subtask -> {
            SubtaskResponse response = new SubtaskResponse();
            response.setId(subtask.getId());
            response.setName(subtask.getName());
            response.setCompleted(subtask.getCompleted());

            // Thêm các trường mới
            response.setStartDate(subtask.getStartDate());
            response.setDueDate(subtask.getDueDate());
            response.setCreatedDate(subtask.getCreatedDate());
            response.setLastModifiedDate(subtask.getLastModifiedDate());

            // Thêm thông tin của task
            Task task = subtask.getTask();
            if (task != null) {
                response.setTaskId(task.getId());
                response.setTaskName(task.getName());
                response.setTaskStatus(task.getStatus().toString());

                // Thêm thông tin của project
                Project project = task.getProject();
                if (project != null) {
                    response.setProjectId(project.getId());
                    response.setProjectName(project.getName());
                }
            }

            // Thêm thông tin assignee
            User assignee = subtask.getAssignee();
            if (assignee != null) {
                response.setAssigneeId(assignee.getId());
                response.setAssigneeName(assignee.getFullName());
                response.setAssigneeEmail(assignee.getEmail());
            }

            return response;
        }).collect(Collectors.toList());

        // Tạo và trả về PagedResponse
        return new PagedResponse<>(subtaskResponses, pageNo, pageSize,
                subtaskPage.getTotalElements(), subtaskPage.getTotalPages(),
                subtaskPage.isLast());
    }
}