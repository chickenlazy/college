package com.college.backend.college.project.service;

import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.response.UserResponse;

public interface UserService {
    // Phương thức để lấy tất cả users với phân trang
    PagedResponse<UserResponse> getAllUsers(int pageNo, int pageSize);

    // Phương thức để lấy tất cả users với phân trang, tìm kiếm và lọc theo role
    PagedResponse<UserResponse> getAllUsers(int pageNo, int pageSize, String search, String role);
}