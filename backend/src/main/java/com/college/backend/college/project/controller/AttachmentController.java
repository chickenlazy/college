package com.college.backend.college.project.controller;

import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.AttachmentResponse;
import com.college.backend.college.project.service.AttachmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/attachments")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AttachmentController {

    private final AttachmentService attachmentService;

    @Autowired
    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AttachmentResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("projectId") Integer projectId,
            @RequestParam("uploadedBy") Integer uploadedBy,
            @RequestParam(value = "description", required = false) String description) {

        AttachmentResponse response = attachmentService.uploadFile(projectId, uploadedBy, file, description);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttachmentResponse> getAttachmentById(@PathVariable Integer id) {
        AttachmentResponse response = attachmentService.getAttachmentById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<AttachmentResponse>> getAttachmentsByProjectId(@PathVariable Integer projectId) {
        List<AttachmentResponse> responses = attachmentService.getAttachmentsByProjectId(projectId);
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteAttachment(@PathVariable Integer id) {
        attachmentService.deleteAttachment(id);

        ApiResponse apiResponse = new ApiResponse(
                Boolean.TRUE,
                "Attachment deleted successfully");

        return new ResponseEntity<>(apiResponse, HttpStatus.OK);
    }
}