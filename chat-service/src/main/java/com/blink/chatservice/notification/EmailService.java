package com.blink.chatservice.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@ConditionalOnBean(JavaMailSender.class)
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendNewMessageEmail(String to, String preview) {
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(to);
            mail.setSubject("New message on Blink");
            mail.setText("You have a new message: \n\n" + preview);
            mailSender.send(mail);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }
}
