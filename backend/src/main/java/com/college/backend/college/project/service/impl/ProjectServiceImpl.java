package com.college.backend.college.project.service.impl;

import com.college.backend.college.project.entity.Project;
import com.college.backend.college.project.entity.Tag;
import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.enums.NotificationType;
import com.college.backend.college.project.enums.ProjectStatus;
import com.college.backend.college.project.enums.TaskStatus;
import com.college.backend.college.project.exception.ResourceNotFoundException;
import com.college.backend.college.project.mapper.ProjectMapper;
import com.college.backend.college.project.repository.ProjectRepository;
import com.college.backend.college.project.repository.TagRepository;
import com.college.backend.college.project.repository.TaskRepository;
import com.college.backend.college.project.repository.UserRepository;
import com.college.backend.college.project.request.EmailRequest;
import com.college.backend.college.project.request.NotificationRequest;
import com.college.backend.college.project.request.ProjectRequest;
import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.response.ProjectResponse;
import com.college.backend.college.project.response.UserResponse;
import com.college.backend.college.project.service.EmailService;
import com.college.backend.college.project.service.NotificationService;
import com.college.backend.college.project.service.ProjectService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProjectServiceImpl implements ProjectService {
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;
    private final NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    @Autowired
    public ProjectServiceImpl(ProjectRepository projectRepository, TaskRepository taskRepository, UserRepository userRepository, TagRepository tagRepository, NotificationService notificationService) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.tagRepository = tagRepository;
        this.notificationService = notificationService;
    }

    ProjectResponse mapProjectToProjectResponse(Project project) {
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
        return getAllProjects(pageNo, pageSize, null, null);
    }

    @Override
    @Transactional
    public PagedResponse<ProjectResponse> getAllProjects(int pageNo, int pageSize, String search, ProjectStatus status) {
        // Tạo Pageable để phân trang
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by("createdDate").descending()); // pageNo - 1 vì Spring Data JPA bắt đầu từ 0

        // Tạo Specification để tìm kiếm và lọc
        Specification<Project> spec = Specification.where(null);

        // Thêm điều kiện tìm kiếm theo tên nếu có
        if (StringUtils.hasText(search)) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.like(
                            criteriaBuilder.lower(root.get("name")),
                            "%" + search.toLowerCase() + "%"
                    )
            );
        }

        // Thêm điều kiện lọc theo status nếu có
        if (status != null) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("status"), status)
            );
        }

        // Truy vấn các project từ repository với điều kiện tìm kiếm và lọc
        Page<Project> projectPage = projectRepository.findAll(spec, pageable);

        // Chuyển đổi các Project thành ProjectResponse sử dụng phương thức map
        List<ProjectResponse> projectResponses = projectPage.getContent().stream()
                .map(this::mapProjectToProjectResponse)
                .collect(Collectors.toList());

        // Tạo và trả về PagedResponse
        return new PagedResponse<>(projectResponses, pageNo, pageSize,
                projectPage.getTotalElements(), projectPage.getTotalPages(),
                projectPage.isLast());
    }

    @Override
    @Transactional
    public ProjectResponse createProject(ProjectRequest projectRequest) {
        // Tạo đối tượng Project mới từ ProjectRequest
        Project project = ProjectMapper.INSTANCE.projectReqToProject(projectRequest);

        // Thiết lập ngày tạo và ngày cập nhật
        Date now = new Date();
        project.setCreatedDate(now);
        project.setLastModifiedDate(now);

        // Thiết lập manager nếu có managerId
        if (projectRequest.getManagerId() != null) {
            User manager = userRepository.findById(projectRequest.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found with ID: " + projectRequest.getManagerId()));
            project.setManager(manager);
        }

        // Thiết lập danh sách users
        if (projectRequest.getUserIds() != null && !projectRequest.getUserIds().isEmpty()) {
            Set<User> users = projectRequest.getUserIds().stream()
                    .map(userId -> userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId)))
                    .collect(Collectors.toSet());
            project.setUsers(users);
        }

        // Thiết lập danh sách tags
        if (projectRequest.getTagIds() != null && !projectRequest.getTagIds().isEmpty()) {
            Set<Tag> tags = projectRequest.getTagIds().stream()
                    .map(tagId -> tagRepository.findById(tagId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + tagId)))
                    .collect(Collectors.toSet());
            project.setTags(tags);
        }

        // Lưu project vào cơ sở dữ liệu
        Project savedProject = projectRepository.save(project);

        if (savedProject.getManager() != null) {
            NotificationRequest managerNotification = new NotificationRequest();
            managerNotification.setTitle("Dự án mới được tạo");
            managerNotification.setContent("Bạn đã được chỉ định làm quản lý cho dự án \"" + savedProject.getName() + "\"");
            managerNotification.setType(NotificationType.PROJECT);
            managerNotification.setReferenceId(savedProject.getId());
            managerNotification.setUserId(savedProject.getManager().getId());
            notificationService.createNotification(managerNotification);
        }

// Thông báo cho các thành viên
        if (savedProject.getUsers() != null && !savedProject.getUsers().isEmpty()) {
            NotificationRequest memberNotification = new NotificationRequest();
            memberNotification.setTitle("Dự án mới được tạo");
            memberNotification.setContent("Bạn đã được thêm vào dự án \"" + savedProject.getName() + "\"");
            memberNotification.setType(NotificationType.PROJECT);
            memberNotification.setReferenceId(savedProject.getId());

            Integer[] userIds = savedProject.getUsers().stream()
                    .map(User::getId)
                    .toArray(Integer[]::new);

            notificationService.createBulkNotifications(memberNotification, userIds);
        }

        if (project.getManager() != null && project.getManager().getEmail() != null
                && !project.getManager().getEmail().isEmpty()) {
            sendProjectCreationEmail(project.getManager(), savedProject, project.getUsers());
        }

        // Chuyển đổi Project thành ProjectResponse và trả về
        return mapProjectToProjectResponse(savedProject);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Integer id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + id));

        return mapProjectToProjectResponse(project);
    }

    @Override
    @Transactional
    public ProjectResponse updateProject(Integer id, ProjectRequest projectRequest) {
        // Kiểm tra xem project có tồn tại không
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + id));

        ProjectStatus oldStatus = project.getStatus();
        // Lưu manager cũ để so sánh
        User oldManager = project.getManager();

        // Cập nhật các thông tin cơ bản
        ProjectMapper.INSTANCE.updateProjectFromRequest(projectRequest, project);

        if (projectRequest.getDueDate() != null
                && oldStatus == ProjectStatus.OVER_DUE
                && projectRequest.getDueDate().after(new Date())) {
            project.setStatus(ProjectStatus.IN_PROGRESS);
        }

        // Cập nhật ngày chỉnh sửa
        project.setLastModifiedDate(new Date());

        // Cập nhật manager nếu có
        User newManager = null;
        if (projectRequest.getManagerId() != null) {
            newManager = userRepository.findById(projectRequest.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found with ID: " + projectRequest.getManagerId()));
            project.setManager(newManager);
        } else {
            project.setManager(null);
        }

        // Cập nhật danh sách users
        if (projectRequest.getUserIds() != null) {
            Set<User> users = projectRequest.getUserIds().stream()
                    .map(userId -> userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId)))
                    .collect(Collectors.toSet());
            project.setUsers(users);
        } else {
            project.setUsers(new HashSet<>());
        }

        // Cập nhật danh sách tags
        if (projectRequest.getTagIds() != null) {
            Set<Tag> tags = projectRequest.getTagIds().stream()
                    .map(tagId -> tagRepository.findById(tagId)
                            .orElseThrow(() -> new ResourceNotFoundException("Tag not found with ID: " + tagId)))
                    .collect(Collectors.toSet());
            project.setTags(tags);
        } else {
            project.setTags(new HashSet<>());
        }

        // Lưu project đã cập nhật
        Project updatedProject = projectRepository.save(project);

        // Kiểm tra thay đổi manager
        if (oldManager != null && newManager != null && !oldManager.getId().equals(newManager.getId())) {
            // Thông báo cho manager mới
            NotificationRequest newManagerNotification = new NotificationRequest();
            newManagerNotification.setTitle("Bổ nhiệm quản lý dự án");
            newManagerNotification.setContent("Bạn đã được bổ nhiệm làm quản lý cho dự án \"" + updatedProject.getName() + "\"");
            newManagerNotification.setType(NotificationType.PROJECT);
            newManagerNotification.setReferenceId(updatedProject.getId());
            newManagerNotification.setUserId(newManager.getId());
            notificationService.createNotification(newManagerNotification);

            // Thông báo cho manager cũ
            NotificationRequest oldManagerNotification = new NotificationRequest();
            oldManagerNotification.setTitle("Thay đổi quản lý dự án");
            oldManagerNotification.setContent("Bạn không còn là quản lý của dự án \"" + updatedProject.getName() + "\"");
            oldManagerNotification.setType(NotificationType.PROJECT);
            oldManagerNotification.setReferenceId(updatedProject.getId());
            oldManagerNotification.setUserId(oldManager.getId());
            notificationService.createNotification(oldManagerNotification);

            // Thông báo cho tất cả thành viên về việc thay đổi manager
            if (updatedProject.getUsers() != null && !updatedProject.getUsers().isEmpty()) {
                NotificationRequest teamNotification = new NotificationRequest();
                teamNotification.setTitle("Thay đổi quản lý dự án");
                teamNotification.setContent(newManager.getFullName() + " đã được bổ nhiệm thay thế cho " +
                        oldManager.getFullName() + " làm quản lý trong dự án \"" +
                        updatedProject.getName() + "\"");
                teamNotification.setType(NotificationType.PROJECT);
                teamNotification.setReferenceId(updatedProject.getId());

                // Lấy danh sách ID của tất cả thành viên
                Integer[] teamUserIds = updatedProject.getUsers().stream()
                        .map(User::getId)
                        .toArray(Integer[]::new);

                // Gửi thông báo hàng loạt cho tất cả thành viên
                notificationService.createBulkNotifications(teamNotification, teamUserIds);
            }
        } else if (oldManager == null && newManager != null) {
            // Trường hợp thêm mới manager (trước đó không có)
            NotificationRequest newManagerNotification = new NotificationRequest();
            newManagerNotification.setTitle("Bổ nhiệm quản lý dự án");
            newManagerNotification.setContent("Bạn đã được bổ nhiệm làm quản lý cho dự án \"" + updatedProject.getName() + "\"");
            newManagerNotification.setType(NotificationType.PROJECT);
            newManagerNotification.setReferenceId(updatedProject.getId());
            newManagerNotification.setUserId(newManager.getId());
            notificationService.createNotification(newManagerNotification);

            // Thông báo cho tất cả thành viên về việc bổ nhiệm manager mới
            if (updatedProject.getUsers() != null && !updatedProject.getUsers().isEmpty()) {
                NotificationRequest teamNotification = new NotificationRequest();
                teamNotification.setTitle("Bổ nhiệm quản lý dự án mới");
                teamNotification.setContent(newManager.getFullName() + " đã được bổ nhiệm làm quản lý mới cho dự án \"" +
                        updatedProject.getName() + "\"");
                teamNotification.setType(NotificationType.PROJECT);
                teamNotification.setReferenceId(updatedProject.getId());

                // Lấy danh sách ID của tất cả thành viên
                Integer[] teamUserIds = updatedProject.getUsers().stream()
                        .map(User::getId)
                        .toArray(Integer[]::new);

                // Gửi thông báo hàng loạt cho tất cả thành viên
                notificationService.createBulkNotifications(teamNotification, teamUserIds);
            }
        } else if (oldManager != null && newManager == null) {
            // Trường hợp gỡ bỏ manager (không còn manager nữa)
            NotificationRequest oldManagerNotification = new NotificationRequest();
            oldManagerNotification.setTitle("Thay đổi quản lý dự án");
            oldManagerNotification.setContent("Bạn không còn là quản lý của dự án \"" + updatedProject.getName() + "\"");
            oldManagerNotification.setType(NotificationType.PROJECT);
            oldManagerNotification.setReferenceId(updatedProject.getId());
            oldManagerNotification.setUserId(oldManager.getId());
            notificationService.createNotification(oldManagerNotification);

            // Thông báo cho tất cả thành viên về việc gỡ bỏ manager
            if (updatedProject.getUsers() != null && !updatedProject.getUsers().isEmpty()) {
                NotificationRequest teamNotification = new NotificationRequest();
                teamNotification.setTitle("Thay đổi quản lý dự án");
                teamNotification.setContent(oldManager.getFullName() + " không còn là quản lý của dự án \"" +
                        updatedProject.getName() + "\" nữa");
                teamNotification.setType(NotificationType.PROJECT);
                teamNotification.setReferenceId(updatedProject.getId());

                // Lấy danh sách ID của tất cả thành viên
                Integer[] teamUserIds = updatedProject.getUsers().stream()
                        .map(User::getId)
                        .toArray(Integer[]::new);

                // Gửi thông báo hàng loạt cho tất cả thành viên
                notificationService.createBulkNotifications(teamNotification, teamUserIds);
            }
        }

        // Trong phương thức updateProject
        if (oldStatus != updatedProject.getStatus()) {
            NotificationRequest statusNotification = new NotificationRequest();
            statusNotification.setTitle("Trạng thái dự án đã thay đổi");
            statusNotification.setContent("Trạng thái của dự án \"" + updatedProject.getName() + "\" đã được cập nhật thành " + updatedProject.getStatus().name());
            statusNotification.setType(NotificationType.PROJECT);
            statusNotification.setReferenceId(updatedProject.getId());

            // Danh sách ID người nhận thông báo
            List<Integer> notifyUserIds = new ArrayList<>();

            // Thêm manager vào danh sách nhận thông báo (nếu có)
            if (updatedProject.getManager() != null) {
                notifyUserIds.add(updatedProject.getManager().getId());
            }

            // Thêm các thành viên vào danh sách nhận thông báo
            if (updatedProject.getUsers() != null && !updatedProject.getUsers().isEmpty()) {
                updatedProject.getUsers().forEach(user -> {
                    if (!notifyUserIds.contains(user.getId())) {
                        notifyUserIds.add(user.getId());
                    }
                });
            }

            // Gửi thông báo cho tất cả người nhận
            if (!notifyUserIds.isEmpty()) {
                notificationService.createBulkNotifications(statusNotification,
                        notifyUserIds.toArray(new Integer[0]));
            }
        }

        // Chuyển đổi và trả về
        return mapProjectToProjectResponse(updatedProject);
    }

    @Override
    @Transactional
    public void deleteProject(Integer id) {
        // Kiểm tra xem project có tồn tại không
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + id));

        // Xóa project khỏi cơ sở dữ liệu
        projectRepository.delete(project);
    }

    @Override
    @Transactional
    public ProjectResponse updateProjectStatus(Integer projectId, ProjectStatus status) {
        // Kiểm tra xem project có tồn tại không
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        // Lưu trạng thái cũ để so sánh
        ProjectStatus oldStatus = project.getStatus();

        // Cập nhật trạng thái mới
        project.setStatus(status);
        project.setLastModifiedDate(new Date());

        // Lưu project đã cập nhật
        Project updatedProject = projectRepository.save(project);

        // Gửi thông báo khi trạng thái thay đổi
        if (oldStatus != updatedProject.getStatus()) {
            NotificationRequest statusNotification = new NotificationRequest();
            statusNotification.setTitle("Trạng thái dự án đã thay đổi");
            statusNotification.setContent("Trạng thái của dự án \"" + updatedProject.getName() + "\" đã được cập nhật thành " + updatedProject.getStatus().name());
            statusNotification.setType(NotificationType.PROJECT);
            statusNotification.setReferenceId(updatedProject.getId());

            // Danh sách ID người nhận thông báo
            List<Integer> notifyUserIds = new ArrayList<>();

            // Thêm manager vào danh sách nhận thông báo (nếu có)
            if (updatedProject.getManager() != null) {
                notifyUserIds.add(updatedProject.getManager().getId());
            }

            // Thêm các thành viên vào danh sách nhận thông báo
            if (updatedProject.getUsers() != null && !updatedProject.getUsers().isEmpty()) {
                updatedProject.getUsers().forEach(user -> {
                    if (!notifyUserIds.contains(user.getId())) {
                        notifyUserIds.add(user.getId());
                    }
                });
            }

            // Gửi thông báo cho tất cả người nhận
            if (!notifyUserIds.isEmpty()) {
                notificationService.createBulkNotifications(statusNotification,
                        notifyUserIds.toArray(new Integer[0]));
            }
        }

        // Chuyển đổi và trả về
        return mapProjectToProjectResponse(updatedProject);
    }

    @Override
    @Transactional
    public ProjectResponse addTagToProject(Integer projectId, Integer tagId) {
        // Tìm project theo ID
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        // Tìm tag theo ID
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found with ID: " + tagId));

        // Khởi tạo set tags nếu chưa có
        if (project.getTags() == null) {
            project.setTags(new HashSet<>());
        }

        // Thêm tag vào project
        project.getTags().add(tag);

        // Cập nhật ngày chỉnh sửa
        project.setLastModifiedDate(new Date());

        // Lưu project đã cập nhật
        Project updatedProject = projectRepository.save(project);

        // Chuyển đổi và trả về
        return mapProjectToProjectResponse(updatedProject);
    }

    @Override
    @Transactional
    public ProjectResponse removeTagFromProject(Integer projectId, Integer tagId) {
        // Tìm project theo ID
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        // Tìm tag theo ID
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found with ID: " + tagId));

        // Kiểm tra xem project có set tags không
        if (project.getTags() == null) {
            throw new ResourceNotFoundException("Tag with ID " + tagId + " not found in project");
        }

        // Xóa tag khỏi project
        boolean removed = project.getTags().removeIf(t -> t.getId().equals(tagId));

        if (!removed) {
            throw new ResourceNotFoundException("Tag with ID " + tagId + " not found in project");
        }

        // Cập nhật ngày chỉnh sửa
        project.setLastModifiedDate(new Date());

        // Lưu project đã cập nhật
        Project updatedProject = projectRepository.save(project);

        // Chuyển đổi và trả về
        return mapProjectToProjectResponse(updatedProject);
    }

    @Override
    @Transactional
    public ProjectResponse addMemberToProject(Integer projectId, Integer userId) {
        // Tìm project theo ID
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        // Tìm user theo ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Khởi tạo set users nếu chưa có
        if (project.getUsers() == null) {
            project.setUsers(new HashSet<>());
        }

        // Kiểm tra xem user đã trong project chưa
        if (project.getUsers().stream().anyMatch(u -> u.getId().equals(userId))) {
            // User đã là thành viên của project
            return mapProjectToProjectResponse(project);
        }

        // Thêm user vào project
        project.getUsers().add(user);

        // Cập nhật ngày chỉnh sửa
        project.setLastModifiedDate(new Date());

        // Lưu project đã cập nhật
        Project updatedProject = projectRepository.save(project);

        NotificationRequest notificationRequest = new NotificationRequest();
        notificationRequest.setTitle("Bạn đã được thêm vào dự án");
        notificationRequest.setContent("Bạn đã được thêm vào dự án \"" + updatedProject.getName() + "\"");
        notificationRequest.setType(NotificationType.PROJECT);
        notificationRequest.setReferenceId(updatedProject.getId());
        notificationRequest.setUserId(userId);
        notificationService.createNotification(notificationRequest);

        // Chuyển đổi và trả về
        return mapProjectToProjectResponse(updatedProject);
    }

    @Override
    @Transactional
    public ProjectResponse removeMemberFromProject(Integer projectId, Integer userId) {
        // Tìm project theo ID
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        // Tìm user theo ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Kiểm tra xem project có set users không
        if (project.getUsers() == null) {
            throw new ResourceNotFoundException("User not found with ID: " + userId);
        }

        // Xóa user khỏi project
        boolean removed = project.getUsers().removeIf(u -> u.getId().equals(userId));

        if (!removed) {
            throw new ResourceNotFoundException("User not found with ID: " + userId);
        }

        // Cập nhật ngày chỉnh sửa
        project.setLastModifiedDate(new Date());

        // Lưu project đã cập nhật
        Project updatedProject = projectRepository.save(project);

        NotificationRequest removeNotification = new NotificationRequest();
        removeNotification.setTitle("Bạn đã bị xóa khỏi dự án");
        removeNotification.setContent("Bạn đã bị xóa khỏi dự án \"" + updatedProject.getName() + "\"");
        removeNotification.setType(NotificationType.PROJECT);
        removeNotification.setReferenceId(updatedProject.getId());
        removeNotification.setUserId(userId);
        notificationService.createNotification(removeNotification);

        // Chuyển đổi và trả về
        return mapProjectToProjectResponse(updatedProject);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ProjectResponse> getProjectsByManagerId(Integer managerId, int pageNo, int pageSize, String search, ProjectStatus status) {
        // Kiểm tra xem manager có tồn tại hay không
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + managerId));

        // Tạo Pageable để phân trang
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by("createdDate").descending());

        // Tạo Specification để tìm kiếm và lọc
        Specification<Project> spec = (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("manager").get("id"), managerId);

        // Thêm điều kiện tìm kiếm theo tên nếu có
        if (StringUtils.hasText(search)) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.like(
                            criteriaBuilder.lower(root.get("name")),
                            "%" + search.toLowerCase() + "%"
                    )
            );
        }

        // Thêm điều kiện lọc theo status nếu có
        if (status != null) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("status"), status)
            );
        }

        // Truy vấn các project từ repository với điều kiện tìm kiếm và lọc
        Page<Project> projectPage = projectRepository.findAll(spec, pageable);

        // Chuyển đổi các Project thành ProjectResponse
        List<ProjectResponse> projectResponses = projectPage.getContent().stream()
                .map(this::mapProjectToProjectResponse)
                .collect(Collectors.toList());

        // Tạo và trả về PagedResponse
        return new PagedResponse<>(projectResponses, pageNo, pageSize,
                projectPage.getTotalElements(), projectPage.getTotalPages(),
                projectPage.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ProjectResponse> getProjectsByUserId(Integer userId, int pageNo, int pageSize, String search, ProjectStatus status) {
        // Kiểm tra xem user có tồn tại hay không
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Tạo Pageable để phân trang
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by("createdDate").descending());

        // Tạo Specification để tìm kiếm và lọc
        Specification<Project> spec = (root, query, criteriaBuilder) -> {
            // Join với bảng users
            Join<Project, User> userJoin = root.join("users");
            return criteriaBuilder.equal(userJoin.get("id"), userId);
        };

        // Thêm điều kiện tìm kiếm theo tên nếu có
        if (StringUtils.hasText(search)) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.like(
                            criteriaBuilder.lower(root.get("name")),
                            "%" + search.toLowerCase() + "%"
                    )
            );
        }

        // Thêm điều kiện lọc theo status nếu có
        if (status != null) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("status"), status)
            );
        }

        // Truy vấn các project từ repository với điều kiện tìm kiếm và lọc
        Page<Project> projectPage = projectRepository.findAll(spec, pageable);

        // Chuyển đổi các Project thành ProjectResponse
        List<ProjectResponse> projectResponses = projectPage.getContent().stream()
                .map(this::mapProjectToProjectResponse)
                .collect(Collectors.toList());

        // Tạo và trả về PagedResponse
        return new PagedResponse<>(projectResponses, pageNo, pageSize,
                projectPage.getTotalElements(), projectPage.getTotalPages(),
                projectPage.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getProjectMembers(Integer projectId) {
        // Kiểm tra xem project có tồn tại không
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        // Nếu project không có danh sách thành viên, trả về danh sách rỗng
        List<User> members = new ArrayList<>();

        if (project.getUsers() != null) {
            // Lọc ra các thành viên không phải là manager
            members = project.getUsers().stream()
                    .filter(user -> project.getManager() == null || !user.getId().equals(project.getManager().getId()))
                    .collect(Collectors.toList());
        }

        // Chuyển đổi từ User sang UserResponse
        return members.stream()
                .map(this::mapUserToUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllProjectsByUserId(Integer userId) {
        // Kiểm tra xem user có tồn tại hay không
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Tạo Specification để lọc theo userId (là thành viên hoặc là manager)
        Specification<Project> spec = (root, query, criteriaBuilder) -> {
            // Bắt buộc distinct để tránh kết quả trùng lặp
            query.distinct(true);

            // Điều kiện 1: User là thành viên của project
            Join<Project, User> userJoin = root.join("users", jakarta.persistence.criteria.JoinType.LEFT);
            Predicate userIsMember = criteriaBuilder.equal(userJoin.get("id"), userId);

            // Điều kiện 2: User là manager của project
            Predicate userIsManager = criteriaBuilder.equal(root.get("manager").get("id"), userId);

            // Kết hợp 2 điều kiện bằng OR
            return criteriaBuilder.or(userIsMember, userIsManager);
        };

        // Truy vấn tất cả projects của user (không phân trang)
        List<Project> projects = projectRepository.findAll(spec, Sort.by("createdDate").descending());

        // Chuyển đổi các Project thành ProjectResponse
        return projects.stream()
                .map(this::mapProjectToProjectResponse)
                .collect(Collectors.toList());
    }

//    @Override
//    @Transactional(readOnly = true)
//    public List<ProjectResponse> getAllProjectsWithoutPaging() {
//        List<Project> projects = projectRepository.findAll(Sort.by("createdDate").descending());
//        return projects.stream()
//                .map(this::mapProjectToProjectResponse)
//                .collect(Collectors.toList());
//    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllProjectsWithoutPaging() {
        // Tạo Specification để chỉ lấy projects có status IN_PROGRESS
        Specification<Project> spec = (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("status"), ProjectStatus.IN_PROGRESS);

        List<Project> projects = projectRepository.findAll(spec, Sort.by("createdDate").descending());
        return projects.stream()
                .map(this::mapProjectToProjectResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllProjectsByManagerIdWithoutPaging(Integer managerId) {
        // Kiểm tra xem manager có tồn tại hay không
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + managerId));

        // Tạo Specification để lọc theo managerId
        Specification<Project> spec = (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("manager").get("id"), managerId);

        // Truy vấn tất cả projects của manager
        List<Project> projects = projectRepository.findAll(spec, Sort.by("createdDate").descending());

        // Chuyển đổi các Project thành ProjectResponse
        return projects.stream()
                .map(this::mapProjectToProjectResponse)
                .collect(Collectors.toList());
    }

    // Phương thức helper để chuyển đổi User sang UserResponse
    private UserResponse mapUserToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setRole(user.getRole());
        response.setCreatedDate(user.getCreatedDate());
        response.setLastModifiedDate(user.getLastModifiedDate());
        response.setDepartment(user.getDepartment());
        response.setAddress(user.getAddress());
        response.setPosition(user.getPosition());
        response.setStatus(user.getStatus());

        return response;
    }

    @Async
    public void sendProjectCreationEmail(User manager, Project project, Set<User> users) {
        try {
            String subject = "Thông báo: Dự án mới đã được tạo - " + project.getName();

            // Tạo nội dung HTML cho email
            StringBuilder usersList = new StringBuilder();
            if (users != null && !users.isEmpty()) {
                usersList.append("<ul>");
                for (User user : users) {
                    usersList.append("<li>")
                            .append(user.getFullName() != null ? user.getFullName() : user.getUsername())
                            .append(" (").append(user.getEmail()).append(")")
                            .append("</li>");
                }
                usersList.append("</ul>");
            } else {
                usersList.append("<p>Chưa có thành viên nào được thêm vào dự án.</p>");
            }

            String htmlBody = "<html><body>" +
                    "<h2>Xin chào " + (manager.getFullName() != null ? manager.getFullName() : manager.getUsername()) + ",</h2>" +
                    "<p>Một dự án mới đã được tạo và bạn được chỉ định làm quản lý.</p>" +
                    "<h3>Thông tin dự án:</h3>" +
                    "<p><strong>Tên dự án:</strong> " + project.getName() + "</p>" +
                    "<p><strong>ID dự án:</strong> " + project.getId() + "</p>" +
                    "<p><strong>Mô tả:</strong> " + (project.getDescription() != null ? project.getDescription() : "Không có mô tả") + "</p>" +
                    "<p><strong>Ngày bắt đầu:</strong> " + (project.getStartDate() != null ? formatDate(project.getStartDate()) : "Chưa xác định") + "</p>" +
                    "<p><strong>Ngày kết thúc dự kiến:</strong> " + (project.getDueDate() != null ? formatDate(project.getDueDate()) : "Chưa xác định") + "</p>" +
                    "<h3>Danh sách thành viên:</h3>" +
                    usersList.toString() +
                    "<p>Vui lòng <a href='https://yourapp.com/projects/" + project.getId() + "'>nhấp vào đây</a> để xem chi tiết dự án.</p>" +
                    "<p>Trân trọng,<br>Hệ thống quản lý dự án</p>" +
                    "</body></html>";

            // Tạo EmailRequest từ lớp có sẵn
            EmailRequest emailRequest = new EmailRequest();
            emailRequest.setTo(manager.getEmail());
            emailRequest.setSubject(subject);
            emailRequest.setBody(htmlBody);

            // Gửi email
            emailService.sendEmailWithHtml(emailRequest);
        } catch (Exception e) {
            // Log lỗi nhưng không dừng quy trình tạo dự án
            System.err.println("Không thể gửi email thông báo: " + e.getMessage());
            // Có thể sử dụng logger thay vì System.err
            // logger.error("Failed to send project creation notification email", e);
        }
    }

    private String formatDate(Date date) {
        if (date == null) return "";
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
        return sdf.format(date);
    }
}