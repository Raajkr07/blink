package com.blink.chatservice.chat.controller;

import java.nio.file.Path;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

import com.blink.chatservice.chat.service.FileSystemService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.blink.chatservice.chat.dto.CreateGroupRequest;
import com.blink.chatservice.chat.dto.DirectChatRequest;
import com.blink.chatservice.chat.dto.PagedResponse;
import com.blink.chatservice.chat.dto.SaveFileRequest;
import com.blink.chatservice.chat.dto.SendEmailRequest;
import com.blink.chatservice.chat.dto.SendMessageRequest;
import com.blink.chatservice.chat.entity.Conversation;
import com.blink.chatservice.chat.entity.Message;
import com.blink.chatservice.chat.service.ChatService;
import com.blink.chatservice.notification.service.EmailService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final EmailService emailService;
    private final FileSystemService fileSystemService;

    @PostMapping("/direct")
    public ResponseEntity<Conversation> createDirect(Authentication auth, @RequestBody DirectChatRequest request) {
        if (request == null || request.otherUserContact() == null || request.otherUserContact().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(chatService.createDirectConversation(auth.getName(), request.otherUserContact().trim()));
    }

    @PostMapping("/group")
    public ResponseEntity<Conversation> createGroup(Authentication auth, @Valid @RequestBody CreateGroupRequest request) {
        return ResponseEntity.ok(chatService.createGroupConversation(auth.getName(), request.getTitle().trim(), new HashSet<>(request.getParticipantIds())));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<Conversation>> listMyConversations(Authentication auth) {
        return ResponseEntity.ok(chatService.listConversationsForUser(auth.getName()));
    }

    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<Message> sendMessage(Authentication auth, @PathVariable String conversationId, @RequestBody SendMessageRequest request) {
        if (request == null || request.body() == null || request.body().isBlank()) return ResponseEntity.badRequest().build();
        if (request.body().length() > 2000) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(chatService.sendMessage(conversationId, auth.getName(), request.body().trim()));
    }

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<PagedResponse<Message>> getMessages(@PathVariable String conversationId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(PagedResponse.from(chatService.getMessages(conversationId, page, size)));
    }

    @GetMapping("/{conversationId}")
    public ResponseEntity<Conversation> getConversation(@PathVariable String conversationId) {
        return ResponseEntity.ok(chatService.getConversation(conversationId));
    }

    @DeleteMapping("/{conversationId}")
    public ResponseEntity<Void> deleteConversation(Authentication auth, @PathVariable String conversationId) {
        chatService.deleteConversation(conversationId, auth.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(Authentication auth, @PathVariable String messageId) {
        chatService.deleteMessage(messageId, auth.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/save-file")
    public ResponseEntity<Object> saveFile(Authentication auth, @RequestBody SaveFileRequest request) {
        if (request.fileName() == null || request.fileName().isBlank()) {
            return ResponseEntity.badRequest().body("Filename is required");
        }

        try {
            String content = request.content() != null ? request.content() : "";
            Path savedPath = fileSystemService.saveToDesktop(request.fileName().trim(), content);
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "fileName", savedPath.getFileName().toString(),
                    "fullPath", savedPath.toString(),
                    "message", "File saved successfully to Desktop"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Could not save file: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/send-email")
    public ResponseEntity<Object> sendEmail(Authentication auth, @RequestBody SendEmailRequest request) {
        if (request.to() == null || request.to().isBlank()) return ResponseEntity.badRequest().body(Map.of("message", "Recipient is required"));
        
        try {
            emailService.sendUserEmail(auth.getName(), request.to().trim(), request.subject() != null ? request.subject() : "Message from BlinxAI", request.body() != null ? request.body() : "");
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}

