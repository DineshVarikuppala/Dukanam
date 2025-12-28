package com.shopfy.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_verifications")
@Data
public class OtpVerification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long otpId;

    @Column(nullable = false)
    private String contactInfo;

    @Column(nullable = false)
    private String otpCode;

    @Column(nullable = false)
    private LocalDateTime expiryTime;

    private boolean isUsed = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    // Role is needed to verify if the otp was requested for a specific role login,
    // though the requirement says "select role on login", usually OTP is tied to
    // contact.
    // We can just verify contact.
}
