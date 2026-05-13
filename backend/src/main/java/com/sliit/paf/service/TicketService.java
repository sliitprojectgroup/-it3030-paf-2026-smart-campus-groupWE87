package com.sliit.paf.service;

import com.sliit.paf.exception.ResourceNotFoundException;
import com.sliit.paf.exception.ConflictException;
import com.sliit.paf.model.Ticket;
import com.sliit.paf.model.TicketAttachment;
import com.sliit.paf.model.TicketComment;
import com.sliit.paf.dto.TicketResponse;
import com.sliit.paf.dto.TicketAttachmentResponse;
import com.sliit.paf.dto.TicketCommentResponse;
import com.sliit.paf.repository.TicketRepository;
import com.sliit.paf.repository.TicketAttachmentRepository;
import com.sliit.paf.repository.TicketCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final TicketCommentRepository commentRepository;

    // Create ticket
    public Ticket createTicket(Ticket ticket) {
        if (ticket.getStatus() == null || ticket.getStatus().isEmpty()) {
            ticket.setStatus("OPEN");
        }
        return ticketRepository.save(ticket);
    }

    // Get all tickets
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    // Get ticket by ID with attachments and comments
    public TicketResponse getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + id));
        return convertToResponse(ticket);
    }

    // Get tickets by resource
    public List<Ticket> getTicketsByResource(Long resourceId) {
        return ticketRepository.findByResourceId(resourceId);
    }

    // Get tickets by user (created by)
    public List<Ticket> getTicketsByUser(Long userId) {
        return ticketRepository.findByCreatedBy(userId);
    }

    // Get tickets by status
    public List<Ticket> getTicketsByStatus(String status) {
        return ticketRepository.findByStatus(status);
    }

    // Get tickets assigned to technician
    public List<Ticket> getTicketsAssignedToTechnician(Long technicianId) {
        return ticketRepository.findByAssignedTechnician(technicianId);
    }

    // Update ticket
    public Ticket updateTicket(Long id, Ticket ticketUpdates) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + id));

        if (ticketUpdates.getCategory() != null) {
            ticket.setCategory(ticketUpdates.getCategory());
        }
        if (ticketUpdates.getTitle() != null) {
            ticket.setTitle(ticketUpdates.getTitle());
        }
        if (ticketUpdates.getDescription() != null) {
            ticket.setDescription(ticketUpdates.getDescription());
        }
        if (ticketUpdates.getPriority() != null) {
            ticket.setPriority(ticketUpdates.getPriority());
        }
        if (ticketUpdates.getPreferredContact() != null) {
            ticket.setPreferredContact(ticketUpdates.getPreferredContact());
        }
        if (ticketUpdates.getResolutionNotes() != null) {
            ticket.setResolutionNotes(ticketUpdates.getResolutionNotes());
        }

        return ticketRepository.save(ticket);
    }

    // Update ticket status with workflow validation
    public Ticket updateTicketStatus(Long id, String newStatus) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + id));

        String currentStatus = ticket.getStatus();

        // Validate status transition
        validateStatusTransition(currentStatus, newStatus);

        ticket.setStatus(newStatus);
        return ticketRepository.save(ticket);
    }

    // Validate status transitions
    private void validateStatusTransition(String currentStatus, String newStatus) {
        if (currentStatus.equals(newStatus)) {
            return; // No change
        }

        boolean validTransition = false;

        switch (currentStatus) {
            case "OPEN":
                validTransition = newStatus.equals("IN_PROGRESS") || newStatus.equals("REJECTED");
                break;
            case "IN_PROGRESS":
                validTransition = newStatus.equals("RESOLVED") || newStatus.equals("REJECTED");
                break;
            case "RESOLVED":
                validTransition = newStatus.equals("CLOSED");
                break;
            case "REJECTED":
            case "CLOSED":
                validTransition = false;
                break;
        }

        if (!validTransition) {
            throw new ConflictException(
                    String.format("Invalid status transition from %s to %s", currentStatus, newStatus));
        }
    }

    // Assign technician
    public Ticket assignTechnician(Long id, Long technicianId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + id));

        ticket.setAssignedTechnician(technicianId);
        return ticketRepository.save(ticket);
    }

    // Reject ticket with reason
    public Ticket rejectTicket(Long id, String reason) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + id));

        validateStatusTransition(ticket.getStatus(), "REJECTED");
        ticket.setStatus("REJECTED");
        ticket.setRejectionReason(reason);
        return ticketRepository.save(ticket);
    }

    // Add comment
    public TicketComment addComment(Long ticketId, Long userId, String content) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Ticket not found with ID: " + ticketId);
        }

        TicketComment comment = new TicketComment();
        comment.setTicketId(ticketId);
        comment.setUserId(userId);
        comment.setContent(content);
        return commentRepository.save(comment);
    }

    // Update comment (owner only)
    public TicketComment updateComment(Long commentId, Long userId, String content) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with ID: " + commentId));

        if (!comment.getUserId().equals(userId)) {
            throw new SecurityException("You can only edit your own comments");
        }

        comment.setContent(content);
        return commentRepository.save(comment);
    }

    // Delete comment (owner only)
    public void deleteComment(Long commentId, Long userId) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with ID: " + commentId));

        if (!comment.getUserId().equals(userId)) {
            throw new SecurityException("You can only delete your own comments");
        }

        commentRepository.deleteById(commentId);
    }

    // Get comments for ticket
    public List<TicketCommentResponse> getTicketComments(Long ticketId) {
        return commentRepository.findByTicketId(ticketId)
                .stream()
                .map(this::convertCommentToResponse)
                .collect(Collectors.toList());
    }

    // Upload attachment
    public TicketAttachment uploadAttachment(Long ticketId, String fileName, String filePath,
            String fileType, Long fileSize) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Ticket not found with ID: " + ticketId);
        }

        // Validate max 3 attachments
        List<TicketAttachment> existingAttachments = attachmentRepository.findByTicketId(ticketId);
        if (existingAttachments.size() >= 3) {
            throw new ConflictException("Maximum 3 attachments allowed per ticket");
        }

        // Validate file type (images only)
        if (!isValidImageType(fileType)) {
            throw new ConflictException("Only image files are allowed");
        }

        TicketAttachment attachment = new TicketAttachment();
        attachment.setTicketId(ticketId);
        attachment.setFileName(fileName);
        attachment.setFilePath(filePath);
        attachment.setFileType(fileType);
        attachment.setFileSize(fileSize);
        return attachmentRepository.save(attachment);
    }

    // Get attachments for ticket
    public List<TicketAttachmentResponse> getTicketAttachments(Long ticketId) {
        return attachmentRepository.findByTicketId(ticketId)
                .stream()
                .map(this::convertAttachmentToResponse)
                .collect(Collectors.toList());
    }

    // Delete attachment
    public void deleteAttachment(Long attachmentId) {
        if (!attachmentRepository.existsById(attachmentId)) {
            throw new ResourceNotFoundException("Attachment not found with ID: " + attachmentId);
        }
        attachmentRepository.deleteById(attachmentId);
    }

    // Helper method to validate image file type
    private boolean isValidImageType(String fileType) {
        return fileType != null && (fileType.equals("image/jpeg") ||
                fileType.equals("image/jpg") ||
                fileType.equals("image/png") ||
                fileType.equals("image/gif") ||
                fileType.equals("image/webp"));
    }

    // Convert to DTO response
    private TicketResponse convertToResponse(Ticket ticket) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setResourceId(ticket.getResourceId());
        response.setCategory(ticket.getCategory());
        response.setTitle(ticket.getTitle());
        response.setDescription(ticket.getDescription());
        response.setPriority(ticket.getPriority());
        response.setPreferredContact(ticket.getPreferredContact());
        response.setStatus(ticket.getStatus());
        response.setCreatedBy(ticket.getCreatedBy());
        response.setAssignedTechnician(ticket.getAssignedTechnician());
        response.setResolutionNotes(ticket.getResolutionNotes());
        response.setRejectionReason(ticket.getRejectionReason());
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());

        // Get attachments and comments
        response.setAttachments(getTicketAttachments(ticket.getId()));
        response.setComments(getTicketComments(ticket.getId()));

        return response;
    }

    private TicketAttachmentResponse convertAttachmentToResponse(TicketAttachment attachment) {
        return new TicketAttachmentResponse(
                attachment.getId(),
                attachment.getFileName(),
                attachment.getFilePath(),
                attachment.getFileType(),
                attachment.getFileSize());
    }

    private TicketCommentResponse convertCommentToResponse(TicketComment comment) {
        return new TicketCommentResponse(
                comment.getId(),
                comment.getUserId(),
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getUpdatedAt());
    }
}
