package com.college.backend.college.project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "subtasks")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Subtask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name")
    private String name;

    @Column(name = "completed")
    private Boolean completed = false;

    // Mối quan hệ với Task
    @ManyToOne
    @JoinColumn(name = "task_id")
    private Task task;

    @OneToOne
    @JoinColumn(name = "assignee_id")
    private User assignee;
}