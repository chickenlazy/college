package com.college.backend.college.project.repository;

import com.college.backend.college.project.entity.Notification;
import com.college.backend.college.project.enums.NotificationStatus;
import com.college.backend.college.project.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer>, JpaSpecificationExecutor<Notification> {

    // Tìm kiếm thông báo theo userId
    Page<Notification> findByUserId(Integer userId, Pageable pageable);

    // Tìm kiếm thông báo theo userId và status
    Page<Notification> findByUserIdAndStatus(Integer userId, NotificationStatus status, Pageable pageable);

    // Đếm số thông báo chưa đọc của một người dùng
    long countByUserIdAndStatus(Integer userId, NotificationStatus status);

    // Cập nhật trạng thái đã đọc cho tất cả thông báo của một người dùng
    @Modifying
    @Query("UPDATE Notification n SET n.status = :status, n.readDate = CURRENT_TIMESTAMP WHERE n.user.id = :userId AND n.status = com.college.backend.college.project.enums.NotificationStatus.UNREAD")
    int markAllAsRead(Integer userId, NotificationStatus status);

    // Tìm kiếm thông báo theo loại và reference ID
    List<Notification> findByTypeAndReferenceId(NotificationType type, Integer referenceId);
}