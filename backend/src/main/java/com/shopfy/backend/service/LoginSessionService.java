package com.shopfy.backend.service;

import com.shopfy.backend.entity.LoginSession;
import com.shopfy.backend.entity.User;
import com.shopfy.backend.repository.LoginSessionRepository;
import com.shopfy.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LoginSessionService {

    @Autowired
    private LoginSessionRepository loginSessionRepository;

    @Autowired
    private UserRepository userRepository;

    public LoginSession recordLogin(Long userId, String ipAddress, String userAgent) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Close any active sessions for this user (in case logout wasn't recorded)
        Optional<LoginSession> activeSession = loginSessionRepository.findByUserAndLogoutTimeIsNull(user);
        if (activeSession.isPresent()) {
            LoginSession session = activeSession.get();
            session.setLogoutTime(LocalDateTime.now());
            loginSessionRepository.save(session);
        }

        // Create new login session
        LoginSession newSession = new LoginSession();
        newSession.setUser(user);
        newSession.setLoginTime(LocalDateTime.now());
        newSession.setIpAddress(ipAddress);
        newSession.setUserAgent(userAgent);

        return loginSessionRepository.save(newSession);
    }

    public LoginSession recordLogout(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<LoginSession> activeSession = loginSessionRepository.findByUserAndLogoutTimeIsNull(user);

        if (activeSession.isPresent()) {
            LoginSession session = activeSession.get();
            session.setLogoutTime(LocalDateTime.now());
            return loginSessionRepository.save(session);
        }

        return null;
    }

    public List<LoginSession> getUserSessions(Long userId) {
        return loginSessionRepository.findByUser_UserId(userId);
    }

    public LoginSession getActiveSession(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return loginSessionRepository.findByUserAndLogoutTimeIsNull(user).orElse(null);
    }
}
