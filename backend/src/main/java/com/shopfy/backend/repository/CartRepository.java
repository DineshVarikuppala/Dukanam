package com.shopfy.backend.repository;

import com.shopfy.backend.entity.Cart;
import com.shopfy.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);
}
