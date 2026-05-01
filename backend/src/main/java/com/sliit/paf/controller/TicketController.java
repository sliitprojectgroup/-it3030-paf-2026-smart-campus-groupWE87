package com.sliit.paf.controller;

import com.sliit.paf.model.Ticket;
import com.sliit.paf.model.TicketAttachment;
import com.sliit.paf.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

import java.io.IOException;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@Valid @RequestBody Ticket ticket) {
        return new ResponseEntity<>(ticketService.createTicket(ticket), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<List<Ticket>> getTicketsByResource(@PathVariable Long resourceId) {
        return ResponseEntity.ok(ticketService.getTicketsByResourceId(resourceId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Ticket>> getTicketsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ticketService.getTicketsByUserId(userId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Ticket>> getTicketsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(ticketService.getTicketsByStatus(status));
    }

    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<Ticket>> getTicketsByPriority(@PathVariable String priority) {
        return ResponseEntity.ok(ticketService.getTicketsByPriority(priority));
    }

    @GetMapping("/assigned/{staffId}")
    public ResponseEntity<List<Ticket>> getTicketsAssignedTo(@PathVariable Long staffId) {
        return ResponseEntity.ok(ticketService.getTicketsByAssignedTo(staffId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(@PathVariable Long id, @Valid @RequestBody Ticket ticketDetails) {
        return ResponseEntity.ok(ticketService.updateTicket(id, ticketDetails));
    }

    @PutMapping("/{id}/status/{status}")
    public ResponseEntity<Ticket> updateTicketStatus(@PathVariable Long id, @PathVariable String status) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status));
    }

    @PutMapping("/{id}/assign/{staffId}")
    public ResponseEntity<Ticket> assignTicket(@PathVariable Long id, @PathVariable Long staffId) {
        return ResponseEntity.ok(ticketService.assignTicket(id, staffId));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Ticket> rejectTicket(@PathVariable Long id, @RequestParam String reason) {
        return ResponseEntity.ok(ticketService.rejectTicket(id, reason));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Ticket deleted successfully");
        return ResponseEntity.ok(response);
    }

    // Attachment endpoints
    @PostMapping("/{id}/attachments")
    public ResponseEntity<TicketAttachment> uploadAttachment(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            TicketAttachment attachment = ticketService.uploadAttachment(id, file);
            return new ResponseEntity<>(attachment, HttpStatus.CREATED);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{id}/attachments")
    public ResponseEntity<List<TicketAttachment>> getAttachments(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketAttachments(id));
    }

    @GetMapping("/attachment/{attachmentId}")
    public ResponseEntity<TicketAttachment> getAttachment(@PathVariable Long attachmentId) {
        return ResponseEntity.ok(ticketService.getAttachment(attachmentId));
    }

    @DeleteMapping("/attachment/{attachmentId}")
    public ResponseEntity<Map<String, String>> deleteAttachment(@PathVariable Long attachmentId) {
        ticketService.deleteAttachment(attachmentId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Attachment deleted successfully");
        return ResponseEntity.ok(response);
    }
}
