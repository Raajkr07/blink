package com.blink.chatservice.websocket.dto;

public record TypingResponse(
        String conversationId,
        String userId,
        Boolean typing
) {}
