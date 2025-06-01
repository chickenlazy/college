package com.college.backend.college.project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Date;

@Entity
@Table(name = "task_files")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class TaskFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "original_name", nullable = false)
    private String originalName;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @Column(name = "size", nullable = false)
    private Long size;

    @Column(name = "path", nullable = false)
    private String path;

    @Column(name = "description")
    private String description;

    @CreationTimestamp
    @Column(name = "upload_date", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date uploadDate;

    @UpdateTimestamp
    @Column(name = "last_modified_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastModifiedDate;

    // Mối quan hệ với Task
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    // Mối quan hệ với User (người upload file)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;
}