package com.college.backend.college.project.controller;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import org.apache.commons.io.IOUtils;

import com.college.backend.college.project.request.FileUpdateRequest;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.FileDeleteResponse;
import com.college.backend.college.project.response.FileListResponse;
import com.college.backend.college.project.response.FileResponse;
import com.college.backend.college.project.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class FileController {

    private final FileService fileService;

    @Autowired
    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    /**
     * Tải một file lên cho dự án cụ thể
     *
     * @param file file cần tải lên
     * @param projectId id của dự án
     * @param userId id của người dùng tải lên
     * @param description mô tả về file (có thể null)
     * @return thông tin của file đã được tải lên
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FileResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("projectId") Integer projectId,
            @RequestParam("userId") Integer userId,
            @RequestParam(value = "description", required = false) String description) {
        try {
            FileResponse response = fileService.uploadFile(file, projectId, userId, description);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Tải nhiều file lên cho dự án cụ thể
     *
     * @param files danh sách file cần tải lên
     * @param projectId id của dự án
     * @param userId id của người dùng tải lên
     * @param description mô tả về file (có thể null)
     * @return danh sách thông tin của các file đã được tải lên
     */
    @PostMapping(value = "/multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<FileResponse>> uploadMultipleFiles(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("projectId") Integer projectId,
            @RequestParam("userId") Integer userId,
            @RequestParam(value = "description", required = false) String description) {
        try {
            List<FileResponse> responses = fileService.uploadMultipleFiles(files, projectId, userId, description);
            return new ResponseEntity<>(responses, HttpStatus.CREATED);
        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Lấy danh sách file của một dự án
     *
     * @param projectId id của dự án
     * @return danh sách thông tin file của dự án
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<FileListResponse> getFilesByProject(@PathVariable Integer projectId) {
        FileListResponse response = fileService.getFilesByProject(projectId);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy thông tin chi tiết của một file
     *
     * @param fileId id của file
     * @return thông tin chi tiết của file
     */
    @GetMapping("/{fileId}")
    public ResponseEntity<FileResponse> getFileById(@PathVariable Integer fileId) {
        FileResponse response = fileService.getFileById(fileId);
        return ResponseEntity.ok(response);
    }

    /**
     * Cập nhật thông tin của file
     *
     * @param fileId id của file cần cập nhật
     * @param fileUpdateRequest thông tin mới cần cập nhật
     * @return thông tin đã cập nhật của file
     */
    @PutMapping("/{fileId}")
    public ResponseEntity<FileResponse> updateFile(
            @PathVariable Integer fileId,
            @RequestBody FileUpdateRequest fileUpdateRequest) {
        FileResponse response = fileService.updateFile(fileId, fileUpdateRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Xóa file khỏi hệ thống và database
     *
     * @param fileId id của file cần xóa
     * @return kết quả xóa file
     */
    @DeleteMapping("/{fileId}")
    public ResponseEntity<FileDeleteResponse> deleteFile(@PathVariable Integer fileId) {
        try {
            FileDeleteResponse response = fileService.deleteFile(fileId);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Tạo URL để download file
     *
     * @param fileId id của file
     * @return URL để download file
     */
    @GetMapping("/{fileId}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable Integer fileId) {
        try {
            // Lấy thông tin file từ database
            FileResponse fileInfo = fileService.getFileById(fileId);

            // Tải file từ Cloudinary
            URL url = new URL(fileInfo.getPath());
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");

            // Đọc nội dung file
            InputStream inputStream = connection.getInputStream();

            // Tạo resource để trả về
            ByteArrayResource resource = new ByteArrayResource(IOUtils.toByteArray(inputStream));

            // Đóng kết nối
            connection.disconnect();

            // Thiết lập headers cho response
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(fileInfo.getContentType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + fileInfo.getOriginalName() + "\"")
                    .body(resource);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Lấy danh sách file đã được tải lên bởi một người dùng
     *
     * @param userId id của người dùng
     * @return danh sách thông tin file của người dùng
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FileResponse>> getFilesByUser(@PathVariable Integer userId) {
        List<FileResponse> responses = fileService.getFilesByUser(userId);
        return ResponseEntity.ok(responses);
    }
}