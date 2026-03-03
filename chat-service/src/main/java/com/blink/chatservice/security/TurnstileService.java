package com.blink.chatservice.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class TurnstileService {

    private static final Logger log = LoggerFactory.getLogger(TurnstileService.class);

    @Value("${turnstile.secret}")
    private String turnstileSecret;

    private static final String VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    public boolean verifyToken(String token) {
        if (token == null || token.isEmpty()) {
            log.warn("Turnstile token is missing or empty");
            return false;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("secret", turnstileSecret);
            map.add("response", token);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(VERIFY_URL, request, Map.class);

            if (response.getBody() != null) {
                Boolean success = (Boolean) response.getBody().get("success");
                if (success != null && success) {
                    return true;
                } else {
                    log.warn("Turnstile verification failed: {}", response.getBody());
                }
            }
        } catch (Exception e) {
            log.error("Error verifying Turnstile token", e);
        }
        return false;
    }
}
