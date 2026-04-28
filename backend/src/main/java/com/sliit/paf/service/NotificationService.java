package com.sliit.paf.service;

import com.sliit.paf.model.Notification;
import com.sliit.paf.model.User;
import com.sliit.paf.repository.NotificationRepository;
import com.sliit.paf.repository.UserRepository;
import com.sliit.paf.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // ─── Core creation helper ─────────────────────────────────────────────────

    private Notification create(Long recipientId, String title, String message,
                                 String type, Long referenceId, String referenceType) {
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + recipientId));

        Notification n = new Notification();
        n.setRecipient(recipient);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setReferenceId(referenceId);
        n.setReferenceType(referenceType);
        n.setRead(false);

        // Also log to console for debugging / dev visibility
        System.out.printf("[NOTIFICATION] → %s | %s | %s%n", recipient.getEmail(), title, message);

        return notificationRepository.save(n);
    }

    // ─── Booking notifications ────────────────────────────────────────────────

    public void notifyBookingApproved(Long userId, Long bookingId, String resourceName) {
        create(userId,
                "Booking Approved ✅",
                "Your booking for \"" + resourceName + "\" has been approved.",
                "BOOKING_APPROVED", bookingId, "BOOKING");
    }

    public void notifyBookingRejected(Long userId, Long bookingId, String resourceName, String reason) {
        create(userId,
                "Booking Rejected ❌",
                "Your booking for \"" + resourceName + "\" was rejected. Reason: " + reason,
                "BOOKING_REJECTED", bookingId, "BOOKING");
    }

    public void notifyBookingCancelled(Long userId, Long bookingId, String resourceName) {
        create(userId,
                "Booking Cancelled",
                "Your booking for \"" + resourceName + "\" has been cancelled.",
                "BOOKING_CANCELLED", bookingId, "BOOKING");
    }

    // ─── Ticket notifications ─────────────────────────────────────────────────

    public void notifyTicketStatusChanged(Long userId, Long ticketId, String newStatus) {
        create(userId,
                "Ticket Status Updated",
                "Your ticket #" + ticketId + " status changed to: " + newStatus,
                "TICKET_STATUS_CHANGED", ticketId, "TICKET");
    }

    public void notifyTicketCommentAdded(Long userId, Long ticketId, String commenterName) {
        create(userId,
                "New Comment on Your Ticket",
                commenterName + " added a comment to ticket #" + ticketId,
                "TICKET_COMMENT_ADDED", ticketId, "TICKET");
    }

    public void notifyTicketAssigned(Long userId, Long ticketId) {
        create(userId,
                "Ticket Assigned to You",
                "You have been assigned to ticket #" + ticketId + ". Please review and update the status.",
                "TICKET_ASSIGNED", ticketId, "TICKET");
    }

    // ─── Query methods (used by NotificationController) ───────────────────────

    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotificationsForUser(Long userId) {
        return notificationRepository.findByRecipientIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    public long countUnread(Long userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    @Transactional
    public Notification markAsRead(Long notificationId, Long userId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
        // Security: only the owner can mark it read
        if (!n.getRecipient().getId().equals(userId)) {
            throw new SecurityException("Access denied to notification " + notificationId);
        }
        n.setRead(true);
        return notificationRepository.save(n);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
        if (!n.getRecipient().getId().equals(userId)) {
            throw new SecurityException("Access denied");
        }
        notificationRepository.delete(n);
    }
}