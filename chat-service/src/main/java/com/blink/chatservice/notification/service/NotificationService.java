package com.blink.chatservice.notification.service;

public interface NotificationService {
    boolean sendOtp(String identifier, String otp, String appName, String verifyUrl);
    boolean sendOtpToPhone(String phoneNumber, String otp, String appName);
    boolean sendOtpToEmail(String email, String otp, String appName, String verifyUrl);
    boolean isValidPhone(String identifier);
    boolean isValidEmail(String identifier);
    String maskPhone(String phone);
    String maskEmail(String email);
    String maskIdentifier(String identifier);
}
