package com.blink.chatservice.user.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Refresh Token entity for multi-day login sessions
 * Stores refresh tokens in MongoDB for validation and revocation
 */
@Data
@Document(collection = "refresh_tokens")
public class RefreshToken {

    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed(unique = true)
    private String token; // The actual JWT refresh token

    private LocalDateTime expiresAt;
    private LocalDateTime createdAt = LocalDateTime.now();
    private boolean revoked = false;
    private String deviceInfo; // Optional: store device/browser info for security

    /**
     * Check if token is expired
     */
    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(LocalDateTime.now());
    }

    /**
     * Check if token is valid (not expired and not revoked)
     */
    public boolean isValid() {
        return !revoked && !isExpired();
    }
}
