package com.shopfy.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true, nullable = false)
    private String mobileNumber;

    private String firstName;
    private String lastName;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    public String getFullName() {
        return firstName + " " + lastName;
    }

    @Column(nullable = false)
    private Boolean emailNotificationsEnabled = true; // Default to enabled

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
