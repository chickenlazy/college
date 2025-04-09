package com.college.backend.college.project.utils;

import com.college.backend.college.project.entity.Project;
import com.college.backend.college.project.entity.Subtask;
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

    /**
     * Chạy mỗi giờ để kiểm tra và cập nhật trạng thái COMPLETED cho các project và task
     * Cron expression: "0 15 * * * *" = chạy vào phút thứ 15 của mỗi giờ
     */
    @Scheduled(cron = "0 15 * * * *")
    @Transactional
    public void updateCompletedStatus() {
        Date now = new Date();

        // Cập nhật task thành COMPLETED nếu tất cả subtask đã completed
        int updatedTasks = updateTasksWithCompletedSubtasks(now);

        // Cập nhật project thành COMPLETED nếu tất cả task đã completed
        int updatedProjects = updateProjectsWithCompletedTasks(now);

        logger.info("Scheduled task completed: {} projects and {} tasks updated to COMPLETED status",
                updatedProjects, updatedTasks);
    }

    /**
     * Cập nhật trạng thái COMPLETED cho các project có tất cả task đã completed
     * @param now Thời gian hiện tại
     * @return Số lượng project đã được cập nhật
     */
    private int updateProjectsWithCompletedTasks(Date now) {
        // Lấy tất cả project không ở trạng thái COMPLETED
        List<Project> projects = projectRepository.findByStatusNot(ProjectStatus.COMPLETED);
        int count = 0;

        for (Project project : projects) {
            List<Task> tasks = taskRepository.findByProjectId(project.getId());

            // Skip dự án không có task nào
            if (tasks.isEmpty()) {
                continue;
            }

            boolean allTasksCompleted = true;
            for (Task task : tasks) {
                if (task.getStatus() != TaskStatus.COMPLETED) {
                    allTasksCompleted = false;
                    break;
                }
            }

            if (allTasksCompleted) {
                project.setStatus(ProjectStatus.COMPLETED);
                project.setLastModifiedDate(now);
                projectRepository.save(project);
                count++;
            }
        }

        return count;
    }

    /**
     * Cập nhật trạng thái COMPLETED cho các task có tất cả subtask đã completed
     * @param now Thời gian hiện tại
     * @return Số lượng task đã được cập nhật
     */
    private int updateTasksWithCompletedSubtasks(Date now) {
        // Lấy tất cả task không ở trạng thái COMPLETED
        List<Task> tasks = taskRepository.findByStatusNot(TaskStatus.COMPLETED);
        int count = 0;

        for (Task task : tasks) {
            // Skip task không có subtask nào
            if (task.getSubtasks() == null || task.getSubtasks().isEmpty()) {
                continue;
            }

            boolean allSubtasksCompleted = true;
            for (Subtask subtask : task.getSubtasks()) {
                if (!subtask.getCompleted()) {
                    allSubtasksCompleted = false;
                    break;
                }
            }

            if (allSubtasksCompleted) {
                task.setStatus(TaskStatus.COMPLETED);
                task.setLastModifiedDate(now);
                taskRepository.save(task);
                count++;
            }
        }

        return count;
    }
}