package com.sliit.paf.controller;

import com.sliit.paf.dto.CreateTicketRequest;
import com.sliit.paf.dto.CreateCommentRequest;
import com.sliit.paf.dto.TicketResponse;
import com.sliit.paf.dto.TicketAttachmentResponse;
import com.sliit.paf.dto.TicketCommentResponse;
import com.sliit.paf.model.Ticket;
import com.sliit.paf.model.TicketAttachment;
import com.sliit.paf.model.TicketComment;
import com.sliit.paf.service.TicketService;
import com.sliit.paf.service.TicketCommentService;
import com.sliit.paf.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService ticketService;
    private final TicketCommentService commentService;
    private final FileUploadService fileUploadService;

    // ==================== TICKET CRUD ====================

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(@Valid @RequestBody CreateTicketRequest request) {
        Ticket ticket = ticketService.createTicket(request);
        return new ResponseEntity<>(convertToResponse(ticket), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        List<Ticket> tickets = ticketService.getAllTickets();
        return ResponseEntity.ok(tickets.stream().map(this::convertToResponse).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long id) {
        Ticket ticket = ticketService.getTicketById(id);
        return ResponseEntity.ok(convertToResponse(ticket));
    }

    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<List<TicketResponse>> getTicketsByResource(@PathVariable Long resourceId) {
        List<Ticket> tickets = ticketService.getTicketsByResourceId(resourceId);
        return ResponseEntity.ok(tickets.stream().map(this::convertToResponse).collect(Collectors.toList()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TicketResponse>> getTicketsByUser(@PathVariable Long userId) {
        List<Ticket> tickets = ticketService.getTicketsByCreatedBy(userId);
        return ResponseEntity.ok(tickets.stream().map(this::convertToResponse).collect(Collectors.toList()));
    }

    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<List<TicketResponse>> getTicketsByTechnician(@PathVariable Long technicianId) {
        List<Ticket> tickets = ticketService.getTicketsByAssignedTechnician(technicianId);
        return ResponseEntity.ok(tickets.stream().map(this::convertToResponse).collect(Collectors.toList()));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<TicketResponse>> getTicketsByStatus(@PathVariable String status) {
        List<Ticket> tickets = ticketService.getTicketsByStatus(status);
        return ResponseEntity.ok(tickets.stream().map(this::convertToResponse).collect(Collectors.toList()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== STATUS & ASSIGNMENT ====================

    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTechnician(
            @PathVariable Long id,
            @RequestParam Long technicianId) {
        Ticket ticket = ticketService.assignTechnician(id, technicianId);
        return ResponseEntity.ok(convertToResponse(ticket));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String notes) {
        Ticket ticket = ticketService.updateTicketStatus(id, status, notes);
        return ResponseEntity.ok(convertToResponse(ticket));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<TicketResponse> rejectTicket(
            @PathVariable Long id,
            @RequestParam String reason) {
        Ticket ticket = ticketService.rejectTicket(id, reason);
        return ResponseEntity.ok(convertToResponse(ticket));
    }

    // ==================== ATTACHMENTS ====================

    @PostMapping("/{id}/attachments")
    public ResponseEntity<TicketAttachmentResponse> uploadAttachment(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            TicketAttachment attachment = fileUploadService.uploadAttachment(id, file);
            return new ResponseEntity<>(convertAttachmentToResponse(attachment), HttpStatus.CREATED);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}/attachments")
    public ResponseEntity<List<TicketAttachmentResponse>> getAttachments(@PathVariable Long id) {
        Ticket ticket = ticketService.getTicketById(id);
        return ResponseEntity.ok(
                ticket.getAttachments().stream()
                        .map(this::convertAttachmentToResponse)
                        .collect(Collectors.toList()));
    }

    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long attachmentId) {
        try {
            fileUploadService.deleteAttachment(attachmentId);
            return ResponseEntity.noContent().build();
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/attachments/{attachmentId}/download")
    public ResponseEntity<byte[]> downloadAttachment(@PathVariable Long attachmentId) {
        try {
            byte[] fileContent = fileUploadService.downloadAttachment(attachmentId);
            return ResponseEntity.ok(fileContent);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ==================== COMMENTS ====================

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketCommentResponse> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CreateCommentRequest request) {
        TicketComment comment = commentService.addComment(id, request);
        return new ResponseEntity<>(convertCommentToResponse(comment), HttpStatus.CREATED);
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketCommentResponse>> getComments(@PathVariable Long id) {
        List<TicketComment> comments = commentService.getTicketComments(id);
        return ResponseEntity.ok(
                comments.stream()
                        .map(this::convertCommentToResponse)
                        .collect(Collectors.toList()));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<TicketCommentResponse> updateComment(
            @PathVariable Long commentId,
            @RequestParam String content,
            @RequestParam Long userId) {
        TicketComment comment = commentService.updateComment(commentId, content, userId);
        return ResponseEntity.ok(convertCommentToResponse(comment));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @RequestParam Long userId) {
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/comments/{commentId}/admin")
    public ResponseEntity<Void> deleteCommentAsAdmin(@PathVariable Long commentId) {
        commentService.deleteCommentAsAdmin(commentId);
        return ResponseEntity.noContent().build();
    }

    // ==================== RESPONSE CONVERSION HELPERS ====================

    private TicketResponse convertToResponse(Ticket ticket) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setCategory(ticket.getCategory());
        response.setDescription(ticket.getDescription());
        response.setResourceId(ticket.getResourceId());
        response.setPriority(ticket.getPriority());
        response.setStatus(ticket.getStatus());
        response.setPreferredContact(ticket.getPreferredContact());
        response.setCreatedBy(ticket.getCreatedBy());
        response.setAssignedTechnician(ticket.getAssignedTechnician());
        response.setResolutionNotes(ticket.getResolutionNotes());
        response.setRejectionReason(ticket.getRejectionReason());
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());
        response.setAttachments(
                ticket.getAttachments().stream()
                        .map(this::convertAttachmentToResponse)
                        .collect(Collectors.toList()));
        response.setComments(
                ticket.getComments().stream()
                        .map(this::convertCommentToResponse)
                        .collect(Collectors.toList()));
        return response;
    }

    private TicketAttachmentResponse convertAttachmentToResponse(TicketAttachment attachment) {
        return new TicketAttachmentResponse(
                attachment.getId(),
                attachment.getFileName(),
                attachment.getFilePath(),
                attachment.getFileSize(),
                attachment.getMimeType(),
                attachment.getUploadedAt());
    }

    private TicketCommentResponse convertCommentToResponse(TicketComment comment) {
        return new TicketCommentResponse(
                comment.getId(),
                comment.getUserId(),
                comment.getUserName(),
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getUpdatedAt(),
                comment.getIsEdited());
    }
}
