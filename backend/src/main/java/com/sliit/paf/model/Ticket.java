package com.sliit.paf.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotNull
    private Long resourceId;

    @Column(nullable = false)
    @NotNull
    private Long userId; // ID of the user who reported the issue

    @Column(nullable = false)
    @NotBlank
    private String category; // e.g., ELECTRICAL, PLUMBING, HVAC, IT, FURNITURE, OTHER

    @Column(nullable = false)
    @NotBlank
    private String description;

    @Column(nullable = false)
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(nullable = false)
    private String status; // OPEN, IN_PROGRESS, RESOLVED

    @Column(nullable = true)
    private Long assignedTo; // ID of technician/staff member assigned to this ticket

    @Column(nullable = true)
    private String contactName;

    @Column(nullable = true)
    private String contactPhone;

    @Column(nullable = true)
    private String contactEmail;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = true, columnDefinition = "TEXT")
    private String rejectionReason; // Reason for rejection (if status = REJECTED)

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TicketAttachment> attachments;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TicketComment> comments;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null || status.isEmpty()) {
            status = "OPEN";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
