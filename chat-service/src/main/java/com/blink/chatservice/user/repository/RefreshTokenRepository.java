package com.blink.chatservice.user.repository;

import com.blink.chatservice.user.entity.RefreshToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends MongoRepository<RefreshToken, String> {
    Optional<RefreshToken> findByToken(String token);
    List<RefreshToken> findByUserId(String userId);
    void deleteByUserId(String userId); // Delete all tokens for a user (on logout)
    void deleteByToken(String token); // Delete specific token
    void deleteByExpiresAtBefore(java.time.LocalDateTime date); // Cleanup expired tokens
}
