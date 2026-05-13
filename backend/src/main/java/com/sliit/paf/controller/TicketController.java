package com.sliit.paf.controller;

import com.sliit.paf.model.Ticket;
import com.sliit.paf.model.TicketComment;
import com.sliit.paf.model.TicketAttachment;
import com.sliit.paf.service.TicketService;
import com.sliit.paf.dto.CreateTicketRequest;
import com.sliit.paf.dto.TicketResponse;
import com.sliit.paf.dto.TicketCommentResponse;
import com.sliit.paf.dto.AddCommentRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService ticketService;
    private final String uploadDir = "uploads/tickets";

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@Valid @RequestBody CreateTicketRequest request) {
        Ticket ticket = new Ticket();
        ticket.setResourceId(request.getResourceId());
        ticket.setCategory(request.getCategory());
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setPreferredContact(request.getPreferredContact());
        ticket.setCreatedBy(request.getCreatedBy());
        return new ResponseEntity<>(ticketService.createTicket(ticket), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<List<Ticket>> getTicketsByResource(@PathVariable Long resourceId) {
        return ResponseEntity.ok(ticketService.getTicketsByResource(resourceId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Ticket>> getTicketsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ticketService.getTicketsByUser(userId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Ticket>> getTicketsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(ticketService.getTicketsByStatus(status));
    }

    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<List<Ticket>> getTicketsAssignedToTechnician(@PathVariable Long technicianId) {
        return ResponseEntity.ok(ticketService.getTicketsAssignedToTechnician(technicianId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(@PathVariable Long id, @Valid @RequestBody Ticket ticket) {
        return ResponseEntity.ok(ticketService.updateTicket(id, ticket));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Ticket> updateTicketStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<Ticket> assignTechnician(@PathVariable Long id, @RequestParam Long technicianId) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, technicianId));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Ticket> rejectTicket(@PathVariable Long id, @RequestParam String reason) {
        return ResponseEntity.ok(ticketService.rejectTicket(id, reason));
    }

    // Comments endpoints
    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketComment> addComment(@PathVariable Long id, 
                                                     @RequestParam Long userId,
                                                     @Valid @RequestBody AddCommentRequest request) {
        return new ResponseEntity<>(ticketService.addComment(id, userId, request.getContent()), HttpStatus.CREATED);
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketCommentResponse>> getTicketComments(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketComments(id));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<TicketComment> updateComment(@PathVariable Long commentId,
                                                        @RequestParam Long userId,
                                                        @Valid @RequestBody AddCommentRequest request) {
        return ResponseEntity.ok(ticketService.updateComment(commentId, userId, request.getContent()));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId, @RequestParam Long userId) {
        ticketService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }

    // Attachment endpoints
    @PostMapping("/{id}/attachments")
    public ResponseEntity<TicketAttachment> uploadAttachment(@PathVariable Long id,
                                                             @RequestParam("file") MultipartFile file) {
        try {
            // Create upload directory if not exists
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);

            // Generate unique filename
            String originalFileName = file.getOriginalFilename();
            String fileExtension = originalFileName != null ? 
                    originalFileName.substring(originalFileName.lastIndexOf(".")) : "";
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

            // Save file
            Path filePath = uploadPath.resolve(uniqueFileName);
            Files.write(filePath, file.getBytes());

            // Save to database
            TicketAttachment attachment = ticketService.uploadAttachment(
                    id,
                    originalFileName,
                    filePath.toString(),
                    file.getContentType(),
                    file.getSize()
            );
            return new ResponseEntity<>(attachment, HttpStatus.CREATED);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/attachments")
    public ResponseEntity<?> getTicketAttachments(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketAttachments(id));
    }

    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long attachmentId) {
        ticketService.deleteAttachment(attachmentId);
        return ResponseEntity.noContent().build();
    }
}
