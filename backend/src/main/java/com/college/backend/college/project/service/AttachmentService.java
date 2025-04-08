package com.college.backend.college.project.service;

import com.college.backend.college.project.response.AttachmentResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AttachmentService {
    AttachmentResponse uploadFile(Integer projectId, Integer uploadedBy, MultipartFile file, String description);

    AttachmentResponse getAttachmentById(Integer id);

    List<AttachmentResponse> getAttachmentsByProjectId(Integer projectId);

    void deleteAttachment(Integer id);
}