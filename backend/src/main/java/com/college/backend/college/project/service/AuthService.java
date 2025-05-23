package com.college.backend.college.project.service;

import com.college.backend.college.project.request.LoginRequest;
import com.college.backend.college.project.request.UpdateRoleRequest;
import com.college.backend.college.project.request.UserRequest;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.JwtAuthResponse;

public interface AuthService {
    String register(UserRequest userRequest);
    JwtAuthResponse login(LoginRequest loginDto);
    ApiResponse updateUserRole(UpdateRoleRequest updateRoleRequest);
}
