package com.college.backend.college.project.service.impl;

import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.enums.Role;
import com.college.backend.college.project.enums.UserStatus;
import com.college.backend.college.project.exception.ResourceNotFoundException;
import com.college.backend.college.project.mapper.UserMapper;
import com.college.backend.college.project.repository.UserRepository;
import com.college.backend.college.project.request.LoginRequest;
import com.college.backend.college.project.request.UpdateRoleRequest;
import com.college.backend.college.project.request.UserRequest;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.JwtAuthResponse;
import com.college.backend.college.project.security.JwtTokenProvider;
import com.college.backend.college.project.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class AuthServiceImpl implements AuthService {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public String register(UserRequest userRequest) {
//        if (userRepository.existsByUsername(userRequest.getUsername())) {
//            throw new TodoAPIException(HttpStatus.BAD_REQUEST, "Tên người dùng đã tồn tại");
//        }
//
//        if (userRepository.existsByEmail(userRequest.getEmail())) {
//            throw new TodoAPIException(HttpStatus.BAD_REQUEST, "Email đã tồn tại");
//        }

        User user = UserMapper.INSTANCE.userReqToUser(userRequest);
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));

//        user.setRole(Role.ROLE_USER);

        user = userRepository.save(user);
        return "Người dùng đã được đăng ký thành công với ID " + user.getId();
    }

    // Sửa phương thức login
    @Override
    public JwtAuthResponse login(LoginRequest loginDto) {
        JwtAuthResponse jwtAuthResponse = new JwtAuthResponse();

        // Kiểm tra user có tồn tại và status trước khi xác thực
        Optional<User> userOptional = userRepository.findByUsernameOrEmail(loginDto.getUsernameOrEmail());
        if(userOptional.isPresent()) {
            User user = userOptional.get();
            // Kiểm tra status, nếu là INACTIVE thì trả về response với message thông báo
            if(UserStatus.INACTIVE.equals(user.getStatus())) {
                jwtAuthResponse.setSuccess(false);
                jwtAuthResponse.setMessage("The account has been disabled");
                return jwtAuthResponse;
            }
        }

        try {
            //1. Tạo đối tượng authentication từ loginDto
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDto.getUsernameOrEmail(), loginDto.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            //2. Tạo một token JWT và gán vào biến AccessToken
            String token = jwtTokenProvider.generateToken(authentication);

            //3. Kiểm tra Role của User
            if(userOptional.isPresent()) {
                User loggedInUser = userOptional.get();
                // Lấy Role từ enum
                String role = loggedInUser.getRole().name();

                //Thêm thông tin user vào response
                jwtAuthResponse.setId(loggedInUser.getId());
                jwtAuthResponse.setFullName(loggedInUser.getFullName());
                jwtAuthResponse.setUsername(loggedInUser.getUsername());
                jwtAuthResponse.setEmail(loggedInUser.getEmail());
                jwtAuthResponse.setPhoneNumber((loggedInUser.getPhoneNumber()));
                jwtAuthResponse.setCreatedDate(loggedInUser.getCreatedDate());
                jwtAuthResponse.setLastModifiedDate(loggedInUser.getLastModifiedDate());
                jwtAuthResponse.setRole(role);
            }

            jwtAuthResponse.setAccessToken(token);
            jwtAuthResponse.setMessage("Login successful");

        } catch (Exception e) {
            jwtAuthResponse.setSuccess(false);
            jwtAuthResponse.setMessage("Invalid username or password");
        }

        return jwtAuthResponse;
    }

    @Override
    @Transactional
    public ApiResponse updateUserRole(UpdateRoleRequest updateRoleRequest) {
        // Tìm user theo ID
        User user = userRepository.findById(updateRoleRequest.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + updateRoleRequest.getUserId()));

        // Cập nhật role
        user.setRole(updateRoleRequest.getRole());

        // Cập nhật thời gian chỉnh sửa nếu có trường này
        if (user.getLastModifiedDate() != null) {
            user.setLastModifiedDate(new Date());
        }

        // Lưu thay đổi
        userRepository.save(user);

        // Trả về response
        return new ApiResponse(Boolean.TRUE, "User role updated successfully to " + updateRoleRequest.getRole().name());
    }
}

