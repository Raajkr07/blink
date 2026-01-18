package com.blink.chatservice.websocket;

import com.blink.chatservice.websocket.service.WebSocketTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.*;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private final WebSocketTokenService tokenService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            // Intercepting CONNECT header to extract JWT and authenticate the WS session.
            String userId = tokenService.getUserIdFromHeader(authHeader);
            if (userId != null) {
                var authentication = new UsernamePasswordAuthenticationToken(userId, null, null);
                accessor.setUser(authentication);
            }
        }
        return message;
    }
}

