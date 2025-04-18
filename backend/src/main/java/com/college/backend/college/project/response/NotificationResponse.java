package com.college.backend.college.project.response;

import com.college.backend.college.project.enums.NotificationStatus;
import com.college.backend.college.project.enums.NotificationType;
import lombok.Data;

import java.util.Date;

@Data
public class NotificationResponse {
    private Integer id;
    private String title;
    private String content;
    private NotificationType type;
    private NotificationStatus status;
    private Integer referenceId;
    private Integer userId;
    private String userName;
    private Date createdDate;
    private Date readDate;
}