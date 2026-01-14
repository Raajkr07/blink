package com.blink.chatservice.websocket.dto;

public record TypingRequest(
        String conversationId,
        Boolean typing
) {}
