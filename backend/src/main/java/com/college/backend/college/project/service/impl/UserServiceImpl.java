package com.college.backend.college.project.service.impl;

import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.enums.Role;
import com.college.backend.college.project.enums.UserStatus;
import com.college.backend.college.project.exception.BadCredentialsException;
import com.college.backend.college.project.exception.InvalidPasswordException;
import com.college.backend.college.project.exception.ResourceNotFoundException;
import com.college.backend.college.project.mapper.UserMapper;
import com.college.backend.college.project.repository.UserRepository;
import com.college.backend.college.project.request.EmailRequest;
import com.college.backend.college.project.request.PasswordUpdateRequest;
import com.college.backend.college.project.request.UserRequest;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.response.UserResponse;
import com.college.backend.college.project.service.EmailService;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, EmailService emailService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getAllUsers(int pageNo, int pageSize) {
        return getAllUsers(pageNo, pageSize, null, null);
    }

//    @Override
//    @Transactional(readOnly = true)
//    public PagedResponse<UserResponse> getAllUsers(int pageNo, int pageSize, String search, String roleString) {
//        // Tạo Pageable để phân trang
//        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by("createdDate").descending()); // pageNo - 1 vì Spring Data JPA bắt đầu từ 0
//
//        // Tạo Specification để tìm kiếm và lọc
//        Specification<User> spec = Specification.where(null);
//
//        // Thêm điều kiện tìm kiếm theo tên hoặc email nếu có
//        if (StringUtils.hasText(search)) {
//            spec = spec.and((root, query, criteriaBuilder) ->
//                    criteriaBuilder.or(
//                            criteriaBuilder.like(
//                                    criteriaBuilder.lower(root.get("fullName")),
//                                    "%" + search.toLowerCase() + "%"
//                            ),
//                            criteriaBuilder.like(
//                                    criteriaBuilder.lower(root.get("email")),
//                                    "%" + search.toLowerCase() + "%"
//                            )
//                    )
//            );
//        }
//
//        // Thêm điều kiện lọc theo role nếu có
//        if (StringUtils.hasText(roleString)) {
//            try {
//                Role role = Role.valueOf(roleString.toUpperCase());
//                spec = spec.and((root, query, criteriaBuilder) ->
//                        criteriaBuilder.equal(root.get("role"), role)
//                );
//            } catch (IllegalArgumentException e) {
//                // Nếu giá trị role không hợp lệ, bỏ qua
//            }
//        }
//
//        // Truy vấn users từ repository với điều kiện tìm kiếm và lọc
//        Page<User> userPage = userRepository.findAll(spec, pageable);
//
//        // Chuyển đổi các User thành UserResponse sử dụng UserMapper
//        List<UserResponse> userResponses = userPage.getContent().stream()
//                .map(UserMapper.INSTANCE::userToUserRes)
//                .collect(Collectors.toList());
//
//        // Tạo và trả về PagedResponse
//        return new PagedResponse<>(
//                userResponses,
//                pageNo,
//                pageSize,
//                userPage.getTotalElements(),
//                userPage.getTotalPages(),
//                userPage.isLast()
//        );
//    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getAllUsers(int pageNo, int pageSize, String search, String filterValue) {
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

        // Kiểm tra và áp dụng bộ lọc (role hoặc status)
        if (StringUtils.hasText(filterValue)) {
            if (filterValue.startsWith("ROLE_")) {
                // Lọc theo role
                try {
                    Role role = Role.valueOf(filterValue);
                    spec = spec.and((root, query, criteriaBuilder) ->
                            criteriaBuilder.equal(root.get("role"), role)
                    );
                } catch (IllegalArgumentException e) {
                    // Nếu giá trị role không hợp lệ, bỏ qua
                }
            } else if (filterValue.equals("ACTIVE") || filterValue.equals("INACTIVE")) {
                // Lọc theo status
                // Lọc theo status
                try {
                    UserStatus status = UserStatus.valueOf(filterValue);
                    spec = spec.and((root, query, criteriaBuilder) ->
                            criteriaBuilder.equal(root.get("status"), status)
                    );
                } catch (IllegalArgumentException e) {
                    // Nếu giá trị status không hợp lệ, bỏ qua
                }
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

    @Override
    @Transactional(readOnly = true)
    public boolean isFieldValueUnique(String field, String value, Integer excludeId) {
        if ("username".equals(field)) {
            User user = userRepository.findByUsername(value).orElse(null);
            return user == null || (user.getId().equals(excludeId));
        } else if ("email".equals(field)) {
            User user = userRepository.findByEmail(value).orElse(null);
            return user == null || (user.getId().equals(excludeId));
        }
        return true; // Mặc định trả về true nếu field không phải là username hoặc email
    }

    @Override
    @Transactional
    public ApiResponse initiatePasswordReset(String email) {
        // Kiểm tra email có tồn tại
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + email));

        // Kiểm tra tài khoản có đang active không
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BadCredentialsException("Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.");
        }

        // Tạo mã xác nhận ngẫu nhiên 6 chữ số
        String resetCode = generateRandomCode();

        // Lưu mã và thời gian hết hạn (60 giây từ hiện tại)
        user.setResetCode(resetCode);
        user.setResetCodeExpiry(LocalDateTime.now().plusSeconds(60));

        userRepository.save(user);

        // Tạo email request
        EmailRequest emailRequest = createResetPasswordEmail(email, resetCode);

        // Gửi email với nội dung HTML
        emailService.sendEmailWithHtml(emailRequest);

        return new ApiResponse(true, "Mã xác nhận đã được gửi đến email của bạn. Vui lòng kiểm tra và nhập mã trong vòng 60 giây.");
    }

    @Override
    @Transactional
    public ApiResponse verifyAndResetPassword(String email, String resetCode, String newPassword) {
        // Tìm user bằng email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + email));

        // Kiểm tra mã xác nhận
        if (user.getResetCode() == null || !user.getResetCode().equals(resetCode)) {
            throw new BadCredentialsException("Mã xác nhận không đúng");
        }

        // Kiểm tra thời gian hiệu lực
        if (user.getResetCodeExpiry() == null || user.getResetCodeExpiry().isBefore(LocalDateTime.now())) {
            // Xóa mã reset hết hạn
            user.setResetCode(null);
            user.setResetCodeExpiry(null);
            userRepository.save(user);

            throw new BadCredentialsException("Mã xác nhận đã hết hạn. Vui lòng yêu cầu mã mới.");
        }

        // Kiểm tra mật khẩu mới hợp lệ
        if (newPassword == null || newPassword.length() < 6) {
            throw new InvalidPasswordException("Mật khẩu phải có ít nhất 6 ký tự");
        }

        // Cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(newPassword));

        // Xóa mã reset
        user.setResetCode(null);
        user.setResetCodeExpiry(null);

        userRepository.save(user);

        return new ApiResponse(true, "Mật khẩu đã được đặt lại thành công");
    }

    // Phương thức hỗ trợ: Tạo mã xác nhận ngẫu nhiên 6 chữ số
    private String generateRandomCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // Tạo số ngẫu nhiên 6 chữ số
        return String.valueOf(code);
    }

    private EmailRequest createResetPasswordEmail(String email, String resetCode) {
        EmailRequest emailRequest = new EmailRequest();
        emailRequest.setTo(email);
        emailRequest.setSubject("Mã xác nhận đặt lại mật khẩu");

        // Tạo nội dung HTML đẹp cho email
        String htmlContent =
                "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;'>" +
                        "<h2 style='color: #4a148c; text-align: center;'>Đặt lại mật khẩu</h2>" +
                        "<p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>" +
                        "<p>Mã xác nhận của bạn là:</p>" +
                        "<div style='background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;'>" + resetCode + "</div>" +
                        "<p style='color: #d32f2f;'>Mã này chỉ có hiệu lực trong <strong>60 giây</strong>.</p>" +
                        "<p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>" +
                        "<p>Trân trọng,<br>Đội ngũ hỗ trợ</p>" +
                        "</div>";

        emailRequest.setBody(htmlContent);

        return emailRequest;
    }
}