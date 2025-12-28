package com.shopfy.backend.util;

import com.shopfy.backend.entity.User;
import com.shopfy.backend.entity.Role;
import com.shopfy.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class AdminUserInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if admin user already exists
        if (userRepository.findByEmail("Admin@123").isEmpty()) {
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

            User admin = new User();
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setEmail("Admin@123");
            admin.setMobileNumber("1234567890");
            admin.setPassword(encoder.encode("Admin@123"));
            admin.setRole(Role.ADMIN);
            admin.setEmailNotificationsEnabled(true);
            admin.setCreatedAt(LocalDateTime.now());

            userRepository.save(admin);
            System.out.println("✅ Admin user created successfully!");
            System.out.println("Email: Admin@123");
            System.out.println("Password: Admin@123");
        } else {
            System.out.println("ℹ️  Admin user already exists");
        }
    }
}
