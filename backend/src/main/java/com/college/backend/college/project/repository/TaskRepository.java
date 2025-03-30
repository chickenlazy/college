package com.college.backend.college.project.repository;

import com.college.backend.college.project.entity.Task;
import com.college.backend.college.project.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Integer> {
    int countByProjectId(int projectId);
    int countByProjectIdAndStatus(int projectId, TaskStatus staskStatus);
    Page<Task> findAll(Specification<Task> spec, Pageable pageable);
}
