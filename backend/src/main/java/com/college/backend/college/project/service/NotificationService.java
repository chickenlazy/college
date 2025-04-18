package com.college.backend.college.project.service;

import com.college.backend.college.project.entity.Notification;
import com.college.backend.college.project.enums.NotificationStatus;
import com.college.backend.college.project.enums.NotificationType;
import com.college.backend.college.project.request.NotificationRequest;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.NotificationResponse;
import com.college.backend.college.project.response.PagedResponse;

public interface NotificationService {

    // Lấy tất cả thông báo của một người dùng với phân trang
    PagedResponse<NotificationResponse> getNotificationsByUserId(Integer userId, int pageNo, int pageSize, String status);

    // Lấy chi tiết một thông báo theo ID
    NotificationResponse getNotificationById(Integer id);

    // Tạo thông báo mới
    NotificationResponse createNotification(NotificationRequest notificationRequest);

    // Tạo nhiều thông báo cùng lúc (ví dụ: gửi thông báo cho nhiều người dùng)
    ApiResponse createBulkNotifications(NotificationRequest notificationRequest, Integer[] userIds);

    // Đánh dấu một thông báo là đã đọc
    NotificationResponse markAsRead(Integer id);

    // Đánh dấu tất cả thông báo của một người dùng là đã đọc
    ApiResponse markAllAsRead(Integer userId);

    // Xóa một thông báo
    ApiResponse deleteNotification(Integer id);

    // Xóa tất cả thông báo đã đọc của một người dùng
    ApiResponse deleteAllReadNotifications(Integer userId);

    // Đếm số thông báo chưa đọc của một người dùng
    long countUnreadNotifications(Integer userId);
}