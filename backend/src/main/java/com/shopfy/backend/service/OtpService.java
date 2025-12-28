package com.shopfy.backend.service;

import com.shopfy.backend.entity.OtpVerification;
import com.shopfy.backend.repository.OtpVerificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {

    @Autowired
    private OtpVerificationRepository otpRepository;

    @Autowired
    private org.springframework.mail.javamail.JavaMailSender mailSender;

    public void generateAndSendOtp(String contactInfo) {
        String otp = String.format("%04d", new Random().nextInt(10000));

        OtpVerification verification = new OtpVerification();
        verification.setContactInfo(contactInfo);
        verification.setOtpCode(otp);
        verification.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        otpRepository.save(verification);

        // Send Real OTP if email
        if (contactInfo.contains("@")) {
            sendEmailOtp(contactInfo, otp);
        } else {
            // Mock SMS
            System.out.println("OTP for " + contactInfo + ": " + otp);
        }
    }

    private void sendEmailOtp(String email, String otp) {
        try {
            org.springframework.mail.SimpleMailMessage message = new org.springframework.mail.SimpleMailMessage();
            message.setTo(email);
            message.setSubject("DUKANAM Login OTP");
            message.setText("Your DUKANAM LOGIN OTP is: " + otp);
            mailSender.send(message);
            System.out.println("Email sent to " + email);
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Failed to send email: " + e.getMessage());
        }
    }

    public boolean verifyOtp(String contactInfo, String otp) {
        Optional<OtpVerification> verificationOpt = otpRepository.findByContactInfoAndOtpCode(contactInfo, otp);
        if (verificationOpt.isPresent()) {
            OtpVerification verification = verificationOpt.get();
            if (!verification.isUsed() && verification.getExpiryTime().isAfter(LocalDateTime.now())) {
                verification.setUsed(true);
                otpRepository.save(verification);
                return true;
            }
        }
        return false;
    }

    // Public method for sending general emails (notifications, etc.)
    public void sendEmail(String email, String subject, String text) {
        try {
            org.springframework.mail.SimpleMailMessage message = new org.springframework.mail.SimpleMailMessage();
            message.setTo(email);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            System.out.println("Email sent to " + email);
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Failed to send email: " + e.getMessage());
        }
    }
}
