package com.shopfy.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Column(nullable = false)
    private String message;

    private boolean isRead = false;

    private Long relatedOrderId;

    private Long relatedProfileRequestId;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
