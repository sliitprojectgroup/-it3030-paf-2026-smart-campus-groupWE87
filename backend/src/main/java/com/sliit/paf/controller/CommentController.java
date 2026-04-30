package com.sliit.paf.controller;

import com.sliit.paf.model.Comment;
import com.sliit.paf.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<Comment> addComment(
            @PathVariable Long ticketId,
            @Valid @RequestBody Comment comment) {
        comment.setTicketId(ticketId);
        return new ResponseEntity<>(commentService.addComment(comment), HttpStatus.CREATED);
    }

    @GetMapping("/{ticketId}/comments")
    public ResponseEntity<List<Comment>> getCommentsByTicket(@PathVariable Long ticketId) {
        return ResponseEntity.ok(commentService.getCommentsByTicket(ticketId));
    }

    @PutMapping("/comments/{id}")
    public ResponseEntity<Comment> editComment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        String content = (String) request.get("content");
        Long userId = ((Number) request.get("userId")).longValue();
        return ResponseEntity.ok(commentService.editComment(id, content, userId));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @RequestParam Long userId) {
        commentService.deleteComment(id, userId);
        return ResponseEntity.noContent().build();
    }
}
