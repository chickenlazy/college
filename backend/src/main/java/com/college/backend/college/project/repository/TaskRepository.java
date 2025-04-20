package com.college.backend.college.project.repository;

import com.college.backend.college.project.entity.Task;
import com.college.backend.college.project.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Date;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Integer> {
    int countByProjectId(int projectId);
    int countByProjectIdAndStatus(int projectId, TaskStatus staskStatus);
    Page<Task> findAll(Specification<Task> spec, Pageable pageable);
    // Đếm số lượng task theo trạng thái
    long countByStatus(TaskStatus status);

    List<Task> findByStatusNot(TaskStatus status);

    // Đếm số lượng task theo project
    int countByProjectId(Integer projectId);

    // Đếm số lượng task đã hoàn thành theo project
    int countByProjectIdAndStatus(Integer projectId, TaskStatus status);

    // Tìm các task có deadline sau ngày hiện tại và chưa hoàn thành
    Page<Task> findByDueDateAfterAndStatusNot(Date currentDate, TaskStatus status, Pageable pageable);

    List<Task> findByDueDateBeforeAndStatusNot(Date dueDate, TaskStatus status);

    List<Task> findByProjectId(Integer projectId);

    List<Task> findByDueDateBetweenAndStatusNot(Date start, Date end, TaskStatus status);

}