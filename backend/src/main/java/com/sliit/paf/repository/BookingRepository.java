package com.sliit.paf.repository;

import com.sliit.paf.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    List<Booking> findByStatus(String status);
    List<Booking> findByResourceIdAndDate(Long resourceId, LocalDate date);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.resourceId = :resourceId AND b.date = :date " +
           "AND b.status IN ('PENDING', 'APPROVED') " +
           "AND (b.startTime < :endTime AND b.endTime > :startTime)")
    boolean existsConflict(@Param("resourceId") Long resourceId, 
                           @Param("date") LocalDate date, 
                           @Param("startTime") LocalTime startTime, 
                           @Param("endTime") LocalTime endTime);
}
