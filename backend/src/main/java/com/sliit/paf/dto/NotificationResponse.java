package com.sliit.paf.dto;

import com.sliit.paf.model.Notification;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        Long recipientId,
        Long userId,
        String title,
        String message,
        String type,
        Long referenceId,
        String referenceType,
        boolean read,
        boolean readStatus,
        LocalDateTime createdAt
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getRecipient().getId(),
                notification.getRecipient().getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.getReferenceId(),
                notification.getReferenceType(),
                notification.isRead(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}
