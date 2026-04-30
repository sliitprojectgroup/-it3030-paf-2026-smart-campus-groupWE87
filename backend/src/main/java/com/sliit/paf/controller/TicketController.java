package com.sliit.paf.controller;

import com.sliit.paf.model.Ticket;
import com.sliit.paf.service.TicketService;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService ticketService;
    private static final String UPLOAD_DIR = "uploads";
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Ticket>> getTicketsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ticketService.getTicketsByUser(userId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Ticket> updateTicketStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String status = request.get("status");
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<Ticket> assignTechnician(
            @PathVariable Long id,
            @RequestBody Map<String, Long> request) {
        Long technicianId = request.get("technicianId");
        return ResponseEntity.ok(ticketService.assignTechnician(id, technicianId));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<Ticket> addResolutionNotes(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String resolutionNotes = request.get("resolutionNotes");
        return ResponseEntity.ok(ticketService.addResolutionNotes(id, resolutionNotes));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Ticket> rejectTicket(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String rejectionReason = request.get("rejectionReason");
        return ResponseEntity.ok(ticketService.rejectTicket(id, rejectionReason));
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<Ticket> closeTicket(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.closeTicket(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<?> uploadAttachments(
            @PathVariable Long id,
            @RequestParam("files") MultipartFile[] files) {
        
        if (files.length == 0 || files.length > 3) {
            return ResponseEntity.badRequest().body("Please upload between 1 and 3 files");
        }

        try {
            // Ensure upload directory exists
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            List<String> uploadedUrls = new ArrayList<>();

            for (MultipartFile file : files) {
                if (file.isEmpty()) {
                    continue;
                }

                // Validate file size
                if (file.getSize() > MAX_FILE_SIZE) {
                    return ResponseEntity.badRequest()
                            .body("File size exceeds 5MB limit: " + file.getOriginalFilename());
                }

                // Validate file type (images only)
                String contentType = file.getContentType();
                if (contentType == null || !contentType.startsWith("image/")) {
                    return ResponseEntity.badRequest()
                            .body("Only image files are allowed: " + file.getOriginalFilename());
                }

                // Generate unique filename
                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Path filePath = uploadPath.resolve(fileName);

                // Save file
                Files.write(filePath, file.getBytes());

                // Store URL (adjust based on your deployment setup)
                String fileUrl = "/uploads/" + fileName;
                uploadedUrls.add(fileUrl);

                // Add to ticket
                ticketService.addAttachments(id, fileUrl);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Attachments uploaded successfully");
            response.put("urls", uploadedUrls);
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("File upload failed: " + e.getMessage());
        }
    }
}

