package com.college.backend.college.project.mapper;

import com.college.backend.college.project.entity.Task;
import com.college.backend.college.project.request.TaskRequest;
import com.college.backend.college.project.response.TaskResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

@Mapper
public interface TaskMapper {
    TaskMapper INSTANCE = Mappers.getMapper(TaskMapper.class);

    TaskResponse taskToTaskResponse(Task task);
    Task taskRequestToTask(TaskRequest taskRequest);

    void updateTaskFromRequest(TaskRequest request, @MappingTarget Task task);
}