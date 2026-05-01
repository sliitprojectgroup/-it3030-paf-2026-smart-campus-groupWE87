package com.sliit.paf.repository;

import com.sliit.paf.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByResourceId(Long resourceId);
    
    List<Ticket> findByUserId(Long userId);
    
    List<Ticket> findByStatus(String status);
    
    List<Ticket> findByAssignedTo(Long staffId);
    
    List<Ticket> findByPriority(String priority);
    
    @Query("SELECT t FROM Ticket t WHERE t.resourceId = :resourceId AND t.status = :status")
    List<Ticket> findByResourceAndStatus(@Param("resourceId") Long resourceId, @Param("status") String status);
    
    @Query("SELECT t FROM Ticket t WHERE t.userId = :userId AND t.status = :status")
    List<Ticket> findByUserAndStatus(@Param("userId") Long userId, @Param("status") String status);
}
