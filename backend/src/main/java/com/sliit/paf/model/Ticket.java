package com.sliit.paf.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

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
    @NotBlank
    @Size(min = 3, max = 100)
    private String category; // e.g., "MAINTENANCE", "IT_SUPPORT", "FACILITIES"

    @Column(nullable = false)
    @NotBlank
    @Size(min = 10, max = 500)
    private String description;

    @Column(nullable = false)
    @NotNull
    private Long resourceId;

    @Column(nullable = false)
    @NotBlank
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(nullable = false)
    @NotBlank
    private String status; // OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED

    @Column(nullable = false)
    @NotBlank
    private String preferredContact; // Email or phone number

    @Column(nullable = false)
    @NotNull
    private Long createdBy; // User ID who created the ticket

    @Column
    private Long assignedTechnician; // User ID of assigned technician/staff

    @Column(columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TicketAttachment> attachments = new ArrayList<>();

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TicketComment> comments = new ArrayList<>();

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
