package com.sliit.paf.controller;

import com.sliit.paf.model.Booking;
import com.sliit.paf.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

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
    public ResponseEntity<List<Booking>> getAllBookings() {
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
}
