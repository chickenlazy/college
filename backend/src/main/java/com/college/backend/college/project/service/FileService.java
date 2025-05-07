package com.college.backend.college.project.service;

import com.college.backend.college.project.entity.ProjectFile;
import com.college.backend.college.project.request.FileUpdateRequest;
import com.college.backend.college.project.response.FileDeleteResponse;
import com.college.backend.college.project.response.FileListResponse;
import com.college.backend.college.project.response.FileResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface FileService {

    /**
     * Tải file lên hệ thống và lưu thông tin vào database
     *
     * @param file file cần tải lên
     * @param projectId id của dự án chứa file
     * @param userId id của người dùng tải lên file
     * @param description mô tả về file (có thể null)
     * @return thông tin của file đã được tải lên
     * @throws IOException nếu có lỗi khi xử lý file
     */
    FileResponse uploadFile(MultipartFile file, Integer projectId, Integer userId, String description) throws IOException;

    /**
     * Tải nhiều file lên hệ thống và lưu thông tin vào database
     *
     * @param files danh sách file cần tải lên
     * @param projectId id của dự án chứa file
     * @param userId id của người dùng tải lên file
     * @param description mô tả về file (có thể null)
     * @return danh sách thông tin của các file đã được tải lên
     * @throws IOException nếu có lỗi khi xử lý file
     */
    List<FileResponse> uploadMultipleFiles(List<MultipartFile> files, Integer projectId, Integer userId, String description) throws IOException;

    /**
     * Lấy danh sách file của một dự án
     *
     * @param projectId id của dự án
     * @return danh sách thông tin file của dự án
     */
    FileListResponse getFilesByProject(Integer projectId);

    /**
     * Lấy thông tin chi tiết của một file
     *
     * @param fileId id của file
     * @return thông tin chi tiết của file
     */
    FileResponse getFileById(Integer fileId);

    /**
     * Cập nhật thông tin của file
     *
     * @param fileId id của file cần cập nhật
     * @param fileUpdateRequest thông tin mới cần cập nhật
     * @return thông tin đã cập nhật của file
     */
    FileResponse updateFile(Integer fileId, FileUpdateRequest fileUpdateRequest);

    /**
     * Xóa file khỏi hệ thống và database
     *
     * @param fileId id của file cần xóa
     * @return kết quả xóa file
     * @throws IOException nếu có lỗi khi xóa file
     */
    FileDeleteResponse deleteFile(Integer fileId) throws IOException;

    /**
     * Tạo URL để download file
     *
     * @param fileId id của file
     * @return URL để download file
     */
    String generateDownloadUrl(Integer fileId);

    /**
     * Lấy danh sách file đã được tải lên bởi một người dùng
     *
     * @param userId id của người dùng
     * @return danh sách thông tin file của người dùng
     */
    List<FileResponse> getFilesByUser(Integer userId);
}