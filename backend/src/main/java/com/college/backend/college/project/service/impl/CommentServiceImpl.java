package com.college.backend.college.project.service.impl;

import com.college.backend.college.project.entity.Project;
import com.college.backend.college.project.entity.Task;
import com.college.backend.college.project.enums.NotificationType;
import com.college.backend.college.project.entity.Comment;
import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.enums.CommentType;
import com.college.backend.college.project.exception.ResourceNotFoundException;
import com.college.backend.college.project.repository.CommentRepository;
import com.college.backend.college.project.repository.ProjectRepository;
import com.college.backend.college.project.repository.TaskRepository;
import com.college.backend.college.project.repository.UserRepository;
import com.college.backend.college.project.request.CommentRequest;
import com.college.backend.college.project.request.NotificationRequest;
import com.college.backend.college.project.response.CommentResponse;
import com.college.backend.college.project.service.CommentService;
import com.college.backend.college.project.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    @Autowired
    public CommentServiceImpl(CommentRepository commentRepository, UserRepository userRepository, NotificationService notificationService, ProjectRepository projectRepository, TaskRepository taskRepository) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
    }

    @Override
    @Transactional
    public CommentResponse createComment(CommentRequest commentRequest, Integer userId) {
        // Tìm user theo ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Tạo đối tượng Comment mới
        Comment comment = new Comment();
        comment.setContent(commentRequest.getContent());
        comment.setType(commentRequest.getType());
        comment.setReferenceId(commentRequest.getReferenceId());
        comment.setUser(user);

        // Nếu có parentId, tìm comment cha
        if (commentRequest.getParentId() != null) {
            Comment parentComment = commentRepository.findById(commentRequest.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found with ID: " + commentRequest.getParentId()));
            comment.setParentComment(parentComment);
        }

        // Thiết lập các giá trị ngày tháng
        Date now = new Date();
        comment.setCreatedDate(now);
        comment.setLastModifiedDate(now);

        // Lưu comment vào cơ sở dữ liệu
        Comment savedComment = commentRepository.save(comment);

        // Xử lý thông báo dựa vào loại comment
        sendCommentNotifications(savedComment, user);

        // Chuyển đổi sang CommentResponse và trả về
        return mapCommentToCommentResponse(savedComment);
    }

    private void sendCommentNotifications(Comment comment, User commentAuthor) {
        // Xử lý dựa vào loại comment
        if (comment.getParentComment() != null) {
            // Đây là reply, thông báo cho người tạo comment gốc
            sendReplyNotification(comment, commentAuthor);
        } else if (comment.getType() == CommentType.PROJECT) {
            // Comment trên project, thông báo cho manager và team members
            sendProjectCommentNotification(comment, commentAuthor);
        } else if (comment.getType() == CommentType.TASK) {
            // Comment trên task, thông báo cho manager và team members của project chứa task
            sendTaskCommentNotification(comment, commentAuthor);
        }
    }

    private void sendReplyNotification(Comment reply, User replyAuthor) {
        Comment parentComment = reply.getParentComment();
        User commentCreator = parentComment.getUser();

        // Không gửi thông báo nếu người trả lời chính là người tạo comment gốc
        if (commentCreator.getId().equals(replyAuthor.getId())) {
            return;
        }

        NotificationRequest notification = new NotificationRequest();
        notification.setTitle("Có người trả lời bình luận của bạn");
        notification.setContent(replyAuthor.getFullName() + " đã trả lời bình luận của bạn: \"" +
                reply.getContent().substring(0, Math.min(50, reply.getContent().length())) +
                (reply.getContent().length() > 50 ? "...\"" : "\""));
        notification.setType(NotificationType.COMMENT);
        notification.setReferenceId(parentComment.getId());
        notification.setUserId(commentCreator.getId());

        notificationService.createNotification(notification);
    }

    private void sendProjectCommentNotification(Comment comment, User commentAuthor) {
        Integer projectId = comment.getReferenceId();

        try {
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

            NotificationRequest notification = new NotificationRequest();
            notification.setTitle("Bình luận mới trong dự án");
            notification.setContent(commentAuthor.getFullName() + " đã bình luận trong dự án \"" +
                    project.getName() + "\": \"" +
                    comment.getContent().substring(0, Math.min(50, comment.getContent().length())) +
                    (comment.getContent().length() > 50 ? "...\"" : "\""));
            notification.setType(NotificationType.COMMENT);
            notification.setReferenceId(comment.getId());

            // Danh sách người nhận thông báo
            List<Integer> notifyUserIds = new ArrayList<>();

            // Thêm manager vào danh sách
            if (project.getManager() != null && !project.getManager().getId().equals(commentAuthor.getId())) {
                notifyUserIds.add(project.getManager().getId());
            }

            // Thêm các thành viên dự án
            if (project.getUsers() != null && !project.getUsers().isEmpty()) {
                project.getUsers().forEach(user -> {
                    // Không gửi thông báo cho người đã đăng comment
                    if (!user.getId().equals(commentAuthor.getId()) && !notifyUserIds.contains(user.getId())) {
                        notifyUserIds.add(user.getId());
                    }
                });
            }

            // Gửi thông báo
            if (!notifyUserIds.isEmpty()) {
                notificationService.createBulkNotifications(notification, notifyUserIds.toArray(new Integer[0]));
            }
        } catch (Exception e) {
            // Log lỗi nhưng không dừng luồng chính
            System.err.println("Failed to send project comment notification: " + e.getMessage());
        }
    }

    private void sendTaskCommentNotification(Comment comment, User commentAuthor) {
        Integer taskId = comment.getReferenceId();

        try {
            Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

            Project project = task.getProject();
            if (project == null) {
                return;
            }

            NotificationRequest notification = new NotificationRequest();
            notification.setTitle("Bình luận mới trong công việc");
            notification.setContent(commentAuthor.getFullName() + " đã bình luận trong công việc \"" +
                    task.getName() + "\" thuộc dự án \"" + project.getName() + "\": \"" +
                    comment.getContent().substring(0, Math.min(50, comment.getContent().length())) +
                    (comment.getContent().length() > 50 ? "...\"" : "\""));
            notification.setType(NotificationType.COMMENT);
            notification.setReferenceId(comment.getId());

            // Danh sách người nhận thông báo
            List<Integer> notifyUserIds = new ArrayList<>();

            // Thêm người tạo task vào danh sách (nếu có)
            if (task.getCreatedBy() != null && !task.getCreatedBy().getId().equals(commentAuthor.getId())) {
                notifyUserIds.add(task.getCreatedBy().getId());
            }

            // Thêm manager của project vào danh sách
            if (project.getManager() != null && !project.getManager().getId().equals(commentAuthor.getId())) {
                notifyUserIds.add(project.getManager().getId());
            }

            // Thêm các thành viên dự án
            if (project.getUsers() != null && !project.getUsers().isEmpty()) {
                project.getUsers().forEach(user -> {
                    // Không gửi thông báo cho người đã đăng comment
                    if (!user.getId().equals(commentAuthor.getId()) && !notifyUserIds.contains(user.getId())) {
                        notifyUserIds.add(user.getId());
                    }
                });
            }

            // Gửi thông báo
            if (!notifyUserIds.isEmpty()) {
                notificationService.createBulkNotifications(notification, notifyUserIds.toArray(new Integer[0]));
            }
        } catch (Exception e) {
            // Log lỗi nhưng không dừng luồng chính
            System.err.println("Failed to send task comment notification: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByTypeAndReferenceId(CommentType type, Integer referenceId) {
        // Tìm tất cả comment gốc (không có parent) theo type và referenceId
        List<Comment> comments = commentRepository.findByTypeAndReferenceIdAndParentCommentIsNullOrderByCreatedDateDesc(type, referenceId);

        // Chuyển đổi danh sách Comment thành danh sách CommentResponse
        return comments.stream()
                .map(this::mapCommentToCommentResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getRepliesByCommentId(Integer commentId) {
        // Kiểm tra xem comment có tồn tại hay không
        if (!commentRepository.existsById(commentId)) {
            throw new ResourceNotFoundException("Comment not found with ID: " + commentId);
        }

        // Tìm tất cả các reply của comment
        List<Comment> replies = commentRepository.findByParentCommentIdOrderByCreatedDateAsc(commentId);

        // Chuyển đổi danh sách Comment thành danh sách CommentResponse
        return replies.stream()
                .map(this::mapCommentToCommentResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteComment(Integer commentId) {
        // Kiểm tra xem comment có tồn tại hay không
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with ID: " + commentId));

        // Xóa comment khỏi cơ sở dữ liệu
        commentRepository.delete(comment);
    }

    @Override
    @Transactional(readOnly = true)
    public CommentResponse getCommentById(Integer commentId) {
        // Tìm comment theo ID
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with ID: " + commentId));

        // Chuyển đổi Comment thành CommentResponse và trả về
        return mapCommentToCommentResponse(comment);
    }

    // Helper method để chuyển đổi Comment thành CommentResponse
    private CommentResponse mapCommentToCommentResponse(Comment comment) {
        CommentResponse commentResponse = new CommentResponse();
        commentResponse.setId(comment.getId());
        commentResponse.setContent(comment.getContent());
        commentResponse.setType(comment.getType());
        commentResponse.setReferenceId(comment.getReferenceId());
        commentResponse.setCreatedDate(comment.getCreatedDate());
        commentResponse.setLastModifiedDate(comment.getLastModifiedDate());

        // Thiết lập thông tin về user
        CommentResponse.UserSummary userSummary = new CommentResponse.UserSummary();
        userSummary.setId(comment.getUser().getId());
        userSummary.setFullName(comment.getUser().getFullName());
        userSummary.setUsername(comment.getUser().getUsername());
        userSummary.setEmail(comment.getUser().getEmail());
        userSummary.setPosition(comment.getUser().getPosition());
        commentResponse.setUser(userSummary);

        // Thiết lập parentId nếu có
        if (comment.getParentComment() != null) {
            commentResponse.setParentId(comment.getParentComment().getId());
        }

        // Đếm số lượng replies
        Integer replyCount = commentRepository.countRepliesByParentId(comment.getId());
        commentResponse.setReplyCount(replyCount);

        return commentResponse;
    }
}