package com.college.backend.college.project.service.impl;

import com.college.backend.college.project.entity.Project;
import com.college.backend.college.project.entity.Subtask;
import com.college.backend.college.project.entity.Task;
import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.enums.ProjectStatus;
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
import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.response.SubtaskResponse;
import com.college.backend.college.project.response.TaskResponse;
import com.college.backend.college.project.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;
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
    public TaskResponse updateTask(Integer taskId, TaskRequest taskRequest) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        // Lưu trữ status hiện tại trước khi cập nhật
        TaskStatus oldStatus = task.getStatus();

        // Sử dụng mapper để cập nhật các thông tin cơ bản
        TaskMapper.INSTANCE.updateTaskFromRequest(taskRequest, task);

        // Kiểm tra nếu deadline được cập nhật dài hơn và trạng thái hiện tại là OVER_DUE
        if (taskRequest.getDueDate() != null
                && oldStatus == TaskStatus.OVER_DUE
                && taskRequest.getDueDate().after(new Date())) {
            task.setStatus(TaskStatus.IN_PROGRESS);
        } else if (taskRequest.getStatus() != null) {
            // Nếu không phải trường hợp đặc biệt trên và có status mới, áp dụng status mới
            task.setStatus(taskRequest.getStatus());
        }

        // Cập nhật thời gian chỉnh sửa
        task.setLastModifiedDate(new Date());

        // Lưu task đã cập nhật
        Task updatedTask = taskRepository.save(task);

        // Trả về response
        TaskResponse response = TaskMapper.INSTANCE.taskToTaskResponse(updatedTask);

        // Cập nhật thông tin project
        if (updatedTask.getProject() != null) {
            response.setProjectId(updatedTask.getProject().getId());
            response.setProjectName(updatedTask.getProject().getName());
        }

        // Tính toán thông tin subtasks
        Set<Subtask> subtasks = updatedTask.getSubtasks();
        int totalSubtasks = subtasks != null ? subtasks.size() : 0;
        int completedSubtasks = subtasks != null ?
                (int) subtasks.stream()
                        .filter(Subtask::getCompleted)
                        .count() : 0;

        response.setTotalSubtasks(totalSubtasks);
        response.setTotalCompletedSubtasks(completedSubtasks);

        // Tính và thiết lập tiến độ
        double progress = totalSubtasks > 0 ?
                ((double) completedSubtasks / totalSubtasks) * 100.0 : 0.0;
        response.setProgress(progress);

        // Xử lý subtasks
        if (subtasks != null) {
            Set<SubtaskResponse> subtaskResponses = subtasks.stream()
                    .map(subtask -> {
                        SubtaskResponse subtaskResponse = SubtaskMapper.INSTANCE.subtaskToSubtaskRes(subtask);

                        // Thêm thông tin assignee
                        if (subtask.getAssignee() != null) {
                            subtaskResponse.setAssigneeId(subtask.getAssignee().getId());
                            subtaskResponse.setAssigneeName(subtask.getAssignee().getFullName());
                            subtaskResponse.setAssigneeEmail(subtask.getAssignee().getEmail());
                        }

                        return subtaskResponse;
                    })
                    .collect(Collectors.toSet());
            response.setSubTasks(subtaskResponses);
        } else {
            response.setSubTasks(new HashSet<>());
        }

        return response;
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

        // Cập nhật trạng thái task
        boolean wasCompleted = task.getStatus() == TaskStatus.COMPLETED;
        if (wasCompleted) {
            task.setStatus(TaskStatus.IN_PROGRESS);
        } else {
            task.setStatus(TaskStatus.COMPLETED);

            // Cũng cập nhật tất cả subtasks thành completed
            if (task.getSubtasks() != null && !task.getSubtasks().isEmpty()) {
                for (Subtask subtask : task.getSubtasks()) {
                    if (!subtask.getCompleted()) {
                        subtask.setCompleted(true);
                        subtaskRepository.save(subtask);
                    }
                }
            }
        }

        // Cập nhật thời gian chỉnh sửa
        task.setLastModifiedDate(new Date());

        // Lưu task đã cập nhật
        Task updatedTask = taskRepository.save(task);

        // Nếu task đã được hoàn thành, kiểm tra project
        if (!wasCompleted && task.getStatus() == TaskStatus.COMPLETED) {
            updateProjectStatusIfNeeded(updatedTask.getProject());
        }

        // Chuyển đổi và trả về response
        return TaskMapper.INSTANCE.taskToTaskResponse(updatedTask);
    }

    @Override
    @Transactional
    public TaskResponse updateTaskStatus(Integer taskId, TaskStatus newStatus) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        boolean wasCompleted = task.getStatus() == TaskStatus.COMPLETED;

        // Cập nhật trạng thái mới
        task.setStatus(newStatus);

        // Cập nhật thời gian chỉnh sửa
        task.setLastModifiedDate(new Date());

        // Nếu task chuyển sang trạng thái COMPLETED
        if (newStatus == TaskStatus.COMPLETED) {
            // Cập nhật tất cả subtasks thành completed
            if (task.getSubtasks() != null && !task.getSubtasks().isEmpty()) {
                for (Subtask subtask : task.getSubtasks()) {
                    if (!subtask.getCompleted()) {
                        subtask.setCompleted(true);
                        subtaskRepository.save(subtask);
                    }
                }
            }

            // Kiểm tra và cập nhật project nếu cần
            if (!wasCompleted) {
                updateProjectStatusIfNeeded(task.getProject());
            }
        }

        // Lưu task đã cập nhật
        Task updatedTask = taskRepository.save(task);

        // Chuyển đổi và trả về response
        return TaskMapper.INSTANCE.taskToTaskResponse(updatedTask);
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

        // Set creator if provided
        if (taskRequest.getCreatedBy() != null) {
            User creator = userRepository.findById(taskRequest.getCreatedBy())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + taskRequest.getCreatedBy()));
            task.setCreatedBy(creator);
        }

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

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<TaskResponse> getAllTasks(int pageNo, int pageSize, String search, TaskStatus status) {
        // Tạo Pageable để phân trang
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by("createdDate").descending()); // pageNo - 1 vì Spring Data JPA bắt đầu từ 0

        // Tạo Specification để tìm kiếm và lọc
        Specification<Task> spec = Specification.where(null);

        // Thêm điều kiện tìm kiếm theo tên nếu có
        if (StringUtils.hasText(search)) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.like(
                            criteriaBuilder.lower(root.get("name")),
                            "%" + search.toLowerCase() + "%"
                    )
            );
        }

        // Thêm điều kiện lọc theo status nếu có
        if (status != null) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("status"), status)
            );
        }

        // Truy vấn các task từ repository với điều kiện tìm kiếm và lọc
        Page<Task> taskPage = taskRepository.findAll(spec, pageable);

        // Chuyển đổi các Task thành TaskResponse
        List<TaskResponse> taskResponses = taskPage.getContent().stream()
                .map(task -> {
                    TaskResponse taskResponse = TaskMapper.INSTANCE.taskToTaskResponse(task);

                    // Thiết lập thông tin project
                    Project project = task.getProject();
                    if (project != null) {
                        taskResponse.setProjectId(project.getId());
                        taskResponse.setProjectName(project.getName());
                    }

                    // Thông tin người tạo đã được thiết lập bởi mapper

                    // Tính toán số lượng subtask và tiến độ
                    Set<Subtask> subtasks = task.getSubtasks();
                    int totalSubtasks = subtasks != null ? subtasks.size() : 0;
                    int completedSubtasks = subtasks != null ?
                            (int) subtasks.stream()
                                    .filter(Subtask::getCompleted)
                                    .count() : 0;

                    taskResponse.setTotalSubtasks(totalSubtasks);
                    taskResponse.setTotalCompletedSubtasks(completedSubtasks);

                    // Tính và thiết lập tiến độ
                    double progress = totalSubtasks > 0 ?
                            ((double) completedSubtasks / totalSubtasks) * 100.0 : 0.0;
                    taskResponse.setProgress(progress);

                    // Map subtasks to responses with user information
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

                    return taskResponse;
                })
                .collect(Collectors.toList());

        // Tạo và trả về PagedResponse
        return new PagedResponse<>(taskResponses, pageNo, pageSize,
                taskPage.getTotalElements(), taskPage.getTotalPages(),
                taskPage.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Integer taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        TaskResponse taskResponse = TaskMapper.INSTANCE.taskToTaskResponse(task);

        // Thiết lập thông tin project
        Project project = task.getProject();
        if (project != null) {
            taskResponse.setProjectId(project.getId());
            taskResponse.setProjectName(project.getName());
        }

        // Thông tin người tạo đã được thiết lập bởi mapper

        // Tính toán số lượng subtask và tiến độ
        Set<Subtask> subtasks = task.getSubtasks();
        int totalSubtasks = subtasks != null ? subtasks.size() : 0;
        int completedSubtasks = subtasks != null ?
                (int) subtasks.stream()
                        .filter(Subtask::getCompleted)
                        .count() : 0;

        taskResponse.setTotalSubtasks(totalSubtasks);
        taskResponse.setTotalCompletedSubtasks(completedSubtasks);

        // Tính và thiết lập tiến độ
        double progress = totalSubtasks > 0 ?
                ((double) completedSubtasks / totalSubtasks) * 100.0 : 0.0;
        taskResponse.setProgress(progress);

        // Map subtasks to responses with user information
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

        return taskResponse;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<TaskResponse> getTasksByCreatedBy(Integer userId, int pageNo, int pageSize, String search, TaskStatus status) {
        // Kiểm tra xem User có tồn tại hay không
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Tạo Pageable để phân trang
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by("createdDate").descending());

        // Tạo Specification để lọc theo người tạo
        Specification<Task> spec = (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("createdBy").get("id"), userId);

        // Thêm điều kiện tìm kiếm theo tên nếu có
        if (StringUtils.hasText(search)) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.like(
                            criteriaBuilder.lower(root.get("name")),
                            "%" + search.toLowerCase() + "%"
                    )
            );
        }

        // Thêm điều kiện lọc theo status nếu có
        if (status != null) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("status"), status)
            );
        }

        // Truy vấn các task từ repository
        Page<Task> taskPage = taskRepository.findAll(spec, pageable);

        // Chuyển đổi các Task thành TaskResponse
        List<TaskResponse> taskResponses = taskPage.getContent().stream()
                .map(task -> {
                    TaskResponse taskResponse = TaskMapper.INSTANCE.taskToTaskResponse(task);

                    // Thiết lập thông tin project
                    Project project = task.getProject();
                    if (project != null) {
                        taskResponse.setProjectId(project.getId());
                        taskResponse.setProjectName(project.getName());
                    }

                    // Tính toán số lượng subtask và tiến độ
                    Set<Subtask> subtasks = task.getSubtasks();
                    int totalSubtasks = subtasks != null ? subtasks.size() : 0;
                    int completedSubtasks = subtasks != null ?
                            (int) subtasks.stream()
                                    .filter(Subtask::getCompleted)
                                    .count() : 0;

                    taskResponse.setTotalSubtasks(totalSubtasks);
                    taskResponse.setTotalCompletedSubtasks(completedSubtasks);

                    // Tính và thiết lập tiến độ
                    double progress = totalSubtasks > 0 ?
                            ((double) completedSubtasks / totalSubtasks) * 100.0 : 0.0;
                    taskResponse.setProgress(progress);

                    // Map subtasks to responses with user information
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

                    return taskResponse;
                })
                .collect(Collectors.toList());

        // Tạo và trả về PagedResponse
        return new PagedResponse<>(taskResponses, pageNo, pageSize,
                taskPage.getTotalElements(), taskPage.getTotalPages(),
                taskPage.isLast());
    }
}