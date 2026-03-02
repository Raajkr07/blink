package com.blink.chatservice.mcp.tool;

import com.blink.chatservice.mcp.tool.helper.UserLookupHelper;
import com.blink.chatservice.user.service.OAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class SendEmailTool implements McpTool {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserLookupHelper userLookupHelper;
    private final OAuthService oAuthService;

    @Override
    public String name() {
        return "send_email";
    }

    @Override
    public String description() {
        return "Compose and send an email via Gmail. Write like a real person in natural Indian English — no LLM boilerplate.";
    }

    @Override
    public Map<String, Object> inputSchema() {
        return Map.of(
            "type", "object",
            "properties", Map.of(
                "to", Map.of("type", "string", "description", "Recipient email"),
                "subject", Map.of("type", "string", "description", "Short, natural subject line. Write like a human: 'Quick question about tomorrow' not 'Inquiry Regarding Upcoming Schedule'"),
                "body", Map.of("type", "string", "description", "Email body in natural Indian English. Keep it 3-5 lines. No 'I hope this finds you well' or 'Kindly do the needful'. Use warm openings like 'Hey' or 'Hi'. Match the user's intent exactly. Use [Recipient Name] and [Your Name] as placeholders.")
            ),
            "required", List.of("to", "subject", "body")
        );
    }

    @Override
    public Map<String, Object> execute(String userId, Map<String, Object> arguments) {
        String to = (String) arguments.get("to");
        String subject = (String) arguments.getOrDefault("subject", "(No Subject)");
        String body = (String) arguments.getOrDefault("body", "");

        if (to == null || to.isBlank()) {
            throw new IllegalArgumentException("Recipient is required");
        }

        // 1. Verify Google Authentication (Gmail Access)
        try {
            oAuthService.getAccessToken(userId);
        } catch (IllegalArgumentException e) {
            log.warn("Gmail prepare failed: No Google credentials for user: {}", userId);
            return Map.of(
                "success", false,
                "message", "You haven't linked your Google account yet. Please login with Google to send emails.",
                "error_type", "PERMISSION_DENIED"
            );
        }

        // 2. Resolve name placeholders using helper
        String finalBody = userLookupHelper.resolveNamePlaceholders(body, userId, to);

        try {
            // Push email preview to frontend for user confirmation/edit
            // We don't send via Gmail API here for security reasons
            messagingTemplate.convertAndSend("/topic/user/" + userId + "/actions", Map.of(
                "type", "SEND_EMAIL_REQUEST",
                "payload", Map.of(
                    "to", to,
                    "subject", subject,
                    "body", finalBody
                )
            ));

            return Map.of(
                "success", true, 
                "message", "Email preview prepared. CRITICAL: Do NOT tell the user that the email has been sent. Tell them you have prepared a draft and it is waiting for their review and confirmation."
            );
        } catch (Exception e) {
            String errMsg = e.getMessage() != null ? e.getMessage() : "Unknown error";
            log.error("Failed to prepare email preview for user: {}. Error: {}", userId, errMsg);
            return Map.of("success", false, "message", "Failed to prepare email: " + errMsg);
        }
    }
}
