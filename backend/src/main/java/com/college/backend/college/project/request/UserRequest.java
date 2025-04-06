package com.college.backend.college.project.request;

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
    private String department;  // New field for department
    private String address;     // New field for address
    private String position;    // New field for position
}
