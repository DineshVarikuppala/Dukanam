package com.shopfy.backend.service;

import com.shopfy.backend.entity.SupportMessage;
import com.shopfy.backend.entity.SupportTicket;
import com.shopfy.backend.entity.User;
import com.shopfy.backend.repository.SupportMessageRepository;
import com.shopfy.backend.repository.SupportTicketRepository;
import com.shopfy.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SupportService {

    @Autowired
    private SupportTicketRepository ticketRepository;

    @Autowired
    private SupportMessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public SupportTicket createTicket(Long userId, String subject) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SupportTicket ticket = new SupportTicket();
        ticket.setUser(user);
        ticket.setSubject(subject);
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        ticket.setStatus(SupportTicket.TicketStatus.OPEN);

        return ticketRepository.save(ticket);
    }

    public SupportMessage addMessage(Long ticketId, Long senderId, String content) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        SupportMessage message = new SupportMessage();
        message.setTicket(ticket);
        message.setSender(sender);
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());

        // Update ticket timestamp
        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);

        SupportMessage savedMessage = messageRepository.save(message);

        // If sender is NOT the ticket owner, notify the ticket owner (Customer)
        if (!ticket.getUser().getUserId().equals(senderId)) {
            String preview = content.length() > 30 ? content.substring(0, 27) + "..." : content;
            notificationService.sendSupportReplyNotification(ticket.getUser(), ticketId, preview);
        }

        return savedMessage;
    }

    public List<SupportTicket> getUserTickets(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<SupportTicket> tickets = ticketRepository.findByUserOrderByUpdatedAtDesc(user);

        // Populate unread count
        for (SupportTicket ticket : tickets) {
            long count = messageRepository.countByTicketAndSenderNotAndIsReadFalse(ticket, user);
            ticket.setUnreadCount(count);
        }
        return tickets;
    }

    public List<SupportTicket> getAllTickets() {
        return ticketRepository.findAllByOrderByUpdatedAtDesc();
    }

    public List<SupportMessage> getTicketMessages(Long ticketId) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        return messageRepository.findByTicketOrderByTimestampAsc(ticket);
    }

    public void markTicketAsRead(Long ticketId, Long userId) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<SupportMessage> unreadMessages = messageRepository.findByTicketAndSenderNotAndIsReadFalse(ticket, user);
        for (SupportMessage msg : unreadMessages) {
            msg.setRead(true);
            messageRepository.save(msg);
        }
    }
}
