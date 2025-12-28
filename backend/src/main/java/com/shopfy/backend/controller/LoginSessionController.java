package com.shopfy.backend.controller;

import com.shopfy.backend.entity.LoginSession;
import com.shopfy.backend.service.LoginSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/login-sessions")
@CrossOrigin(origins = "*")
public class LoginSessionController {

    @Autowired
    private LoginSessionService loginSessionService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LoginSession>> getUserSessions(@PathVariable Long userId) {
        List<LoginSession> sessions = loginSessionService.getUserSessions(userId);
        return ResponseEntity.ok(sessions);
    }

    @PostMapping("/logout")
    public ResponseEntity<LoginSession> recordLogout(@RequestBody Map<String, Long> payload) {
        Long userId = payload.get("userId");
        LoginSession session = loginSessionService.recordLogout(userId);
        return ResponseEntity.ok(session);
    }

    @GetMapping("/active/{userId}")
    public ResponseEntity<LoginSession> getActiveSession(@PathVariable Long userId) {
        LoginSession session = loginSessionService.getActiveSession(userId);
        return ResponseEntity.ok(session);
    }
}
