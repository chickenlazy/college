package com.college.backend.college.project.utils;

import com.college.backend.college.project.entity.Project;
import com.college.backend.college.project.entity.Task;
import com.college.backend.college.project.enums.ProjectStatus;
import com.college.backend.college.project.enums.TaskStatus;
import com.college.backend.college.project.repository.ProjectRepository;
import com.college.backend.college.project.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Component
public class ProjectTaskScheduler {

    private static final Logger logger = LoggerFactory.getLogger(ProjectTaskScheduler.class);

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    @Autowired
    public ProjectTaskScheduler(ProjectRepository projectRepository, TaskRepository taskRepository) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
    }

    /**
     * Chạy mỗi giờ để cập nhật trạng thái OVER_DUE cho các project và task đã quá hạn
     * Cron expression: "0 0 * * * *" = chạy vào phút thứ 0 của mỗi giờ
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void updateOverdueStatus() {
        Date now = new Date();

        // Đếm số lượng cập nhật
        int updatedProjects = updateOverdueProjects(now);
        int updatedTasks = updateOverdueTasks(now);

        logger.info("Scheduled task completed: {} projects and {} tasks updated to OVER_DUE status",
                updatedProjects, updatedTasks);
    }

    /**
     * Cập nhật trạng thái OVER_DUE cho các project quá hạn
     * @param now Thời gian hiện tại
     * @return Số lượng project đã được cập nhật
     */
    private int updateOverdueProjects(Date now) {
        List<Project> overdueProjects = projectRepository.findByDueDateBeforeAndStatusNot(
                now, ProjectStatus.COMPLETED);

        int count = 0;
        for (Project project : overdueProjects) {
            // Chỉ cập nhật nếu trạng thái hiện tại không phải là OVER_DUE
            if (project.getStatus() != ProjectStatus.OVER_DUE) {
                project.setStatus(ProjectStatus.OVER_DUE);
                project.setLastModifiedDate(now);
                projectRepository.save(project);
                count++;
            }
        }

        return count;
    }

    /**
     * Cập nhật trạng thái OVER_DUE cho các task quá hạn
     * @param now Thời gian hiện tại
     * @return Số lượng task đã được cập nhật
     */
    private int updateOverdueTasks(Date now) {
        List<Task> overdueTasks = taskRepository.findByDueDateBeforeAndStatusNot(
                now, TaskStatus.COMPLETED);

        int count = 0;
        for (Task task : overdueTasks) {
            // Chỉ cập nhật nếu trạng thái hiện tại không phải là OVER_DUE
            if (task.getStatus() != TaskStatus.OVER_DUE) {
                task.setStatus(TaskStatus.OVER_DUE);
                task.setLastModifiedDate(now);
                taskRepository.save(task);
                count++;
            }
        }

        return count;
    }
}