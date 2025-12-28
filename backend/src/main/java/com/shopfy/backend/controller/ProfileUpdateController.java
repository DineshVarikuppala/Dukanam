package com.shopfy.backend.controller;

import com.shopfy.backend.entity.ProfileUpdateRequest;
import com.shopfy.backend.service.ProfileUpdateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profile-requests")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileUpdateController {

    @Autowired
    private ProfileUpdateService profileUpdateService;

    @PostMapping("/{userId}")
    public ResponseEntity<ProfileUpdateRequest> createRequest(@PathVariable Long userId,
            @RequestBody Map<String, Map<String, String>> changes) {
        try {
            System.out.println("Received request for userId: " + userId);
            System.out.println("Changes: " + changes);
            ProfileUpdateRequest request = profileUpdateService.createRequest(userId, changes);
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            System.err.println("Error creating profile update request: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProfileUpdateRequest>> getUserRequests(@PathVariable Long userId) {
        return ResponseEntity.ok(profileUpdateService.getRequestsByUser(userId));
    }

    @GetMapping("/user/{userId}/pending")
    public ResponseEntity<List<ProfileUpdateRequest>> getUserPendingRequests(@PathVariable Long userId) {
        return ResponseEntity.ok(
                profileUpdateService.getRequestsByUserAndStatus(userId, ProfileUpdateRequest.RequestStatus.PENDING));
    }

    @GetMapping("/{requestId}")
    public ResponseEntity<ProfileUpdateRequest> getRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(profileUpdateService.getRequestById(requestId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ProfileUpdateRequest>> getPendingRequests() {
        return ResponseEntity.ok(profileUpdateService.getPendingRequests());
    }

    @PutMapping("/{requestId}/approve")
    public ResponseEntity<ProfileUpdateRequest> approveRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(profileUpdateService.approveRequest(requestId));
    }

    @PutMapping("/{requestId}/decline")
    public ResponseEntity<ProfileUpdateRequest> declineRequest(@PathVariable Long requestId,
            @RequestBody(required = false) Map<String, String> body) {
        String comment = body != null ? body.get("comment") : null;
        return ResponseEntity.ok(profileUpdateService.declineRequest(requestId, comment));
    }
}
