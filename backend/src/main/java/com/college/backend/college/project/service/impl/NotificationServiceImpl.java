package com.college.backend.college.project.service.impl;

import com.college.backend.college.project.entity.Notification;
import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.enums.NotificationStatus;
import com.college.backend.college.project.exception.ResourceNotFoundException;
import com.college.backend.college.project.repository.NotificationRepository;
import com.college.backend.college.project.repository.UserRepository;
import com.college.backend.college.project.request.NotificationRequest;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.NotificationResponse;
import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Autowired
    public NotificationServiceImpl(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<NotificationResponse> getNotificationsByUserId(Integer userId, int pageNo, int pageSize, String status) {
        // Kiểm tra user tồn tại
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Tạo Pageable để phân trang
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by("createdDate").descending());

        Page<Notification> notificationPage;

        // Lọc theo trạng thái nếu có
        if (status != null && !status.isEmpty()) {
            try {
                NotificationStatus notificationStatus = NotificationStatus.valueOf(status.toUpperCase());
                notificationPage = notificationRepository.findByUserIdAndStatus(userId, notificationStatus, pageable);
            } catch (IllegalArgumentException e) {
                // Nếu trạng thái không hợp lệ, lấy tất cả
                notificationPage = notificationRepository.findByUserId(userId, pageable);
            }
        } else {
            notificationPage = notificationRepository.findByUserId(userId, pageable);
        }

        // Chuyển đổi thành NotificationResponse
        List<NotificationResponse> notificationResponses = notificationPage.getContent().stream()
                .map(this::mapToNotificationResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                notificationResponses,
                pageNo,
                pageSize,
                notificationPage.getTotalElements(),
                notificationPage.getTotalPages(),
                notificationPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationResponse getNotificationById(Integer id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));

        return mapToNotificationResponse(notification);
    }

    @Override
    @Transactional
    public NotificationResponse createNotification(NotificationRequest notificationRequest) {
        // Tìm user
        User user = userRepository.findById(notificationRequest.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + notificationRequest.getUserId()));

        // Tạo notification mới
        Notification notification = new Notification();
        notification.setTitle(notificationRequest.getTitle());
        notification.setContent(notificationRequest.getContent());
        notification.setType(notificationRequest.getType());
        notification.setStatus(NotificationStatus.UNREAD);
        notification.setReferenceId(notificationRequest.getReferenceId());
        notification.setUser(user);
        notification.setCreatedDate(new Date());

        // Lưu vào DB
        Notification savedNotification = notificationRepository.save(notification);

        return mapToNotificationResponse(savedNotification);
    }

    @Override
    @Transactional
    public ApiResponse createBulkNotifications(NotificationRequest notificationRequest, Integer[] userIds) {
        List<Notification> notifications = new ArrayList<>();

        for (Integer userId : userIds) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

            Notification notification = new Notification();
            notification.setTitle(notificationRequest.getTitle());
            notification.setContent(notificationRequest.getContent());
            notification.setType(notificationRequest.getType());
            notification.setStatus(NotificationStatus.UNREAD);
            notification.setReferenceId(notificationRequest.getReferenceId());
            notification.setUser(user);
            notification.setCreatedDate(new Date());

            notifications.add(notification);
        }

        notificationRepository.saveAll(notifications);

        return new ApiResponse(true, "Bulk notifications created successfully");
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(Integer id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));

        // Chỉ cập nhật nếu trạng thái là UNREAD
        if (notification.getStatus() == NotificationStatus.UNREAD) {
            notification.setStatus(NotificationStatus.READ);
            notification.setReadDate(new Date());
            notification = notificationRepository.save(notification);
        }

        return mapToNotificationResponse(notification);
    }

    @Override
    @Transactional
    public ApiResponse markAllAsRead(Integer userId) {
        // Kiểm tra user tồn tại
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Đánh dấu tất cả thông báo chưa đọc thành đã đọc
        int updatedCount = notificationRepository.markAllAsRead(userId, NotificationStatus.READ);

        return new ApiResponse(true, updatedCount + " notifications marked as read");
    }

    @Override
    @Transactional
    public ApiResponse deleteNotification(Integer id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));

        notificationRepository.delete(notification);

        return new ApiResponse(true, "Notification deleted successfully");
    }

    @Override
    @Transactional
    public ApiResponse deleteAllReadNotifications(Integer userId) {
        // Kiểm tra user tồn tại
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Tìm tất cả thông báo đã đọc
        Pageable unpaged = Pageable.unpaged();
        Page<Notification> readNotifications = notificationRepository.findByUserIdAndStatus(userId, NotificationStatus.READ, unpaged);

        // Xóa tất cả thông báo đã đọc
        notificationRepository.deleteAll(readNotifications.getContent());

        return new ApiResponse(true, readNotifications.getContent().size() + " read notifications deleted");
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnreadNotifications(Integer userId) {
        // Kiểm tra user tồn tại
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Đếm số thông báo chưa đọc
        return notificationRepository.countByUserIdAndStatus(userId, NotificationStatus.UNREAD);
    }

    // Helper method to map Notification to NotificationResponse
    private NotificationResponse mapToNotificationResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setTitle(notification.getTitle());
        response.setContent(notification.getContent());
        response.setType(notification.getType());
        response.setStatus(notification.getStatus());
        response.setReferenceId(notification.getReferenceId());
        response.setCreatedDate(notification.getCreatedDate());
        response.setReadDate(notification.getReadDate());

        if (notification.getUser() != null) {
            response.setUserId(notification.getUser().getId());
            response.setUserName(notification.getUser().getFullName());
        }

        return response;
    }
}