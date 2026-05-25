package com.sliit.paf.service;

import com.sliit.paf.dto.CreateTicketRequest;
import com.sliit.paf.dto.TicketResponse;
import com.sliit.paf.exception.ResourceNotFoundException;
import com.sliit.paf.model.Ticket;
import com.sliit.paf.repository.TicketRepository;
import com.sliit.paf.repository.TicketAttachmentRepository;
import com.sliit.paf.repository.TicketCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final TicketCommentRepository commentRepository;

    private static final Set<String> VALID_STATUSES = new HashSet<>(
            Arrays.asList("OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"));

    private static final Set<String> VALID_PRIORITIES = new HashSet<>(
            Arrays.asList("LOW", "MEDIUM", "HIGH", "CRITICAL"));

    // State transition rules
    private static final Set<String>[] TRANSITION_RULES = new Set[] {
            // From OPEN
            new HashSet<>(Arrays.asList("IN_PROGRESS", "REJECTED")),
            // From IN_PROGRESS
            new HashSet<>(Arrays.asList("RESOLVED", "REJECTED", "OPEN")),
            // From RESOLVED
            new HashSet<>(Arrays.asList("CLOSED", "REJECTED")),
            // From CLOSED
            new HashSet<>(Arrays.asList("REJECTED")),
            // From REJECTED
            new HashSet<>(Arrays.asList("OPEN"))
    };

    public Ticket createTicket(CreateTicketRequest request) {
        if (!VALID_PRIORITIES.contains(request.getPriority())) {
            throw new IllegalArgumentException("Invalid priority: " + request.getPriority());
        }

        Ticket ticket = new Ticket();
        ticket.setCategory(request.getCategory());
        ticket.setDescription(request.getDescription());
        ticket.setResourceId(request.getResourceId());
        ticket.setPriority(request.getPriority());
        ticket.setPreferredContact(request.getPreferredContact());
        ticket.setCreatedBy(request.getCreatedBy());
        ticket.setStatus("OPEN");

        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + id));
    }

    public List<Ticket> getTicketsByResourceId(Long resourceId) {
        return ticketRepository.findByResourceId(resourceId);
    }

    public List<Ticket> getTicketsByCreatedBy(Long userId) {
        return ticketRepository.findByCreatedBy(userId);
    }

    public List<Ticket> getTicketsByAssignedTechnician(Long technicianId) {
        return ticketRepository.findByAssignedTechnician(technicianId);
    }

    public List<Ticket> getTicketsByStatus(String status) {
        if (!VALID_STATUSES.contains(status)) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
        return ticketRepository.findByStatus(status);
    }

    public Ticket assignTechnician(Long ticketId, Long technicianId) {
        Ticket ticket = getTicketById(ticketId);
        ticket.setAssignedTechnician(technicianId);
        return ticketRepository.save(ticket);
    }

    public Ticket updateTicketStatus(Long ticketId, String newStatus, String notes) {
        if (!VALID_STATUSES.contains(newStatus)) {
            throw new IllegalArgumentException("Invalid status: " + newStatus);
        }

        Ticket ticket = getTicketById(ticketId);
        String currentStatus = ticket.getStatus();

        // Validate status transition
        if (!isValidTransition(currentStatus, newStatus)) {
            throw new IllegalArgumentException(
                    "Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        ticket.setStatus(newStatus);

        if (newStatus.equals("RESOLVED") && notes != null) {
            ticket.setResolutionNotes(notes);
        }

        return ticketRepository.save(ticket);
    }

    public Ticket rejectTicket(Long ticketId, String reason) {
        Ticket ticket = getTicketById(ticketId);

        // Can only reject from OPEN or IN_PROGRESS
        if (!ticket.getStatus().equals("OPEN") && !ticket.getStatus().equals("IN_PROGRESS")) {
            throw new IllegalArgumentException("Can only reject tickets in OPEN or IN_PROGRESS status");
        }

        ticket.setStatus("REJECTED");
        ticket.setRejectionReason(reason);
        return ticketRepository.save(ticket);
    }

    public void deleteTicket(Long ticketId) {
        Ticket ticket = getTicketById(ticketId);

        // Delete attachments and comments (cascade will handle this)
        commentRepository.deleteByTicketId(ticketId);
        attachmentRepository.deleteByTicketId(ticketId);

        ticketRepository.delete(ticket);
    }

    private boolean isValidTransition(String currentStatus, String newStatus) {
        if (currentStatus.equals(newStatus)) {
            return true;
        }

        int statusIndex = Arrays.asList("OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED")
                .indexOf(currentStatus);

        if (statusIndex < 0) {
            return false;
        }

        return TRANSITION_RULES[statusIndex].contains(newStatus);
    }
}
