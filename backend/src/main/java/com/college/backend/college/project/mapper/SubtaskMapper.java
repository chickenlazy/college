package com.college.backend.college.project.mapper;

import com.college.backend.college.project.entity.Subtask;
import com.college.backend.college.project.request.SubtaskRequest;
import com.college.backend.college.project.response.SubtaskResponse;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface SubtaskMapper {
    SubtaskMapper INSTANCE = Mappers.getMapper(SubtaskMapper.class);

    SubtaskResponse subtaskToSubtaskRes(Subtask subtask);
    Subtask subtaskReqToSubtask(SubtaskRequest subtaskRequest);
}
