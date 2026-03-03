package com.blink.chatservice.user.controller;

import com.blink.chatservice.config.GoogleOAuthConfig;
import com.blink.chatservice.config.JwtConfig;
import com.blink.chatservice.notification.service.NotificationService;
import com.blink.chatservice.security.JwtUtil;
import com.blink.chatservice.security.TokenDenylistService;
import com.blink.chatservice.user.entity.User;
import com.blink.chatservice.user.repository.OAuth2CredentialRepository;
import com.blink.chatservice.user.repository.UserRepository;
import com.blink.chatservice.user.service.OAuthService;
import com.blink.chatservice.user.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth/google")
@RequiredArgsConstructor
@Slf4j
public class GoogleAuthController {

    private final OAuthService oAuthService;
    private final GoogleOAuthConfig googleConfig;
    private final JwtUtil jwtUtil;
    private final JwtConfig jwtConfig;
    private final TokenDenylistService denylistService;
    private final UserRepository userRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    private final OAuth2CredentialRepository oAuth2CredentialRepository;

    @Value("${app.cookie.domain:#{null}}")
    private String cookieDomain;

    @PostMapping("/init")
    public ResponseEntity<Map<String, String>> initAuth(@RequestParam(required = false) String redirect_to) {
        String authUrl = oAuthService.generateAuthUrl(redirect_to);
        return ResponseEntity.ok(Collections.singletonMap("url", authUrl));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> googleStatus(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        String userId = (String) authentication.getPrincipal();
        boolean linked = oAuth2CredentialRepository.findByUserIdAndProvider(userId, "google").isPresent();
        return ResponseEntity.ok(Map.of("linked", linked));
    }

    @GetMapping("/callback")
    public void callback(@RequestParam String code, @RequestParam String state, HttpServletResponse response) throws IOException {
        try {
            Map<String, String> result = oAuthService.processCallback(code, state);
            String accessToken = result.get("token");
            String redirectUri = result.get("redirectUri");
            
            String userId = jwtUtil.extractUserId(accessToken);
            String refreshToken = userService.generateAndSaveRefreshToken(userId);

            addCookie(response, "access_token", accessToken, (int) (jwtConfig.getExpiration() / 1000));
            addCookie(response, "refresh_token", refreshToken, (int) (jwtConfig.getRefreshExpiration() / 1000));
            
            if (redirectUri == null || redirectUri.isEmpty()) {
                redirectUri = googleConfig.getDefaultRedirectUri();
            }

            response.sendRedirect(redirectUri); 
        } catch (IllegalStateException e) {
            log.error("OAuth Callback Error: {}", e.getMessage());
            String errorRedirect = googleConfig.getErrorRedirectUri();
            if (e.getMessage() != null && e.getMessage().contains("scheduled for deletion")) {
                errorRedirect += (errorRedirect.contains("?") ? "&" : "?") + "error=account_deleted";
            }
            response.sendRedirect(errorRedirect);
        } catch (Exception e) {
            log.error("OAuth Callback Error: {}", e.getMessage());
            response.sendRedirect(googleConfig.getErrorRedirectUri());
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = null;
        if (request.getCookies() != null) {
            refreshToken = Arrays.stream(request.getCookies())
                    .filter(c -> "refresh_token".equals(c.getName()))
                    .findFirst()
                    .map(Cookie::getValue)
                    .orElse(null);
        }

        if (refreshToken == null || !jwtUtil.validateToken(refreshToken) || !jwtUtil.isRefreshToken(refreshToken)) {
            return ResponseEntity.status(401).build();
        }

        String userId = jwtUtil.extractUserId(refreshToken);

        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
             return ResponseEntity.status(401).build();
        }
        User user = userOptional.get();
        
        try {
             oAuthService.refreshCredential(userId);
        } catch (Exception e) {
            log.warn("Failed to refresh Google token during session refresh: {}", e.getMessage());
        }

        String newAccessToken = jwtUtil.generateToken(user);
        String newRefreshToken = userService.generateAndSaveRefreshToken(userId); // Rotate
        
        addCookie(response, "access_token", newAccessToken, (int) (jwtConfig.getExpiration() / 1000));
        addCookie(response, "refresh_token", newRefreshToken, (int) (jwtConfig.getRefreshExpiration() / 1000));
        
        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }

    @GetMapping("/session")
    public ResponseEntity<Map<String, Object>> getSession(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) {
        
        // If not authenticated, try to recover session via refresh token cookie
        if (authentication == null || !authentication.isAuthenticated()) {
            String refreshToken = null;
            if (request.getCookies() != null) {
                refreshToken = Arrays.stream(request.getCookies())
                        .filter(c -> "refresh_token".equals(c.getName()))
                        .findFirst()
                        .map(Cookie::getValue)
                        .orElse(null);
            }

            if (refreshToken != null && jwtUtil.validateToken(refreshToken) && jwtUtil.isRefreshToken(refreshToken)) {
                String userId = jwtUtil.extractUserId(refreshToken);
                Optional<User> userOptional = userRepository.findById(userId);
                
                if (userOptional.isPresent()) {
                    User user = userOptional.get();
                    log.info("Recovering session for user: {}", userId);
                    
                    try {
                        oAuthService.refreshCredential(userId);
                    } catch (Exception e) {
                        log.warn("Google credential refresh failed during session recovery: {}", e.getMessage());
                    }

                    String newAccessToken = jwtUtil.generateToken(user);
                    String newRefreshToken = userService.generateAndSaveRefreshToken(userId);
                    
                    addCookie(response, "access_token", newAccessToken, (int) (jwtConfig.getExpiration() / 1000));
                    addCookie(response, "refresh_token", newRefreshToken, (int) (jwtConfig.getRefreshExpiration() / 1000));
                    
                    return ResponseEntity.ok(Map.of(
                        "user", user,
                        "accessToken", newAccessToken
                    ));
                }
            }
            return ResponseEntity.status(401).build();
        }

        String userId = (String) authentication.getPrincipal();
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        
        User user = userOptional.get();
        String accessToken = jwtUtil.generateToken(user);
        
        return ResponseEntity.ok(Map.of(
            "user", user,
            "accessToken", accessToken
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        String jwt = null;
        
        // Try header first
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
        } else if (request.getCookies() != null) {
            // Then check cookies
            jwt = Arrays.stream(request.getCookies())
                    .filter(c -> "access_token".equals(c.getName()))
                    .findFirst()
                    .map(Cookie::getValue)
                    .orElse(null);
        }

        if (jwt != null && jwtUtil.validateToken(jwt)) {
            String userId = jwtUtil.extractUserId(jwt);
            userRepository.findById(userId).ifPresent(u -> {
                u.setOnline(false);
                u.setLastSeen(java.time.LocalDateTime.now(java.time.ZoneId.of("UTC")));
                userRepository.save(u);
            });

            String jti = jwtUtil.extractClaim(jwt, claims -> claims.getId());
            java.util.Date expiration = jwtUtil.getExpirationDate(jwt);
            if (jti != null && expiration != null) {
                long ttl = expiration.getTime() - System.currentTimeMillis();
                if (ttl > 0) {
                    denylistService.denylistToken(jti, ttl);
                }
            }
        }

        // Also revoke refresh token from cookie if exists
        if (request.getCookies() != null) {
            Arrays.stream(request.getCookies())
                    .filter(c -> "refresh_token".equals(c.getName()))
                    .findFirst()
                    .ifPresent(c -> userService.revokeRefreshToken(c.getValue()));
        }

        clearCookie(response, "access_token");
        clearCookie(response, "refresh_token");

        // Send notification email for Google disconnect
        if (jwt != null && jwtUtil.validateToken(jwt)) {
            String uid = jwtUtil.extractUserId(jwt);
            boolean hasGoogle = oAuth2CredentialRepository.findByUserIdAndProvider(uid, "google").isPresent();
            if (hasGoogle) {
                userRepository.findById(uid).ifPresent(u -> {
                    if (u.getEmail() != null && !u.getEmail().isBlank()) {
                        notificationService.sendAccountActionNotification(u.getEmail(), u.getUsername(), "GOOGLE_DISCONNECTED");
                    }
                });
            }
        }

        return ResponseEntity.ok().build();
    }

    @PostMapping("/revoke")
    public ResponseEntity<?> revoke(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        String userId = (String) authentication.getPrincipal();

        // Check if user has Google credentials
        boolean hasGoogle = oAuth2CredentialRepository.findByUserIdAndProvider(userId, "google").isPresent();
        if (!hasGoogle) {
            return ResponseEntity.status(404).body(Map.of("error", "No Google account linked"));
        }

        oAuthService.revokeCredential(userId);

        // Send notification email for Google revoke
        userRepository.findById(userId).ifPresent(u -> {
            if (u.getEmail() != null && !u.getEmail().isBlank()) {
                notificationService.sendAccountActionNotification(u.getEmail(), u.getUsername(), "GOOGLE_REVOKED");
            }
        });

        return ResponseEntity.ok().build();
    }

    private void addCookie(HttpServletResponse response, String name, String value, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setAttribute("SameSite", "None");
        if (cookieDomain != null && !cookieDomain.isBlank()) {
            cookie.setDomain(cookieDomain);
        }
        cookie.setMaxAge(maxAge);
        response.addCookie(cookie);
    }

    private void clearCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, "");
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setAttribute("SameSite", "None");
        if (cookieDomain != null && !cookieDomain.isBlank()) {
            cookie.setDomain(cookieDomain);
        }
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
