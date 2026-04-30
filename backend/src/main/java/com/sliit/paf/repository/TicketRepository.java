package com.sliit.paf.repository;

import com.sliit.paf.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByResourceId(Long resourceId);
    List<Ticket> findByUserId(Long userId);
    List<Ticket> findByStatus(String status);
    List<Ticket> findByAssignedTo(Long userId);
    List<Ticket> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Ticket> findAllByOrderByCreatedAtDesc();
}
