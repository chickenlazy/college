package com.college.backend.college.project.repository;

import com.college.backend.college.project.entity.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Integer> {
    Page<Tag> findAll(Specification<Tag> spec, Pageable pageable);
    Optional<Tag> findByName(String trimmedTagName);
}
