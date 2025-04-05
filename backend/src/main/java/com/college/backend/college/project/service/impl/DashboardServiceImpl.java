package com.college.backend.college.project.service.impl;

import com.college.backend.college.project.entity.Project;
import com.college.backend.college.project.entity.Subtask;
import com.college.backend.college.project.entity.Task;
import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.enums.ProjectStatus;
import com.college.backend.college.project.enums.TaskStatus;
import com.college.backend.college.project.repository.ProjectRepository;
import com.college.backend.college.project.repository.SubtaskRepository;
import com.college.backend.college.project.repository.TaskRepository;
import com.college.backend.college.project.repository.UserRepository;
import com.college.backend.college.project.response.DashboardResponse;
import com.college.backend.college.project.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final SubtaskRepository subtaskRepository;

    @Autowired
    public DashboardServiceImpl(
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            SubtaskRepository subtaskRepository) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.subtaskRepository = subtaskRepository;
    }

    @Override
    @Transactional
    public DashboardResponse getDashboardData() {
        // Tạo response
        DashboardResponse response = new DashboardResponse();
        response.setStatus("success");

        // Khởi tạo dữ liệu dashboard
        DashboardResponse.DashboardData dashboardData = new DashboardResponse.DashboardData();

        // Tổng hợp thống kê
        dashboardData.setStats(getStats());

        // Trạng thái project
        dashboardData.setProjectStatus(getProjectStatusCounts());

        // Trạng thái task
        dashboardData.setTaskStatus(getTaskStatusCounts());

        // Dự án gần đây
        dashboardData.setRecentProjects(getRecentProjects());

        // Deadline sắp tới
        dashboardData.setUpcomingDeadlines(getUpcomingDeadlines());

        // Khối lượng công việc của team
        dashboardData.setTeamWorkload(getTeamWorkload());

        response.setData(dashboardData);
        return response;
    }

    private DashboardResponse.Stats getStats() {
        long totalProjects = projectRepository.count();
        long totalTasks = taskRepository.count();
        long totalUsers = userRepository.count();
        long completedProjects = projectRepository.countByStatus(ProjectStatus.COMPLETED);
        long overDueProjects = projectRepository.countByStatus(ProjectStatus.OVER_DUE);
        long inProgressProjects = projectRepository.countByStatus(ProjectStatus.IN_PROGRESS);

        return DashboardResponse.Stats.builder()
                .totalProjects((int) totalProjects)
                .totalTasks((int) totalTasks)
                .totalUsers((int) totalUsers)
                .completedProjects((int) completedProjects)
                .overDueProjects((int) overDueProjects)
                .inProgressProjects((int) inProgressProjects)
                .build();
    }

    private Map<String, Integer> getProjectStatusCounts() {
        Map<String, Integer> statusCounts = new HashMap<>();
        statusCounts.put("inProgress", (int) projectRepository.countByStatus(ProjectStatus.IN_PROGRESS));
        statusCounts.put("notStarted", (int) projectRepository.countByStatus(ProjectStatus.NOT_STARTED));
        statusCounts.put("onHold", (int) projectRepository.countByStatus(ProjectStatus.ON_HOLD));
        statusCounts.put("completed", (int) projectRepository.countByStatus(ProjectStatus.COMPLETED));
        statusCounts.put("overDue", (int) projectRepository.countByStatus(ProjectStatus.OVER_DUE));
        return statusCounts;
    }

    private Map<String, Integer> getTaskStatusCounts() {
        Map<String, Integer> statusCounts = new HashMap<>();
        statusCounts.put("completed", (int) taskRepository.countByStatus(TaskStatus.COMPLETED));
        statusCounts.put("inProgress", (int) taskRepository.countByStatus(TaskStatus.IN_PROGRESS));
        statusCounts.put("notStarted", (int) taskRepository.countByStatus(TaskStatus.NOT_STARTED));
        statusCounts.put("overDue", (int) taskRepository.countByStatus(TaskStatus.OVER_DUE));
        statusCounts.put("onHold", (int) taskRepository.countByStatus(TaskStatus.ON_HOLD));
        return statusCounts;
    }

    private List<DashboardResponse.ProjectSummary> getRecentProjects() {
        // Lấy 5 dự án mới nhất
        List<Project> recentProjects = projectRepository.findAll(
                        PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "lastModifiedDate")))
                .getContent();

        DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;

        return recentProjects.stream().map(project -> {
            // Tính toán tiến độ dự án dựa trên số lượng tasks đã hoàn thành
            int totalTasks = taskRepository.countByProjectId(project.getId());
            int completedTasks = taskRepository.countByProjectIdAndStatus(project.getId(), TaskStatus.COMPLETED);
            double progress = totalTasks > 0 ? (double) completedTasks / totalTasks * 100 : 0;

            // Thông tin manager
            DashboardResponse.ManagerInfo managerInfo = null;
            if (project.getManager() != null) {
                managerInfo = DashboardResponse.ManagerInfo.builder()
                        .id(project.getManager().getId())
                        .fullName(project.getManager().getFullName())
                        .build();
            }

            // Danh sách tags
            List<String> tags = project.getTags() != null ?
                    project.getTags().stream().map(tag -> tag.getName()).collect(Collectors.toList()) :
                    new ArrayList<>();

            return DashboardResponse.ProjectSummary.builder()
                    .id(project.getId())
                    .name(project.getName())
                    .status(project.getStatus().toString())
                    .startDate(formatDate(project.getStartDate()))
                    .dueDate(formatDate(project.getDueDate()))
                    .progress(progress)
                    .manager(managerInfo)
                    .tags(tags)
                    .build();
        }).collect(Collectors.toList());
    }

    private List<DashboardResponse.DeadlineItem> getUpcomingDeadlines() {
        // Lấy 5 task có deadline gần nhất
        LocalDateTime now = LocalDateTime.now();
        Date currentDate = Date.from(now.atZone(ZoneId.systemDefault()).toInstant());

        List<Task> upcomingTasks = taskRepository.findByDueDateAfterAndStatusNot(
                        currentDate,
                        TaskStatus.COMPLETED,
                        PageRequest.of(0, 3, Sort.by(Sort.Direction.ASC, "dueDate")))
                .getContent();

        List<Project> upcomingProjects = projectRepository.findByDueDateAfterAndStatusNot(
                        currentDate,
                        ProjectStatus.COMPLETED,
                        PageRequest.of(0, 2, Sort.by(Sort.Direction.ASC, "dueDate")))
                .getContent();

        List<DashboardResponse.DeadlineItem> deadlineItems = new ArrayList<>();

        // Thêm tasks vào danh sách
        for (Task task : upcomingTasks) {
            DashboardResponse.DeadlineItem item = DashboardResponse.DeadlineItem.builder()
                    .id(task.getId())
                    .type("task")
                    .name(task.getName())
                    .projectId(task.getProject() != null ? task.getProject().getId() : null)
                    .projectName(task.getProject() != null ? task.getProject().getName() : null)
                    .dueDate(formatDate(task.getDueDate()))
                    .status(task.getStatus().toString())
                    .build();
            deadlineItems.add(item);
        }

        // Thêm projects vào danh sách
        for (Project project : upcomingProjects) {
            DashboardResponse.DeadlineItem item = DashboardResponse.DeadlineItem.builder()
                    .id(project.getId())
                    .type("project")
                    .name(project.getName())
                    .dueDate(formatDate(project.getDueDate()))
                    .status(project.getStatus().toString())
                    .build();
            deadlineItems.add(item);
        }

        // Sắp xếp lại theo deadline gần nhất
        deadlineItems.sort(Comparator.comparing(DashboardResponse.DeadlineItem::getDueDate));

        return deadlineItems.stream().limit(5).collect(Collectors.toList());
    }

    private List<DashboardResponse.TeamWorkload> getTeamWorkload() {
        // Lấy 5 user hoạt động nhiều nhất (có nhiều task được gán nhất)
        List<User> activeUsers = userRepository.findAll(PageRequest.of(0, 5)).getContent();

        return activeUsers.stream().map(user -> {
            // Đếm số lượng subtasks được gán cho user
            List<Subtask> assignedSubtasks = subtaskRepository.findByAssigneeId(user.getId());
            int assignedTasks = assignedSubtasks.size();
            int completedTasks = (int) assignedSubtasks.stream().filter(Subtask::getCompleted).count();

            return DashboardResponse.TeamWorkload.builder()
                    .userId(user.getId())
                    .fullName(user.getFullName())
                    .assignedTasks(assignedTasks)
                    .completedTasks(completedTasks)
                    .build();
        }).collect(Collectors.toList());
    }

    private String formatDate(Date date) {
        if (date == null) return null;
        return date.toInstant()
                .atZone(ZoneId.of("UTC"))  // Chuyển sang UTC thay vì zone mặc định
                .format(DateTimeFormatter.ISO_INSTANT);  // Định dạng theo kiểu "2025-04-03T16:26:24.000+00:00"
    }

}