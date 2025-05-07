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
public class ProjectFileResponse {
    private Integer id;
    private String name;
    private String originalName;
    private String contentType;
    private Long size;
    private String description;
    private Date uploadDate;
    private Date lastModifiedDate;
    private String downloadUrl;

    // Thông tin người upload
    private UserInfoInFile uploadedBy;

    // Project info
    private Integer projectId;
    private String projectName;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserInfoInFile {
        private Integer id;
        private String fullName;
        private String email;
    }
}