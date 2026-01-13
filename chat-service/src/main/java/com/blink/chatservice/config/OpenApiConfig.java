package com.blink.chatservice.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.servers.Server;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Blink Chat Service API",
                version = "v1",
                description = "Real-time chat backend (users, conversations, messages, WebSocket)",
                contact = @Contact(name = "Blink Backend")
        ),
        servers = {
                @Server(url = "http://localhost:8080", description = "Local Dev")
        },
        security = @SecurityRequirement(name = "bearerToken")
)
public class OpenApiConfig {

    @Bean
    public OpenAPI blinkOpenAPI() {
        return new OpenAPI()
                .info(new io.swagger.v3.oas.models.info.Info()
                        .title("Blink Chat Service API")
                        .version("v1")
                        .description("API docs for Blink chat backend")
                        .license(new License().name("MIT")))
                .components(new io.swagger.v3.oas.models.Components()
                        .addSecuritySchemes("bearerToken", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
