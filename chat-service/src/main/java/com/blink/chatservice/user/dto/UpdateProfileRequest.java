package com.blink.chatservice.user.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String username;
    private String avatarUrl;
    private String bio;
    private String email;
    private String phone;
}
