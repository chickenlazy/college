package com.college.backend.college.project.controller;

import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.repository.UserRepository;
import com.college.backend.college.project.request.LoginRequest;
import com.college.backend.college.project.request.UpdateRoleRequest;
import com.college.backend.college.project.request.UserRequest;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.JwtAuthResponse;
import com.college.backend.college.project.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @Autowired
    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    // Sửa phương thức đăng ký
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody UserRequest userRequest) {
        String response = authService.register(userRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Sửa phương thức đăng nhập
    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> loginUser(@RequestBody LoginRequest loginDto) {
        JwtAuthResponse jwtAuthResponse = authService.login(loginDto);
        if (!jwtAuthResponse.isSuccess()) {
            return new ResponseEntity<>(jwtAuthResponse, HttpStatus.UNAUTHORIZED);
        }
        return new ResponseEntity<>(jwtAuthResponse, HttpStatus.OK);
    }

    @PatchMapping("/role")
    @PreAuthorize("hasRole('ADMIN')")  // Đảm bảo chỉ ADMIN mới có quyền thay đổi role
    public ResponseEntity<ApiResponse> updateUserRole(@RequestBody UpdateRoleRequest updateRoleRequest) {
        ApiResponse apiResponse = authService.updateUserRole(updateRoleRequest);
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/check-status")
    public ResponseEntity<?> checkUserStatus(Authentication authentication) {
        String username = authentication.getName();
        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            Map<String, Object> response = new HashMap<>();
            response.put("status", user.getStatus());
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }
}
