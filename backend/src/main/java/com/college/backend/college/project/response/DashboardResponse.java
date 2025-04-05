package com.college.backend.college.project.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DashboardResponse {
    private String status;
    private DashboardData data;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DashboardData {
        private Stats stats;
        private Map<String, Integer> projectStatus;
        private Map<String, Integer> taskStatus;
        private List<ProjectSummary> recentProjects;
        private List<DeadlineItem> upcomingDeadlines;
        private List<TeamWorkload> teamWorkload;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Stats {
        private int totalProjects;
        private int totalTasks;
        private int totalUsers;
        private int completedProjects;
        private int overDueProjects;
        private int inProgressProjects;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProjectSummary {
        private Integer id;
        private String name;
        private String status;
        private String startDate;
        private String dueDate;
        private double progress;
        private ManagerInfo manager;
        private List<String> tags;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ManagerInfo {
        private Integer id;
        private String fullName;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DeadlineItem {
        private Integer id;
        private String type; // "task" or "project"
        private String name;
        private Integer projectId;
        private String projectName;
        private String dueDate;
        private String status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TeamWorkload {
        private Integer userId;
        private String fullName;
        private int assignedTasks;
        private int completedTasks;
    }
}