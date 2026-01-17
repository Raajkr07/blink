package com.blink.chatservice.websocket.controller;

import com.blink.chatservice.chat.service.ChatService;
import com.blink.chatservice.websocket.dto.RealtimeMessageRequest;
import com.blink.chatservice.websocket.dto.TypingRequest;
import com.blink.chatservice.websocket.dto.TypingResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWsController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload RealtimeMessageRequest request,
                            Principal principal) {
        handleSendMessage(request, principal);
    }

    @MessageMapping("/chat.sendMessageSimple")
    public void sendMessageSimple(@Payload RealtimeMessageRequest request,
                                  Principal principal) {
        handleSendMessage(request, principal);
    }

    private void handleSendMessage(RealtimeMessageRequest request, Principal principal) {
        if (principal == null) {
            log.warn("WS Message received without principal");
            return;
        }

        if (request == null || request.conversationId() == null || request.body() == null) {
            log.warn("Invalid WS message request from {}", principal.getName());
            return;
        }

        try {
            String senderId = principal.getName();
            // This will save AND broadcast via ChatServiceImpl
            chatService.sendMessage(request.conversationId(), senderId, request.body());
            
            log.debug("WS message processed for conversation {}", request.conversationId());
        } catch (Exception e) {
            log.error("Error processing WebSocket message from {}: {}", principal.getName(), e.getMessage());
        }
    }

    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload TypingRequest request, Principal principal) {
        if (principal == null || request == null || request.conversationId() == null) {
            return;
        }

        try {
            String userId = principal.getName();
            TypingResponse response = new TypingResponse(
                    request.conversationId(),
                    userId,
                    request.typing() != null ? request.typing() : false
            );

            // Broadcast typing indicator to all participants in the conversation
            messagingTemplate.convertAndSend(
                    "/topic/conversations/" + request.conversationId() + "/typing",
                    response
            );
        } catch (Exception e) {
            System.err.println("Error handling typing indicator: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
