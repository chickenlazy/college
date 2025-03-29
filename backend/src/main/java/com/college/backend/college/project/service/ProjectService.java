package com.college.backend.college.project.service;

import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.response.ProjectResponse;

public interface ProjectService {
    PagedResponse<ProjectResponse> getAllProjects(int pageNo, int pageSize);
}
