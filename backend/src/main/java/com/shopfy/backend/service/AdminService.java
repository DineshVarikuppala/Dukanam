package com.shopfy.backend.service;

import com.shopfy.backend.entity.User;
import com.shopfy.backend.entity.Role;
import com.shopfy.backend.repository.UserRepository;
import com.shopfy.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    public Map<String, List<Map<String, Object>>> getUsersByRole() {
        List<User> allUsers = userRepository.findAll();

        Map<String, List<Map<String, Object>>> usersByRole = new HashMap<>();

        // Group users by role, excluding ADMIN users
        List<Map<String, Object>> customers = allUsers.stream()
                .filter(user -> user.getRole() == Role.CUSTOMER)
                .map(this::mapUserToDto)
                .collect(Collectors.toList());

        List<Map<String, Object>> storeOwners = allUsers.stream()
                .filter(user -> user.getRole() == Role.STORE_OWNER)
                .map(this::mapUserToDto)
                .collect(Collectors.toList());

        usersByRole.put("CUSTOMER", customers);
        usersByRole.put("STORE_OWNER", storeOwners);

        return usersByRole;
    }

    public Map<String, Object> getUserDetails(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> details = mapUserToDto(user);

        // Fetch full orders
        List<?> orders = new ArrayList<>();
        if (user.getRole() == Role.CUSTOMER) {
            orders = orderRepository.findByCustomerUserId(userId);
        } else if (user.getRole() == Role.STORE_OWNER) {
            orders = orderRepository.findByStoreOwnerUserId(userId);
        }
        details.put("orders", orders);

        return details;
    }

    public Map<String, Object> getOverallStats() {
        List<User> allUsers = userRepository.findAll();

        long totalCustomers = allUsers.stream()
                .filter(user -> user.getRole() == Role.CUSTOMER)
                .count();

        long totalStoreOwners = allUsers.stream()
                .filter(user -> user.getRole() == Role.STORE_OWNER)
                .count();

        long totalOrders = orderRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCustomers", totalCustomers);
        stats.put("totalStoreOwners", totalStoreOwners);
        stats.put("totalOrders", totalOrders);
        stats.put("totalUsers", totalCustomers + totalStoreOwners);

        return stats;
    }

    private Map<String, Object> mapUserToDto(User user) {
        Map<String, Object> userDto = new HashMap<>();
        userDto.put("userId", user.getUserId());
        userDto.put("firstName", user.getFirstName());
        userDto.put("lastName", user.getLastName());
        userDto.put("email", user.getEmail());
        userDto.put("mobileNumber", user.getMobileNumber());
        userDto.put("role", user.getRole().toString());

        // Get order count based on role
        long orderCount = 0;
        try {
            if (user.getRole() == Role.CUSTOMER) {
                // Count orders placed by customer
                orderCount = orderRepository.findByCustomerUserId(user.getUserId()).size();
            } else if (user.getRole() == Role.STORE_OWNER) {
                // Count orders received by store owner's stores
                orderCount = orderRepository.findByStoreOwnerUserId(user.getUserId()).size();
            }
        } catch (Exception e) {
            System.err.println("Error fetching order count for user " + user.getUserId() + ": " + e.getMessage());
            orderCount = 0;
        }

        userDto.put("orderCount", orderCount);
        userDto.put("createdAt", user.getCreatedAt());

        return userDto;
    }
}
