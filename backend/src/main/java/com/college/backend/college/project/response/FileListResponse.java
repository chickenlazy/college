package com.college.backend.college.project.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FileListResponse {
    private List<FileResponse> files;

    // Project related fields
    private Integer projectId;
    private String projectName;

    // Task related fields
    private Integer taskId;
    private String taskName;

    private Integer totalFiles;
    private Long totalSize; // Tổng dung lượng của tất cả file (byte)
}