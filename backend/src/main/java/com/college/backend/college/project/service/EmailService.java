package com.college.backend.college.project.service;

import com.college.backend.college.project.request.EmailRequest;

public interface EmailService {
    void sendSimpleEmail(EmailRequest emailRequest);
    void sendEmailWithHtml(EmailRequest emailRequest);
    void sendEmailWithAttachment(EmailRequest emailRequest, String attachment) throws Exception;
}
