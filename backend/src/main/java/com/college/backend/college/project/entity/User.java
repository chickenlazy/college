package com.college.backend.college.project.entity;

import com.college.backend.college.project.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.Set;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "full_name")
    private String fullName;

    @Column(length = 50, unique = true)
    private String username;

    @Column(length = 520)
    private String password;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "department")
    private String department;  // New field for department

    @Column(name = "address")
    private String address;  // New field for address

    @Column(name = "position")
    private String position;  // New field for position

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Role role;

    @CreationTimestamp
    @Column(name = "created_date", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @UpdateTimestamp
    @Column(name = "last_modified_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastModifiedDate;

    // Mối quan hệ với Project qua bảng project_users
    @ManyToMany(mappedBy = "users", fetch = FetchType.LAZY)
    private Set<Project> projects;

    @OneToMany(mappedBy = "assignee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Subtask> subtasks;

    // Mối quan hệ với Comment (author)
    @OneToMany(mappedBy = "author", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    private Set<Comment> comments;

    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Task> createdTasks;
}