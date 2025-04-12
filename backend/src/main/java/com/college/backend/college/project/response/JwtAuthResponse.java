package com.college.backend.college.project.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class JwtAuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private Integer id;
    private String role;
    private String fullName;
    private String phoneNumber;
    private String username;
    private String email;
    private Date createdDate;
    private Date lastModifiedDate;
    private String message;
    private boolean success = true;
}

