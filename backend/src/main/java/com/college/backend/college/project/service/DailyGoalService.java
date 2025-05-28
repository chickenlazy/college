package com.college.backend.college.project.service;

import com.college.backend.college.project.enums.GoalCategory;
import com.college.backend.college.project.enums.GoalPriority;
import com.college.backend.college.project.request.DailyGoalRequest;
import com.college.backend.college.project.request.DailyGoalUpdateProgressRequest;
import com.college.backend.college.project.request.DailyGoalToggleRequest;
import com.college.backend.college.project.response.DailyGoalResponse;
import com.college.backend.college.project.response.DailyGoalListResponse;
import com.college.backend.college.project.response.DailyGoalStatsResponse;

import java.util.List;

public interface DailyGoalService {

    // CRUD operations
    DailyGoalResponse createGoal(DailyGoalRequest goalRequest, Integer userId);
    DailyGoalResponse getGoalById(Integer id);
    DailyGoalResponse updateGoal(Integer id, DailyGoalRequest goalRequest, Integer userId);
    void deleteGoal(Integer id, Integer userId);

    // Get goals with pagination and filters
    DailyGoalListResponse getAllGoalsByUserId(
            Integer userId,
            int pageNo,
            int pageSize,
            String search,
            GoalCategory category,
            GoalPriority priority,
            Boolean completed
    );

    // Get goals without pagination
    List<DailyGoalResponse> getAllGoalsByUserIdWithoutPaging(Integer userId);

    // Update progress
    DailyGoalResponse updateGoalProgress(Integer id, DailyGoalUpdateProgressRequest request, Integer userId);

    // Toggle completed status
    DailyGoalResponse toggleGoalCompleted(Integer id, DailyGoalToggleRequest request, Integer userId);

    // Get statistics
    DailyGoalStatsResponse getGoalStatsByUserId(Integer userId);

    // Get today's goals
    List<DailyGoalResponse> getTodayGoalsByUserId(Integer userId);

    // Get goals by date range
    List<DailyGoalResponse> getGoalsByUserIdAndDateRange(Integer userId, String startDate, String endDate);
}