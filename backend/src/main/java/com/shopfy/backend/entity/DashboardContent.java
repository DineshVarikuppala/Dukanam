package com.shopfy.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dashboard_content")
public class DashboardContent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String filename;
    private String url;

    @Enumerated(EnumType.STRING)
    private ContentType type;

    private boolean isActive = false;

    // Playback preferences
    private boolean loopVideo = true; // Default to loop
    private boolean muteDefault = true; // Default to mute (for autoplay compatibility)

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum ContentType {
        BUYER_VIDEO
    }

    public DashboardContent() {
    }

    public DashboardContent(String filename, String url, ContentType type) {
        this.filename = filename;
        this.url = url;
        this.type = type;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public ContentType getType() {
        return type;
    }

    public void setType(ContentType type) {
        this.type = type;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isLoopVideo() {
        return loopVideo;
    }

    public void setLoopVideo(boolean loopVideo) {
        this.loopVideo = loopVideo;
    }

    public boolean isMuteDefault() {
        return muteDefault;
    }

    public void setMuteDefault(boolean muteDefault) {
        this.muteDefault = muteDefault;
    }
}
