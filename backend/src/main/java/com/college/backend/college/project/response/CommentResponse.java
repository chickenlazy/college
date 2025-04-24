package com.college.backend.college.project.response;

import com.college.backend.college.project.enums.CommentType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CommentResponse {
    private Integer id;
    private String content;
    private CommentType type;
    private Integer referenceId;
    private Date createdDate;
    private Date lastModifiedDate;
    private UserSummary user;
    private Integer parentId;
    private Integer replyCount;

    @NoArgsConstructor
    @AllArgsConstructor
    @Getter
    @Setter
    public static class UserSummary {
        private Integer id;
        private String fullName;
        private String username;
        private String email;
        private String position;
    }
}