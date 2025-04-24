package com.college.backend.college.project.repository;

import com.college.backend.college.project.entity.Comment;
import com.college.backend.college.project.enums.CommentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {

    // Tìm tất cả comment gốc (không có parent) theo type và referenceId
    List<Comment> findByTypeAndReferenceIdAndParentCommentIsNullOrderByCreatedDateDesc(CommentType type, Integer referenceId);

    // Tìm tất cả các reply của một comment
    List<Comment> findByParentCommentIdOrderByCreatedDateAsc(Integer parentId);

    // Đếm số lượng replies của một comment
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.parentComment.id = :parentId")
    Integer countRepliesByParentId(@Param("parentId") Integer parentId);
}