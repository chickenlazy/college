package com.college.backend.college.project.mapper;

import com.college.backend.college.project.entity.Project;
import com.college.backend.college.project.request.ProjectRequest;
import com.college.backend.college.project.response.ProjectResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ProjectMapper {
    ProjectMapper INSTANCE = Mappers.getMapper(ProjectMapper.class);

    ProjectResponse projectToProjectRes(Project project);
    Project projectReqToProject(ProjectRequest projectRequest);

    void updateProjectFromRequest(ProjectRequest request, @MappingTarget Project project);
}
