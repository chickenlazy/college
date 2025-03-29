package com.college.backend.college.project.response;

import com.college.backend.college.project.entity.Comment;
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

    // Constructor to initialize CommentResponse from Comment entity
    public CommentResponse(Comment comment) {
        this.id = comment.getId();
        this.text = comment.getText();
        this.authorId = comment.getAuthor() != null ? comment.getAuthor().getId() : null;
        this.createdDate = comment.getCreatedDate();
        this.authorName = comment.getAuthor() != null ? comment.getAuthor().getFullName() : null;
    }
}
