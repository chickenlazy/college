package com.college.backend.college.project.response;

import com.college.backend.college.project.entity.Comment;
import com.college.backend.college.project.entity.Subtask;
import com.college.backend.college.project.entity.Task;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.Set;

@Getter
@Setter
public class TaskResponse {

    private Integer id;
    private String name;
    private String description;
    private Date startDate;
    private Date dueDate;
    private String status;
    private String priority;
    private Date createdDate;

    // Project details
    private Integer projectId;
    private String projectName;

    // Assignee details
    private Integer assigneeId;
    private String assigneeName;
    private String assigneeEmail;

    // Subtasks and comments
    private Set<Subtask> subTasks;
    private Set<Comment> comments;

    // Progress calculation
    private Double progress;

    // Constructor to initialize TaskResponse from Task entity
    public TaskResponse(Task task) {
        this.id = task.getId();
        this.name = task.getName();
        this.description = task.getDescription();
        this.startDate = task.getStartDate();
        this.dueDate = task.getDueDate();
        this.status = task.getStatus().toString(); // Enum to String
        this.priority = task.getPriority().toString(); // Enum to String
        this.createdDate = task.getCreatedDate();

        // Project details
        this.projectId = task.getProject() != null ? task.getProject().getId() : null;
        this.projectName = task.getProject() != null ? task.getProject().getName() : null;

        // Assignee details
        this.assigneeId = task.getAssignee() != null ? task.getAssignee().getId() : null;
        this.assigneeName = task.getAssignee() != null ? task.getAssignee().getFullName() : null;
        this.assigneeEmail = task.getAssignee() != null ? task.getAssignee().getEmail() : null;

        // Subtasks and comments
        this.subTasks = task.getSubtasks();
        this.comments = task.getComments();

        // Progress calculation (based on subtasks' completion)
        this.progress = calculateProgress(subTasks);
    }

    // Calculate progress as the percentage of completed subtasks
    private Double calculateProgress(Set<Subtask> subTasks) {
        if (subTasks == null || subTasks.isEmpty()) {
            return 0.0;
        }
        long totalSubtasks = subTasks.size();
        long completedSubtasks = subTasks.stream().filter(Subtask::getCompleted).count();
        return ((double) completedSubtasks / totalSubtasks) * 100;
    }
}
