package com.college.backend.college.project.request;

import lombok.Data;

@Data
public class PasswordUpdateRequest {
    private String email;
    private String currentPassword;
    private String newPassword;
}