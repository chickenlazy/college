package com.college.backend.college.project.request;

import com.college.backend.college.project.enums.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ProjectRequest {

    private String name;
    private String description;
    private Date startDate;
    private Date dueDate;
    private ProjectStatus status;
    private Integer managerId;
    private Set<String> emails;
}