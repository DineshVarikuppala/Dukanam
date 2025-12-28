package com.shopfy.backend.controller;

import com.shopfy.backend.dto.AuthResponse;
import com.shopfy.backend.dto.LoginRequest;
import com.shopfy.backend.dto.OtpRequest;
import com.shopfy.backend.dto.RegisterRequest;
import com.shopfy.backend.entity.User;
import com.shopfy.backend.service.AuthService;
import com.shopfy.backend.service.LoginSessionService;
import com.shopfy.backend.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private OtpService otpService;

    @Autowired
    private AuthService authService;

    @Autowired
    private LoginSessionService loginSessionService;

    @PostMapping("/send-otp")
    public String sendOtp(@RequestBody OtpRequest request) {
        otpService.generateAndSendOtp(request.getContactInfo());
        return "OTP Sent";
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.ok(authService.register(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress,
            @RequestHeader(value = "User-Agent", required = false) String userAgent) {
        try {
            AuthResponse response = authService.login(request);
            // Record login session
            loginSessionService.recordLogin(response.getUserId(), ipAddress, userAgent);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        try {
            User user = authService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/user/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @RequestBody Map<String, String> updates) {
        try {
            User updatedUser = authService.updateUser(userId, updates);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
