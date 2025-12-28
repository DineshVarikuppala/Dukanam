package com.shopfy.backend.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String contactInfo;
    private String password;
}
