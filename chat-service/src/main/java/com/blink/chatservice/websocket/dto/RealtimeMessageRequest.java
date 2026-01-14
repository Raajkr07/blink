package com.blink.chatservice.websocket.dto;

public record RealtimeMessageRequest(
        String conversationId,
        String body
) {}
