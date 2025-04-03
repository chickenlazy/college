package com.college.backend.college.project.request;

import com.college.backend.college.project.enums.TaskPriority;
import com.college.backend.college.project.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TaskRequest {
    private String name;
    private String description;
    private Date startDate;
    private Date dueDate;
    private TaskStatus status;
    private TaskPriority priority;
    private Integer projectId;
    private Integer createdBy;
    private List<SubtaskRequest> subtaskRequests;
}