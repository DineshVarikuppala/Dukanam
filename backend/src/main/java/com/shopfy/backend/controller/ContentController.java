package com.shopfy.backend.controller;

import com.shopfy.backend.entity.DashboardContent;
import com.shopfy.backend.service.ContentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/content")
public class ContentController {

    @Autowired
    private ContentService contentService;

    @PostMapping("/upload")
    public ResponseEntity<DashboardContent> uploadFile(@RequestParam("file") MultipartFile file,
            @RequestParam("type") String typeStr) {
        DashboardContent.ContentType type = DashboardContent.ContentType.valueOf(typeStr);
        return ResponseEntity.ok(contentService.uploadContent(file, type));
    }

    @GetMapping
    public List<DashboardContent> getHistory(@RequestParam("type") String typeStr) {
        DashboardContent.ContentType type = DashboardContent.ContentType.valueOf(typeStr);
        return contentService.getHistory(type);
    }

    @GetMapping("/active")
    public ResponseEntity<DashboardContent> getActive(@RequestParam("type") String typeStr) {
        DashboardContent.ContentType type = DashboardContent.ContentType.valueOf(typeStr);
        ResponseEntity<DashboardContent> response = contentService.getActiveContent(type) != null
                ? ResponseEntity.ok(contentService.getActiveContent(type))
                : ResponseEntity.noContent().build();
        return response;
    }

    @PutMapping("/{id}/active")
    public ResponseEntity<DashboardContent> setActive(@PathVariable Long id) {
        return ResponseEntity.ok(contentService.setActive(id));
    }

    @PutMapping("/{id}/settings")
    public ResponseEntity<DashboardContent> updateSettings(
            @PathVariable Long id,
            @RequestParam("loop") boolean loop,
            @RequestParam("mute") boolean mute) {
        return ResponseEntity.ok(contentService.updateSettings(id, loop, mute));
    }

    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            Path file = Paths.get("uploads").resolve(filename);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok().contentType(MediaType.parseMediaType("video/mp4")).body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
