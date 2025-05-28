package com.college.backend.college.project.response;

import com.college.backend.college.project.enums.GoalCategory;
import com.college.backend.college.project.enums.GoalPriority;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DailyGoalResponse {

    private Integer id;
    private String title;
    private String description;
    private GoalCategory category;
    private GoalPriority priority;
    private Integer estimatedTime;
    private Integer progress;
    private Boolean completed;
    private Date dueDate;
    private Date createdDate;
    private Date lastModifiedDate;
    private Integer userId;
    private String userFullName;
}