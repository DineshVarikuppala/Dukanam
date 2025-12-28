package com.shopfy.backend.dto;

import com.shopfy.backend.entity.Role;
import lombok.Data;

@Data
public class OtpRequest {
    private String contactInfo;
    private Role role;
}
