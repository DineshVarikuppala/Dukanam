package com.shopfy.backend.dto;

import com.shopfy.backend.entity.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String mobileNumber;
    private String password;
    private Role role;
    private String otp;
}
