package com.sliit.paf.repository;

import com.sliit.paf.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTicketId(Long ticketId);
    List<Comment> findByUserIdAndTicketId(Long userId, Long ticketId);
}
