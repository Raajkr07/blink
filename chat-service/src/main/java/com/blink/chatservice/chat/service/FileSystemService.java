package com.blink.chatservice.chat.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@Slf4j
public class FileSystemService {

    public Path saveToDesktop(String filename, String content) throws IOException {
        String userHome = System.getProperty("user.home");
        Path desktopPath = null;

        // On Windows, prioritize OneDrive Desktop as it's the most common "visible" desktop now
        Path oneDriveDesktop = Paths.get(userHome, "OneDrive", "Desktop");
        Path localDesktop = Paths.get(userHome, "Desktop");

        if (Files.exists(oneDriveDesktop)) {
            desktopPath = oneDriveDesktop;
        } else if (Files.exists(localDesktop)) {
            desktopPath = localDesktop;
        } else {
            // Default to local Desktop if neither exists (will be created)
            desktopPath = localDesktop;
        }

        if (!Files.exists(desktopPath)) {
            Files.createDirectories(desktopPath);
        }

        // Allow spaces in filename as requested
        String sanitizedFilename = filename.replaceAll("[^a-zA-Z0-9._\\s-]", "_").trim();
        if (!sanitizedFilename.contains(".")) {
            sanitizedFilename += ".txt";
        }

        Path targetPath = desktopPath.resolve(sanitizedFilename);

        log.info("Saving file to: {}", targetPath.toAbsolutePath());
        Files.writeString(targetPath, content, StandardCharsets.UTF_8);

        return targetPath.toAbsolutePath();
    }
}
