package com.college.backend.college.project.service.impl;

import com.college.backend.college.project.entity.Tag;
import com.college.backend.college.project.mapper.TagMapper;
import com.college.backend.college.project.repository.TagRepository;
import com.college.backend.college.project.response.PagedResponse;
import com.college.backend.college.project.response.TagResponse;
import com.college.backend.college.project.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;

    @Autowired
    public TagServiceImpl(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<TagResponse> getAllTags(int pageNo, int pageSize) {
        return getAllTags(pageNo, pageSize, null);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<TagResponse> getAllTags(int pageNo, int pageSize, String search) {
        // Tạo Pageable để phân trang
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize); // pageNo - 1 vì Spring Data JPA bắt đầu từ 0

        // Tạo Specification để tìm kiếm
        Specification<Tag> spec = Specification.where(null);

        // Thêm điều kiện tìm kiếm theo tên nếu có
        if (StringUtils.hasText(search)) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.like(
                            criteriaBuilder.lower(root.get("name")),
                            "%" + search.toLowerCase() + "%"
                    )
            );
        }

        // Truy vấn tags từ repository với điều kiện tìm kiếm
        Page<Tag> tagPage = tagRepository.findAll(spec, pageable);

        // Chuyển đổi các Tag thành TagResponse sử dụng TagMapper
        List<TagResponse> tagResponses = tagPage.getContent().stream()
                .map(TagMapper.INSTANCE::tagToTagRes)
                .collect(Collectors.toList());

        // Tạo và trả về PagedResponse
        return new PagedResponse<>(
                tagResponses,
                pageNo,
                pageSize,
                tagPage.getTotalElements(),
                tagPage.getTotalPages(),
                tagPage.isLast()
        );
    }
}