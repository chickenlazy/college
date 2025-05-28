package com.college.backend.college.project.controller;

import com.college.backend.college.project.enums.GoalCategory;
import com.college.backend.college.project.enums.GoalPriority;
import com.college.backend.college.project.request.DailyGoalRequest;
import com.college.backend.college.project.request.DailyGoalUpdateProgressRequest;
import com.college.backend.college.project.request.DailyGoalToggleRequest;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.DailyGoalResponse;
import com.college.backend.college.project.response.DailyGoalListResponse;
import com.college.backend.college.project.response.DailyGoalStatsResponse;
import com.college.backend.college.project.service.DailyGoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/daily-goals")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class DailyGoalController {

    private final DailyGoalService dailyGoalService;

    @Autowired
    public DailyGoalController(DailyGoalService dailyGoalService) {
        this.dailyGoalService = dailyGoalService;
    }

    /**
     * Tạo goal mới
     * POST /api/daily-goals?userId=1
     */
    @PostMapping
    public ResponseEntity<DailyGoalResponse> createGoal(
            @RequestParam Integer userId,
            @RequestBody DailyGoalRequest goalRequest) {
        DailyGoalResponse goalResponse = dailyGoalService.createGoal(goalRequest, userId);
        return new ResponseEntity<>(goalResponse, HttpStatus.CREATED);
    }

    /**
     * Lấy goal theo ID
     * GET /api/daily-goals/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<DailyGoalResponse> getGoalById(@PathVariable Integer id) {
        DailyGoalResponse goalResponse = dailyGoalService.getGoalById(id);
        return ResponseEntity.ok(goalResponse);
    }

    /**
     * Cập nhật goal
     * PUT /api/daily-goals/{id}?userId=1
     */
    @PutMapping("/{id}")
    public ResponseEntity<DailyGoalResponse> updateGoal(
            @PathVariable Integer id,
            @RequestParam Integer userId,
            @RequestBody DailyGoalRequest goalRequest) {
        DailyGoalResponse updatedGoal = dailyGoalService.updateGoal(id, goalRequest, userId);
        return ResponseEntity.ok(updatedGoal);
    }

    /**
     * Xóa goal
     * DELETE /api/daily-goals/{id}?userId=1
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteGoal(
            @PathVariable Integer id,
            @RequestParam Integer userId) {
        dailyGoalService.deleteGoal(id, userId);

        ApiResponse apiResponse = new ApiResponse(
                Boolean.TRUE,
                "Goal deleted successfully");

        return new ResponseEntity<>(apiResponse, HttpStatus.OK);
    }

    /**
     * Lấy danh sách goals với phân trang và lọc
     * GET /api/daily-goals?userId=1&pageNo=1&pageSize=10&search=keyword&category=WORK&priority=HIGH&completed=true
     */
    @GetMapping
    public ResponseEntity<DailyGoalListResponse> getAllGoals(
            @RequestParam Integer userId,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Boolean completed) {

        // Chuyển đổi category từ String sang Enum
        GoalCategory goalCategory = null;
        if (category != null && !category.equals("all")) {
            try {
                goalCategory = GoalCategory.valueOf(category.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Nếu giá trị category không hợp lệ, bỏ qua
            }
        }

        // Chuyển đổi priority từ String sang Enum
        GoalPriority goalPriority = null;
        if (priority != null && !priority.equals("all")) {
            try {
                goalPriority = GoalPriority.valueOf(priority.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Nếu giá trị priority không hợp lệ, bỏ qua
            }
        }

        DailyGoalListResponse response = dailyGoalService.getAllGoalsByUserId(
                userId, pageNo, pageSize, search, goalCategory, goalPriority, completed);

        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách goals của user theo userId với phân trang và lọc
     * GET /api/daily-goals/user/{userId}?pageNo=1&pageSize=10&search=keyword&category=WORK&priority=HIGH&completed=true
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<DailyGoalListResponse> getAllGoalsByUserId(
            @PathVariable Integer userId,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Boolean completed) {

        // Chuyển đổi category từ String sang Enum
        GoalCategory goalCategory = null;
        if (category != null && !category.equals("all")) {
            try {
                goalCategory = GoalCategory.valueOf(category.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Nếu giá trị category không hợp lệ, bỏ qua
            }
        }

        // Chuyển đổi priority từ String sang Enum
        GoalPriority goalPriority = null;
        if (priority != null && !priority.equals("all")) {
            try {
                goalPriority = GoalPriority.valueOf(priority.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Nếu giá trị priority không hợp lệ, bỏ qua
            }
        }

        DailyGoalListResponse response = dailyGoalService.getAllGoalsByUserId(
                userId, pageNo, pageSize, search, goalCategory, goalPriority, completed);

        return ResponseEntity.ok(response);
    }

    /**
     * Lấy tất cả goals (không phân trang)
     * GET /api/daily-goals/all?userId=1
     */
    @GetMapping("/all")
    public ResponseEntity<List<DailyGoalResponse>> getAllGoalsWithoutPaging(@RequestParam Integer userId) {
        List<DailyGoalResponse> response = dailyGoalService.getAllGoalsByUserIdWithoutPaging(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy tất cả goals của user theo userId (không phân trang)
     * GET /api/daily-goals/user/{userId}/all
     */
    @GetMapping("/user/{userId}/all")
    public ResponseEntity<List<DailyGoalResponse>> getAllGoalsByUserIdWithoutPaging(@PathVariable Integer userId) {
        List<DailyGoalResponse> response = dailyGoalService.getAllGoalsByUserIdWithoutPaging(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Cập nhật tiến độ goal
     * PATCH /api/daily-goals/{id}/progress?userId=1
     */
    @PatchMapping("/{id}/progress")
    public ResponseEntity<DailyGoalResponse> updateGoalProgress(
            @PathVariable Integer id,
            @RequestParam Integer userId,
            @RequestBody DailyGoalUpdateProgressRequest request) {
        DailyGoalResponse updatedGoal = dailyGoalService.updateGoalProgress(id, request, userId);
        return ResponseEntity.ok(updatedGoal);
    }

    /**
     * Toggle trạng thái completed của goal
     * PATCH /api/daily-goals/{id}/toggle?userId=1
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<DailyGoalResponse> toggleGoalCompleted(
            @PathVariable Integer id,
            @RequestParam Integer userId,
            @RequestBody DailyGoalToggleRequest request) {
        DailyGoalResponse updatedGoal = dailyGoalService.toggleGoalCompleted(id, request, userId);
        return ResponseEntity.ok(updatedGoal);
    }

    /**
     * Lấy thống kê goals
     * GET /api/daily-goals/stats?userId=1
     */
    @GetMapping("/stats")
    public ResponseEntity<DailyGoalStatsResponse> getGoalStats(@RequestParam Integer userId) {
        DailyGoalStatsResponse stats = dailyGoalService.getGoalStatsByUserId(userId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Lấy thống kê goals của user theo userId
     * GET /api/daily-goals/user/{userId}/stats
     */
    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<DailyGoalStatsResponse> getGoalStatsByUserId(@PathVariable Integer userId) {
        DailyGoalStatsResponse stats = dailyGoalService.getGoalStatsByUserId(userId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Lấy goals hôm nay
     * GET /api/daily-goals/today?userId=1
     */
    @GetMapping("/today")
    public ResponseEntity<List<DailyGoalResponse>> getTodayGoals(@RequestParam Integer userId) {
        List<DailyGoalResponse> todayGoals = dailyGoalService.getTodayGoalsByUserId(userId);
        return ResponseEntity.ok(todayGoals);
    }

    /**
     * Lấy goals hôm nay của user theo userId
     * GET /api/daily-goals/user/{userId}/today
     */
    @GetMapping("/user/{userId}/today")
    public ResponseEntity<List<DailyGoalResponse>> getTodayGoalsByUserId(@PathVariable Integer userId) {
        List<DailyGoalResponse> todayGoals = dailyGoalService.getTodayGoalsByUserId(userId);
        return ResponseEntity.ok(todayGoals);
    }

    /**
     * Lấy goals trong khoảng thời gian
     * GET /api/daily-goals/date-range?userId=1&startDate=2025-05-01&endDate=2025-05-31
     */
    @GetMapping("/date-range")
    public ResponseEntity<List<DailyGoalResponse>> getGoalsByDateRange(
            @RequestParam Integer userId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        List<DailyGoalResponse> goals = dailyGoalService.getGoalsByUserIdAndDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(goals);
    }

    /**
     * Lấy goals trong khoảng thời gian của user theo userId
     * GET /api/daily-goals/user/{userId}/date-range?startDate=2025-05-01&endDate=2025-05-31
     */
    @GetMapping("/user/{userId}/date-range")
    public ResponseEntity<List<DailyGoalResponse>> getGoalsByUserIdAndDateRange(
            @PathVariable Integer userId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        List<DailyGoalResponse> goals = dailyGoalService.getGoalsByUserIdAndDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(goals);
    }
}