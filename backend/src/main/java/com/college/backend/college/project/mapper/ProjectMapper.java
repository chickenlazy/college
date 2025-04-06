package com.college.backend.college.project.mapper;

import com.college.backend.college.project.entity.Project;
import com.college.backend.college.project.entity.Subtask;
import com.college.backend.college.project.entity.Task;
import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.entity.Tag;
import com.college.backend.college.project.request.ProjectRequest;
import com.college.backend.college.project.response.ProjectResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper
public interface ProjectMapper {
    ProjectMapper INSTANCE = Mappers.getMapper(ProjectMapper.class);

    @Mapping(target = "totalTasks", ignore = true)
    @Mapping(target = "totalCompletedTasks", ignore = true)
    @Mapping(target = "progress", ignore = true)
    @Mapping(target = "managerId", ignore = true)
    @Mapping(target = "managerName", ignore = true)
    @Mapping(target = "tasks", source = "tasks")
    @Mapping(target = "users", source = "users")
    @Mapping(target = "tags", source = "tags")
    ProjectResponse projectToProjectRes(Project project);

    Project projectReqToProject(ProjectRequest projectRequest);

    void updateProjectFromRequest(ProjectRequest request, @MappingTarget Project project);

    default Set<ProjectResponse.UserResponseInProject> mapUsers(Set<User> users) {
        if (users == null) {
            return null;
        }
        return users.stream()
                .map(user -> {
                    ProjectResponse.UserResponseInProject userResponse = new ProjectResponse.UserResponseInProject();
                    userResponse.setId(user.getId());
                    userResponse.setFullName(user.getFullName());
                    userResponse.setEmail(user.getEmail());
                    userResponse.setRole(user.getRole());
                    userResponse.setDepartment(user.getDepartment());  // New field for department
                    userResponse.setAddress(user.getAddress());        // New field for address
                    userResponse.setPosition(user.getPosition());
                    return userResponse;
                })
                .collect(Collectors.toSet());
    }

    default Set<ProjectResponse.TagResponseInProject> mapTags(Set<Tag> tags) {
        if (tags == null) {
            return null;
        }
        return tags.stream()
                .map(tag -> {
                    ProjectResponse.TagResponseInProject tagResponse = new ProjectResponse.TagResponseInProject();
                    tagResponse.setId(tag.getId());
                    tagResponse.setName(tag.getName());
                    tagResponse.setColor(tag.getColor());
                    return tagResponse;
                })
                .collect(Collectors.toSet());
    }

    default Set<ProjectResponse.TaskResponseInProject> mapTasks(Set<Task> tasks) {
        if (tasks == null) {
            return null;
        }
        return tasks.stream()
                .map(task -> {
                    ProjectResponse.TaskResponseInProject taskResponse = new ProjectResponse.TaskResponseInProject();
                    taskResponse.setId(task.getId());
                    taskResponse.setName(task.getName());
                    taskResponse.setDescription(task.getDescription());
                    taskResponse.setStartDate(task.getStartDate());
                    taskResponse.setDueDate(task.getDueDate());
                    taskResponse.setStatus(task.getStatus());
                    taskResponse.setPriority(task.getPriority());

                    // Map the subtasks
                    if (task.getSubtasks() != null) {
                        taskResponse.setSubtasks(task.getSubtasks().stream()
                                .map(this::mapSubtask)
                                .collect(Collectors.toSet()));
                    }

                    return taskResponse;
                })
                .collect(Collectors.toSet());
    }

    default ProjectResponse.SubtaskResponseInTask mapSubtask(Subtask subtask) {
        ProjectResponse.SubtaskResponseInTask subtaskResponse = new ProjectResponse.SubtaskResponseInTask();
        subtaskResponse.setId(subtask.getId());
        subtaskResponse.setName(subtask.getName());
        subtaskResponse.setCompleted(subtask.getCompleted());
        return subtaskResponse;
    }
}