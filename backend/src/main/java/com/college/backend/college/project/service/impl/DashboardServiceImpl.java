// 1. Cập nhật DashboardServiceImpl.java

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
import lombok.Builder;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
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
        DashboardResponse response = new DashboardResponse();
        response.setStatus("success");

        DashboardResponse.DashboardData dashboardData = new DashboardResponse.DashboardData();

        dashboardData.setStats(getStats());
        dashboardData.setProjectStatus(getProjectStatusCounts());
        dashboardData.setTaskStatus(getTaskStatusCounts());
        dashboardData.setRecentProjects(getRecentProjects());
        dashboardData.setUpcomingDeadlines(getUpcomingDeadlines());
        dashboardData.setTeamWorkload(getTeamWorkload());

        response.setData(dashboardData);
        return response;
    }

    // Giữ nguyên các method cũ...
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
        List<Project> recentProjects = projectRepository.findAll(
                        PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "lastModifiedDate")))
                .getContent();

        return recentProjects.stream().map(project -> {
            int totalTasks = taskRepository.countByProjectId(project.getId());
            int completedTasks = taskRepository.countByProjectIdAndStatus(project.getId(), TaskStatus.COMPLETED);
            double progress = totalTasks > 0 ? (double) completedTasks / totalTasks * 100 : 0;

            DashboardResponse.ManagerInfo managerInfo = null;
            if (project.getManager() != null) {
                managerInfo = DashboardResponse.ManagerInfo.builder()
                        .id(Long.valueOf(project.getManager().getId()))
                        .fullName(project.getManager().getFullName())
                        .build();
            }

            List<String> tags = project.getTags() != null ?
                    project.getTags().stream().map(tag -> tag.getName()).collect(Collectors.toList()) :
                    new ArrayList<>();

            return DashboardResponse.ProjectSummary.builder()
                    .id(Long.valueOf(project.getId()))
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

        for (Task task : upcomingTasks) {
            DashboardResponse.DeadlineItem item = DashboardResponse.DeadlineItem.builder()
                    .id(Long.valueOf(task.getId()))
                    .type("task")
                    .name(task.getName())
                    .projectId(Long.valueOf(task.getProject() != null ? task.getProject().getId() : null))
                    .projectName(task.getProject() != null ? task.getProject().getName() : null)
                    .dueDate(formatDate(task.getDueDate()))
                    .status(task.getStatus().toString())
                    .build();
            deadlineItems.add(item);
        }

        for (Project project : upcomingProjects) {
            DashboardResponse.DeadlineItem item = DashboardResponse.DeadlineItem.builder()
                    .id(Long.valueOf(project.getId()))
                    .type("project")
                    .name(project.getName())
                    .dueDate(formatDate(project.getDueDate()))
                    .status(project.getStatus().toString())
                    .build();
            deadlineItems.add(item);
        }

        deadlineItems.sort(Comparator.comparing(DashboardResponse.DeadlineItem::getDueDate));
        return deadlineItems.stream().limit(5).collect(Collectors.toList());
    }

    // CẢI THIỆN TEAM WORKLOAD - CHI TIẾT
    private List<DashboardResponse.TeamWorkload> getTeamWorkload() {
        List<User> allUsers = userRepository.findAll();
        List<DashboardResponse.TeamWorkload> workloadList = new ArrayList<>();

        for (User user : allUsers) {
            TeamWorkloadMetrics metrics = calculateUserWorkloadMetrics(user);

            // Chỉ thêm vào list nếu user có công việc được gán
            if (metrics.getTotalAssignedTasks() > 0) {
                DashboardResponse.TeamWorkload workload = DashboardResponse.TeamWorkload.builder()
                        .userId(Long.valueOf(user.getId()))
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .role(user.getRole() != null ? user.getRole().toString() : "N/A")
                        .assignedTasks(metrics.getTotalAssignedTasks())
                        .completedTasks(metrics.getCompletedTasks())
                        .overdueTasks(metrics.getOverdueTasks())
                        .inProgressTasks(metrics.getInProgressTasks())
                        .workloadPercentage(Math.round(metrics.getWorkloadPercentage() * 100.0) / 100.0)
                        .averageTaskCompletionDays(Math.round(metrics.getAverageTaskCompletionDays() * 100.0) / 100.0)
                        .currentActiveProjects(metrics.getCurrentActiveProjects())
                        .thisWeekCompletedTasks(metrics.getThisWeekCompletedTasks())
                        .thisMonthCompletedTasks(metrics.getThisMonthCompletedTasks())
                        .performanceScore(Math.round(metrics.getPerformanceScore() * 100.0) / 100.0)
                        .onTimeCompletionRate(Math.round(metrics.getOnTimeCompletionRate() * 100.0) / 100.0)
                        .build();
                workloadList.add(workload);
            }
        }

        // Sắp xếp theo performance score (cao nhất trước), sau đó theo workload percentage
        workloadList.sort((a, b) -> {
            int performanceCompare = Double.compare(b.getPerformanceScore(), a.getPerformanceScore());
            if (performanceCompare != 0) {
                return performanceCompare;
            }
            return Double.compare(b.getWorkloadPercentage(), a.getWorkloadPercentage());
        });

        // Lấy top 8 users
        return workloadList.stream().limit(8).collect(Collectors.toList());
    }

    private TeamWorkloadMetrics calculateUserWorkloadMetrics(User user) {
        List<Subtask> assignedSubtasks = subtaskRepository.findByAssigneeId(user.getId());

        LocalDateTime now = LocalDateTime.now();
        Date currentDate = Date.from(now.atZone(ZoneId.systemDefault()).toInstant());

        // Thời gian đầu tuần và đầu tháng
        Date startOfWeek = Date.from(now.with(java.time.DayOfWeek.MONDAY)
                .withHour(0).withMinute(0).withSecond(0).withNano(0)
                .atZone(ZoneId.systemDefault()).toInstant());
        Date startOfMonth = Date.from(now.withDayOfMonth(1)
                .withHour(0).withMinute(0).withSecond(0).withNano(0)
                .atZone(ZoneId.systemDefault()).toInstant());

        // Tính các metrics cơ bản
        int totalAssignedTasks = assignedSubtasks.size();
        int completedTasks = (int) assignedSubtasks.stream()
                .filter(Subtask::getCompleted)
                .count();

        int overdueTasks = (int) assignedSubtasks.stream()
                .filter(subtask -> !subtask.getCompleted() &&
                        subtask.getDueDate() != null &&
                        subtask.getDueDate().before(currentDate))
                .count();

        int inProgressTasks = (int) assignedSubtasks.stream()
                .filter(subtask -> !subtask.getCompleted() &&
                        (subtask.getDueDate() == null || subtask.getDueDate().after(currentDate)))
                .count();

        // Tính workload percentage
        double workloadPercentage = totalAssignedTasks > 0 ?
                ((double) (inProgressTasks + overdueTasks) / totalAssignedTasks) * 100 : 0;

        // Tính thời gian trung bình hoàn thành task
        double averageCompletionDays = calculateAverageTaskCompletionDays(assignedSubtasks);

        // Đếm số project đang active
        int currentActiveProjects = (int) assignedSubtasks.stream()
                .filter(subtask -> !subtask.getCompleted())
                .map(subtask -> subtask.getTask().getProject().getId())
                .collect(Collectors.toSet())
                .size();

        // Đếm task hoàn thành trong tuần/tháng này
        int thisWeekCompletedTasks = (int) assignedSubtasks.stream()
                .filter(subtask -> subtask.getCompleted() &&
                        subtask.getLastModifiedDate() != null &&
                        subtask.getLastModifiedDate().after(startOfWeek))
                .count();

        int thisMonthCompletedTasks = (int) assignedSubtasks.stream()
                .filter(subtask -> subtask.getCompleted() &&
                        subtask.getLastModifiedDate() != null &&
                        subtask.getLastModifiedDate().after(startOfMonth))
                .count();

        // Tính performance score và on-time completion rate
        double performanceScore = calculatePerformanceScore(assignedSubtasks);
        double onTimeCompletionRate = calculateOnTimeCompletionRate(assignedSubtasks);

        return TeamWorkloadMetrics.builder()
                .totalAssignedTasks(totalAssignedTasks)
                .completedTasks(completedTasks)
                .overdueTasks(overdueTasks)
                .inProgressTasks(inProgressTasks)
                .workloadPercentage(workloadPercentage)
                .averageTaskCompletionDays(averageCompletionDays)
                .currentActiveProjects(currentActiveProjects)
                .thisWeekCompletedTasks(thisWeekCompletedTasks)
                .thisMonthCompletedTasks(thisMonthCompletedTasks)
                .performanceScore(performanceScore)
                .onTimeCompletionRate(onTimeCompletionRate)
                .build();
    }

    private double calculateAverageTaskCompletionDays(List<Subtask> subtasks) {
        List<Subtask> completedSubtasks = subtasks.stream()
                .filter(subtask -> subtask.getCompleted() &&
                        subtask.getStartDate() != null &&
                        subtask.getLastModifiedDate() != null &&
                        // Thêm điều kiện: lastModifiedDate phải sau startDate
                        subtask.getLastModifiedDate().after(subtask.getStartDate()))
                .collect(Collectors.toList());

        if (completedSubtasks.isEmpty()) {
            return 0.0;
        }

        double totalDays = completedSubtasks.stream()
                .mapToDouble(subtask -> {
                    long diffInMillies = subtask.getLastModifiedDate().getTime() -
                            subtask.getStartDate().getTime();
                    double days = diffInMillies / (1000.0 * 60 * 60 * 24);
                    return Math.max(0, days); // Đảm bảo không âm
                })
                .sum();

        return totalDays / completedSubtasks.size();
    }

    private double calculatePerformanceScore(List<Subtask> subtasks) {
        if (subtasks.isEmpty()) return 0;

        double completionRate = (double) subtasks.stream()
                .mapToInt(s -> s.getCompleted() ? 1 : 0)
                .sum() / subtasks.size();

        double onTimeCompletionRate = calculateOnTimeCompletionRate(subtasks) / 100.0; // Chia cho 100 vì method trả về %
        double consistencyScore = calculateConsistencyScore(subtasks) / 100.0; // Chia cho 100 vì method trả về %

        // Weighted average: 40% completion rate, 35% on-time rate, 25% consistency
        return (completionRate * 0.4 + onTimeCompletionRate * 0.35 + consistencyScore * 0.25) * 100;
    }

    private double calculateOnTimeCompletionRate(List<Subtask> subtasks) {
        List<Subtask> completedSubtasks = subtasks.stream()
                .filter(s -> s.getCompleted() && s.getDueDate() != null && s.getLastModifiedDate() != null)
                .collect(Collectors.toList());

        if (completedSubtasks.isEmpty()) return 0;

        long onTimeCompletions = completedSubtasks.stream()
                .filter(s -> !s.getLastModifiedDate().after(s.getDueDate()))
                .count();

        return (double) onTimeCompletions / completedSubtasks.size();
    }

    private double calculateConsistencyScore(List<Subtask> subtasks) {
        List<Subtask> completedSubtasks = subtasks.stream()
                .filter(s -> s.getCompleted() && s.getLastModifiedDate() != null)
                .sorted(Comparator.comparing(Subtask::getLastModifiedDate))
                .collect(Collectors.toList());

        if (completedSubtasks.size() < 2) return 80.0; // Default score for users with < 2 completed tasks

        // Tính độ lệch chuẩn của khoảng thời gian giữa các task completion
        List<Long> gaps = new ArrayList<>();
        for (int i = 1; i < completedSubtasks.size(); i++) {
            long gap = ChronoUnit.DAYS.between(
                    completedSubtasks.get(i-1).getLastModifiedDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate(),
                    completedSubtasks.get(i).getLastModifiedDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate()
            );
            gaps.add(gap);
        }

        double avgGap = gaps.stream().mapToLong(Long::longValue).average().orElse(0);
        double variance = gaps.stream()
                .mapToDouble(gap -> Math.pow(gap - avgGap, 2))
                .average()
                .orElse(0);
        double stdDev = Math.sqrt(variance);

        // Convert to consistency score (lower std dev = higher consistency)
        // Max score 100, decrease by standard deviation
        return Math.max(0, Math.min(100, 100 - (stdDev * 2)));
    }

    private String formatDate(Date date) {
        if (date == null) return null;
        return date.toInstant()
                .atZone(ZoneId.of("UTC"))
                .format(DateTimeFormatter.ISO_INSTANT);
    }

    // Inner class để lưu metrics
    @Data
    @Builder
    public static class TeamWorkloadMetrics {
        private int totalAssignedTasks;
        private int completedTasks;
        private int overdueTasks;
        private int inProgressTasks;
        private double workloadPercentage;
        private double averageTaskCompletionDays;
        private int currentActiveProjects;
        private int thisWeekCompletedTasks;
        private int thisMonthCompletedTasks;
        private double performanceScore;
        private double onTimeCompletionRate;
    }
}