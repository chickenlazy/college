package com.college.backend.college.project.service.impl;

import com.college.backend.college.project.entity.Attachment;
import com.college.backend.college.project.entity.Project;
import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.exception.ResourceNotFoundException;
import com.college.backend.college.project.repository.AttachmentRepository;
import com.college.backend.college.project.repository.ProjectRepository;
import com.college.backend.college.project.repository.UserRepository;
import com.college.backend.college.project.response.AttachmentResponse;
import com.college.backend.college.project.service.AttachmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AttachmentServiceImpl implements AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Autowired
    public AttachmentServiceImpl(AttachmentRepository attachmentRepository,
                                 ProjectRepository projectRepository,
                                 UserRepository userRepository) {
        this.attachmentRepository = attachmentRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public AttachmentResponse uploadFile(Integer projectId, Integer uploadedBy,
                                         MultipartFile file, String description) {
        // Kiểm tra project có tồn tại không
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        // Kiểm tra user có tồn tại không
        User user = userRepository.findById(uploadedBy)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + uploadedBy));

        try {
            // Tạo thư mục lưu trữ nếu chưa tồn tại
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Lấy tên file gốc và tạo tên file duy nhất
            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
            String fileExtension = "";
            if (originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

            // Đường dẫn lưu file
            Path targetLocation = uploadPath.resolve(uniqueFileName);

            // Lưu file
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Tạo đối tượng Attachment
            Attachment attachment = new Attachment();
            attachment.setFileName(originalFileName);
            attachment.setFilePath(targetLocation.toString());
            attachment.setFileType(file.getContentType());
            attachment.setFileSize(file.getSize());
            attachment.setDescription(description);
            attachment.setProject(project);
            attachment.setUploadedBy(user);
            attachment.setCreatedDate(new Date());
            attachment.setLastModifiedDate(new Date());

            // Lưu vào cơ sở dữ liệu
            Attachment savedAttachment = attachmentRepository.save(attachment);

            // Trả về response
            return mapAttachmentToResponse(savedAttachment);

        } catch (IOException ex) {
            throw new RuntimeException("Could not store file. Please try again!", ex);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AttachmentResponse getAttachmentById(Integer id) {
        Attachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found with ID: " + id));

        return mapAttachmentToResponse(attachment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachmentsByProjectId(Integer projectId) {
        // Kiểm tra project có tồn tại không
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        List<Attachment> attachments = attachmentRepository.findByProjectId(projectId);

        return attachments.stream()
                .map(this::mapAttachmentToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteAttachment(Integer id) {
        Attachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found with ID: " + id));

        try {
            // Xóa file từ hệ thống
            Path filePath = Paths.get(attachment.getFilePath());
            Files.deleteIfExists(filePath);

            // Xóa record từ database
            attachmentRepository.delete(attachment);
        } catch (IOException ex) {
            throw new RuntimeException("Error occurred while deleting the file", ex);
        }
    }

    private AttachmentResponse mapAttachmentToResponse(Attachment attachment) {
        AttachmentResponse response = new AttachmentResponse();
        response.setId(attachment.getId());
        response.setFileName(attachment.getFileName());
        response.setFileType(attachment.getFileType());
        response.setFileSize(attachment.getFileSize());
        response.setDescription(attachment.getDescription());
        response.setProjectId(attachment.getProject().getId());
        response.setUploadedById(attachment.getUploadedBy().getId());
        response.setUploadedByName(attachment.getUploadedBy().getFullName());
        response.setCreatedDate(attachment.getCreatedDate());

        return response;
    }
}