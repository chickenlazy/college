package com.college.backend.college.project.mapper;

import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.request.UserRequest;
import com.college.backend.college.project.response.UserResponse;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface UserMapper {
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    UserResponse userToUserRes(User user);
    User userReqToUser(UserRequest userRequest);
}
