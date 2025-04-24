package com.college.backend.college.project.controller;

import com.college.backend.college.project.enums.CommentType;
import com.college.backend.college.project.request.CommentRequest;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.CommentResponse;
import com.college.backend.college.project.security.CurrentUser;
import com.college.backend.college.project.security.UserPrincipal;
import com.college.backend.college.project.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class CommentController {

    private final CommentService commentService;

    @Autowired
    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    /**
     * API tạo mới comment hoặc reply comment: POST /api/comments
     * @param commentRequest Dữ liệu của comment
     * @param currentUser Người dùng hiện tại
     * @return Comment đã được tạo
     */
    @PostMapping
    public ResponseEntity<CommentResponse> createComment(
            @RequestBody CommentRequest commentRequest,
            @CurrentUser UserPrincipal currentUser) {

        Integer userId = currentUser.getId();
        CommentResponse commentResponse = commentService.createComment(commentRequest, userId);
        return new ResponseEntity<>(commentResponse, HttpStatus.CREATED);
    }

    /**
     * API lấy danh sách comment theo đối tượng: GET /api/comments?type=PROJECT&referenceId=1
     * @param type Loại đối tượng (PROJECT, TASK, SUBTASK)
     * @param referenceId ID của đối tượng
     * @return Danh sách comment
     */
    @GetMapping
    public ResponseEntity<List<CommentResponse>> getCommentsByTypeAndReferenceId(
            @RequestParam CommentType type,
            @RequestParam Integer referenceId) {

        List<CommentResponse> comments = commentService.getCommentsByTypeAndReferenceId(type, referenceId);
        return ResponseEntity.ok(comments);
    }

    /**
     * API lấy replies của một comment: GET /api/comments/{commentId}/replies
     * @param commentId ID của comment
     * @return Danh sách replies
     */
    @GetMapping("/{commentId}/replies")
    public ResponseEntity<List<CommentResponse>> getRepliesByCommentId(@PathVariable Integer commentId) {
        List<CommentResponse> replies = commentService.getRepliesByCommentId(commentId);
        return ResponseEntity.ok(replies);
    }

    /**
     * API lấy thông tin chi tiết của một comment: GET /api/comments/{commentId}
     * @param commentId ID của comment
     * @return Thông tin chi tiết của comment
     */
    @GetMapping("/{commentId}")
    public ResponseEntity<CommentResponse> getCommentById(@PathVariable Integer commentId) {
        CommentResponse commentResponse = commentService.getCommentById(commentId);
        return ResponseEntity.ok(commentResponse);
    }

    /**
     * API xóa comment: DELETE /api/comments/{commentId}
     * @param commentId ID của comment
     * @return Thông báo kết quả
     */
    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse> deleteComment(
            @PathVariable Integer commentId,
            @CurrentUser UserPrincipal currentUser) {

        // Có thể thêm kiểm tra quyền xóa ở đây
        // Ví dụ: chỉ cho phép người tạo comment hoặc admin xóa comment

        commentService.deleteComment(commentId);

        ApiResponse apiResponse = new ApiResponse(
                Boolean.TRUE,
                "Comment deleted successfully");

        return new ResponseEntity<>(apiResponse, HttpStatus.OK);
    }
}