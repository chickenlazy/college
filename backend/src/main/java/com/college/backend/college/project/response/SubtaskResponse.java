package com.college.backend.college.project.response;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class SubtaskResponse {
    private Integer id;
    private String name;
    private Boolean completed = false;
    private Integer assigneeId;
    private String assigneeName;
    private String assigneeEmail;
    private Date startDate;
    private Date dueDate;
    private Date createdDate;
    private Date lastModifiedDate;

    // Thông tin về task
    private Integer taskId;
    private String taskName;
    private String taskStatus;
    private Integer projectId;
    private String projectName;
}