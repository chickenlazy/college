package com.college.backend.college.project.service.impl;

import com.college.backend.college.project.request.EmailRequest;
import com.college.backend.college.project.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
public class EmailServiceImpl implements EmailService {
    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void sendSimpleEmail(EmailRequest emailRequest) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(emailRequest.getTo());
        message.setSubject(emailRequest.getSubject());
        message.setText(emailRequest.getBody());

        mailSender.send(message);
    }

    @Override
    public void sendEmailWithHtml(EmailRequest emailRequest) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(emailRequest.getTo());
            helper.setSubject(emailRequest.getSubject());
            helper.setText(emailRequest.getBody(), true); // true để sử dụng HTML

            // Thêm header để giảm khả năng vào spam
            message.addHeader("List-Unsubscribe", "<http://localhost:3000//unsubscribe?email=" + emailRequest.getTo() + ">");
            message.addHeader("Precedence", "bulk");

            mailSender.send(message);
        } catch (MessagingException e) {
            // Log lỗi và xử lý ngoại lệ
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Override
    public void sendEmailWithAttachment(EmailRequest emailRequest, String attachment) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(emailRequest.getTo());
        helper.setSubject(emailRequest.getSubject());
        helper.setText(emailRequest.getBody());

        FileSystemResource file = new FileSystemResource(new File(attachment));
        helper.addAttachment(file.getFilename(), file);

        mailSender.send(message);
    }
}
