// 2. Cập nhật DashboardResponse.java

package com.college.backend.college.project.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private String status;
    private DashboardData data;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardData {
        private Stats stats;
        private Map<String, Integer> projectStatus;
        private Map<String, Integer> taskStatus;
        private List<ProjectSummary> recentProjects;
        private List<DeadlineItem> upcomingDeadlines;
        private List<TeamWorkload> teamWorkload;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Stats {
        private int totalProjects;
        private int totalTasks;
        private int totalUsers;
        private int completedProjects;
        private int overDueProjects;
        private int inProgressProjects;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectSummary {
        private Long id;
        private String name;
        private String status;
        private String startDate;
        private String dueDate;
        private double progress;
        private ManagerInfo manager;
        private List<String> tags;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ManagerInfo {
        private Long id;
        private String fullName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeadlineItem {
        private Long id;
        private String type; // "task" or "project"
        private String name;
        private Long projectId;
        private String projectName;
        private String dueDate;
        private String status;
    }

    // CẬP NHẬT TEAMWORKLOAD VỚI CÁC FIELD MỚI
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamWorkload {
        private Long userId;
        private String fullName;
        private String email;
        private String role;

        // Basic task metrics
        private int assignedTasks;
        private int completedTasks;
        private int overdueTasks;
        private int inProgressTasks;

        // Advanced metrics
        private double workloadPercentage;              // Tỷ lệ công việc đang làm
        private double averageTaskCompletionDays;       // Thời gian trung bình hoàn thành
        private int currentActiveProjects;              // Số project đang tham gia

        // Time-based performance
        private int thisWeekCompletedTasks;            // Task hoàn thành tuần này
        private int thisMonthCompletedTasks;           // Task hoàn thành tháng này

        // Performance indicators
        private double performanceScore;                // Điểm hiệu suất tổng hợp
        private double onTimeCompletionRate;           // Tỷ lệ hoàn thành đúng hạn (%)
    }

    // THÊM CLASS CHO TOP PERFORMERS (OPTIONAL)
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopPerformer {
        private Long userId;
        private String fullName;
        private double completionRate;
        private int completedTasksThisMonth;
        private double performanceScore;
        private String performanceLevel; // "Excellent", "Good", "Average", "Below Average"
    }
}