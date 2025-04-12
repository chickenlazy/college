package com.college.backend.college.project.service;

import com.college.backend.college.project.enums.ProjectStatus;
import com.college.backend.college.project.request.ProjectRequest;
import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.response.ProjectResponse;
import com.college.backend.college.project.response.UserResponse;

import java.util.List;

public interface ProjectService {
    PagedResponse<ProjectResponse> getAllProjects(int pageNo, int pageSize);

    PagedResponse<ProjectResponse> getAllProjects(
            int pageNo,
            int pageSize,
            String search,
            ProjectStatus status);

    ProjectResponse createProject(ProjectRequest projectRequest);

    ProjectResponse getProjectById(Integer id);
    ProjectResponse updateProject(Integer id, ProjectRequest projectRequest);
    void deleteProject(Integer id);
    ProjectResponse addTagToProject(Integer projectId, Integer Integer);
    ProjectResponse removeTagFromProject(Integer projectId, Integer tagId);
    // Thêm member vào project
    ProjectResponse addMemberToProject(Integer projectId, Integer userId);

    // Xóa member khỏi project
    ProjectResponse removeMemberFromProject(Integer projectId, Integer userId);

    PagedResponse<ProjectResponse> getProjectsByManagerId(Integer managerId, int pageNo, int pageSize, String search, ProjectStatus status);
    PagedResponse<ProjectResponse> getProjectsByUserId(Integer userId, int pageNo, int pageSize, String search, ProjectStatus status);

    /**
     * Lấy danh sách thành viên của một dự án
     * @param projectId ID của dự án
     * @return Danh sách UserResponse thuộc dự án
     */
    List<UserResponse> getProjectMembers(Integer projectId);
    List<ProjectResponse> getAllProjectsByUserId(Integer userId);
}
