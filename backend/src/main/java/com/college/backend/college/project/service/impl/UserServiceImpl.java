package com.college.backend.college.project.service.impl;

import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.enums.Role;
import com.college.backend.college.project.enums.UserStatus;
import com.college.backend.college.project.exception.BadCredentialsException;
import com.college.backend.college.project.exception.InvalidPasswordException;
import com.college.backend.college.project.exception.ResourceNotFoundException;
import com.college.backend.college.project.mapper.UserMapper;
import com.college.backend.college.project.repository.UserRepository;
import com.college.backend.college.project.request.PasswordUpdateRequest;
import com.college.backend.college.project.request.UserRequest;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.response.UserResponse;
import com.college.backend.college.project.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getAllUsers(int pageNo, int pageSize) {
        return getAllUsers(pageNo, pageSize, null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getAllUsers(int pageNo, int pageSize, String search, String roleString) {
        // Tạo Pageable để phân trang
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by("createdDate").descending()); // pageNo - 1 vì Spring Data JPA bắt đầu từ 0

        // Tạo Specification để tìm kiếm và lọc
        Specification<User> spec = Specification.where(null);

        // Thêm điều kiện tìm kiếm theo tên hoặc email nếu có
        if (StringUtils.hasText(search)) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.or(
                            criteriaBuilder.like(
                                    criteriaBuilder.lower(root.get("fullName")),
                                    "%" + search.toLowerCase() + "%"
                            ),
                            criteriaBuilder.like(
                                    criteriaBuilder.lower(root.get("email")),
                                    "%" + search.toLowerCase() + "%"
                            )
                    )
            );
        }

        // Thêm điều kiện lọc theo role nếu có
        if (StringUtils.hasText(roleString)) {
            try {
                Role role = Role.valueOf(roleString.toUpperCase());
                spec = spec.and((root, query, criteriaBuilder) ->
                        criteriaBuilder.equal(root.get("role"), role)
                );
            } catch (IllegalArgumentException e) {
                // Nếu giá trị role không hợp lệ, bỏ qua
            }
        }

        // Truy vấn users từ repository với điều kiện tìm kiếm và lọc
        Page<User> userPage = userRepository.findAll(spec, pageable);

        // Chuyển đổi các User thành UserResponse sử dụng UserMapper
        List<UserResponse> userResponses = userPage.getContent().stream()
                .map(UserMapper.INSTANCE::userToUserRes)
                .collect(Collectors.toList());

        // Tạo và trả về PagedResponse
        return new PagedResponse<>(
                userResponses,
                pageNo,
                pageSize,
                userPage.getTotalElements(),
                userPage.getTotalPages(),
                userPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllActiveUsers() {
        // Tìm tất cả người dùng có trạng thái ACTIVE
        List<User> activeUsers = userRepository.findByStatus(UserStatus.ACTIVE);

        // Chuyển đổi danh sách User thành danh sách UserResponse
        return activeUsers.stream()
                .map(UserMapper.INSTANCE::userToUserRes)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        return UserMapper.INSTANCE.userToUserRes(user);
    }

    @Override
    @Transactional
    public UserResponse toggleUserStatus(Integer userId) {
        // Find the user or throw ResourceNotFoundException
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Toggle the user status
        user.setStatus(user.getStatus() == UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE);

        // Save the updated user
        User updatedUser = userRepository.save(user);

        // Convert and return the updated user response
        return UserMapper.INSTANCE.userToUserRes(updatedUser);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Integer userId, UserRequest userRequest) {
        // Tìm người dùng theo ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Chuẩn bị thông tin cập nhật từ userRequest
        User updatedInfo = UserMapper.INSTANCE.userReqToUser(userRequest);

        // Cập nhật các trường (giữ lại mật khẩu hiện tại nếu không có mật khẩu mới)
        if (StringUtils.hasText(updatedInfo.getFullName())) {
            user.setFullName(updatedInfo.getFullName());
        }

        if (StringUtils.hasText(updatedInfo.getEmail())) {
            user.setEmail(updatedInfo.getEmail());
        }

        if (StringUtils.hasText(updatedInfo.getPhoneNumber())) {
            user.setPhoneNumber(updatedInfo.getPhoneNumber());
        }

        if (StringUtils.hasText(updatedInfo.getDepartment())) {
            user.setDepartment(updatedInfo.getDepartment());
        }

        if (StringUtils.hasText(updatedInfo.getAddress())) {
            user.setAddress(updatedInfo.getAddress());
        }

        if (StringUtils.hasText(updatedInfo.getPosition())) {
            user.setPosition(updatedInfo.getPosition());
        }

        // Nếu có mật khẩu mới, mã hóa và cập nhật
        if (StringUtils.hasText(userRequest.getPassword())) {
            user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        }

        if (userRequest.getStatus() != null) {
            user.setStatus(userRequest.getStatus());
        }

        // Thêm vào phương thức updateUser trong UserServiceImpl
        if (userRequest.getRole() != null) {
            user.setRole(userRequest.getRole());
        }

        // Lưu thay đổi
        User savedUser = userRepository.save(user);

        // Chuyển đổi và trả về user đã cập nhật
        return UserMapper.INSTANCE.userToUserRes(savedUser);
    }

    @Override
    @Transactional
    public UserResponse updatePassword(PasswordUpdateRequest passwordUpdateRequest) {
        // Find the user by username
        User user = userRepository.findByEmail(passwordUpdateRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Validate current password
        if (!passwordEncoder.matches(passwordUpdateRequest.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        // Validate new password (optional: add password strength checks)
        if (passwordUpdateRequest.getNewPassword() == null || passwordUpdateRequest.getNewPassword().length() < 6) {
            throw new InvalidPasswordException("Password must be at least 6 characters long");
        }

        // Encode and set new password
        user.setPassword(passwordEncoder.encode(passwordUpdateRequest.getNewPassword()));

        return UserMapper.INSTANCE.userToUserRes(userRepository.save(user));
    }
}