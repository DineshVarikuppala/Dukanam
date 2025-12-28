package com.shopfy.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.Duration;

@Entity
@Table(name = "login_sessions")
@Data
public class LoginSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long sessionId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime loginTime;

    @Column
    private LocalDateTime logoutTime;

    @Column
    private String ipAddress;

    @Column
    private String userAgent;

    // Calculate duration in seconds
    public Long getDurationInSeconds() {
        if (logoutTime == null) {
            // Session still active, calculate duration until now
            return Duration.between(loginTime, LocalDateTime.now()).getSeconds();
        }
        return Duration.between(loginTime, logoutTime).getSeconds();
    }

    // Format duration as HH:MM:SS
    public String getFormattedDuration() {
        Long seconds = getDurationInSeconds();
        long hours = seconds / 3600;
        long minutes = (seconds % 3600) / 60;
        long secs = seconds % 60;
        return String.format("%02d:%02d:%02d", hours, minutes, secs);
    }

    public boolean isActive() {
        return logoutTime == null;
    }
}
