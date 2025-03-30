package com.college.backend.college.project.controller;

import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.response.UserResponse;
import com.college.backend.college.project.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}