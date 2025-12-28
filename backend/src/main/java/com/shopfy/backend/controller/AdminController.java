package com.shopfy.backend.controller;

import com.shopfy.backend.entity.User;
import com.shopfy.backend.entity.Role;
import com.shopfy.backend.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            Map<String, List<Map<String, Object>>> usersByRole = adminService.getUsersByRole();
            return ResponseEntity.ok(usersByRole);
        } catch (Exception e) {
            System.err.println("Error in getAllUsers: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch users: " + e.getMessage()));
        }
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserDetails(@PathVariable Long userId) {
        try {
            Map<String, Object> userDetails = adminService.getUserDetails(userId);
            return ResponseEntity.ok(userDetails);
        } catch (Exception e) {
            System.err.println("Error in getUserDetails: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch user details: " + e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        try {
            Map<String, Object> stats = adminService.getOverallStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("Error in getStats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch stats: " + e.getMessage()));
        }
    }
}
