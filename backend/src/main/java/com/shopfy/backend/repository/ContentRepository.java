package com.shopfy.backend.repository;

import com.shopfy.backend.entity.DashboardContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContentRepository extends JpaRepository<DashboardContent, Long> {
    List<DashboardContent> findByTypeOrderByCreatedAtDesc(DashboardContent.ContentType type);

    Optional<DashboardContent> findByTypeAndIsActiveTrue(DashboardContent.ContentType type);
}
