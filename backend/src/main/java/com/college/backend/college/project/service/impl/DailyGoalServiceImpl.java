package com.college.backend.college.project.service.impl;

import com.college.backend.college.project.entity.DailyGoal;
import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.enums.GoalCategory;
import com.college.backend.college.project.enums.GoalPriority;
import com.college.backend.college.project.exception.ResourceNotFoundException;
import com.college.backend.college.project.repository.DailyGoalRepository;
import com.college.backend.college.project.repository.UserRepository;
import com.college.backend.college.project.request.DailyGoalRequest;
import com.college.backend.college.project.request.DailyGoalUpdateProgressRequest;
import com.college.backend.college.project.request.DailyGoalToggleRequest;
import com.college.backend.college.project.response.DailyGoalResponse;
import com.college.backend.college.project.response.DailyGoalListResponse;
import com.college.backend.college.project.response.DailyGoalStatsResponse;
import com.college.backend.college.project.service.DailyGoalService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DailyGoalServiceImpl implements DailyGoalService {

    private final DailyGoalRepository dailyGoalRepository;
    private final UserRepository userRepository;

    @Autowired
    public DailyGoalServiceImpl(DailyGoalRepository dailyGoalRepository, UserRepository userRepository) {
        this.dailyGoalRepository = dailyGoalRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public DailyGoalResponse createGoal(DailyGoalRequest goalRequest, Integer userId) {
        // Kiểm tra user có tồn tại không
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Tạo goal mới
        DailyGoal goal = new DailyGoal();
        goal.setTitle(goalRequest.getTitle());
        goal.setDescription(goalRequest.getDescription());
        goal.setCategory(goalRequest.getCategory() != null ? goalRequest.getCategory() : GoalCategory.WORK);
        goal.setPriority(goalRequest.getPriority() != null ? goalRequest.getPriority() : GoalPriority.MEDIUM);
        goal.setEstimatedTime(goalRequest.getEstimatedTime() != null ? goalRequest.getEstimatedTime() : 30);
        goal.setDueDate(goalRequest.getDueDate() != null ? goalRequest.getDueDate() : new Date());
        goal.setProgress(goalRequest.getProgress() != null ? goalRequest.getProgress() : 0);
        goal.setCompleted(goalRequest.getCompleted() != null ? goalRequest.getCompleted() : false);
        goal.setUser(user);

        Date now = new Date();
        goal.setCreatedDate(now);
        goal.setLastModifiedDate(now);

        // Lưu goal
        DailyGoal savedGoal = dailyGoalRepository.save(goal);

        return mapGoalToResponse(savedGoal);
    }

    @Override
    @Transactional(readOnly = true)
    public DailyGoalResponse getGoalById(Integer id) {
        DailyGoal goal = dailyGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + id));

        return mapGoalToResponse(goal);
    }

    @Override
    @Transactional
    public DailyGoalResponse updateGoal(Integer id, DailyGoalRequest goalRequest, Integer userId) {
        // Kiểm tra goal có tồn tại và thuộc về user này không
        DailyGoal goal = dailyGoalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + id));

        // Cập nhật thông tin
        if (goalRequest.getTitle() != null) {
            goal.setTitle(goalRequest.getTitle());
        }
        if (goalRequest.getDescription() != null) {
            goal.setDescription(goalRequest.getDescription());
        }
        if (goalRequest.getCategory() != null) {
            goal.setCategory(goalRequest.getCategory());
        }
        if (goalRequest.getPriority() != null) {
            goal.setPriority(goalRequest.getPriority());
        }
        if (goalRequest.getEstimatedTime() != null) {
            goal.setEstimatedTime(goalRequest.getEstimatedTime());
        }
        if (goalRequest.getDueDate() != null) {
            goal.setDueDate(goalRequest.getDueDate());
        }
        if (goalRequest.getProgress() != null) {
            goal.setProgress(goalRequest.getProgress());
            // Tự động đánh dấu completed nếu progress = 100%
            if (goalRequest.getProgress() == 100) {
                goal.setCompleted(true);
            }
        }
        if (goalRequest.getCompleted() != null) {
            goal.setCompleted(goalRequest.getCompleted());
        }

        goal.setLastModifiedDate(new Date());

        DailyGoal updatedGoal = dailyGoalRepository.save(goal);
        return mapGoalToResponse(updatedGoal);
    }

    @Override
    @Transactional
    public void deleteGoal(Integer id, Integer userId) {
        // Kiểm tra goal có tồn tại và thuộc về user này không
        DailyGoal goal = dailyGoalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + id));

        dailyGoalRepository.delete(goal);
    }

    @Override
    @Transactional(readOnly = true)
    public DailyGoalListResponse getAllGoalsByUserId(
            Integer userId,
            int pageNo,
            int pageSize,
            String search,
            GoalCategory category,
            GoalPriority priority,
            Boolean completed) {

        // Kiểm tra user có tồn tại không
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Tạo Pageable
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by("createdDate").descending());

        // Tạo Specification
        Specification<DailyGoal> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Luôn lọc theo userId
            predicates.add(criteriaBuilder.equal(root.get("user").get("id"), userId));

            // Tìm kiếm theo title
            if (StringUtils.hasText(search)) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("title")),
                        "%" + search.toLowerCase() + "%"
                ));
            }

            // Lọc theo category
            if (category != null) {
                predicates.add(criteriaBuilder.equal(root.get("category"), category));
            }

            // Lọc theo priority
            if (priority != null) {
                predicates.add(criteriaBuilder.equal(root.get("priority"), priority));
            }

            // Lọc theo completed
            if (completed != null) {
                predicates.add(criteriaBuilder.equal(root.get("completed"), completed));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        // Truy vấn
        Page<DailyGoal> goalPage = dailyGoalRepository.findAll(spec, pageable);

        // Chuyển đổi sang response
        List<DailyGoalResponse> goalResponses = goalPage.getContent().stream()
                .map(this::mapGoalToResponse)
                .collect(Collectors.toList());

        return new DailyGoalListResponse(
                goalResponses,
                pageNo,
                pageSize,
                goalPage.getTotalElements(),
                goalPage.getTotalPages(),
                goalPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<DailyGoalResponse> getAllGoalsByUserIdWithoutPaging(Integer userId) {
        // Kiểm tra user có tồn tại không
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        List<DailyGoal> goals = dailyGoalRepository.findByUserIdOrderByCreatedDateDesc(userId);
        return goals.stream()
                .map(this::mapGoalToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DailyGoalResponse updateGoalProgress(Integer id, DailyGoalUpdateProgressRequest request, Integer userId) {
        // Kiểm tra goal có tồn tại và thuộc về user này không
        DailyGoal goal = dailyGoalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + id));

        // Validate progress
        if (request.getProgress() < 0 || request.getProgress() > 100) {
            throw new IllegalArgumentException("Progress must be between 0 and 100");
        }

        goal.setProgress(request.getProgress());
        // Tự động đánh dấu completed nếu progress = 100%
        if (request.getProgress() == 100) {
            goal.setCompleted(true);
        } else {
            goal.setCompleted(false);
        }
        goal.setLastModifiedDate(new Date());

        DailyGoal updatedGoal = dailyGoalRepository.save(goal);
        return mapGoalToResponse(updatedGoal);
    }

    @Override
    @Transactional
    public DailyGoalResponse toggleGoalCompleted(Integer id, DailyGoalToggleRequest request, Integer userId) {
        // Kiểm tra goal có tồn tại và thuộc về user này không
        DailyGoal goal = dailyGoalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + id));

        goal.setCompleted(request.getCompleted());
        // Nếu đánh dấu completed, set progress = 100%, ngược lại giữ nguyên progress
        if (request.getCompleted()) {
            goal.setProgress(100);
        }
        goal.setLastModifiedDate(new Date());

        DailyGoal updatedGoal = dailyGoalRepository.save(goal);
        return mapGoalToResponse(updatedGoal);
    }

    @Override
    @Transactional(readOnly = true)
    public DailyGoalStatsResponse getGoalStatsByUserId(Integer userId) {
        // Kiểm tra user có tồn tại không
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        long totalGoals = dailyGoalRepository.countByUserId(userId);
        long completedGoals = dailyGoalRepository.countByUserIdAndCompleted(userId, true);
        long pendingGoals = totalGoals - completedGoals;
        long todayGoals = dailyGoalRepository.countTodayGoalsByUserId(userId);
        double completionRate = totalGoals > 0 ? (double) completedGoals / totalGoals * 100 : 0;
        long highPriorityGoals = dailyGoalRepository.countByUserIdAndPriority(userId, GoalPriority.HIGH);
        long mediumPriorityGoals = dailyGoalRepository.countByUserIdAndPriority(userId, GoalPriority.MEDIUM);
        long lowPriorityGoals = dailyGoalRepository.countByUserIdAndPriority(userId, GoalPriority.LOW);

        return new DailyGoalStatsResponse(
                totalGoals,
                completedGoals,
                pendingGoals,
                todayGoals,
                completionRate,
                highPriorityGoals,
                mediumPriorityGoals,
                lowPriorityGoals
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<DailyGoalResponse> getTodayGoalsByUserId(Integer userId) {
        // Kiểm tra user có tồn tại không
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        List<DailyGoal> goals = dailyGoalRepository.findTodayGoalsByUserId(userId);
        return goals.stream()
                .map(this::mapGoalToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DailyGoalResponse> getGoalsByUserIdAndDateRange(Integer userId, String startDate, String endDate) {
        // Kiểm tra user có tồn tại không
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        try {
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
            Date start = formatter.parse(startDate);
            Date end = formatter.parse(endDate);

            List<DailyGoal> goals = dailyGoalRepository.findByUserIdAndCreatedDateBetween(userId, start, end);
            return goals.stream()
                    .map(this::mapGoalToResponse)
                    .collect(Collectors.toList());
        } catch (ParseException e) {
            throw new IllegalArgumentException("Invalid date format. Use yyyy-MM-dd");
        }
    }

    // Helper method để chuyển đổi entity sang response
    private DailyGoalResponse mapGoalToResponse(DailyGoal goal) {
        DailyGoalResponse response = new DailyGoalResponse();
        response.setId(goal.getId());
        response.setTitle(goal.getTitle());
        response.setDescription(goal.getDescription());
        response.setCategory(goal.getCategory());
        response.setPriority(goal.getPriority());
        response.setEstimatedTime(goal.getEstimatedTime());
        response.setProgress(goal.getProgress());
        response.setCompleted(goal.getCompleted());
        response.setDueDate(goal.getDueDate());
        response.setCreatedDate(goal.getCreatedDate());
        response.setLastModifiedDate(goal.getLastModifiedDate());
        response.setUserId(goal.getUser().getId());
        response.setUserFullName(goal.getUser().getFullName());
        return response;
    }
}