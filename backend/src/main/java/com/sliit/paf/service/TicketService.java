package com.sliit.paf.service;

import com.sliit.paf.exception.ResourceNotFoundException;
import com.sliit.paf.model.Ticket;
import com.sliit.paf.model.TicketAttachment;
import com.sliit.paf.repository.TicketRepository;
import com.sliit.paf.repository.TicketAttachmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketAttachmentRepository attachmentRepository;

    public Ticket createTicket(Ticket ticket) {
        if (ticket.getStatus() == null || ticket.getStatus().isEmpty()) {
            ticket.setStatus("OPEN");
        }
        if (ticket.getPriority() == null || ticket.getPriority().isEmpty()) {
            ticket.setPriority("MEDIUM");
        }
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

    public List<Ticket> getTicketsByUserId(Long userId) {
        return ticketRepository.findByUserId(userId);
    }

    public List<Ticket> getTicketsByStatus(String status) {
        return ticketRepository.findByStatus(status);
    }

    public List<Ticket> getTicketsByAssignedTo(Long staffId) {
        return ticketRepository.findByAssignedTo(staffId);
    }

    public List<Ticket> getTicketsByPriority(String priority) {
        return ticketRepository.findByPriority(priority);
    }

    public Ticket updateTicketStatus(Long id, String newStatus) {
        Ticket ticket = getTicketById(id);
        ticket.setStatus(newStatus);
        return ticketRepository.save(ticket);
    }

    public Ticket assignTicket(Long ticketId, Long staffId) {
        Ticket ticket = getTicketById(ticketId);
        ticket.setAssignedTo(staffId);
        ticket.setStatus("IN_PROGRESS");
        return ticketRepository.save(ticket);
    }

    public Ticket rejectTicket(Long ticketId, String reason) {
        Ticket ticket = getTicketById(ticketId);
        ticket.setStatus("REJECTED");
        ticket.setRejectionReason(reason);
        return ticketRepository.save(ticket);
    }

    public Ticket updateTicket(Long id, Ticket ticketDetails) {
        Ticket ticket = getTicketById(id);
        
        if (ticketDetails.getDescription() != null) {
            ticket.setDescription(ticketDetails.getDescription());
        }
        if (ticketDetails.getStatus() != null) {
            ticket.setStatus(ticketDetails.getStatus());
        }
        if (ticketDetails.getPriority() != null) {
            ticket.setPriority(ticketDetails.getPriority());
        }
        if (ticketDetails.getAssignedTo() != null) {
            ticket.setAssignedTo(ticketDetails.getAssignedTo());
        }
        if (ticketDetails.getContactName() != null) {
            ticket.setContactName(ticketDetails.getContactName());
        }
        if (ticketDetails.getContactPhone() != null) {
            ticket.setContactPhone(ticketDetails.getContactPhone());
        }
        if (ticketDetails.getContactEmail() != null) {
            ticket.setContactEmail(ticketDetails.getContactEmail());
        }
        
        return ticketRepository.save(ticket);
    }

    public void deleteTicket(Long id) {
        Ticket ticket = getTicketById(id);
        ticketRepository.delete(ticket);
    }

    public TicketAttachment uploadAttachment(Long ticketId, MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate file type - only images allowed
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        // Check attachment count - max 3 per ticket
        Ticket ticket = getTicketById(ticketId);
        long attachmentCount = attachmentRepository.findByTicketId(ticketId).size();
        if (attachmentCount >= 3) {
            throw new IllegalArgumentException("Maximum 3 attachments allowed per ticket");
        }

        TicketAttachment attachment = new TicketAttachment();
        attachment.setTicket(ticket);
        attachment.setFileName(file.getOriginalFilename());
        attachment.setFileType(contentType);
        attachment.setFileSize(file.getSize());
        attachment.setFileData(file.getBytes());

        return attachmentRepository.save(attachment);
    }

    public TicketAttachment getAttachment(Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found with ID: " + attachmentId));
    }

    public List<TicketAttachment> getTicketAttachments(Long ticketId) {
        return attachmentRepository.findByTicketId(ticketId);
    }

    public void deleteAttachment(Long attachmentId) {
        TicketAttachment attachment = getAttachment(attachmentId);
        attachmentRepository.delete(attachment);
    }
}
