package com.shopfy.backend.controller;

import com.shopfy.backend.entity.SupportMessage;
import com.shopfy.backend.entity.SupportTicket;
import com.shopfy.backend.service.SupportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/support")
@CrossOrigin(origins = "*")
public class SupportController {

    @Autowired
    private SupportService supportService;

    @PostMapping("/tickets")
    public ResponseEntity<SupportTicket> createTicket(@RequestParam Long userId,
            @RequestParam(required = false) String subject) {
        return ResponseEntity.ok(supportService.createTicket(userId, subject));
    }

    @PostMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<SupportMessage> sendMessage(@PathVariable Long ticketId, @RequestParam Long senderId,
            @RequestBody Map<String, String> payload) {
        String content = payload.get("content");
        return ResponseEntity.ok(supportService.addMessage(ticketId, senderId, content));
    }

    @GetMapping("/tickets")
    public ResponseEntity<List<SupportTicket>> getTickets(@RequestParam(required = false) Long userId) {
        if (userId != null) {
            return ResponseEntity.ok(supportService.getUserTickets(userId));
        } else {
            // Admin: get all
            return ResponseEntity.ok(supportService.getAllTickets());
        }
    }

    @GetMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<List<SupportMessage>> getMessages(@PathVariable Long ticketId) {
        return ResponseEntity.ok(supportService.getTicketMessages(ticketId));
    }

    @PutMapping("/tickets/{ticketId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long ticketId, @RequestParam Long userId) {
        supportService.markTicketAsRead(ticketId, userId);
        return ResponseEntity.ok().build();
    }
}
