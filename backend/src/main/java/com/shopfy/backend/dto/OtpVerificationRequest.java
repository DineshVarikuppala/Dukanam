package com.shopfy.backend.dto;

import com.shopfy.backend.entity.Role;
import lombok.Data;

@Data
public class OtpVerificationRequest {
    private String contactInfo;
    private String otp;
    private Role role;
}
