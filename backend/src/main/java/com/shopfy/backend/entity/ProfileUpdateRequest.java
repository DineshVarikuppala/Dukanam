package com.shopfy.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "profile_update_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String changeData; // JSON string like {"email": {"old": "a@b.com", "new": "x@y.com"}}

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.PENDING;

    private String adminComment;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum RequestStatus {
        PENDING,
        APPROVED,
        DECLINED
    }
}
