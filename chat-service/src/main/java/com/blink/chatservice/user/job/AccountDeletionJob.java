package com.blink.chatservice.user.job;

import com.blink.chatservice.user.entity.User;
import com.blink.chatservice.user.repository.OAuth2CredentialRepository;
import com.blink.chatservice.user.repository.RefreshTokenRepository;
import com.blink.chatservice.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AccountDeletionJob {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OAuth2CredentialRepository oAuth2CredentialRepository;
    private final CacheManager cacheManager;

    @Scheduled(fixedRate = 1_800_000) // 30 minutes
    public void purgeDeletedAccounts() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("UTC"));
        List<User> expiredUsers = userRepository.findByPendingDeletionTrueAndDeletionScheduledAtBefore(now);

        if (expiredUsers.isEmpty()) return;

        log.info("AccountDeletionJob: Found {} accounts to permanently delete", expiredUsers.size());

        for (User user : expiredUsers) {
            try {
                String userId = user.getId();

                // Clean up any remaining refresh tokens
                refreshTokenRepository.deleteByUserId(userId);

                // Clean up any remaining OAuth credentials
                oAuth2CredentialRepository.findByUserIdAndProvider(userId, "google")
                        .ifPresent(oAuth2CredentialRepository::delete);

                // Evict from cache
                if (cacheManager != null) {
                    var cache = cacheManager.getCache("users_v2");
                    if (cache != null) cache.evict(userId);
                }

                // Permanently delete user document
                userRepository.deleteById(userId);

                log.info("AccountDeletionJob: Permanently deleted user {} ({})", userId, user.getEmail());
            } catch (Exception e) {
                log.error("AccountDeletionJob: Failed to delete user {}: {}", user.getId(), e.getMessage());
            }
        }
    }
}
