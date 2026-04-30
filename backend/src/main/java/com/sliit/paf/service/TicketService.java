package com.sliit.paf.service;

import com.sliit.paf.exception.ResourceNotFoundException;
import com.sliit.paf.model.Ticket;
import com.sliit.paf.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;

    public Ticket createTicket(Ticket ticket) {
        if (ticket.getStatus() == null || ticket.getStatus().isEmpty()) {
            ticket.setStatus("OPEN");
        }
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc();
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + id));
    }

    public List<Ticket> getTicketsByUser(Long userId) {
        return ticketRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Ticket> getTicketsByStatus(String status) {
        return ticketRepository.findByStatus(status);
    }

    public Ticket updateTicketStatus(Long id, String status) {
        Ticket ticket = getTicketById(id);
        ticket.setStatus(status);
        return ticketRepository.save(ticket);
    }

    public Ticket assignTechnician(Long id, Long technicianId) {
        Ticket ticket = getTicketById(id);
        ticket.setAssignedTo(technicianId);
        ticket.setStatus("IN_PROGRESS");
        return ticketRepository.save(ticket);
    }

    public Ticket addResolutionNotes(Long id, String resolutionNotes) {
        Ticket ticket = getTicketById(id);
        ticket.setResolutionNotes(resolutionNotes);
        ticket.setStatus("RESOLVED");
        return ticketRepository.save(ticket);
    }

    public Ticket rejectTicket(Long id, String rejectionReason) {
        Ticket ticket = getTicketById(id);
        ticket.setRejectionReason(rejectionReason);
        ticket.setStatus("REJECTED");
        return ticketRepository.save(ticket);
    }

    public Ticket closeTicket(Long id) {
        Ticket ticket = getTicketById(id);
        ticket.setStatus("CLOSED");
        return ticketRepository.save(ticket);
    }

    public void deleteTicket(Long id) {
        if (!ticketRepository.existsById(id)) {
            throw new ResourceNotFoundException("Ticket not found with ID: " + id);
        }
        ticketRepository.deleteById(id);
    }

    public Ticket addAttachments(Long id, String attachmentUrl) {
        Ticket ticket = getTicketById(id);
        if (ticket.getAttachments() == null) {
            ticket.setAttachments(attachmentUrl);
        } else {
            ticket.setAttachments(ticket.getAttachments() + "," + attachmentUrl);
        }
        return ticketRepository.save(ticket);
    }
}
