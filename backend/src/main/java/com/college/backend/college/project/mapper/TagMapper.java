package com.college.backend.college.project.mapper;

import com.college.backend.college.project.entity.Tag;
import com.college.backend.college.project.request.TagRequest;
import com.college.backend.college.project.response.TagResponse;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface TagMapper {
    TagMapper INSTANCE = Mappers.getMapper(TagMapper.class);

    TagResponse tagToTagRes(Tag tag);
    Tag tagReqToTag(TagRequest tagRequest);
}
