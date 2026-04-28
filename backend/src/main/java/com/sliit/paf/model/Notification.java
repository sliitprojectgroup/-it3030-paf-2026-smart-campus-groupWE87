package com.sliit.paf.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The user who receives this notification
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User recipient;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    // BOOKING_APPROVED, BOOKING_REJECTED, BOOKING_CANCELLED,
    // TICKET_STATUS_CHANGED, TICKET_COMMENT_ADDED, TICKET_ASSIGNED
    @Column(nullable = false)
    private String type;

    // Optional reference to the related entity (bookingId or ticketId)
    private Long referenceId;

    // "BOOKING" or "TICKET"
    private String referenceType;

    @Column(nullable = false)
    private boolean read = false;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}