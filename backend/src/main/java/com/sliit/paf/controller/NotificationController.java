package com.sliit.paf.controller;

import com.sliit.paf.dto.NotificationResponse;
import com.sliit.paf.dto.NotificationRequest;
import com.sliit.paf.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Member 4 – Notification endpoints
 *
 *  GET    /api/notifications?userId={id}          → all notifications for user
 *  GET    /api/notifications/unread?userId={id}   → unread only
 *  GET    /api/notifications/count?userId={id}    → unread badge count
 *  PUT    /api/notifications/{id}/read?userId={uid} → mark single as read
 *  PUT    /api/notifications/read-all?userId={id}  → mark all as read
 *  DELETE /api/notifications/{id}?userId={uid}    → delete one notification
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class NotificationController {

    private final NotificationService notificationService;

    // POST /api/notifications
    @PostMapping
    public ResponseEntity<NotificationResponse> create(@Valid @RequestBody NotificationRequest request) {
        String title = request.title() == null || request.title().isBlank()
                ? "Notification"
                : request.title();
        String type = request.type() == null || request.type().isBlank()
                ? "GENERAL"
                : request.type();
        String referenceType = request.referenceType() == null || request.referenceType().isBlank()
                ? "SYSTEM"
                : request.referenceType();

        return new ResponseEntity<>(
                NotificationResponse.from(notificationService.createNotification(
                        request.userId(),
                        title,
                        request.message(),
                        type,
                        request.referenceId(),
                        referenceType
                )),
                HttpStatus.CREATED
        );
    }

    // GET /api/notifications?userId=5
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getAll(@RequestParam Long userId) {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userId)
                .stream()
                .map(NotificationResponse::from)
                .toList());
    }

    // GET /api/notifications/user/5
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> getAllByPath(@PathVariable Long userId) {
        return getAll(userId);
    }

    // GET /api/notifications/unread?userId=5
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnread(@RequestParam Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotificationsForUser(userId)
                .stream()
                .map(NotificationResponse::from)
                .toList());
    }

    // GET /api/notifications/count?userId=5  → { "count": 3 }
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestParam Long userId) {
        return ResponseEntity.ok(Map.of("count", notificationService.countUnread(userId)));
    }

    // PUT /api/notifications/5/read?userId=12
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id,
                                                           @RequestParam Long userId) {
        return ResponseEntity.ok(NotificationResponse.from(notificationService.markAsRead(id, userId)));
    }

    // PATCH /api/notifications/5/read
    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsReadForOwner(@PathVariable Long id) {
        return ResponseEntity.ok(NotificationResponse.from(notificationService.markAsRead(id)));
    }

    // PUT /api/notifications/read-all?userId=12
    @PutMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(@RequestParam Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    // DELETE /api/notifications/5?userId=12
    @DeleteMapping(value = "/{id}", params = "userId")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id,
                                                       @RequestParam Long userId) {
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.ok(Map.of("message", "Notification deleted"));
    }

    // DELETE /api/notifications/5
    @DeleteMapping(value = "/{id}", params = "!userId")
    public ResponseEntity<Void> deleteWithoutUser(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}
