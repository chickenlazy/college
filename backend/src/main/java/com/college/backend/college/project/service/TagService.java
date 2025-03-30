package com.college.backend.college.project.service;

import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.response.TagResponse;

public interface TagService {
    // Phương thức để lấy tất cả tags với phân trang
    PagedResponse<TagResponse> getAllTags(int pageNo, int pageSize);

    // Phương thức để lấy tất cả tags với phân trang và tìm kiếm
    PagedResponse<TagResponse> getAllTags(int pageNo, int pageSize, String search);
}