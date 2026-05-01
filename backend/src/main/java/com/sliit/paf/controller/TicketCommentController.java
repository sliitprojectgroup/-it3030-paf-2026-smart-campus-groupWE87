package com.sliit.paf.controller;

import com.sliit.paf.model.TicketComment;
import com.sliit.paf.service.TicketCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TicketCommentController {

    private final TicketCommentService commentService;

    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<TicketComment> addComment(
            @PathVariable Long ticketId,
            @Valid @RequestBody TicketComment comment) {
        return new ResponseEntity<>(commentService.addComment(ticketId, comment), HttpStatus.CREATED);
    }

    @GetMapping("/{ticketId}/comments")
    public ResponseEntity<List<TicketComment>> getTicketComments(@PathVariable Long ticketId) {
        return ResponseEntity.ok(commentService.getTicketComments(ticketId));
    }

    @GetMapping("/comment/{commentId}")
    public ResponseEntity<TicketComment> getComment(@PathVariable Long commentId) {
        return ResponseEntity.ok(commentService.getCommentById(commentId));
    }

    @PutMapping("/comment/{commentId}")
    public ResponseEntity<TicketComment> updateComment(
            @PathVariable Long commentId,
            @RequestBody Map<String, Object> body) {
        String newContent = (String) body.get("content");
        Long userId = ((Number) body.get("userId")).longValue();
        return ResponseEntity.ok(commentService.updateComment(commentId, newContent, userId));
    }

    @DeleteMapping("/comment/{commentId}")
    public ResponseEntity<Map<String, String>> deleteComment(
            @PathVariable Long commentId,
            @RequestParam Long userId) {
        commentService.deleteComment(commentId, userId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Comment deleted successfully");
        return ResponseEntity.ok(response);
    }
}
