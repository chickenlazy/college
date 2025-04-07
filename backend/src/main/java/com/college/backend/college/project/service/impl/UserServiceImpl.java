package com.college.backend.college.project.service.impl;

import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.enums.Role;
import com.college.backend.college.project.enums.UserStatus;
import com.college.backend.college.project.exception.ResourceNotFoundException;
import com.college.backend.college.project.mapper.UserMapper;
import com.college.backend.college.project.repository.UserRepository;
import com.college.backend.college.project.request.UserRequest;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.response.UserResponse;
import com.college.backend.college.project.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize); // pageNo - 1 vì Spring Data JPA bắt đầu từ 0

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
}