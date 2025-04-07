package com.college.backend.college.project.request;

import com.college.backend.college.project.enums.Role;
import com.college.backend.college.project.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserRequest {
    private String fullName;
    private String username;
    private String password;
    private String email;
    private String phoneNumber;
    private String department;
    private String address;
    private String position;
    private UserStatus status;
    private Role role;
}
