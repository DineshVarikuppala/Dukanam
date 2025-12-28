package com.shopfy.backend.service;

import com.shopfy.backend.entity.DashboardContent;
import com.shopfy.backend.repository.ContentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class ContentService {

    @Autowired
    private ContentRepository contentRepository;

    private final Path fileStorageLocation;

    public ContentService() {
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public DashboardContent uploadContent(MultipartFile file, DashboardContent.ContentType type) {
        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID().toString() + fileExtension;

        try {
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Using API endpoint to serve files
            String fileUrl = "/api/content/files/" + fileName;

            DashboardContent content = new DashboardContent(originalFileName, fileUrl, type);
            return contentRepository.save(content);

        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    public List<DashboardContent> getHistory(DashboardContent.ContentType type) {
        return contentRepository.findByTypeOrderByCreatedAtDesc(type);
    }

    public DashboardContent getActiveContent(DashboardContent.ContentType type) {
        return contentRepository.findByTypeAndIsActiveTrue(type).orElse(null);
    }

    @Transactional
    public DashboardContent setActive(Long id) {
        DashboardContent content = contentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found"));

        // Deactivate all others of same type
        List<DashboardContent> all = contentRepository.findByTypeOrderByCreatedAtDesc(content.getType());
        for (DashboardContent c : all) {
            c.setActive(false);
        }
        contentRepository.saveAll(all);

        // Activate this one
        content.setActive(true);
        return contentRepository.save(content);
    }

    public DashboardContent updateSettings(Long id, boolean loopVideo, boolean muteDefault) {
        DashboardContent content = contentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        content.setLoopVideo(loopVideo);
        content.setMuteDefault(muteDefault);
        return contentRepository.save(content);
    }
}
