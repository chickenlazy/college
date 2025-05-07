package com.college.backend.college.project.repository;

import com.college.backend.college.project.entity.ProjectFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectFileRepository extends JpaRepository<ProjectFile, Integer> {

    /**
     * Tìm tất cả file thuộc về một dự án
     *
     * @param projectId id của dự án
     * @return danh sách file thuộc về dự án
     */
    List<ProjectFile> findByProjectId(Integer projectId);

    /**
     * Tìm tất cả file được tải lên bởi một người dùng
     *
     * @param uploadedById id của người dùng tải lên
     * @return danh sách file được tải lên bởi người dùng
     */
    List<ProjectFile> findByUploadedById(Integer uploadedById);

    /**
     * Đếm số lượng file trong một dự án
     *
     * @param projectId id của dự án
     * @return số lượng file thuộc về dự án
     */
    long countByProjectId(Integer projectId);
}