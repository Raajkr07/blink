package com.blink.chatservice.user.service;

import com.blink.chatservice.user.dto.AuthDto;
import com.blink.chatservice.user.entity.User;
import java.util.List;
import java.util.Map;

public interface UserService {

    String  requestOtp(String identifier);
    boolean verifyOtp(String identifier, String otp);
    String completeSignup(String identifier,
                          String username,
                          String avatarUrl,
                          String bio,
                          String email,
                          String phone);
    String completeLogin(AuthDto.LoginRequest loginRequest);
    
    /**
     * Complete signup and return both access and refresh tokens
     * @return Map with "accessToken" and "refreshToken" keys
     */
    Map<String, String> completeSignupWithRefreshToken(String identifier,
                          String username,
                          String avatarUrl,
                          String bio,
                          String email,
                          String phone);
    
    /**
     * Complete login and return both access and refresh tokens
     * @return Map with "accessToken" and "refreshToken" keys
     */
    Map<String, String> completeLoginWithRefreshToken(AuthDto.LoginRequest loginRequest);
    
    /**
     * Refresh access token using refresh token
     * @param refreshToken The refresh token
     * @return Map with new "accessToken" and optionally new "refreshToken" (if rotation enabled)
     */
    Map<String, String> refreshAccessToken(String refreshToken);
    
    /**
     * Revoke refresh token (logout)
     */
    void revokeRefreshToken(String refreshToken);
    
    User getProfile(String userId);
    User updateProfile(String userId, String username, String avatarUrl, String bio, String email, String phone);
    List<User> searchUsersByContact(String query, String currentUserId);
    List<String> getOnlineUserIds();
    boolean isUserOnline(String userId);
    boolean userExists(String phone, String email);
    boolean userExists(String identifier);
    String resolveUserIdFromContact(String contact);
}
