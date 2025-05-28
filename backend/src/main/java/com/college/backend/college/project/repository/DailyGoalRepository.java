package com.college.backend.college.project.repository;

import com.college.backend.college.project.entity.DailyGoal;
import com.college.backend.college.project.enums.GoalPriority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyGoalRepository extends JpaRepository<DailyGoal, Integer>, JpaSpecificationExecutor<DailyGoal> {

    Optional<DailyGoal> findByIdAndUserId(Integer id, Integer userId);

    List<DailyGoal> findByUserIdOrderByCreatedDateDesc(Integer userId);

    long countByUserId(Integer userId);

    long countByUserIdAndCompleted(Integer userId, Boolean completed);

    long countByUserIdAndPriority(Integer userId, GoalPriority priority);

    @Query("SELECT COUNT(g) FROM DailyGoal g WHERE g.user.id = :userId AND DATE(g.createdDate) = CURDATE()")
    long countTodayGoalsByUserId(@Param("userId") Integer userId);

    @Query("SELECT g FROM DailyGoal g WHERE g.user.id = :userId AND DATE(g.createdDate) = CURDATE() ORDER BY g.createdDate DESC")
    List<DailyGoal> findTodayGoalsByUserId(@Param("userId") Integer userId);

    List<DailyGoal> findByUserIdAndCreatedDateBetween(Integer userId, Date startDate, Date endDate);
}