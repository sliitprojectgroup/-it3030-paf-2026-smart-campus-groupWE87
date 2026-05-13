package com.sliit.paf.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

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
    @NotBlank
    private String category; // MAINTENANCE, IT, FACILITIES, etc.

    @Column(nullable = false)
    @NotBlank
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    @NotBlank
    private String description;

    @Column(nullable = false)
    @NotNull
    private String priority; // HIGH, MEDIUM, LOW

    @Column(nullable = false)
    @NotBlank
    private String preferredContact; // email, phone, etc.

    @Column(nullable = false)
    private String status; // OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED

    @Column(nullable = false)
    @NotNull
    private Long createdBy; // userId

    private Long assignedTechnician; // userId

    @Column(columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @PrePersist
    public void applyDefaults() {
        if (this.status == null || this.status.isEmpty()) {
            this.status = "OPEN";
        }
    }
}
