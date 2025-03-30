package com.college.backend.college.project.service;

import com.college.backend.college.project.enums.ProjectStatus;
import com.college.backend.college.project.request.ProjectRequest;
import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.response.ProjectResponse;

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


}
