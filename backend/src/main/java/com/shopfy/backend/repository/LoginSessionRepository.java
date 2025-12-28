package com.shopfy.backend.repository;

import com.shopfy.backend.entity.LoginSession;
import com.shopfy.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoginSessionRepository extends JpaRepository<LoginSession, Long> {

    List<LoginSession> findByUserOrderByLoginTimeDesc(User user);

    Optional<LoginSession> findByUserAndLogoutTimeIsNull(User user);

    List<LoginSession> findByUser_UserId(Long userId);
}
