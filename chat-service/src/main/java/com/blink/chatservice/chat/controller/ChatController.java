package com.blink.chatservice.chat.controller;

import com.blink.chatservice.chat.dto.CreateGroupRequest;
import com.blink.chatservice.chat.dto.DirectChatRequest;
import com.blink.chatservice.chat.dto.SendMessageRequest;
import com.blink.chatservice.chat.entity.Conversation;
import com.blink.chatservice.chat.entity.Message;
import com.blink.chatservice.chat.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/direct")
    @Operation(summary = "Create or get direct conversation")
    public ResponseEntity<Conversation> createDirect(
            Authentication auth,
            @RequestBody DirectChatRequest request
    ) {
        try {
            if (request == null || request.otherUserContact() == null || request.otherUserContact().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            String me = auth.getName();
            Conversation conv = chatService.createDirectConversation(me, request.otherUserContact().trim());
            return ResponseEntity.ok(conv);
        } catch (IllegalArgumentException e) {
            log.warn("Bad request creating direct conversation: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error creating direct conversation", e);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/group")
    @Operation(summary = "Create group conversation")
    public ResponseEntity<Conversation> createGroup(
            Authentication auth,
            @Valid @RequestBody CreateGroupRequest request
    ) {
        try {
            log.info("Received group creation request: {}", request);

            
            String me = auth.getName();
            Set<String> participants =
                    new HashSet<>(request.getParticipantIds());
            
            Conversation conv = chatService.createGroupConversation(me, request.getTitle().trim(), participants);
            return ResponseEntity.ok(conv);
        } catch (IllegalArgumentException e) {
            log.warn("Bad request creating group: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error creating group conversation", e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<Conversation>> listMyConversations(Authentication auth) {
        try {
            String me = auth.getName();
            return ResponseEntity.ok(chatService.listConversationsForUser(me));
        } catch (Exception e) {
            log.error("Error listing conversations", e);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/{conversationId}/messages")
    @Operation(summary = "Send message to conversation")
    public ResponseEntity<Message> sendMessage(
            Authentication auth,
            @PathVariable String conversationId,
            @RequestBody SendMessageRequest request
    ) {
        try {
            if (request == null || request.body() == null || request.body().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            if (request.body().length() > 2000) {
                return ResponseEntity.badRequest().build();
            }
            
            String me = auth.getName();
            // This message is now broadcasted automatically by logic moved to Service layer
            Message msg = chatService.sendMessage(conversationId, me, request.body().trim());
            return ResponseEntity.ok(msg);
        } catch (IllegalArgumentException e) {
            log.warn("Bad request sending message: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error sending message", e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<Page<Message>> getMessages(
            @PathVariable String conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        try {
            Page<Message> msg = chatService.getMessages(conversationId, page, size);
            return ResponseEntity.ok(msg);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error fetching messages", e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{conversationId}")
    @Operation(summary = "Get conversation details")
    public ResponseEntity<Conversation> getConversation(
            @PathVariable String conversationId
    ) {
        try {
            Conversation conv = chatService.getConversation(conversationId);
            return ResponseEntity.ok(conv);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error getting conversation", e);
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/{conversationId}")
    @Operation(summary = "Delete or leave conversation")
    public ResponseEntity<Void> deleteConversation(
            Authentication auth,
            @PathVariable String conversationId
    ) {
        try {
            String userId = auth.getName();
            chatService.deleteConversation(conversationId, userId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error deleting conversation", e);
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/messages/{messageId}")
    @Operation(summary = "Delete a message")
    public ResponseEntity<Void> deleteMessage(
            Authentication auth,
            @PathVariable String messageId
    ) {
        try {
            String userId = auth.getName();
            chatService.deleteMessage(messageId, userId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error deleting message", e);
            return ResponseEntity.status(500).build();
        }
    }

}

