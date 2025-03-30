package com.college.backend.college.project.service.impl;

import com.college.backend.college.project.entity.Project;
import com.college.backend.college.project.entity.Tag;
import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.enums.ProjectStatus;
import com.college.backend.college.project.enums.TaskStatus;
import com.college.backend.college.project.exception.ResourceNotFoundException;
import com.college.backend.college.project.mapper.ProjectMapper;
import com.college.backend.college.project.repository.ProjectRepository;
import com.college.backend.college.project.repository.TagRepository;
import com.college.backend.college.project.repository.TaskRepository;
import com.college.backend.college.project.repository.UserRepository;
import com.college.backend.college.project.request.ProjectRequest;
import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.response.ProjectResponse;
import com.college.backend.college.project.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProjectServiceImpl implements ProjectService {
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;

    @Autowired
    public ProjectServiceImpl(ProjectRepository projectRepository, TaskRepository taskRepository, UserRepository userRepository, TagRepository tagRepository) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.tagRepository = tagRepository;
    }

    private ProjectResponse mapProjectToProjectResponse(Project project) {
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
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize); // pageNo - 1 vì Spring Data JPA bắt đầu từ 0

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

        // Cập nhật các thông tin cơ bản
        ProjectMapper.INSTANCE.updateProjectFromRequest(projectRequest, project);

        // Cập nhật ngày chỉnh sửa
        project.setLastModifiedDate(new Date());

        // Cập nhật manager nếu có
        if (projectRequest.getManagerId() != null) {
            User manager = userRepository.findById(projectRequest.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found with ID: " + projectRequest.getManagerId()));
            project.setManager(manager);
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

        // Chuyển đổi và trả về
        return mapProjectToProjectResponse(updatedProject);
    }
}