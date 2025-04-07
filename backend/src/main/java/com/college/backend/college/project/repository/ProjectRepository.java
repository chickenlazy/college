package com.college.backend.college.project.repository;

import com.college.backend.college.project.entity.Project;
import com.college.backend.college.project.enums.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Date;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Integer> {
    Page<Project> findAll(Specification<Project> spec, Pageable pageable);
    // Đếm số lượng project theo trạng thái
    long countByStatus(ProjectStatus status);

    // Tìm các project có deadline sau ngày hiện tại và chưa hoàn thành
    Page<Project> findByDueDateAfterAndStatusNot(Date currentDate, ProjectStatus status, Pageable pageable);

    List<Project> findByDueDateBeforeAndStatusNot(Date dueDate, ProjectStatus status);

}