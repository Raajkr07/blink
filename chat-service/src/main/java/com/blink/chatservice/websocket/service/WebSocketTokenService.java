package com.blink.chatservice.websocket.service;

import com.blink.chatservice.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WebSocketTokenService {

    private final JwtUtil jwtUtil;

    public String getUserIdFromHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }
}
