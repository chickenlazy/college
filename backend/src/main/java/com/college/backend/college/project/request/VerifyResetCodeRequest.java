package com.college.backend.college.project.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class VerifyResetCodeRequest {
    private String email;
    private String resetCode;
    private String newPassword;
}
