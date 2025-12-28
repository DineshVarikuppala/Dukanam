package com.shopfy.backend.repository;

import com.shopfy.backend.entity.Role;
import com.shopfy.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByMobileNumber(String mobileNumber);

    // For login checks
    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.email = :identifier OR u.mobileNumber = :identifier")
    Optional<User> findByEmailOrMobileNumber(String identifier);

    List<User> findByRole(Role role);
}
