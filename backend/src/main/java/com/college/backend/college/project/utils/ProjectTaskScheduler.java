package com.college.backend.college.project.utils;

import com.college.backend.college.project.entity.Project;
import com.college.backend.college.project.entity.Subtask;
import com.college.backend.college.project.entity.Task;
import com.college.backend.college.project.enums.NotificationType;
import com.college.backend.college.project.enums.ProjectStatus;
import com.college.backend.college.project.enums.TaskStatus;
import com.college.backend.college.project.repository.ProjectRepository;
import com.college.backend.college.project.repository.SubtaskRepository;
import com.college.backend.college.project.repository.TaskRepository;
import com.college.backend.college.project.request.NotificationRequest;
import com.college.backend.college.project.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Component
public class ProjectTaskScheduler {

    private static final Logger logger = LoggerFactory.getLogger(ProjectTaskScheduler.class);

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final NotificationService notificationService;
    private final SubtaskRepository subtaskRepository;

    @Autowired
    public ProjectTaskScheduler(ProjectRepository projectRepository, TaskRepository taskRepository, NotificationService notificationService, SubtaskRepository subtaskRepository) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.notificationService = notificationService;
        this.subtaskRepository = subtaskRepository;
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

    @Scheduled(cron = "0 30 * * * *") // Chạy vào phút thứ 30 của mỗi giờ
    @Transactional
    public void sendDeadlineNotifications() {
        Date now = new Date();
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(now);

        // Thông báo về project sắp đến hạn hoặc quá hạn
        sendProjectDeadlineNotifications(now, calendar);

        // Thông báo về subtask sắp đến hạn hoặc quá hạn
        sendSubtaskDeadlineNotifications(now, calendar);
    }

    private void sendProjectDeadlineNotifications(Date now, Calendar calendar) {
        // Kiểm tra các project sắp đến hạn (trong vòng 3 ngày)
        calendar.add(Calendar.DAY_OF_YEAR, 3);
        Date threeDaysLater = calendar.getTime();
        calendar.setTime(now);

        List<Project> projectsNearDeadline = projectRepository.findByDueDateBetweenAndStatusNot(
                now, threeDaysLater, ProjectStatus.COMPLETED);

        for (Project project : projectsNearDeadline) {
            if (project.getManager() != null) {
                NotificationRequest notification = new NotificationRequest();
                notification.setTitle("Dự án sắp đến hạn");
                notification.setContent("Dự án \"" + project.getName() + "\" sắp đến hạn vào " + formatDate(project.getDueDate()));
                notification.setType(NotificationType.PROJECT);
                notification.setReferenceId(project.getId());
                notification.setUserId(project.getManager().getId());

                notificationService.createNotification(notification);
            }
        }

        // Kiểm tra các project đã quá hạn
        List<Project> overdueProjects = projectRepository.findByDueDateBeforeAndStatusNot(
                now, ProjectStatus.COMPLETED);

        for (Project project : overdueProjects) {
            if (project.getManager() != null) {
                NotificationRequest notification = new NotificationRequest();
                notification.setTitle("Dự án đã quá hạn");
                notification.setContent("Dự án \"" + project.getName() + "\" đã quá hạn kể từ " + formatDate(project.getDueDate()));
                notification.setType(NotificationType.PROJECT);
                notification.setReferenceId(project.getId());
                notification.setUserId(project.getManager().getId());

                notificationService.createNotification(notification);
            }
        }
    }

    private void sendSubtaskDeadlineNotifications(Date now, Calendar calendar) {
        // Kiểm tra các subtask sắp đến hạn (trong vòng 3 ngày)
        calendar.add(Calendar.DAY_OF_YEAR, 3);
        Date threeDaysLater = calendar.getTime();
        calendar.setTime(now);

        List<Subtask> subtasksNearDeadline = subtaskRepository.findByDueDateBetweenAndCompletedFalse(
                now, threeDaysLater);

        for (Subtask subtask : subtasksNearDeadline) {
            if (subtask.getAssignee() != null) {
                NotificationRequest notification = new NotificationRequest();
                notification.setTitle("Công việc con sắp đến hạn");
                notification.setContent("Công việc con \"" + subtask.getName() + "\" sắp đến hạn vào " + formatDate(subtask.getDueDate()));
                notification.setType(NotificationType.SUBTASK);
                notification.setReferenceId(subtask.getId());
                notification.setUserId(subtask.getAssignee().getId());

                notificationService.createNotification(notification);
            }
        }

        // Kiểm tra các subtask đã quá hạn
        List<Subtask> overdueSubtasks = subtaskRepository.findByDueDateBeforeAndCompletedFalse(now);

        for (Subtask subtask : overdueSubtasks) {
            if (subtask.getAssignee() != null) {
                NotificationRequest notification = new NotificationRequest();
                notification.setTitle("Công việc con đã quá hạn");
                notification.setContent("Công việc con \"" + subtask.getName() + "\" đã quá hạn kể từ " + formatDate(subtask.getDueDate()));
                notification.setType(NotificationType.SUBTASK);
                notification.setReferenceId(subtask.getId());
                notification.setUserId(subtask.getAssignee().getId());

                notificationService.createNotification(notification);
            }
        }

        sendTaskDeadlineNotificationsToProjectManagers(now, calendar);
    }

    private void sendTaskDeadlineNotificationsToProjectManagers(Date now, Calendar calendar) {
        // Kiểm tra các task sắp đến hạn (trong vòng 3 ngày)
        calendar.add(Calendar.DAY_OF_YEAR, 3);
        Date threeDaysLater = calendar.getTime();
        calendar.setTime(now);

        List<Task> tasksNearDeadline = taskRepository.findByDueDateBetweenAndStatusNot(
                now, threeDaysLater, TaskStatus.COMPLETED);

        for (Task task : tasksNearDeadline) {
            Project project = task.getProject();
            if (project != null && project.getManager() != null) {
                NotificationRequest notification = new NotificationRequest();
                notification.setTitle("Công việc sắp đến hạn");
                notification.setContent("Công việc \"" + task.getName() + "\" trong dự án \"" + project.getName() + "\" sắp đến hạn vào " + formatDate(task.getDueDate()));
                notification.setType(NotificationType.TASK);
                notification.setReferenceId(task.getId());
                notification.setUserId(project.getManager().getId());

                notificationService.createNotification(notification);
            }
        }

        // Kiểm tra các task đã quá hạn
        List<Task> overdueTasks = taskRepository.findByDueDateBeforeAndStatusNot(
                now, TaskStatus.COMPLETED);

        for (Task task : overdueTasks) {
            Project project = task.getProject();
            if (project != null && project.getManager() != null) {
                NotificationRequest notification = new NotificationRequest();
                notification.setTitle("Công việc đã quá hạn");
                notification.setContent("Công việc \"" + task.getName() + "\" trong dự án \"" + project.getName() + "\" đã quá hạn kể từ " + formatDate(task.getDueDate()));
                notification.setType(NotificationType.TASK);
                notification.setReferenceId(task.getId());
                notification.setUserId(project.getManager().getId());

                notificationService.createNotification(notification);
            }
        }
    }

    private String formatDate(Date date) {
        if (date == null) return "";
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
        return sdf.format(date);
    }


}