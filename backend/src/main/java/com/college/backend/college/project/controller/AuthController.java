package com.college.backend.college.project.controller;

import com.college.backend.college.project.request.LoginRequest;
import com.college.backend.college.project.request.UserRequest;
import com.college.backend.college.project.response.JwtAuthResponse;
import com.college.backend.college.project.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
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
        return new ResponseEntity<>(jwtAuthResponse, HttpStatus.OK);
    }
}
