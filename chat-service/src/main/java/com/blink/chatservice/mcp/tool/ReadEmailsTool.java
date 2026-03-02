package com.blink.chatservice.mcp.tool;

import com.blink.chatservice.user.service.OAuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.http.MediaType;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReadEmailsTool implements McpTool {

    private final OAuthService oAuthService;
    private final ObjectMapper objectMapper;
    private final RestClient aiRestClient;

    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");
    private static final int DEFAULT_MAX_RESULTS = 20;
    private static final DateTimeFormatter DD_MM_YYYY = DateTimeFormatter.ofPattern("dd-MM-yyyy");

    @Override
    public String name() {
        return "read_emails";
    }

    @Override
    public String description() {
        return "Comprehensive Gmail search. Can filter by date (today/yesterday/last_7_days), status (UNREAD, STARRED), and folder (INBOX/received, SENT, DRAFTS). Supports keyword search via 'query'.";
    }

    @Override
    public Map<String, Object> inputSchema() {
        return Map.of(
            "type", "object",
            "properties", Map.of(
                "dateFilter", Map.of("type", "string", "description",
                    "Filter by time. Examples: 'today', 'yesterday', 'last_7_days', 'last_30_days', 'march', or 'DD-MM-YYYY'. Use 'all_time' to search without date restrictions. CRITICAL: If the user asks for 'last 5 emails', do NOT use 'last_5_days' — just set maxResults to 5 and use 'all_time'."),
                "startDate", Map.of("type", "string", "description",
                    "Start date (DD-MM-YYYY)."),
                "endDate", Map.of("type", "string", "description",
                    "End date (DD-MM-YYYY)."),
                "query", Map.of("type", "string", "description",
                    "Advanced Gmail search. Examples: 'from:name@gmail.com', 'to:name@gmail.com'. For SENT, use 'label:SENT'. For RECEIVED, use 'label:INBOX'. For UNREAD, include 'is:unread'."),
                "maxResults", Map.of("type", "integer", "description",
                    "Max emails to return (default 20, max 50)."),
                "labelFilter", Map.of("type", "string", "description",
                    "Label filter: INBOX, SENT, STARRED, UNREAD, DRAFTS. Use this to explicitly search folders.")
            ),
            "required", Collections.emptyList()
        );
    }

    @Override
    @SuppressWarnings("unchecked")
    public Object execute(String userId, Map<String, Object> arguments) {
        String dateFilter = (String) arguments.get("dateFilter");
        String startDateStr = (String) arguments.get("startDate");
        String endDateStr = (String) arguments.get("endDate");
        String userQuery = (String) arguments.getOrDefault("query", "");
        String labelFilter = (String) arguments.getOrDefault("labelFilter", "");
        int maxResults = DEFAULT_MAX_RESULTS;

        Object maxResultsObj = arguments.get("maxResults");
        if (maxResultsObj != null) {
            try {
                maxResults = Math.min(maxResultsObj instanceof Integer ? (Integer) maxResultsObj :
                        Integer.parseInt(maxResultsObj.toString()), 50);
            } catch (NumberFormatException e) {
                log.warn("Invalid maxResults value: {}", maxResultsObj);
            }
        }
        final int finalMaxResults = maxResults;

        try {
            return oAuthService.executeGoogleApiWithRetry(userId, accessToken -> {
                try {
                    String dateQuery = buildDateEpochQuery(dateFilter, startDateStr, endDateStr);
                    String gmailQuery = (dateQuery != null) ? dateQuery : "";
                    
                    if (userQuery != null && !userQuery.isBlank()) {
                        gmailQuery = gmailQuery.isEmpty() ? userQuery : gmailQuery + " " + userQuery;
                    }

                    // If completely empty, default to a wider window (30 days) to be more helpful,
                    if (gmailQuery.isBlank() && (dateFilter == null || !dateFilter.equalsIgnoreCase("all_time"))) {
                        gmailQuery = buildDateEpochQuery("last_30_days", null, null);
                    }

                    log.info("Reading emails for user {} with query: '{}', label: '{}', max: {}",
                            userId, gmailQuery, labelFilter, finalMaxResults);

                    // Step 1: List message IDs
                    String finalQuery = gmailQuery;
                    if (!finalQuery.isBlank()) {
                        finalQuery = finalQuery.replaceAll("after:(\\d{4})-(\\d{2})-(\\d{2})", "after:$1/$2/$3")
                                               .replaceAll("before:(\\d{4})-(\\d{2})-(\\d{2})", "before:$1/$2/$3");
                    }

                    final String fQuery = finalQuery;
                    final int fMaxResults = finalMaxResults;

                    StringBuilder urlBuilder = new StringBuilder("https://www.googleapis.com/gmail/v1/users/me/messages?");
                    urlBuilder.append("maxResults=").append(fMaxResults);
                    
                    if (!fQuery.isBlank()) {
                        urlBuilder.append("&q=").append(URLEncoder.encode(fQuery, StandardCharsets.UTF_8));
                    }
                    if (labelFilter != null && !labelFilter.isBlank() && !labelFilter.equalsIgnoreCase("ALL")) {
                        String uppercaseLabel = labelFilter.toUpperCase().trim();
                        urlBuilder.append("&labelIds=").append(URLEncoder.encode(uppercaseLabel, StandardCharsets.UTF_8));
                    }

                    String listResponse = aiRestClient.get()
                            .uri(URI.create(urlBuilder.toString()))
                            .header("Authorization", "Bearer " + accessToken)
                            .accept(MediaType.APPLICATION_JSON)
                            .retrieve()
                            .body(String.class);

                    Map<String, Object> listResult = objectMapper.readValue(listResponse, Map.class);

                    List<Map<String, String>> messageRefs = (List<Map<String, String>>) listResult.get("messages");
                    if (messageRefs == null || messageRefs.isEmpty()) {
                        return Map.of(
                            "success", true,
                            "count", 0,
                            "emails", List.of(),
                            "message", "No emails found for the specified filter.",
                            "query_used", gmailQuery
                        );
                    }

                    // Step 2: Fetch each message's details
                    List<Map<String, Object>> emails = new ArrayList<>();
                    for (Map<String, String> ref : messageRefs) {
                        try {
                            Map<String, Object> emailDetail = fetchEmailDetail(accessToken, ref.get("id"));
                            if (emailDetail != null) {
                                emails.add(emailDetail);
                            }
                        } catch (Exception e) {
                            log.warn("Failed to fetch email {}: {}", ref.get("id"), e.getMessage());
                        }
                    }

                    // Sort by timestamp descending (newest first)
                    emails.sort((a, b) -> {
                        long tsA = ((Number) a.getOrDefault("timestamp_epoch", 0L)).longValue();
                        long tsB = ((Number) b.getOrDefault("timestamp_epoch", 0L)).longValue();
                        return Long.compare(tsB, tsA);
                    });

                    return Map.of(
                        "success", true,
                        "count", emails.size(),
                        "emails", emails,
                        "query_used", gmailQuery,
                        "hint", "CRITICAL INSTRUCTION FOR SUMMARY: Present these emails using a highly readable, structured markdown layout:\n\n" +
                                "1. 📅 **[Date and Time]**\n" +
                                "   👤 **From**: [Sender Name/Email]\n" +
                                "   📌 **Subject**: [Accurate Subject]\n" +
                                "   📝 **Summary**: [Write a very simple, 1-2 sentence summary.]\n" +
                                "   <!-- (Internal ID: [threadId] | [messageIdHeader]) -->\n\n" +
                                "CRITICAL: You MUST include the HTML comment <!-- (Internal ID: ...) --> exactly as it appears in the data for each email. This is mandatory for trackability but will be invisible to the user. Format the list with appropriate spacing. Never output raw JSON. Always conclude by asking if the user would like to take action."
                    );
                } catch (org.springframework.web.client.HttpClientErrorException e) {
                    throw e; // Rethrow to be caught by the retry logic if 401
                } catch (Exception e) {
                    throw new RuntimeException("Email fetch failed: " + e.getMessage(), e);
                }
            });

        } catch (IllegalArgumentException e) {
            // No Google credentials linked
            log.warn("No Google credentials for user {}: {}", userId, e.getMessage());
            return Map.of("success", false,
                "message", "You haven't linked your Google account yet. Please login with Google to access your Gmail.",
                "error_type", "PERMISSION_DENIED");
        } catch (Exception e) {
            String errMsg = e.getMessage() != null ? e.getMessage() : "Unknown error";
            log.error("Failed to read emails for user {}: {}", userId, errMsg, e);
            if (isPermissionError(errMsg)) {
                return Map.of("success", false,
                    "message", "You don't have permission to access your Gmail. Please login with Google again to refresh access.",
                    "error_type", "PERMISSION_DENIED");
            }
            return Map.of("success", false, "message", "Failed to read emails: " + errMsg);
        }
    }

    private boolean isPermissionError(String errMsg) {
        return errMsg.contains("403") || errMsg.contains("401")
                || errMsg.contains("Forbidden") || errMsg.contains("insufficient")
                || errMsg.contains("Unauthorized") || errMsg.contains("No Google credentials")
                || errMsg.contains("PERMISSION_DENIED") || errMsg.contains("access_denied");
    }

    private String buildDateEpochQuery(String dateFilter, String startDateStr, String endDateStr) {
        LocalDate today = LocalDate.now(IST);
        LocalDate startDate;
        LocalDate endDate;

        if (dateFilter != null && !dateFilter.isBlank()) {
            switch (dateFilter.toLowerCase().trim()) {
                case "today" -> {
                    startDate = today;
                    endDate = today;
                }
                case "yesterday" -> {
                    startDate = today.minusDays(1);
                    endDate = today.minusDays(1);
                }
                case "this_week", "this week" -> {
                    startDate = today.with(DayOfWeek.MONDAY);
                    endDate = today;
                }
                case "last_week", "last week" -> {
                    startDate = today.minusWeeks(1).with(DayOfWeek.MONDAY);
                    endDate = today.minusWeeks(1).with(DayOfWeek.SUNDAY);
                }
                case "last_3_days", "last 3 days" -> {
                    startDate = today.minusDays(2);
                    endDate = today;
                }
                case "last_7_days", "last 7 days" -> {
                    startDate = today.minusDays(6);
                    endDate = today;
                }
                case "last_30_days", "last 30 days" -> {
                    startDate = today.minusDays(29);
                    endDate = today;
                }
                default -> {
                    try {
                        startDate = LocalDate.parse(dateFilter, DD_MM_YYYY);
                        endDate = startDate;
                    } catch (Exception e) {
                        // Fallback: try YYYY-MM-DD (ISO) format
                        try {
                            startDate = LocalDate.parse(dateFilter, DateTimeFormatter.ISO_LOCAL_DATE);
                            endDate = startDate;
                        } catch (Exception e2) {
                            // Fallback: try month name (e.g., "march", "february")
                            try {
                                Month m = Month.valueOf(dateFilter.toUpperCase().trim());
                                int year = today.getYear();
                                startDate = LocalDate.of(year, m, 1);
                                endDate = LocalDate.of(year, m, m.length(LocalDate.of(year, 1, 1).isLeapYear()));
                            } catch (Exception e3) {
                                return null;
                            }
                        }
                    }
                }
            }
        } else if (startDateStr != null) {
            try {
                startDate = LocalDate.parse(startDateStr, DD_MM_YYYY);
                endDate = (endDateStr != null) ? LocalDate.parse(endDateStr, DD_MM_YYYY) : startDate;
            } catch (Exception e) {
                return null;
            }
        } else {
            return null;
        }

        long startEpoch = startDate.atStartOfDay(IST).toEpochSecond();
        long endEpoch = endDate.plusDays(1).atStartOfDay(IST).toEpochSecond();

        return "after:" + startEpoch + " before:" + endEpoch;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchEmailDetail(String accessToken, String messageId) {
        String url = String.format(
            "https://www.googleapis.com/gmail/v1/users/me/messages/%s?format=full",
            messageId
        );

        String response = aiRestClient.get()
                .uri(URI.create(url))
                .header("Authorization", "Bearer " + accessToken)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(String.class);

        try {
            Map<String, Object> msg = objectMapper.readValue(response, Map.class);
            Map<String, Object> payload = (Map<String, Object>) msg.get("payload");

            if (payload == null) return null;

            List<Map<String, String>> headers = (List<Map<String, String>>) payload.get("headers");

            String from = getHeader(headers, "From");
            String to = getHeader(headers, "To");
            String subject = getHeader(headers, "Subject");
            String date = getHeader(headers, "Date");
            String replyTo = getHeader(headers, "Reply-To");
            String messageIdHeader = getHeader(headers, "Message-ID");

            String snippet = (String) msg.getOrDefault("snippet", "");
            String threadId = (String) msg.get("threadId");
            long internalDate = Long.parseLong(msg.getOrDefault("internalDate", "0").toString());
            List<String> labelIds = (List<String>) msg.getOrDefault("labelIds", List.of());

            // Extract body text
            String body = extractBodyText(payload);

            // Format the timestamp
            String formattedTime = "";
            if (internalDate > 0) {
                Instant instant = Instant.ofEpochMilli(internalDate);
                formattedTime = LocalDateTime.ofInstant(instant, IST)
                        .format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm"));
            }

            Map<String, Object> emailInfo = new LinkedHashMap<>();
            emailInfo.put("messageId", messageId);
            emailInfo.put("threadId", threadId);
            emailInfo.put("from", from);
            emailInfo.put("to", to);
            emailInfo.put("subject", subject != null ? subject : "(No Subject)");
            emailInfo.put("snippet", snippet);
            emailInfo.put("body", body != null && body.length() > 500 ? body.substring(0, 500) + "..." : body);
            emailInfo.put("local_date_ist", formattedTime); // Standardized to local timezone for the AI
            emailInfo.put("raw_header_date", date); // The raw unparsed Date header
            emailInfo.put("timestamp_epoch", internalDate);
            emailInfo.put("labels", labelIds);
            emailInfo.put("is_unread", labelIds.contains("UNREAD"));
            emailInfo.put("is_starred", labelIds.contains("STARRED"));
            if (replyTo != null) emailInfo.put("replyTo", replyTo);
            if (messageIdHeader != null) emailInfo.put("messageIdHeader", messageIdHeader);

            return emailInfo;

        } catch (Exception e) {
            log.warn("Error parsing email {}: {}", messageId, e.getMessage());
            return null;
        }
    }

    private String getHeader(List<Map<String, String>> headers, String name) {
        if (headers == null) return null;
        return headers.stream()
                .filter(h -> name.equalsIgnoreCase(h.get("name")))
                .map(h -> h.get("value"))
                .findFirst()
                .orElse(null);
    }

    @SuppressWarnings("unchecked")
    private String extractBodyText(Map<String, Object> payload) {
        // Check for direct body data
        Map<String, Object> body = (Map<String, Object>) payload.get("body");
        if (body != null && body.get("data") != null) {
            return decodeBase64Url((String) body.get("data"));
        }

        // Check parts recursively
        List<Map<String, Object>> parts = (List<Map<String, Object>>) payload.get("parts");
        if (parts != null) {
            // Prefer text/plain first
            for (Map<String, Object> part : parts) {
                String mimeType = (String) part.get("mimeType");
                if ("text/plain".equals(mimeType)) {
                    Map<String, Object> partBody = (Map<String, Object>) part.get("body");
                    if (partBody != null && partBody.get("data") != null) {
                        return decodeBase64Url((String) partBody.get("data"));
                    }
                }
            }
            // Fallback to text/html
            for (Map<String, Object> part : parts) {
                String mimeType = (String) part.get("mimeType");
                if ("text/html".equals(mimeType)) {
                    Map<String, Object> partBody = (Map<String, Object>) part.get("body");
                    if (partBody != null && partBody.get("data") != null) {
                        String html = decodeBase64Url((String) partBody.get("data"));
                        // Strip HTML tags for plain text
                        return html.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();
                    }
                }
            }
            // Check multipart nested parts
            for (Map<String, Object> part : parts) {
                String mimeType = (String) part.get("mimeType");
                if (mimeType != null && mimeType.startsWith("multipart/")) {
                    String nested = extractBodyText(part);
                    if (nested != null) return nested;
                }
            }
        }
        return null;
    }

    private String decodeBase64Url(String data) {
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(data);
            return new String(decoded, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.warn("Base64 decode failed: {}", e.getMessage());
            return null;
        }
    }
}
