package com.shopfy.backend.repository;

import com.shopfy.backend.entity.Category;
import com.shopfy.backend.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByStore(Store store);
}
