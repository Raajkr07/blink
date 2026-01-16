package com.blink.chatservice.user.dto;

import jakarta.validation.constraints.NotBlank;

public class AuthDto {
    public record OtpRequest(
            @NotBlank String identifier,
            String email
    ) {}

    public record VerifyOtpRequest(
            @NotBlank String identifier,
            @NotBlank String otp
    ) {}

    public record SignupRequest(
            @NotBlank String identifier,
            @NotBlank String username,
            String avatarUrl,
            String bio,
            String email,
            String phone
    ) {}

    public record LoginRequest(
            @NotBlank String identifier,
            String email,
            String otp
    ) {}

    public record OtpResponse(String message) {}
    public record VerifyOtpResponse(String message, boolean valid) {}
    public record AuthResponse(String token) {}

    public record TokenResponse(String accessToken, String refreshToken, String error) {
        public TokenResponse(String accessToken, String refreshToken) {
            this(accessToken, refreshToken, null);
        }
    }

    public record RefreshTokenRequest(@NotBlank String refreshToken) {}
    
    public record VerifyRequest(
            @NotBlank String identifier,
            @NotBlank String otp,
            String username,
            String avatarUrl,
            String bio,
            String email,
            String phone
    ) {}
}
