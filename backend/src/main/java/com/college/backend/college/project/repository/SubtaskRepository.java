package com.college.backend.college.project.repository;

import com.college.backend.college.project.entity.Subtask;
import com.college.backend.college.project.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubtaskRepository extends JpaRepository<Subtask, Integer> {
    List<Subtask> findByTaskId(Integer taskId);
    void deleteAllByTask(Task task);
}