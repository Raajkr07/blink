package com.blink.chatservice.websocket.dto;

public record PresenceEvent(
        String userId,
        boolean online
) {}
