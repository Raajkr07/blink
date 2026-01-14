package com.blink.chatservice.websocket.dto;
import java.time.LocalDateTime;

public record RealtimeMessageResponse(
        String id,
        String conversationId,
        String senderId,
        String recipientId,
        String body,
        LocalDateTime createdAt
) {}

