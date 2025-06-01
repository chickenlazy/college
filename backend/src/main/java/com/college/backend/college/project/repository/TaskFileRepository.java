package com.college.backend.college.project.repository;

import com.college.backend.college.project.entity.TaskFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskFileRepository extends JpaRepository<TaskFile, Integer> {

    /**
     * Lấy danh sách file theo task ID
     */
    List<TaskFile> findByTaskId(Integer taskId);

    /**
     * Lấy danh sách file theo người upload
     */
    List<TaskFile> findByUploadedById(Integer uploadedById);

    /**
     * Lấy danh sách file theo task ID và người upload
     */
    List<TaskFile> findByTaskIdAndUploadedById(Integer taskId, Integer uploadedById);

    /**
     * Đếm số lượng file của một task
     */
    long countByTaskId(Integer taskId);

    /**
     * Tính tổng dung lượng file của một task
     */
    @Query("SELECT COALESCE(SUM(tf.size), 0) FROM TaskFile tf WHERE tf.task.id = :taskId")
    Long getTotalSizeByTaskId(@Param("taskId") Integer taskId);

    /**
     * Lấy danh sách file theo project ID (thông qua task)
     */
    @Query("SELECT tf FROM TaskFile tf WHERE tf.task.project.id = :projectId")
    List<TaskFile> findByProjectId(@Param("projectId") Integer projectId);

    /**
     * Lấy danh sách file theo content type
     */
    List<TaskFile> findByContentTypeContaining(String contentType);

    /**
     * Xóa tất cả file của một task
     */
    void deleteByTaskId(Integer taskId);

    /**
     * Lấy danh sách file theo task và sắp xếp theo ngày upload mới nhất
     */
    List<TaskFile> findByTaskIdOrderByUploadDateDesc(Integer taskId);

    /**
     * Lấy danh sách file theo user và sắp xếp theo ngày upload mới nhất
     */
    List<TaskFile> findByUploadedByIdOrderByUploadDateDesc(Integer uploadedById);

    /**
     * Tìm file theo tên gốc
     */
    List<TaskFile> findByOriginalNameContainingIgnoreCase(String originalName);

    /**
     * Lấy file mới nhất của task
     */
    @Query("SELECT tf FROM TaskFile tf WHERE tf.task.id = :taskId ORDER BY tf.uploadDate DESC")
    List<TaskFile> findLatestFilesByTaskId(@Param("taskId") Integer taskId);
}