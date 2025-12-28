package com.shopfy.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shopfy.backend.entity.ProfileUpdateRequest;
import com.shopfy.backend.entity.Role;
import com.shopfy.backend.entity.User;
import com.shopfy.backend.repository.ProfileUpdateRequestRepository;
import com.shopfy.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ProfileUpdateService {

    @Autowired
    private ProfileUpdateRequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public ProfileUpdateRequest createRequest(Long userId, Map<String, Map<String, String>> changes) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        ProfileUpdateRequest request = new ProfileUpdateRequest();
        request.setUser(user);
        request.setStatus(ProfileUpdateRequest.RequestStatus.PENDING);
        try {
            request.setChangeData(objectMapper.writeValueAsString(changes));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize change data", e);
        }

        ProfileUpdateRequest savedRequest = requestRepository.save(request);

        // Send notification to all admins
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        String fieldName = String.join(", ", changes.keySet());
        for (User admin : admins) {
            notificationService.sendProfileUpdateRequestNotification(admin, user, savedRequest.getRequestId(),
                    fieldName);
        }

        return savedRequest;
    }

    public List<ProfileUpdateRequest> getRequestsByUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return requestRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public ProfileUpdateRequest getRequestById(Long requestId) {
        return requestRepository.findById(requestId).orElseThrow(() -> new RuntimeException("Request not found"));
    }

    public List<ProfileUpdateRequest> getPendingRequests() {
        return requestRepository.findByStatusOrderByCreatedAtDesc(ProfileUpdateRequest.RequestStatus.PENDING);
    }

    public List<ProfileUpdateRequest> getRequestsByUserAndStatus(Long userId,
            ProfileUpdateRequest.RequestStatus status) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return requestRepository.findByUserAndStatus(user, status);
    }

    public ProfileUpdateRequest approveRequest(Long requestId) {
        ProfileUpdateRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (request.getStatus() != ProfileUpdateRequest.RequestStatus.PENDING) {
            throw new RuntimeException("Request is not pending");
        }

        User user = request.getUser();

        try {
            Map<String, Map<String, String>> changes = objectMapper.readValue(request.getChangeData(), Map.class);

            if (changes.containsKey("email")) {
                user.setEmail(changes.get("email").get("new"));
            }
            if (changes.containsKey("mobileNumber")) {
                user.setMobileNumber(changes.get("mobileNumber").get("new"));
            }
            // Add other fields here if needed

            userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Failed to apply changes", e);
        }

        request.setStatus(ProfileUpdateRequest.RequestStatus.APPROVED);
        ProfileUpdateRequest savedRequest = requestRepository.save(request);

        // Send notification to user
        try {
            Map<String, Map<String, String>> changes = objectMapper.readValue(request.getChangeData(), Map.class);
            String fieldName = String.join(", ", changes.keySet());
            notificationService.sendProfileUpdateResponseNotification(user, fieldName, true);
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }

        return savedRequest;
    }

    public ProfileUpdateRequest declineRequest(Long requestId, String comment) {
        ProfileUpdateRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (request.getStatus() != ProfileUpdateRequest.RequestStatus.PENDING) {
            throw new RuntimeException("Request is not pending");
        }

        request.setStatus(ProfileUpdateRequest.RequestStatus.DECLINED);
        request.setAdminComment(comment);
        ProfileUpdateRequest savedRequest = requestRepository.save(request);

        // Send notification to user
        try {
            Map<String, Map<String, String>> changes = objectMapper.readValue(request.getChangeData(), Map.class);
            String fieldName = String.join(", ", changes.keySet());
            notificationService.sendProfileUpdateResponseNotification(request.getUser(), fieldName, false);
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }

        return savedRequest;
    }
}
