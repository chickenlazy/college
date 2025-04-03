package com.college.backend.college.project.security;

import com.college.backend.college.project.entity.User;
import com.college.backend.college.project.enums.Role;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Collection;

@Component
public class UserSecurity {

    /**
     * Kiểm tra xem người dùng hiện tại có phải là chủ sở hữu tài khoản hoặc ADMIN không
     * @param userId ID của người dùng cần kiểm tra
     * @return true nếu người dùng hiện tại là chủ sở hữu tài khoản hoặc ADMIN
     */
    public boolean isUserOrAdmin(Integer userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        // Nếu người dùng là ADMIN, cho phép truy cập
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        boolean isAdmin = authorities.stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals(Role.ROLE_ADMIN.name()));

        if (isAdmin) {
            return true;
        }

        // Kiểm tra xem người dùng hiện tại có phải là chủ sở hữu tài khoản không
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            Integer currentUserId = ((User) principal).getId();
            return currentUserId.equals(userId);
        }

        return false;
    }
}