package com.sliit.paf.service;

import com.sliit.paf.exception.ResourceNotFoundException;
import com.sliit.paf.model.Comment;
import com.sliit.paf.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;

    public Comment addComment(Comment comment) {
        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsByTicket(Long ticketId) {
        return commentRepository.findByTicketId(ticketId);
    }

    public Comment getCommentById(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with ID: " + id));
    }

    public Comment editComment(Long id, String content, Long userId) {
        Comment comment = getCommentById(id);
        
        // Check if the user is the owner of the comment
        if (!comment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Only the comment owner can edit this comment");
        }
        
        comment.setContent(content);
        return commentRepository.save(comment);
    }

    public void deleteComment(Long id, Long userId) {
        Comment comment = getCommentById(id);
        
        // Check if the user is the owner of the comment
        if (!comment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Only the comment owner can delete this comment");
        }
        
        commentRepository.deleteById(id);
    }
}
