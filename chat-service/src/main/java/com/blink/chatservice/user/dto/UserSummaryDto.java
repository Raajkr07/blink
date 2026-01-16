package com.blink.chatservice.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDto {
    private String id;
    private String username;
    private String displayName;
    private String maskedPhone;
    private String avatarUrl;
    private boolean online;
    private boolean contact;
    private boolean self;
}
