package com.blink.chatservice.ai.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class AiAnalysisModels {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ConversationAnalysis(
            String summary,
            @JsonProperty("key_points") List<String> keyPoints,
            String sentiment,
            String urgency,
            @JsonProperty("follow_up_required") boolean followUpRequired
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record AutoReplySuggestions(
            @JsonProperty("suggested_replies") List<String> suggestedReplies
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record SearchCriteria(
            List<String> keywords,
            @JsonProperty("user_names") List<String> userNames,
            @JsonProperty("date_range") DateRange dateRange,
            String sentiment,
            @JsonProperty("conversation_type") String conversationType
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record DateRange(String from, String to) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record TaskExtraction(
            @JsonProperty("task_title") String taskTitle,
            String description,
            @JsonProperty("due_date") String dueDate,
            String priority
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record TypingSimulation(
            @JsonProperty("response_complexity") String responseComplexity,
            @JsonProperty("typing_duration_ms") int typingDurationMs
    ) {}
}
