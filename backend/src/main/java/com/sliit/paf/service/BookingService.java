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

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

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
        booking.setQrCode(UUID.randomUUID().toString());
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

    public Map<String, Object> getBookingStats() {
        List<Booking> all = bookingRepository.findAll();
        long totalBookings = all.size();
        long approvedBookings = all.stream().filter(b -> "APPROVED".equals(b.getStatus())).count();
        long checkedInCount = all.stream().filter(b -> Boolean.TRUE.equals(b.getCheckedIn())).count();
        long noShowCount = approvedBookings - checkedInCount;
        double usageRate = approvedBookings > 0 ? (checkedInCount * 100.0 / approvedBookings) : 0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBookings", totalBookings);
        stats.put("approvedBookings", approvedBookings);
        stats.put("checkedInCount", checkedInCount);
        stats.put("noShowCount", noShowCount);
        stats.put("usageRate", Math.round(usageRate * 10.0) / 10.0);
        return stats;
    }

    public Booking verifyBooking(String qrCode) {
        Booking booking = bookingRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid QR code"));

        if (!"APPROVED".equals(booking.getStatus())) {
            throw new ConflictException("Booking is not approved. Current status: " + booking.getStatus());
        }

        if (Boolean.TRUE.equals(booking.getCheckedIn())) {
            return booking;
        }

        booking.setCheckedIn(true);
        booking.setCheckedInTime(LocalDateTime.now());
        return bookingRepository.save(booking);
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
