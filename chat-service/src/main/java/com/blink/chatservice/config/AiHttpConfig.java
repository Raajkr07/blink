package com.blink.chatservice.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class AiHttpConfig {
    @Bean
    public RestTemplate aiRestTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(10))
                // AI calls can be slow, so increasing read timeout to avoid premature failures.
                .setReadTimeout(Duration.ofSeconds(30))
                .build();
    }
}
