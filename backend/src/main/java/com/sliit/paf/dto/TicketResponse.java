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
    private String category;
    private String description;
    private Long resourceId;
    private String priority;
    private String status;
    private String preferredContact;
    private Long createdBy;
    private Long assignedTechnician;
    private String resolutionNotes;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TicketAttachmentResponse> attachments;
    private List<TicketCommentResponse> comments;
}
