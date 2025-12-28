package com.shopfy.backend.repository;

import com.shopfy.backend.entity.SupportTicket;
import com.shopfy.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findByUserOrderByUpdatedAtDesc(User user);

    List<SupportTicket> findAllByOrderByUpdatedAtDesc(); // For Admin
}
