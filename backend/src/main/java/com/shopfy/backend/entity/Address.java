package com.shopfy.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long addressId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String label; // e.g., "Home", "Office", "Other"

    @Column(nullable = false, length = 500)
    private String fullAddress;

    @Column(nullable = false)
    private Boolean isDefault = false;
}
