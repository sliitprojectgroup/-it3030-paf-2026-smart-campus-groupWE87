package com.sliit.paf.repository;

import com.sliit.paf.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Get all notifications for a user, newest first
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long userId);

    // Get only unread notifications for a user
    List<Notification> findByRecipientIdAndReadFalseOrderByCreatedAtDesc(Long userId);

    // Count unread notifications (used for the bell badge in UI)
    long countByRecipientIdAndReadFalse(Long userId);

    // Mark all notifications as read for a user
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.recipient.id = :userId AND n.read = false")
    void markAllAsReadByUserId(Long userId);
}