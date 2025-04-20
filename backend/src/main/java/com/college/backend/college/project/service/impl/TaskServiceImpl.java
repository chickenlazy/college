package com.college.backend.college.project.service.impl;

import com.college.backend.college.project.entity.Project;
import com.college.backend.college.project.entity.Subtask;
import com.college.backend.college.project.entity.Task;
import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.enums.NotificationType;
import com.college.backend.college.project.enums.ProjectStatus;
import com.college.backend.college.project.enums.TaskStatus;
import com.college.backend.college.project.exception.ResourceNotFoundException;
import com.college.backend.college.project.mapper.SubtaskMapper;
import com.college.backend.college.project.mapper.TaskMapper;
import com.college.backend.college.project.repository.ProjectRepository;
import com.college.backend.college.project.repository.SubtaskRepository;
import com.college.backend.college.project.repository.TaskRepository;
import com.college.backend.college.project.repository.UserRepository;
import com.college.backend.college.project.request.NotificationRequest;
import com.college.backend.college.project.request.SubtaskRequest;
import com.college.backend.college.project.request.TaskRequest;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.response.SubtaskResponse;
import com.college.backend.college.project.response.TaskResponse;
import com.college.backend.college.project.service.NotificationService;
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
    private final NotificationService notificationService;

    @Autowired
    public TaskServiceImpl(TaskRepository taskRepository, SubtaskRepository subtaskRepository, ProjectRepository projectRepository, UserRepository userRepository, NotificationService notificationService) {
        this.taskRepository = taskRepository;
        this.subtaskRepository = subtaskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    private void sendTaskStatusChangeNotification(Task task, TaskStatus oldStatus, TaskStatus newStatus) {
        if (oldStatus == newStatus) return;

        Project project = task.getProject();
        if (project == null) return;

        String statusText = "";
        switch (newStatus) {
            case COMPLETED:
                statusText = "đã hoàn thành";
                break;
            case IN_PROGRESS:
                statusText = "đang thực hiện";
                break;
            case NOT_STARTED:
                statusText = "chưa bắt đầu";
                break;
            case OVER_DUE:
                statusText = "quá hạn";
                break;
            default:
                statusText = newStatus.name();
        }

        NotificationRequest notification = new NotificationRequest();
        notification.setTitle("Trạng thái công việc đã thay đổi");
        notification.setContent("Công việc \"" + task.getName() + "\" trong dự án \"" + project.getName() + "\" đã được cập nhật thành " + statusText);
        notification.setType(NotificationType.TASK);
        notification.setReferenceId(task.getId());

        // Danh sách người nhận thông báo
        List<Integer> notifyUserIds = new ArrayList<>();

        // Thêm manager vào danh sách
        if (project.getManager() != null) {
            notifyUserIds.add(project.getManager().getId());
        }

        // Thêm người tạo task vào danh sách
        if (task.getCreatedBy() != null && !notifyUserIds.contains(task.getCreatedBy().getId())) {
            notifyUserIds.add(task.getCreatedBy().getId());
        }

        // Thêm các thành viên dự án
        if (project.getUsers() != null && !project.getUsers().isEmpty()) {
            project.getUsers().forEach(user -> {
                if (!notifyUserIds.contains(user.getId())) {
                    notifyUserIds.add(user.getId());
                }
            });
        }

        // Gửi thông báo
        if (!notifyUserIds.isEmpty()) {
            notificationService.createBulkNotifications(notification, notifyUserIds.toArray(new Integer[0]));
        }
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

        if (taskRequest.getProjectId() != null) {
            Project project = projectRepository.findById(taskRequest.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + taskRequest.getProjectId()));
            task.setProject(project);
        }

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

        // Gửi thông báo nếu trạng thái thay đổi
        if (oldStatus != updatedTask.getStatus()) {
            sendTaskStatusChangeNotification(updatedTask, oldStatus, updatedTask.getStatus());
        }

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

        Project project = task.getProject();

        // Xóa Task
        taskRepository.delete(task);

        // Gửi thông báo về việc xóa task
        if (project != null) {
            NotificationRequest notification = new NotificationRequest();
            notification.setTitle("Công việc đã bị xóa");
            notification.setContent("Công việc \"" + task.getName() + "\" trong dự án \"" + project.getName() + "\" đã bị xóa");
            notification.setType(NotificationType.TASK);
            notification.setReferenceId(project.getId()); // Sử dụng ID của project vì task đã bị xóa

            // Danh sách người nhận thông báo
            List<Integer> notifyUserIds = new ArrayList<>();

            // Thêm manager vào danh sách
            if (project.getManager() != null) {
                notifyUserIds.add(project.getManager().getId());
            }

            // Thêm người tạo task vào danh sách
            if (task.getCreatedBy() != null && !notifyUserIds.contains(task.getCreatedBy().getId())) {
                notifyUserIds.add(task.getCreatedBy().getId());
            }

            // Gửi thông báo
            if (!notifyUserIds.isEmpty()) {
                notificationService.createBulkNotifications(notification, notifyUserIds.toArray(new Integer[0]));
            }
        }

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
        }

        // Cập nhật thời gian chỉnh sửa
        task.setLastModifiedDate(new Date());

        // Lưu task đã cập nhật
        Task updatedTask = taskRepository.save(task);

        // Gửi thông báo khi trạng thái task thay đổi
        TaskStatus newStatus = updatedTask.getStatus();
        sendTaskStatusChangeNotification(updatedTask, wasCompleted ? TaskStatus.COMPLETED : TaskStatus.IN_PROGRESS, newStatus);

        // Chuyển đổi và trả về response
        return TaskMapper.INSTANCE.taskToTaskResponse(updatedTask);
    }

    @Override
    @Transactional
    public TaskResponse updateTaskStatus(Integer taskId, TaskStatus newStatus) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        boolean wasCompleted = task.getStatus() == TaskStatus.COMPLETED;
        TaskStatus oldStatus = task.getStatus();

        // Cập nhật trạng thái mới
        task.setStatus(newStatus);

        // Cập nhật thời gian chỉnh sửa
        task.setLastModifiedDate(new Date());

        // Lưu task đã cập nhật
        Task updatedTask = taskRepository.save(task);

        sendTaskStatusChangeNotification(updatedTask, oldStatus, newStatus);

        // Chuyển đổi và trả về response
        return TaskMapper.INSTANCE.taskToTaskResponse(updatedTask);
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

        task.setSubtasks(new HashSet<>());

        // Save the task first to get task ID for subtasks
        Task savedTask = taskRepository.save(task);

        // Gửi thông báo cho project manager
        if (project.getManager() != null) {
            NotificationRequest managerNotification = new NotificationRequest();
            managerNotification.setTitle("Công việc mới được tạo");
            managerNotification.setContent("Một công việc mới \"" + savedTask.getName() + "\" đã được tạo trong dự án \"" + project.getName() + "\"");
            managerNotification.setType(NotificationType.TASK);
            managerNotification.setReferenceId(savedTask.getId());
            managerNotification.setUserId(project.getManager().getId());
            notificationService.createNotification(managerNotification);
        }

        // Gửi thông báo cho các thành viên dự án
        if (project.getUsers() != null && !project.getUsers().isEmpty()) {
            NotificationRequest memberNotification = new NotificationRequest();
            memberNotification.setTitle("Công việc mới trong dự án");
            memberNotification.setContent("Một công việc mới \"" + savedTask.getName() + "\" đã được tạo trong dự án \"" + project.getName() + "\"");
            memberNotification.setType(NotificationType.TASK);
            memberNotification.setReferenceId(savedTask.getId());

            Integer[] userIds = project.getUsers().stream()
                    .map(User::getId)
                    .toArray(Integer[]::new);

            notificationService.createBulkNotifications(memberNotification, userIds);
        }

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