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
//
//    public JwtAuthResponse(String accessToken, String tokenType, String role, String name, String username, String email) {
//        this.accessToken = accessToken;
//        this.tokenType = tokenType;
//        this.role = role;
//        this.name = name;
//        this.username = username;
//        this.email = email;
//    }
//
//    public String getName() {
//        return name;
//    }
//
//    public void setName(String name) {
//        this.name = name;
//    }
//
//    public void setUsername(String username) {
//        this.username = username;
//    }
//
//    public void setEmail(String email) {
//        this.email = email;
//    }
//
//    public String getUsername() {
//        return username;
//    }
//
//    public String getEmail() {
//        return email;
//    }
//
//    public JwtAuthResponse() {
//    }
//
//    public JwtAuthResponse(String accessToken, String tokenType) {
//        this.accessToken = accessToken;
//        this.tokenType = tokenType;
//    }
//
//    public JwtAuthResponse(String accessToken, String role, String tokenType) {
//        this.accessToken = accessToken;
//        this.role = role;
//        this.tokenType = tokenType;
//    }
//
//    public String getRole() {
//        return role;
//    }
//
//    public void setRole(String role) {
//        this.role = role;
//    }
//
//    public String getAccessToken() {
//        return accessToken;
//    }
//
//    public String getTokenType() {
//        return tokenType;
//    }
//
//    public void setAccessToken(String accessToken) {
//        this.accessToken = accessToken;
//    }
//
//    public void setTokenType(String tokenType) {
//        this.tokenType = tokenType;
//    }
}

