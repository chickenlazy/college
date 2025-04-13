package com.college.backend.college.project.mapper;

import com.college.backend.college.project.entity.Task;
import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.repository.UserRepository;
import com.college.backend.college.project.request.TaskRequest;
import com.college.backend.college.project.response.TaskResponse;
import org.mapstruct.*;
import org.mapstruct.factory.Mappers;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring")
public interface TaskMapper {
    TaskMapper INSTANCE = Mappers.getMapper(TaskMapper.class);

    @Mapping(target = "projectId", ignore = true)
    @Mapping(target = "projectName", ignore = true)
    @Mapping(target = "subTasks", ignore = true)
    @Mapping(target = "totalSubtasks", ignore = true)
    @Mapping(target = "totalCompletedSubtasks", ignore = true)
    @Mapping(target = "progress", ignore = true)
    @Mapping(target = "createdBy", source = "createdBy.id")
    @Mapping(target = "createdByName", source = "createdBy.fullName")
    TaskResponse taskToTaskResponse(Task task);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "subtasks", ignore = true)
    @Mapping(target = "createdBy", ignore = true) // Xử lý bên ngoài
    Task taskRequestToTask(TaskRequest taskRequest);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "subtasks", ignore = true)
    @Mapping(target = "createdBy", ignore = true) // Xử lý bên ngoài
    void updateTaskFromRequest(TaskRequest request, @MappingTarget Task task);
}