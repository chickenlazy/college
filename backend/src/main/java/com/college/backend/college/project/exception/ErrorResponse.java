package com.college.backend.college.project.exception;

import lombok.Data;

import java.util.Date;

@Data
public class ErrorResponse {
    private Integer statusCode;
    private String message;
    private Date timestamp;
}
