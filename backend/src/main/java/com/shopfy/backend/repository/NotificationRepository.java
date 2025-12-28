package com.shopfy.backend.repository;

import com.shopfy.backend.entity.Notification;
import com.shopfy.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);

    List<Notification> findByRecipientAndIsReadFalseOrderByCreatedAtDesc(User recipient);
}
