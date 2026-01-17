package com.blink.chatservice.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class CreateGroupRequest {

    @NotBlank
    private String title;

    @NotNull
    private List<String> participantIds;
}
