package com.college.backend.college.project.response;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.Set;

@Getter
@Setter
public class TaskResponse {

    private Integer id;
    private String name;
    private String description;
    private Date startDate;
    private Date dueDate;
    private String status;
    private String priority;
    private Date createdDate;

    // Project details
    private Integer projectId;
    private String projectName;

    // Subtasks and comments
    private Set<SubtaskResponse> subTasks;

    private Integer totalSubtasks;
    private Integer totalCompletedSubtasks;
    private Double progress;

    // User detail
    private Integer createdBy;
    private String createdByName;
}
