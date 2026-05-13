package com.sliit.paf.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {

    private Long id;
    private Long resourceId;
    private String category;
    private String title;
    private String description;
    private String priority;
    private String preferredContact;
    private String status;
    private Long createdBy;
    private Long assignedTechnician;
    private String resolutionNotes;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TicketAttachmentResponse> attachments;
    private List<TicketCommentResponse> comments;
}
