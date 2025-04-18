package com.college.backend.college.project.controller;

import com.college.backend.college.project.request.NotificationRequest;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.NotificationResponse;
import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class NotificationController {

    private final NotificationService notificationService;

    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<PagedResponse<NotificationResponse>> getNotificationsByUserId(
            @PathVariable Integer userId,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String status) {

        PagedResponse<NotificationResponse> response = notificationService.getNotificationsByUserId(
                userId, pageNo, pageSize, status);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationResponse> getNotificationById(@PathVariable Integer id) {
        NotificationResponse response = notificationService.getNotificationById(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<NotificationResponse> createNotification(@RequestBody NotificationRequest request) {
        NotificationResponse response = notificationService.createNotification(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse> createBulkNotifications(
            @RequestBody NotificationRequest request,
            @RequestParam Integer[] userIds) {

        ApiResponse response = notificationService.createBulkNotifications(request, userIds);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Integer id) {
        NotificationResponse response = notificationService.markAsRead(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<ApiResponse> markAllAsRead(@PathVariable Integer userId) {
        ApiResponse response = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteNotification(@PathVariable Integer id) {
        ApiResponse response = notificationService.deleteNotification(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/user/{userId}/read")
    public ResponseEntity<ApiResponse> deleteAllReadNotifications(@PathVariable Integer userId) {
        ApiResponse response = notificationService.deleteAllReadNotifications(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/count-unread")
    public ResponseEntity<Long> countUnreadNotifications(@PathVariable Integer userId) {
        long count = notificationService.countUnreadNotifications(userId);
        return ResponseEntity.ok(count);
    }
}