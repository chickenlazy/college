package com.college.backend.college.project.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SubtaskRequest {
    private String name;
    private Boolean completed;
    private Integer taskId;
    private Integer assigneeId;
    private Date startDate;
    private Date dueDate;
}