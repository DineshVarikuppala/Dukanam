package com.shopfy.backend.repository;

import com.shopfy.backend.entity.Store;
import com.shopfy.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StoreRepository extends JpaRepository<Store, Long> {
    Optional<Store> findByOwner(User owner);
}
