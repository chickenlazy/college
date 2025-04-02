package com.college.backend.college.project.service.impl;

import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.enums.Role;
import com.college.backend.college.project.mapper.UserMapper;
import com.college.backend.college.project.repository.UserRepository;
import com.college.backend.college.project.request.LoginRequest;
import com.college.backend.college.project.request.UserRequest;
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

        // Cập nhật để sử dụng Role enum thay vì Set<Role>
        user.setRole(Role.ROLE_USER);

        user = userRepository.save(user);
        return "Người dùng đã được đăng ký thành công với ID " + user.getId();
    }

    // Sửa phương thức login
    @Override
    public JwtAuthResponse login(LoginRequest loginDto) {
        JwtAuthResponse jwtAuthResponse = new JwtAuthResponse();
        //1. Tạo đối tượng authentication từ loginDto
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDto.getUsernameOrEmail(), loginDto.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        //2. Tạo một token JWT và gán vào biến AccessToken
        String token = jwtTokenProvider.generateToken(authentication);

        //3. Kiểm tra Role của User
        Optional<User> userOptional = userRepository.findByUsernameOrEmail(loginDto.getUsernameOrEmail());
        String role = null;
        if(userOptional.isPresent()) {
            User loggedInUser = userOptional.get();
            // Lấy Role từ enum
            role = loggedInUser.getRole().name();

            //Thêm thông tin user vào response
            jwtAuthResponse.setId(loggedInUser.getId());
            jwtAuthResponse.setFullName(loggedInUser.getFullName());
            jwtAuthResponse.setUsername(loggedInUser.getUsername());
            jwtAuthResponse.setEmail(loggedInUser.getEmail());
            jwtAuthResponse.setPhoneNumber((loggedInUser.getPhoneNumber()));
            jwtAuthResponse.setCreatedDate(loggedInUser.getCreatedDate());
            jwtAuthResponse.setLastModifiedDate(loggedInUser.getLastModifiedDate());
        }

        jwtAuthResponse.setRole(role);
        jwtAuthResponse.setAccessToken(token);

        return jwtAuthResponse;
    }
}

