package com.shopfy.backend.repository;

import com.shopfy.backend.entity.Subcategory;
import com.shopfy.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubcategoryRepository extends JpaRepository<Subcategory, Long> {
    List<Subcategory> findByCategory(Category category);
}
