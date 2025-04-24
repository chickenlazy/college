package com.college.backend.college.project.service;

import com.college.backend.college.project.enums.CommentType;
import com.college.backend.college.project.request.CommentRequest;
import com.college.backend.college.project.response.CommentResponse;

import java.util.List;

public interface CommentService {

    // Tạo mới comment
    CommentResponse createComment(CommentRequest commentRequest, Integer userId);

    // Lấy danh sách comment theo type và referenceId
    List<CommentResponse> getCommentsByTypeAndReferenceId(CommentType type, Integer referenceId);

    // Lấy danh sách replies của một comment
    List<CommentResponse> getRepliesByCommentId(Integer commentId);

    // Xóa comment
    void deleteComment(Integer commentId);

    // Lấy thông tin chi tiết của một comment
    CommentResponse getCommentById(Integer commentId);
}