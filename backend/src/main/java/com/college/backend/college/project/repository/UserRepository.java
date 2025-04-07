package com.college.backend.college.project.repository;

import com.college.backend.college.project.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Page<User> findAll(Specification<User> spec, Pageable pageable);

    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);
    Boolean existsByUsername(String username);
    @Query("SELECT u FROM User u WHERE u.username = :usernameOrEmail OR u.email = :usernameOrEmail")
    Optional<User> findByUsernameOrEmail(@Param("usernameOrEmail") String usernameOrEmail);
}
