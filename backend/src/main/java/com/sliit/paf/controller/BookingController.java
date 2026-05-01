package com.sliit.paf.controller;

import com.sliit.paf.model.Booking;
import com.sliit.paf.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody Booking booking) {
        return new ResponseEntity<>(bookingService.createBooking(booking), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getBookings(
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate date) {
        if (resourceId != null && date != null) {
            return ResponseEntity.ok(bookingService.getBookingsByResourceAndDate(resourceId, date));
        }
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getBookingsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(bookingService.getBookingsByUserId(userId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Booking>> getPendingBookings() {
        return ResponseEntity.ok(bookingService.getPendingBookings());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getBookingStats() {
        return ResponseEntity.ok(bookingService.getBookingStats());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Booking> approveBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.approveBooking(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Booking> rejectBooking(@PathVariable Long id, @RequestParam(required = false, defaultValue = "No reason provided") String reason) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, reason));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }

    @GetMapping("/verify/{qrCode}")
    public ResponseEntity<?> verifyBooking(@PathVariable String qrCode) {
        Booking booking = bookingService.verifyBooking(qrCode);
        if (Boolean.TRUE.equals(booking.getCheckedIn()) && booking.getCheckedInTime() != null) {
            boolean justCheckedIn = booking.getCheckedInTime().isAfter(java.time.LocalDateTime.now().minusSeconds(5));
            if (justCheckedIn) {
                return ResponseEntity.ok(booking);
            }
            return ResponseEntity.ok(java.util.Map.of(
                    "message", "Already checked in",
                    "checkedInTime", booking.getCheckedInTime().toString(),
                    "bookingId", booking.getId(),
                    "status", booking.getStatus()
            ));
        }
        return ResponseEntity.ok(booking);
    }
}
