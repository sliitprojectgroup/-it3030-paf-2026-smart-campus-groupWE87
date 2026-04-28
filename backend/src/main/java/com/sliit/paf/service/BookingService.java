package com.sliit.paf.service;

import com.sliit.paf.exception.ConflictException;
import com.sliit.paf.exception.ResourceNotFoundException;
import com.sliit.paf.model.Booking;
import com.sliit.paf.model.Resource;
import com.sliit.paf.repository.BookingRepository;
import com.sliit.paf.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    public Booking createBooking(Booking booking) {
        // Validate resource exists and is ACTIVE
        Resource resource = resourceRepository.findById(booking.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        if (!"ACTIVE".equalsIgnoreCase(resource.getStatus())) {
            throw new ConflictException("Resource is currently OUT_OF_SERVICE");
        }

        // Check for time conflicts
        boolean hasConflict = bookingRepository.existsConflict(
                booking.getResourceId(), booking.getDate(), booking.getStartTime(), booking.getEndTime());

        if (hasConflict) {
            throw new ConflictException("Time slot already booked");
        }

        booking.setStatus("PENDING");
        System.out.println("Saving booking for user: " + booking.getUserId());
        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getPendingBookings() {
        return bookingRepository.findByStatus("PENDING");
    }

    public List<Booking> getBookingsByResourceAndDate(Long resourceId, java.time.LocalDate date) {
        return bookingRepository.findByResourceIdAndDate(resourceId, date);
    }

    public Booking approveBooking(Long id) {
        Booking booking = getBookingByIdOrThrow(id);
        booking.setStatus("APPROVED");
        Booking saved = bookingRepository.save(booking);
        
        Resource resource = resourceRepository.findById(booking.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
        notificationService.notifyBookingApproved(booking.getUserId(), id, resource.getName());
        return saved;
    }

    public Booking rejectBooking(Long id, String reason) {
        Booking booking = getBookingByIdOrThrow(id);
        booking.setStatus("REJECTED");
        booking.setAdminReason(reason);
        Booking saved = bookingRepository.save(booking);
        
        Resource resource = resourceRepository.findById(booking.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
        notificationService.notifyBookingRejected(booking.getUserId(), id, resource.getName(), reason);
        return saved;
    }

    public Booking cancelBooking(Long id) {
        Booking booking = getBookingByIdOrThrow(id);
        booking.setStatus("CANCELLED");
        Booking saved = bookingRepository.save(booking);
        
        Resource resource = resourceRepository.findById(booking.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
        notificationService.notifyBookingCancelled(booking.getUserId(), id, resource.getName());
        return saved;
    }

    private Booking getBookingByIdOrThrow(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
    }
}
