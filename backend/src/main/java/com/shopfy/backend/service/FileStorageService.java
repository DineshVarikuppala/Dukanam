package com.shopfy.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    private final String UPLOAD_DIR = "uploads/";

    public FileStorageService() {
        // Create directory if it doesn't exist
        File directory = new File(UPLOAD_DIR);
        if (!directory.exists()) {
            directory.mkdirs();
        }
    }

    public String saveFile(MultipartFile file) {
        if (file.isEmpty())
            return null;

        try {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR + fileName);
            Files.write(path, file.getBytes());
            return "/uploads/" + fileName; // Return relative URL
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }
}
