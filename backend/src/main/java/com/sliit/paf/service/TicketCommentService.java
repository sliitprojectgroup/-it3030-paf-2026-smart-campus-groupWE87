package com.sliit.paf.service;

import com.sliit.paf.dto.CreateCommentRequest;
import com.sliit.paf.dto.TicketCommentResponse;
import com.sliit.paf.exception.ResourceNotFoundException;
import com.sliit.paf.model.Ticket;
import com.sliit.paf.model.TicketComment;
import com.sliit.paf.repository.TicketCommentRepository;
import com.sliit.paf.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TicketCommentService {

    private final TicketCommentRepository commentRepository;
    private final TicketRepository ticketRepository;

    public TicketComment addComment(Long ticketId, CreateCommentRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + ticketId));

        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setUserId(request.getUserId());
        comment.setUserName(request.getUserName());
        comment.setContent(request.getContent());

        return commentRepository.save(comment);
    }

    public List<TicketComment> getTicketComments(Long ticketId) {
        return commentRepository.findByTicketId(ticketId);
    }

    public TicketComment updateComment(Long commentId, String newContent, Long userId) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with ID: " + commentId));

        // Only owner or admin can edit
        if (!comment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You can only edit your own comments");
        }

        comment.setContent(newContent);
        return commentRepository.save(comment);
    }

    public void deleteComment(Long commentId, Long userId) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with ID: " + commentId));

        // Only owner can delete own comment (admin override handled at controller
        // level)
        if (!comment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    public void deleteCommentAsAdmin(Long commentId) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with ID: " + commentId));
        commentRepository.delete(comment);
    }

    public List<TicketCommentResponse> convertToResponses(List<TicketComment> comments) {
        return comments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private TicketCommentResponse convertToResponse(TicketComment comment) {
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
