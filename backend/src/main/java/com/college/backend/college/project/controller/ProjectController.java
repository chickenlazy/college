package com.college.backend.college.project.controller;

import com.college.backend.college.project.enums.ProjectStatus;
import com.college.backend.college.project.request.ProjectRequest;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.response.ProjectResponse;
import com.college.backend.college.project.response.UserResponse;
import com.college.backend.college.project.service.ProjectService;
import com.college.backend.college.project.service.impl.ExcelExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ProjectController {

    private final ProjectService projectService;
    private final ExcelExportService excelExportService;

    @Autowired
    public ProjectController(ProjectService projectService, ExcelExportService excelExportService) {
        this.projectService = projectService;
        this.excelExportService = excelExportService;
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(@RequestBody ProjectRequest projectRequest) {
        ProjectResponse projectResponse = projectService.createProject(projectRequest);
        return new ResponseEntity<>(projectResponse, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable Integer id) {
        ProjectResponse projectResponse = projectService.getProjectById(id);
        return ResponseEntity.ok(projectResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Integer id,
            @RequestBody ProjectRequest projectRequest) {
        ProjectResponse updatedProject = projectService.updateProject(id, projectRequest);
        return ResponseEntity.ok(updatedProject);
    }

    // Phương thức DELETE để xóa dự án
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteProject(@PathVariable Integer id) {
        projectService.deleteProject(id);

        ApiResponse apiResponse = new ApiResponse(
                Boolean.TRUE,
                "Project deleted successfully");

        return new ResponseEntity<>(apiResponse, HttpStatus.OK);
    }

    // Phương thức GET để lấy tất cả các dự án với phân trang, tìm kiếm và lọc
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @GetMapping
    public ResponseEntity<PagedResponse<ProjectResponse>> getAllProjects(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {

        // Chuyển đổi status từ String sang Enum nếu có giá trị
        ProjectStatus projectStatus = null;
        if (status != null && !status.equals("all")) {
            try {
                projectStatus = ProjectStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
                // Nếu giá trị status không hợp lệ, bỏ qua
            }
        }

        // Gọi service để lấy dữ liệu phân trang với tìm kiếm và lọc
        PagedResponse<ProjectResponse> response = projectService.getAllProjects(
                pageNo, pageSize, search, projectStatus);

        // Trả về response dưới dạng HTTP Response Entity
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{projectId}/tags/{tagId}")
    public ResponseEntity<ProjectResponse> addTagToProject(
            @PathVariable Integer projectId,
            @PathVariable Integer tagId) {
        ProjectResponse projectResponse = projectService.addTagToProject(projectId, tagId);
        return ResponseEntity.ok(projectResponse);
    }

    /**
     * Xóa tag khỏi project
     * @param projectId ID của project
     * @param tagId ID của tag
     * @return Project đã được cập nhật
     */
    @DeleteMapping("/{projectId}/tags/{tagId}")
    public ResponseEntity<ProjectResponse> removeTagFromProject(
            @PathVariable Integer projectId,
            @PathVariable Integer tagId) {
        ProjectResponse projectResponse = projectService.removeTagFromProject(projectId, tagId);
        return ResponseEntity.ok(projectResponse);
    }

    @PostMapping("/{projectId}/members/{userId}")
    public ResponseEntity<ProjectResponse> addMemberToProject(
            @PathVariable Integer projectId,
            @PathVariable Integer userId) {
        ProjectResponse projectResponse = projectService.addMemberToProject(projectId, userId);
        return ResponseEntity.ok(projectResponse);
    }

    /**
     * Xóa member khỏi project
     * @param projectId ID của project
     * @param userId ID của user
     * @return Project đã được cập nhật
     */
    @DeleteMapping("/{projectId}/members/{userId}")
    public ResponseEntity<ProjectResponse> removeMemberFromProject(
            @PathVariable Integer projectId,
            @PathVariable Integer userId) {
        ProjectResponse projectResponse = projectService.removeMemberFromProject(projectId, userId);
        return ResponseEntity.ok(projectResponse);
    }

    /**
     * API để lấy danh sách dự án theo manager ID: GET /api/projects/manager/{managerId}?pageNo=1&pageSize=10&search=keyword&status=IN_PROGRESS
     */
    @GetMapping("/manager/{managerId}")
    public ResponseEntity<PagedResponse<ProjectResponse>> getProjectsByManagerId(
            @PathVariable Integer managerId,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {

        // Chuyển đổi status từ String sang Enum nếu có giá trị
        ProjectStatus projectStatus = null;
        if (status != null && !status.equals("all")) {
            try {
                projectStatus = ProjectStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
                // Nếu giá trị status không hợp lệ, bỏ qua
            }
        }

        // Gọi service để lấy dữ liệu
        PagedResponse<ProjectResponse> response = projectService.getProjectsByManagerId(
                managerId, pageNo, pageSize, search, projectStatus);

        return ResponseEntity.ok(response);
    }

    /**
     * API để lấy danh sách thành viên của một dự án: GET /api/projects/{projectId}/members
     */
    @GetMapping("/{projectId}/members")
    public ResponseEntity<List<UserResponse>> getProjectMembers(@PathVariable Integer projectId) {
        List<UserResponse> members = projectService.getProjectMembers(projectId);
        return ResponseEntity.ok(members);
    }

    /**
     * API để lấy danh sách dự án mà một user tham gia: GET /api/projects/user/{userId}?pageNo=1&pageSize=10&search=keyword&status=IN_PROGRESS
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<PagedResponse<ProjectResponse>> getProjectsByUserId(
            @PathVariable Integer userId,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {

        // Chuyển đổi status từ String sang Enum nếu có giá trị
        ProjectStatus projectStatus = null;
        if (status != null && !status.equals("all")) {
            try {
                projectStatus = ProjectStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
                // Nếu giá trị status không hợp lệ, bỏ qua
            }
        }

        // Gọi service để lấy dữ liệu
        PagedResponse<ProjectResponse> response = projectService.getProjectsByUserId(
                userId, pageNo, pageSize, search, projectStatus);

        return ResponseEntity.ok(response);
    }

    /**
     * API để lấy tất cả dự án mà một user tham gia (không phân trang, không lọc): GET /api/projects/user/{userId}/all
     */
    @GetMapping("/user/{userId}/all")
    public ResponseEntity<List<ProjectResponse>> getAllProjectsByUserId(@PathVariable Integer userId) {
        // Gọi service để lấy tất cả dự án của user
        List<ProjectResponse> response = projectService.getAllProjectsByUserId(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public ResponseEntity<List<ProjectResponse>> getAllProjectsWithoutPaging() {
        List<ProjectResponse> response = projectService.getAllProjectsWithoutPaging();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/manager/{managerId}/all")
    public ResponseEntity<List<ProjectResponse>> getAllProjectsByManagerIdWithoutPaging(
            @PathVariable Integer managerId) {
        List<ProjectResponse> response = projectService.getAllProjectsByManagerIdWithoutPaging(managerId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{projectId}/status")
    public ResponseEntity<ProjectResponse> updateProjectStatus(
            @PathVariable Integer projectId,
            @RequestParam ProjectStatus status) {
        ProjectResponse updatedProject = projectService.updateProjectStatus(projectId, status);
        return ResponseEntity.ok(updatedProject);
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<byte[]> exportProjectToExcel(@PathVariable Integer id) {
        try {
            byte[] excelContent = excelExportService.exportProjectToExcel(id);

            // Tạo tên file dựa trên ID dự án và ngày hiện tại
            String currentDate = new SimpleDateFormat("yyyyMMdd").format(new Date());
            String filename = "project_" + id + "_report_" + currentDate + ".xlsx";

            // Thiết lập headers cho response
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(excelContent, headers, HttpStatus.OK);
        } catch (IOException e) {
            // Log lỗi và trả về lỗi 500 Internal Server Error
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}