package com.college.backend.college.project.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FileUploadRequest {
    private Integer projectId;
    private String description;
    // Spring sẽ xử lý MultipartFile thông qua tham số của controller method,
    // nên không cần khai báo ở đây
}