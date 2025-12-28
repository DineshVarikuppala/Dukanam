package com.shopfy.backend.repository;

import com.shopfy.backend.entity.ProfileUpdateRequest;
import com.shopfy.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProfileUpdateRequestRepository extends JpaRepository<ProfileUpdateRequest, Long> {
    List<ProfileUpdateRequest> findByUserOrderByCreatedAtDesc(User user);

    List<ProfileUpdateRequest> findByStatusOrderByCreatedAtDesc(ProfileUpdateRequest.RequestStatus status);

    List<ProfileUpdateRequest> findByUserAndStatus(User user, ProfileUpdateRequest.RequestStatus status);
}
