package com.blink.chatservice.websocket.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Request to send a chat message")
public record SendMessageRequest(
        @Schema(example = "Hello there! This is real time chat application...")
        @NotBlank @Size(max = 2000)
        String body
) {}
