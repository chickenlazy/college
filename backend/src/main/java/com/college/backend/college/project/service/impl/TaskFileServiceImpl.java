package com.college.backend.college.project.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.college.backend.college.project.entity.Task;
import com.college.backend.college.project.entity.TaskFile;
import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.enums.NotificationType;
import com.college.backend.college.project.exception.ResourceNotFoundException;
import com.college.backend.college.project.repository.TaskFileRepository;
import com.college.backend.college.project.repository.TaskRepository;
import com.college.backend.college.project.repository.UserRepository;
import com.college.backend.college.project.request.FileUpdateRequest;
import com.college.backend.college.project.request.NotificationRequest;
import com.college.backend.college.project.response.FileDeleteResponse;
import com.college.backend.college.project.response.FileListResponse;
import com.college.backend.college.project.response.FileResponse;
import com.college.backend.college.project.service.TaskFileService;
import com.college.backend.college.project.service.NotificationService;
import org.apache.commons.compress.utils.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TaskFileServiceImpl implements TaskFileService {

    private final TaskFileRepository taskFileRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final Cloudinary cloudinary;

    @Autowired
    public TaskFileServiceImpl(
            TaskFileRepository taskFileRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            @Value("${cloudinary.url}") String cloudinaryUrl) {
        this.taskFileRepository = taskFileRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.cloudinary = new Cloudinary(cloudinaryUrl);
    }

    @Override
    @Transactional
    public FileResponse uploadFile(MultipartFile file, Integer taskId, Integer userId, String description) throws IOException {
        // Kiểm tra task có tồn tại không
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        // Kiểm tra user có tồn tại không
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Tạo tên file duy nhất để tránh trùng lặp
        String uniqueFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

        // Tải file lên Cloudinary
        Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "public_id", "task_files/" + taskId + "/" + uniqueFileName,
                        "resource_type", "auto",
                        "folder", "task_files"
                )
        );

        // Lấy URL từ kết quả upload
        String fileUrl = (String) uploadResult.get("secure_url");

        // Tạo đối tượng TaskFile
        TaskFile taskFile = new TaskFile();
        taskFile.setName(uniqueFileName);
        taskFile.setOriginalName(file.getOriginalFilename());
        taskFile.setContentType(file.getContentType());
        taskFile.setSize(file.getSize());
        taskFile.setPath(fileUrl);
        taskFile.setDescription(description);
        taskFile.setTask(task);
        taskFile.setUploadedBy(user);
        taskFile.setUploadDate(new Date());
        taskFile.setLastModifiedDate(new Date());

        // Lưu thông tin file vào database
        TaskFile savedFile = taskFileRepository.save(taskFile);

        // Gửi thông báo cho người tạo task
        if (task.getCreatedBy() != null && !task.getCreatedBy().getId().equals(userId)) {
            NotificationRequest notification = new NotificationRequest();
            notification.setTitle("File mới được tải lên");
            notification.setContent(user.getFullName() + " đã tải lên file \"" + file.getOriginalFilename() + "\" vào task \"" + task.getName() + "\"");
            notification.setType(NotificationType.TASK);
            notification.setReferenceId(taskId);
            notification.setUserId(task.getCreatedBy().getId());
            notificationService.createNotification(notification);
        }

        // Trả về thông tin file
        return mapTaskFileToFileResponse(savedFile);
    }

    @Override
    @Transactional
    public List<FileResponse> uploadMultipleFiles(List<MultipartFile> files, Integer taskId, Integer userId, String description) throws IOException {
        List<FileResponse> responses = new ArrayList<>();
        for (MultipartFile file : files) {
            responses.add(uploadFile(file, taskId, userId, description));
        }
        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public FileListResponse getFilesByTask(Integer taskId) {
        // Kiểm tra task có tồn tại không
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        // Lấy danh sách file của task
        List<TaskFile> files = taskFileRepository.findByTaskId(taskId);

        // Chuyển đổi thành FileResponse
        List<FileResponse> fileResponses = files.stream()
                .map(this::mapTaskFileToFileResponse)
                .collect(Collectors.toList());

        // Tính tổng dung lượng
        long totalSize = files.stream()
                .mapToLong(TaskFile::getSize)
                .sum();

        // Tạo và trả về response
        FileListResponse response = new FileListResponse();
        response.setFiles(fileResponses);
        response.setTaskId(taskId);
        response.setTaskName(task.getName());
        response.setTotalFiles(fileResponses.size());
        response.setTotalSize(totalSize);

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public FileResponse getFileById(Integer fileId) {
        TaskFile file = taskFileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with ID: " + fileId));

        return mapTaskFileToFileResponse(file);
    }

    @Override
    @Transactional
    public FileResponse updateFile(Integer fileId, FileUpdateRequest fileUpdateRequest) {
        TaskFile file = taskFileRepository.findById(fileId)
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
        TaskFile updatedFile = taskFileRepository.save(file);

        return mapTaskFileToFileResponse(updatedFile);
    }

    @Override
    @Transactional
    public FileDeleteResponse deleteFile(Integer fileId) throws IOException {
        TaskFile file = taskFileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with ID: " + fileId));

        // Lấy task và user để gửi thông báo
        Task task = file.getTask();
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
        taskFileRepository.delete(file);

        // Gửi thông báo cho người tạo task nếu không phải người tạo task xóa file
        if (task.getCreatedBy() != null && !task.getCreatedBy().getId().equals(user.getId())) {
            NotificationRequest notification = new NotificationRequest();
            notification.setTitle("File đã bị xóa");
            notification.setContent("File \"" + file.getOriginalName() + "\" đã bị xóa khỏi task \"" + task.getName() + "\"");
            notification.setType(NotificationType.TASK);
            notification.setReferenceId(task.getId());
            notification.setUserId(task.getCreatedBy().getId());
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
        TaskFile file = taskFileRepository.findById(fileId)
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
        List<TaskFile> files = taskFileRepository.findByUploadedById(userId);

        // Chuyển đổi thành FileResponse
        return files.stream()
                .map(this::mapTaskFileToFileResponse)
                .collect(Collectors.toList());
    }

    /**
     * Chuyển đổi từ TaskFile sang FileResponse
     */
    private FileResponse mapTaskFileToFileResponse(TaskFile file) {
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

        // Thông tin về task
        if (file.getTask() != null) {
            response.setTaskId(file.getTask().getId());
            response.setTaskName(file.getTask().getName());

            // Thông tin về project của task
            if (file.getTask().getProject() != null) {
                response.setProjectId(file.getTask().getProject().getId());
                response.setProjectName(file.getTask().getProject().getName());
            }
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
     * VD: https://res.cloudinary.com/dbcjoyutt/image/upload/v1234567890/task_files/123/abc.jpg
     * -> task_files/123/abc
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

    @Override
    public byte[] downloadFile(Integer fileId) throws IOException {
        TaskFile file = taskFileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with ID: " + fileId));

        // Tải file từ Cloudinary
        URL url = new URL(file.getPath());
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");

        // Đọc nội dung file
        InputStream inputStream = connection.getInputStream();
        byte[] fileContent = IOUtils.toByteArray(inputStream);

        // Đóng kết nối
        connection.disconnect();

        return fileContent;
    }
}