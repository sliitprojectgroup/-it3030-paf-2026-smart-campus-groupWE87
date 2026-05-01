package com.sliit.paf.repository;

import com.sliit.paf.model.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {
    List<TicketComment> findByTicketIdOrderByCreatedAtDesc(Long ticketId);
    
    List<TicketComment> findByTicketId(Long ticketId);
    
    List<TicketComment> findByUserId(Long userId);
}
