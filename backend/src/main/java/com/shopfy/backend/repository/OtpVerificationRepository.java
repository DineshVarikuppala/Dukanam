package com.shopfy.backend.repository;

import com.shopfy.backend.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findByContactInfoAndOtpCode(String contactInfo, String otpCode);
}
