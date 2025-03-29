package com.college.backend.college.project.response;

import com.college.backend.college.project.entity.Project;
import com.college.backend.college.project.entity.Task;
import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.enums.Role;
import com.college.backend.college.project.enums.TaskPriority;
import com.college.backend.college.project.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.Set;

@Getter
@Setter
public class ProjectResponse {

    private Integer id;
    private String name;
    private String description;
    private Date startDate;
    private Date dueDate;
    private String status;
    private Date createdDate;
    private Set<UserResponseInProject> users;
    private Set<TaskResponseInProject> tasks;
    private Set<TagResponseInProject> tags;
    private Integer totalTasks;
    private Integer totalCompletedTasks;
    private Double progress;
    private Integer managerId;
    private String managerName;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TagResponseInProject {
        private Long id;
        private String name;
        private String color;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserResponseInProject {
        private Long id;
        private String fullName;
        private String email;
        private Role role;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TaskResponseInProject {
        private Integer id;
        private String name;
        private String description;
//        private Integer assigneeId;
//        private String assigneeName;
        private Date startDate;
        private Date dueDate;
        private TaskStatus status;
        private TaskPriority priority;
    }
}
