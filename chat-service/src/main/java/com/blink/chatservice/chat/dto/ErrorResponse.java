package com.blink.chatservice.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private String error;
    private String message;
    private String details;

    public ErrorResponse(String message) {
        this.message =message;
    }

    public String ErrorResponse(String message) {
        return message;
    }
}
