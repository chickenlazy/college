package com.college.backend.college.project.request;

import com.college.backend.college.project.enums.CommentType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CommentRequest {
    private String content;
    private CommentType type;
    private Integer referenceId;
    private Integer parentId;
}