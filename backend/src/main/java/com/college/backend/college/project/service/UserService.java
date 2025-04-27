package com.college.backend.college.project.service;

import com.college.backend.college.project.request.PasswordUpdateRequest;
import com.college.backend.college.project.request.UserRequest;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.response.UserResponse;

import java.util.List;

public interface UserService {
    // Phương thức để lấy tất cả users với phân trang
    PagedResponse<UserResponse> getAllUsers(int pageNo, int pageSize);

    // Phương thức để lấy tất cả users với phân trang, tìm kiếm và lọc theo role
    PagedResponse<UserResponse> getAllUsers(int pageNo, int pageSize, String search, String role);

    // Trong interface UserService, thêm phương thức mới:
    List<UserResponse> getAllActiveUsers();

    UserResponse getUserById(Integer userId);

    UserResponse toggleUserStatus(Integer userId);

    UserResponse updateUser(Integer userId, UserRequest userRequest);

    UserResponse updatePassword(PasswordUpdateRequest passwordUpdateRequest);

    boolean isFieldValueUnique(String field, String value, Integer excludeId);

    /**
     * Khởi tạo quá trình lấy lại mật khẩu bằng cách gửi mã xác nhận
     * @param email Email của người dùng
     * @return ApiResponse chứa thông tin xác nhận
     */
    ApiResponse initiatePasswordReset(String email);

    /**
     * Xác thực mã reset và đặt lại mật khẩu mới
     * @param email Email người dùng
     * @param resetCode Mã xác nhận
     * @param newPassword Mật khẩu mới
     * @return ApiResponse kết quả đặt lại mật khẩu
     */
    ApiResponse verifyAndResetPassword(String email, String resetCode, String newPassword);

    // Thêm vào interface UserService
    ApiResponse verifyResetCode(String email, String resetCode);
}