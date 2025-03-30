package com.college.backend.college.project.controller;

import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.response.TagResponse;
import com.college.backend.college.project.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tags")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class TagController {

    private final TagService tagService;

    @Autowired
    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    // Phương thức GET để lấy tất cả tags với phân trang và tìm kiếm
    @GetMapping
    public ResponseEntity<PagedResponse<TagResponse>> getAllTags(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String search) {

        // Gọi service để lấy dữ liệu phân trang với tìm kiếm
        PagedResponse<TagResponse> response = tagService.getAllTags(
                pageNo, pageSize, search);

        // Trả về response dưới dạng HTTP Response Entity
        return ResponseEntity.ok(response);
    }
}