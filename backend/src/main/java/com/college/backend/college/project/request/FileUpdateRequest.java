package com.college.backend.college.project.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FileUpdateRequest {
    private String description;
    private String originalName; // Cho phép chỉnh sửa tên hiển thị của file
}