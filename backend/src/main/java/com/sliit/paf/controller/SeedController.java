package com.sliit.paf.controller;

import com.sliit.paf.model.Booking;
import com.sliit.paf.model.Resource;
import com.sliit.paf.repository.BookingRepository;
import com.sliit.paf.repository.ResourceRepository;
import com.sliit.paf.repository.TicketRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/seed")
@CrossOrigin(origins = "*") 
public class SeedController {

    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;

    public SeedController(ResourceRepository resourceRepository, BookingRepository bookingRepository, TicketRepository ticketRepository) {
        this.resourceRepository = resourceRepository;
        this.bookingRepository = bookingRepository;
        this.ticketRepository = ticketRepository;
    }

    @PostMapping("/refresh")
    public ResponseEntity<String> refreshDatabase() {
        // 1. Delete all existing related data
        ticketRepository.deleteAll();
        bookingRepository.deleteAll();
        resourceRepository.deleteAll();

        // 2. Re-seed fresh data
        doSeedResources();
        doSeedBookings();

        return ResponseEntity.ok("Database reset and seeded successfully");
    }

    @PostMapping("/resources")
    public ResponseEntity<String> seedResources() {
        if (resourceRepository.count() > 0) {
            return ResponseEntity.ok("Resource data already exists.");
        }
        doSeedResources();
        return ResponseEntity.ok("Seeded 10 resources successfully.");
    }

    @PostMapping("/bookings")
    public ResponseEntity<String> seedBookings() {
        if (bookingRepository.count() > 0) {
            return ResponseEntity.ok("Data already exists");
        }
        if (resourceRepository.count() == 0) {
            return ResponseEntity.badRequest().body("No resources found. Please seed resources first.");
        }
        doSeedBookings();
        return ResponseEntity.ok("Seeded 30 bookings successfully.");
    }

    @DeleteMapping("/reset")
    public ResponseEntity<String> resetBookings() {
        bookingRepository.deleteAll();
        return ResponseEntity.ok("All bookings deleted successfully.");
    }

    // --- Helper Methods ---

    private void doSeedResources() {
        List<Resource> resources = new ArrayList<>();
        resources.add(new Resource(null, "Lecture Hall A", "ROOM", 200, "ACTIVE"));
        resources.add(new Resource(null, "Computer Lab 3", "LAB", 40, "ACTIVE"));
        resources.add(new Resource(null, "Projector Kit 1", "EQUIPMENT", 1, "ACTIVE"));
        resources.add(new Resource(null, "Meeting Room B", "ROOM", 15, "ACTIVE"));
        resources.add(new Resource(null, "Chemistry Lab 1", "LAB", 30, "ACTIVE"));
        resources.add(new Resource(null, "VR Headset Set", "EQUIPMENT", 5, "ACTIVE"));
        resources.add(new Resource(null, "Auditorium Main", "ROOM", 500, "ACTIVE"));
        resources.add(new Resource(null, "Physics Lab 2", "LAB", 35, "ACTIVE"));
        resources.add(new Resource(null, "Camera Sony A7", "EQUIPMENT", 1, "ACTIVE"));
        resources.add(new Resource(null, "Study Room 101", "ROOM", 4, "ACTIVE"));

        resourceRepository.saveAll(resources);
    }

    private void doSeedBookings() {
        List<Resource> allResources = resourceRepository.findAll();
        if (allResources.isEmpty()) return;

        List<Booking> bookings = new ArrayList<>();
        Random random = new Random();
        
        String[] purposes = {
            "Lecture", "Group Study", "Meeting", "Lab Work", 
            "Exam Prep", "Guest Lecture", "Equipment Testing"
        };
        
        for (int i = 0; i < 30; i++) {
            Resource randomResource = allResources.get(random.nextInt(allResources.size()));
            
            // Dates spread across past and future
            int dayOffset = random.nextInt(21) - 5;
            LocalDate date = LocalDate.now().plusDays(dayOffset);
            
            // Valid time ranges
            int startHour = 8 + random.nextInt(9);
            LocalTime startTime = LocalTime.of(startHour, 0);
            LocalTime endTime = startTime.plusHours(1 + random.nextInt(3)); // endTime > startTime
            
            String purpose = purposes[random.nextInt(purposes.length)];
            int attendees = 1 + random.nextInt(randomResource.getCapacity());
            
            int statusRoll = random.nextInt(100);
            String status;
            String adminReason = null;
            
            if (statusRoll < 40) {
                status = "PENDING";
            } else if (statusRoll < 80) {
                status = "APPROVED";
            } else {
                status = "REJECTED";
                adminReason = "Resource unavailable due to maintenance or schedule conflict.";
            }

            Booking booking = new Booking(
                null, 1L, randomResource.getId(), date, startTime, endTime, purpose, attendees, status, adminReason, java.time.LocalDateTime.now().minusDays(random.nextInt(5))
            );
            
            bookings.add(booking);
        }

        bookingRepository.saveAll(bookings);
    }
}
