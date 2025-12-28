package com.shopfy.backend.repository;

import com.shopfy.backend.entity.Product;
import com.shopfy.backend.entity.Store;
import com.shopfy.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStore(Store store);

    List<Product> findByCategory(Category category);

    List<Product> findByProductNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name,
            String description);
}
