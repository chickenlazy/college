package com.college.backend.college.project.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubtaskResponse {

    private Integer id;
    private String name;
    private Boolean completed = false;
    private Integer assigneeId;
    private String assigneeName;
    private String assigneeEmail;
}
