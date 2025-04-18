package com.college.backend.college.project.request;

import com.college.backend.college.project.enums.NotificationType;
import lombok.Data;

@Data
public class NotificationRequest {
    private String title;
    private String content;
    private NotificationType type;
    private Integer referenceId;
    private Integer userId;
}