package com.blink.chatservice.chat.dto;

import java.util.Set;

public record GroupChatRequest(String title, Set<String> participantIds) {
}
