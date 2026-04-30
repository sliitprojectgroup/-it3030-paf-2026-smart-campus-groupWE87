package com.sliit.paf.dto;

import com.sliit.paf.model.Notification;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        Long recipientId,
        String title,
        String message,
        String type,
        Long referenceId,
        String referenceType,
        boolean read,
        LocalDateTime createdAt
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getRecipient().getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.getReferenceId(),
                notification.getReferenceType(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}
