package com.shopfy.backend.dto;

import com.shopfy.backend.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token; // For now, maybe just a session ID or dummy string if JWT not fully set up
    private String message;
    private String userName;
    private Role role;
    private Long userId;
    private Long storeId;
}
