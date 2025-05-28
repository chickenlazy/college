package com.college.backend.college.project.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DailyGoalStatsResponse {

    private long totalGoals;
    private long completedGoals;
    private long pendingGoals;
    private long todayGoals;
    private double completionRate;
    private long highPriorityGoals;
    private long mediumPriorityGoals;
    private long lowPriorityGoals;
}