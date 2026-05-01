package com.sliit.paf.service;

import com.sliit.paf.exception.ConflictException;
import com.sliit.paf.exception.ResourceNotFoundException;
import com.sliit.paf.model.Booking;
import com.sliit.paf.model.Resource;
import com.sliit.paf.repository.BookingRepository;
import com.sliit.paf.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
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
        if (booking.getCheckedIn() == null) {
            booking.setCheckedIn(false);
        }
        Booking saved = bookingRepository.save(booking);

        sendBookingNotification(() -> notificationService.notifyBookingCreated(
                saved.getUserId(), saved.getId(), resource.getName()));
        sendBookingNotification(() -> notificationService.notifyAdminsBookingCreated(
                saved.getUserId(), saved.getId(), resource.getName()));
        return saved;
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

        sendBookingNotification(() -> notificationService.notifyBookingApproved(
                booking.getUserId(), id, getResourceNameForNotification(booking)));
        return saved;
    }

    public Booking rejectBooking(Long id, String reason) {
        Booking booking = getBookingByIdOrThrow(id);
        booking.setStatus("REJECTED");
        booking.setAdminReason(reason);
        Booking saved = bookingRepository.save(booking);

        sendBookingNotification(() -> notificationService.notifyBookingRejected(
                booking.getUserId(), id, getResourceNameForNotification(booking), reason));
        return saved;
    }

    public Booking cancelBooking(Long id) {
        Booking booking = getBookingByIdOrThrow(id);
        booking.setStatus("CANCELLED");
        Booking saved = bookingRepository.save(booking);

        sendBookingNotification(() -> notificationService.notifyBookingCancelled(
                booking.getUserId(), id, getResourceNameForNotification(booking)));
        return saved;
    }

    private String getResourceNameForNotification(Booking booking) {
        return resourceRepository.findById(booking.getResourceId())
                .map(Resource::getName)
                .orElse("Resource #" + booking.getResourceId());
    }

    private void sendBookingNotification(Runnable notificationAction) {
        try {
            notificationAction.run();
        } catch (RuntimeException ex) {
            log.warn("Booking status updated, but notification could not be created: {}", ex.getMessage());
        }
    }

    private Booking getBookingByIdOrThrow(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
    }
}
