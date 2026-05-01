package com.sliit.paf.service;

import com.sliit.paf.exception.ResourceNotFoundException;
import com.sliit.paf.model.Ticket;
import com.sliit.paf.model.TicketComment;
import com.sliit.paf.repository.TicketRepository;
import com.sliit.paf.repository.TicketCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketCommentService {

    private final TicketCommentRepository commentRepository;
    private final TicketRepository ticketRepository;

    public TicketComment addComment(Long ticketId, TicketComment comment) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + ticketId));
        
        comment.setTicket(ticket);
        return commentRepository.save(comment);
    }

    public List<TicketComment> getTicketComments(Long ticketId) {
        // Verify ticket exists
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Ticket not found with ID: " + ticketId);
        }
        return commentRepository.findByTicketIdOrderByCreatedAtDesc(ticketId);
    }

    public TicketComment getCommentById(Long commentId) {
        return commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with ID: " + commentId));
    }

    public TicketComment updateComment(Long commentId, String newContent, Long userId) {
        TicketComment comment = getCommentById(commentId);
        
        // Only allow user who created the comment to edit it
        if (!comment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You can only edit your own comments");
        }
        
        comment.setContent(newContent);
        return commentRepository.save(comment);
    }

    public void deleteComment(Long commentId, Long userId) {
        TicketComment comment = getCommentById(commentId);
        
        // Only allow user who created the comment to delete it
        if (!comment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own comments");
        }
        
        commentRepository.delete(comment);
    }

    public List<TicketComment> getUserComments(Long userId) {
        return commentRepository.findByUserId(userId);
    }
}
