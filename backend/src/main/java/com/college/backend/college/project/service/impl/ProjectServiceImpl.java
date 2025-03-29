package com.college.backend.college.project.service.impl;

import com.college.backend.college.project.entity.Project;
import com.college.backend.college.project.enums.TaskStatus;
import com.college.backend.college.project.mapper.ProjectMapper;
import com.college.backend.college.project.repository.ProjectRepository;
import com.college.backend.college.project.repository.TaskRepository;
import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.response.ProjectResponse;
import com.college.backend.college.project.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectServiceImpl implements ProjectService {
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    @Autowired
    public ProjectServiceImpl(ProjectRepository projectRepository, TaskRepository taskRepository) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
    }

    private ProjectResponse mapProjectToProjectResponse(Project project) {
        int totalTaskCount = taskRepository.countByProjectId(project.getId());
        int totalCompletedTaskCount = taskRepository.countByProjectIdAndStatus(project.getId(), TaskStatus.COMPLETED);
        double progress = totalTaskCount > 0 ? (double) totalCompletedTaskCount / totalTaskCount * 100 : 0;

        ProjectResponse projectResponse = ProjectMapper.INSTANCE.projectToProjectRes(project);
        projectResponse.setTotalTasks(totalTaskCount);
        projectResponse.setTotalCompletedTasks((int) totalCompletedTaskCount);
        projectResponse.setProgress(progress);

        // Xử lý thông tin về manager
        if (project.getManager() != null) {
            projectResponse.setManagerId(project.getManager().getId());
            projectResponse.setManagerName(project.getManager().getFullName());
        }

        return projectResponse;
    }

    @Override
    @Transactional
    public PagedResponse<ProjectResponse> getAllProjects(int pageNo, int pageSize) {
        // Tạo Pageable để phân trang
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize); // pageNo - 1 vì Spring Data JPA bắt đầu từ 0

        // Truy vấn các project từ repository
        Page<Project> projectPage = projectRepository.findAll(pageable);

        // Chuyển đổi các Project thành ProjectResponse sử dụng phương thức map
        List<ProjectResponse> projectResponses = projectPage.getContent().stream()
                .map(this::mapProjectToProjectResponse)
                .collect(Collectors.toList());

        // Tạo và trả về PagedResponse
        return new PagedResponse<>(projectResponses, pageNo, pageSize,
                projectPage.getTotalElements(), projectPage.getTotalPages(),
                projectPage.isLast());
    }
}