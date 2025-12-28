package com.shopfy.backend.service;

import com.shopfy.backend.dto.AuthResponse;
import com.shopfy.backend.dto.LoginRequest;
import com.shopfy.backend.dto.RegisterRequest;
import com.shopfy.backend.entity.User;
import com.shopfy.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpService otpService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.shopfy.backend.repository.StoreRepository storeRepository;

    public AuthResponse register(RegisterRequest request) {
        // 1. Verify OTP (Sent to Email)
        boolean isOtpValid = otpService.verifyOtp(request.getEmail(), request.getOtp());
        if (!isOtpValid) {
            throw new RuntimeException("Invalid or Expired OTP");
        }

        // 2. Check if user exists (Email OR Mobile)
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        if (userRepository.findByMobileNumber(request.getMobileNumber()).isPresent()) {
            throw new RuntimeException("Mobile number already registered");
        }

        // 3. Create User
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setMobileNumber(request.getMobileNumber());
        user.setRole(request.getRole());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user = userRepository.save(user);

        return new AuthResponse("dummy-jwt-token", "Registration Successful", user.getFullName(), user.getRole(),
                user.getUserId(), null);
    }

    public AuthResponse login(LoginRequest request) {
        // 1. Find User by Email OR Mobile
        User user = userRepository.findByEmailOrMobileNumber(request.getContactInfo())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Check Password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        Long storeId = null;
        if (user.getRole() == com.shopfy.backend.entity.Role.STORE_OWNER) {
            java.util.Optional<com.shopfy.backend.entity.Store> store = storeRepository.findByOwner(user);
            if (store.isPresent()) {
                storeId = store.get().getStoreId();
            }
        }

        return new AuthResponse("dummy-jwt-token", "Login Successful", user.getFullName(), user.getRole(),
                user.getUserId(), storeId);
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateUser(Long userId, java.util.Map<String, String> updates) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.containsKey("firstName")) {
            user.setFirstName(updates.get("firstName"));
        }
        if (updates.containsKey("lastName")) {
            user.setLastName(updates.get("lastName"));
        }
        if (updates.containsKey("emailNotificationsEnabled")) {
            user.setEmailNotificationsEnabled(Boolean.parseBoolean(updates.get("emailNotificationsEnabled")));
        }

        return userRepository.save(user);
    }
}
