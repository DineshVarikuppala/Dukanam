package com.shopfy.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subcategories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Subcategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long subcategoryId;

    @Column(nullable = false)
    private String subcategoryName;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
}
