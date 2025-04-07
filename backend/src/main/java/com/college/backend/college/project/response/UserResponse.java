package com.college.backend.college.project.response;

import com.college.backend.college.project.enums.Role;
import com.college.backend.college.project.enums.UserStatus;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class UserResponse {

    private Integer id;
    private String fullName;
    private String username;
    private String email;
    private String phoneNumber;
    private Role role;
    private Date createdDate;
    private Date lastModifiedDate;
    private String department;
    private String address;
    private String position;
    private UserStatus status;
}
