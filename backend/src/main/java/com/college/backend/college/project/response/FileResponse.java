package com.college.backend.college.project.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FileResponse {
    private Integer id;
    private String name;
    private String originalName;
    private String contentType;
    private Long size;
    private String path;
    private String description;
    private Date uploadDate;
    private Date lastModifiedDate;

    // Thông tin về project
    private Integer projectId;
    private String projectName;

    // Thông tin về người upload
    private Integer uploadedById;
    private String uploadedBy;

    // URL để download file
    private String downloadUrl;
}