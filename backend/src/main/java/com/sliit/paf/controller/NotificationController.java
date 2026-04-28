package com.sliit.paf.controller;

import com.sliit.paf.model.Notification;
import com.sliit.paf.service.NotificationService;
import lombok.RequiredArgsConstructor;
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
@CrossOrigin(origins = "http://localhost:5173") // Vite dev server
public class NotificationController {

    private final NotificationService notificationService;

    // GET /api/notifications?userId=5
    @GetMapping
    public ResponseEntity<List<Notification>> getAll(@RequestParam Long userId) {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userId));
    }

    // GET /api/notifications/unread?userId=5
    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnread(@RequestParam Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotificationsForUser(userId));
    }

    // GET /api/notifications/count?userId=5  → { "count": 3 }
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestParam Long userId) {
        return ResponseEntity.ok(Map.of("count", notificationService.countUnread(userId)));
    }

    // PUT /api/notifications/5/read?userId=12
    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id,
                                                    @RequestParam Long userId) {
        return ResponseEntity.ok(notificationService.markAsRead(id, userId));
    }

    // PUT /api/notifications/read-all?userId=12
    @PutMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(@RequestParam Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    // DELETE /api/notifications/5?userId=12
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id,
                                                       @RequestParam Long userId) {
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.ok(Map.of("message", "Notification deleted"));
    }
}