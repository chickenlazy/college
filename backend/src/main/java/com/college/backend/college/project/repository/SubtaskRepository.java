package com.college.backend.college.project.repository;

import com.college.backend.college.project.entity.Subtask;
import com.college.backend.college.project.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubtaskRepository extends JpaRepository<Subtask, Integer> {
    List<Subtask> findByTaskId(Integer taskId);
    void deleteAllByTask(Task task);
    // Tìm subtask theo người được gán
    List<Subtask> findByAssigneeId(Integer assigneeId);
    Page<Subtask> findByAssigneeId(Integer assigneeId, Pageable pageable);

}