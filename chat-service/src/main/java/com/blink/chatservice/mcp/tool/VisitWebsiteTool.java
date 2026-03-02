package com.blink.chatservice.mcp.tool;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class VisitWebsiteTool implements McpTool {

    @Qualifier("aiRestTemplate")
    private final RestTemplate restTemplate;
    
    @Override
    public String name() {
        return "visit_website";
    }

    @Override
    public String description() {
        return "Visit a specific URL and extract its text content. Use this to get detailed information from search results or news articles.";
    }

    @Override
    public Map<String, Object> inputSchema() {
        return Map.of(
            "type", "object",
            "properties", Map.of(
                "url", Map.of("type", "string", "description", "The URL to visit")
            ),
            "required", List.of("url")
        );
    }

    @Override
    public Object execute(String userId, Map<String, Object> args) {
        String url = (String) args.get("url");
        if (url == null || url.isBlank()) {
            return Map.of("success", false, "message", "URL is required");
        }

        log.info("Visiting website: {} for user {}", url, userId);

        try {
            // Using a simple scraper proxy or the direct URL if it's safe.
            // For industry grade, we'd use something like Jina Reader or a custom playwright setup.
            // Since we want to be robust, we'll use Jina Reader API which is free for basic use and returns clean markdown.
            String readerUrl = "https://r.jina.ai/" + url;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", "text/plain");
            headers.set("X-Return-Format", "markdown");

            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(readerUrl, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String content = response.getBody();
                // Cap content to avoid context window overflow
                if (content.length() > 15000) {
                    content = content.substring(0, 15000) + "... [Content truncated]";
                }
                
                return Map.of(
                    "success", true,
                    "url", url,
                    "content", content,
                    "hint", "This is the full text of the page. Synthesize this into your report."
                );
            } else {
                return Map.of("success", false, "message", "Failed to fetch content. Status: " + response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("Failed to visit website {}: {}", url, e.getMessage());
            return Map.of("success", false, "message", "Error fetching website content: " + e.getMessage());
        }
    }
}
