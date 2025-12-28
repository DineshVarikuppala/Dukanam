package com.shopfy.backend.repository;

import com.shopfy.backend.entity.SupportMessage;
import com.shopfy.backend.entity.SupportTicket;
import com.shopfy.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupportMessageRepository extends JpaRepository<SupportMessage, Long> {
    List<SupportMessage> findByTicketOrderByTimestampAsc(SupportTicket ticket);

    long countByTicketAndSenderNotAndIsReadFalse(SupportTicket ticket, User sender);

    List<SupportMessage> findByTicketAndSenderNotAndIsReadFalse(SupportTicket ticket, User sender);
}
