package com.college.backend.college.project.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FileDeleteResponse {
    private Integer id;
    private Boolean success;
    private String message;
}