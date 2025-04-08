package com.college.backend.college.project.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentResponse {
    private Integer id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String description;
    private Integer projectId;
    private Integer uploadedById;
    private String uploadedByName;
    private Date createdDate;
}