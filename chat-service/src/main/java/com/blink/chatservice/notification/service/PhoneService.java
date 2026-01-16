package com.blink.chatservice.notification.service;

public interface PhoneService {
    boolean sendOtpSms(String phoneNumber, String otp, String appName);
    boolean isEnabled();
}
