package com.college.backend.college.project.request;

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
public class DailyGoalRequest {

    private String title;
    private String description;
    private GoalCategory category;
    private GoalPriority priority;
    private Integer estimatedTime;
    private Date dueDate;
    private Integer progress;
    private Boolean completed;
}