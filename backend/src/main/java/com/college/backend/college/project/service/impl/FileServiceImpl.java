package com.college.backend.college.project.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.college.backend.college.project.entity.Project;
import com.college.backend.college.project.entity.ProjectFile;
import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.enums.NotificationType;
import com.college.backend.college.project.exception.ResourceNotFoundException;
import com.college.backend.college.project.repository.ProjectFileRepository;
import com.college.backend.college.project.repository.ProjectRepository;
import com.college.backend.college.project.repository.UserRepository;
import com.college.backend.college.project.request.FileUpdateRequest;
import com.college.backend.college.project.request.NotificationRequest;
import com.college.backend.college.project.response.FileDeleteResponse;
import com.college.backend.college.project.response.FileListResponse;
import com.college.backend.college.project.response.FileResponse;
import com.college.backend.college.project.service.FileService;
import com.college.backend.college.project.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FileServiceImpl implements FileService {

    private final ProjectFileRepository projectFileRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final Cloudinary cloudinary;

    @Autowired
    public FileServiceImpl(
            ProjectFileRepository projectFileRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            @Value("${cloudinary.url}") String cloudinaryUrl) {
        this.projectFileRepository = projectFileRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.cloudinary = new Cloudinary(cloudinaryUrl);
    }

    @Override
    @Transactional
    public FileResponse uploadFile(MultipartFile file, Integer projectId, Integer userId, String description) throws IOException {
        // Kiểm tra project có tồn tại không
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        // Kiểm tra user có tồn tại không
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Tạo tên file duy nhất để tránh trùng lặp
        String uniqueFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

        // Tải file lên Cloudinary
        Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "public_id", "project_files/" + projectId + "/" + uniqueFileName,
                        "resource_type", "auto",
                        "folder", "project_files"
                )
        );

        // Lấy URL từ kết quả upload
        String fileUrl = (String) uploadResult.get("secure_url");

        // Tạo đối tượng ProjectFile
        ProjectFile projectFile = new ProjectFile();
        projectFile.setName(uniqueFileName);
        projectFile.setOriginalName(file.getOriginalFilename());
        projectFile.setContentType(file.getContentType());
        projectFile.setSize(file.getSize());
        projectFile.setPath(fileUrl);
        projectFile.setDescription(description);
        projectFile.setProject(project);
        projectFile.setUploadedBy(user);
        projectFile.setUploadDate(new Date());
        projectFile.setLastModifiedDate(new Date());

        // Lưu thông tin file vào database
        ProjectFile savedFile = projectFileRepository.save(projectFile);

        // Gửi thông báo cho manager của project
        if (project.getManager() != null) {
            NotificationRequest notification = new NotificationRequest();
            notification.setTitle("File mới được tải lên");
            notification.setContent(user.getFullName() + " đã tải lên file \"" + file.getOriginalFilename() + "\" vào dự án \"" + project.getName() + "\"");
            notification.setType(NotificationType.PROJECT);
            notification.setReferenceId(projectId);
            notification.setUserId(project.getManager().getId());
            notificationService.createNotification(notification);
        }

        // Trả về thông tin file
        return mapProjectFileToFileResponse(savedFile);
    }

    @Override
    @Transactional
    public List<FileResponse> uploadMultipleFiles(List<MultipartFile> files, Integer projectId, Integer userId, String description) throws IOException {
        List<FileResponse> responses = new ArrayList<>();
        for (MultipartFile file : files) {
            responses.add(uploadFile(file, projectId, userId, description));
        }
        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public FileListResponse getFilesByProject(Integer projectId) {
        // Kiểm tra project có tồn tại không
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        // Lấy danh sách file của project
        List<ProjectFile> files = projectFileRepository.findByProjectId(projectId);

        // Chuyển đổi thành FileResponse
        List<FileResponse> fileResponses = files.stream()
                .map(this::mapProjectFileToFileResponse)
                .collect(Collectors.toList());

        // Tính tổng dung lượng
        long totalSize = files.stream()
                .mapToLong(ProjectFile::getSize)
                .sum();

        // Tạo và trả về response
        FileListResponse response = new FileListResponse();
        response.setFiles(fileResponses);
        response.setProjectId(projectId);
        response.setProjectName(project.getName());
        response.setTotalFiles(fileResponses.size());
        response.setTotalSize(totalSize);

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public FileResponse getFileById(Integer fileId) {
        ProjectFile file = projectFileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with ID: " + fileId));

        return mapProjectFileToFileResponse(file);
    }

    @Override
    @Transactional
    public FileResponse updateFile(Integer fileId, FileUpdateRequest fileUpdateRequest) {
        ProjectFile file = projectFileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with ID: " + fileId));

        // Cập nhật thông tin file
        if (fileUpdateRequest.getDescription() != null) {
            file.setDescription(fileUpdateRequest.getDescription());
        }

        if (fileUpdateRequest.getOriginalName() != null) {
            file.setOriginalName(fileUpdateRequest.getOriginalName());
        }

        file.setLastModifiedDate(new Date());

        // Lưu thay đổi
        ProjectFile updatedFile = projectFileRepository.save(file);

        return mapProjectFileToFileResponse(updatedFile);
    }

    @Override
    @Transactional
    public FileDeleteResponse deleteFile(Integer fileId) throws IOException {
        ProjectFile file = projectFileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with ID: " + fileId));

        // Lấy project và user để gửi thông báo
        Project project = file.getProject();
        User user = file.getUploadedBy();

        // Xóa file từ Cloudinary
        // Phân tích public_id từ URL
        String publicId = extractPublicIdFromUrl(file.getPath());

        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception e) {
            // Log lỗi nếu không xóa được file từ Cloudinary
            System.err.println("Error deleting file from Cloudinary: " + e.getMessage());
        }

        // Xóa thông tin file từ database
        projectFileRepository.delete(file);

        // Gửi thông báo cho manager nếu không phải manager xóa file
        if (project.getManager() != null && !project.getManager().getId().equals(user.getId())) {
            NotificationRequest notification = new NotificationRequest();
            notification.setTitle("File đã bị xóa");
            notification.setContent("File \"" + file.getOriginalName() + "\" đã bị xóa khỏi dự án \"" + project.getName() + "\"");
            notification.setType(NotificationType.PROJECT);
            notification.setReferenceId(project.getId());
            notification.setUserId(project.getManager().getId());
            notificationService.createNotification(notification);
        }

        // Trả về kết quả
        FileDeleteResponse response = new FileDeleteResponse();
        response.setId(fileId);
        response.setSuccess(true);
        response.setMessage("File deleted successfully");

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public String generateDownloadUrl(Integer fileId) {
        ProjectFile file = projectFileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with ID: " + fileId));

        // Trả về URL để download file
        return file.getPath();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FileResponse> getFilesByUser(Integer userId) {
        // Kiểm tra user có tồn tại không
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Lấy danh sách file của user
        List<ProjectFile> files = projectFileRepository.findByUploadedById(userId);

        // Chuyển đổi thành FileResponse
        return files.stream()
                .map(this::mapProjectFileToFileResponse)
                .collect(Collectors.toList());
    }

    /**
     * Chuyển đổi từ ProjectFile sang FileResponse
     */
    private FileResponse mapProjectFileToFileResponse(ProjectFile file) {
        FileResponse response = new FileResponse();
        response.setId(file.getId());
        response.setName(file.getName());
        response.setOriginalName(file.getOriginalName());
        response.setContentType(file.getContentType());
        response.setSize(file.getSize());
        response.setPath(file.getPath());
        response.setDescription(file.getDescription());
        response.setUploadDate(file.getUploadDate());
        response.setLastModifiedDate(file.getLastModifiedDate());

        // Thông tin về project
        if (file.getProject() != null) {
            response.setProjectId(file.getProject().getId());
            response.setProjectName(file.getProject().getName());
        }

        // Thông tin về người upload
        if (file.getUploadedBy() != null) {
            response.setUploadedById(file.getUploadedBy().getId());
            response.setUploadedBy(file.getUploadedBy().getFullName());
        }

        // URL để download file
        response.setDownloadUrl(file.getPath());

        return response;
    }

    /**
     * Trích xuất public_id từ URL Cloudinary
     * VD: https://res.cloudinary.com/dbcjoyutt/image/upload/v1234567890/project_files/123/abc.jpg
     * -> project_files/123/abc
     */
    private String extractPublicIdFromUrl(String url) {
        // Tách URL để lấy phần path
        String[] parts = url.split("/upload/");
        if (parts.length < 2) {
            return null;
        }

        // Lấy phần sau /upload/
        String pathPart = parts[1];

        // Loại bỏ phần version (v1234567890/) nếu có
        if (pathPart.startsWith("v")) {
            String[] versionParts = pathPart.split("/", 2);
            if (versionParts.length >= 2) {
                pathPart = versionParts[1];
            }
        }

        // Loại bỏ phần extension (.jpg, .png, ...)
        int lastDotIndex = pathPart.lastIndexOf(".");
        if (lastDotIndex > 0) {
            pathPart = pathPart.substring(0, lastDotIndex);
        }

        return pathPart;
    }
}