package com.college.backend.college.project.response;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class CommentResponse {

    private Integer id;
    private String text;
    private Integer authorId;
    private Date createdDate;
    private String authorName;
}
