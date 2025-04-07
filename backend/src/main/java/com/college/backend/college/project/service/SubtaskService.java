package com.college.backend.college.project.service;

import com.college.backend.college.project.request.SubtaskRequest;
import com.college.backend.college.project.response.ApiResponse;
import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.response.SubtaskResponse;

import java.util.List;

public interface SubtaskService {
    // Xóa subtask
    ApiResponse deleteSubtask(Integer subtaskId);

    // Chuyển đổi trạng thái subtask (hoàn thành/chưa hoàn thành)
    SubtaskResponse toggleSubtaskStatus(Integer subtaskId);

    SubtaskResponse createSubtask(SubtaskRequest subtaskRequest);

    List<SubtaskResponse> getSubtasksByAssignee(Integer userId);

    PagedResponse<SubtaskResponse> getSubtasksByAssigneeWithPagination(Integer userId, int pageNo, int pageSize);
}