package com.college.backend.college.project.service;

import com.college.backend.college.project.request.FileUpdateRequest;
import com.college.backend.college.project.response.FileDeleteResponse;
import com.college.backend.college.project.response.FileListResponse;
import com.college.backend.college.project.response.FileResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface TaskFileService {

    /**
     * Upload một file cho task
     *
     * @param file file cần tải lên
     * @param taskId id của task
     * @param userId id của người dùng tải lên
     * @param description mô tả về file (có thể null)
     * @return thông tin của file đã được tải lên
     * @throws IOException nếu có lỗi trong quá trình upload
     */
    FileResponse uploadFile(MultipartFile file, Integer taskId, Integer userId, String description) throws IOException;

    /**
     * Upload nhiều file cho task
     *
     * @param files danh sách file cần tải lên
     * @param taskId id của task
     * @param userId id của người dùng tải lên
     * @param description mô tả về các file (có thể null)
     * @return danh sách thông tin của các file đã được tải lên
     * @throws IOException nếu có lỗi trong quá trình upload
     */
    List<FileResponse> uploadMultipleFiles(List<MultipartFile> files, Integer taskId, Integer userId, String description) throws IOException;

    /**
     * Lấy danh sách file của task
     *
     * @param taskId id của task
     * @return danh sách thông tin file của task
     */
    FileListResponse getFilesByTask(Integer taskId);

    /**
     * Lấy thông tin file theo ID
     *
     * @param fileId id của file
     * @return thông tin chi tiết của file
     */
    FileResponse getFileById(Integer fileId);

    /**
     * Cập nhật thông tin file
     *
     * @param fileId id của file cần cập nhật
     * @param fileUpdateRequest thông tin mới cần cập nhật
     * @return thông tin đã cập nhật của file
     */
    FileResponse updateFile(Integer fileId, FileUpdateRequest fileUpdateRequest);

    /**
     * Xóa file
     *
     * @param fileId id của file cần xóa
     * @return kết quả xóa file
     * @throws IOException nếu có lỗi trong quá trình xóa file từ storage
     */
    FileDeleteResponse deleteFile(Integer fileId) throws IOException;

    /**
     * Tạo URL download file
     *
     * @param fileId id của file
     * @return URL để download file
     */
    String generateDownloadUrl(Integer fileId);

    /**
     * Lấy danh sách file mà user đã upload
     *
     * @param userId id của người dùng
     * @return danh sách thông tin file của người dùng
     */
    List<FileResponse> getFilesByUser(Integer userId);

    /**
     * Download file content
     *
     * @param fileId id của file
     * @return nội dung file dưới dạng byte array
     * @throws IOException nếu có lỗi trong quá trình download
     */
    byte[] downloadFile(Integer fileId) throws IOException;
}