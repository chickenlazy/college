package com.college.backend.college.project.controller;

import com.college.backend.college.project.request.PasswordUpdateRequest;
import com.college.backend.college.project.request.UserRequest;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.response.UserResponse;
import com.college.backend.college.project.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Phương thức GET để lấy tất cả users với phân trang, tìm kiếm và lọc
    @GetMapping
    public ResponseEntity<PagedResponse<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role) {

        // Gọi service để lấy dữ liệu phân trang với tìm kiếm và lọc
        PagedResponse<UserResponse> response = userService.getAllUsers(
                pageNo, pageSize, search, role);

        // Trả về response dưới dạng HTTP Response Entity
        return ResponseEntity.ok(response);
    }

    /**
     * API để lấy thông tin người dùng theo ID
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Integer userId) {
        UserResponse userResponse = userService.getUserById(userId);
        return ResponseEntity.ok(userResponse);
    }

    @PutMapping("/{userId}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')") // Restrict to admin access
    public ResponseEntity<UserResponse> toggleUserStatus(@PathVariable Integer userId) {
        UserResponse updatedUser = userService.toggleUserStatus(userId);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * API để cập nhật thông tin người dùng
     */
    @PutMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Integer userId,
            @RequestBody UserRequest userRequest) {
        UserResponse updatedUser = userService.updateUser(userId, userRequest);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * API để cập nhật password
     */
    @PutMapping("/update-password")
    public ResponseEntity<UserResponse> updatePassword(
            @RequestBody PasswordUpdateRequest passwordUpdateRequest) {
        UserResponse updatedUser = userService.updatePassword(passwordUpdateRequest);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * API để lấy tất cả người dùng có trạng thái ACTIVE
     */
    @GetMapping("/active")
    public ResponseEntity<List<UserResponse>> getAllActiveUsers() {
        List<UserResponse> activeUsers = userService.getAllActiveUsers();
        return ResponseEntity.ok(activeUsers);
    }

}