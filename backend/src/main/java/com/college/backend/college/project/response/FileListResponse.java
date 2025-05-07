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
    private Integer projectId;
    private String projectName;
    private Integer totalFiles;
    private Long totalSize; // Tổng dung lượng của tất cả file (byte)
}