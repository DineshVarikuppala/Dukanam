package com.shopfy.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "stores")
@Data
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long storeId;

    @OneToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String storeName;

    @Column(columnDefinition = "TEXT")
    private String storeAddress;

    private String contactNumber;
    private String storeLogoUrl;

    // Lat/Long for future location features
    private Double latitude;
    private Double longitude;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
