package com.blink.chatservice.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;


@RequiredArgsConstructor
@Slf4j
@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Async
    public void sendOtpEmail(String to, String otp, String appName, String verifyUrl) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject("Verify Your " + appName + " Account - Your OTP Code");

            Context context = new Context();
            context.setVariable("otp", otp);
            context.setVariable("appName", appName);
            context.setVariable("verifyUrl", verifyUrl);
            String htmlContent = templateEngine.process("otp-mail", context);

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);
            log.info("OTP email sent successfully to: {}", to);
        } catch (MessagingException | MailException e) {
            log.error("Failed to send OTP email to {}: {}", to, e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error sending OTP email to {}: {}", to, e.getMessage(), e);
        }
    }

    @Async
    public void sendNewMessageEmail(String to, String preview, String appName) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject("New Message on " + appName);

            Context context = new Context();
            context.setVariable("preview", preview);
            context.setVariable("appName", appName);
            String htmlContent = templateEngine.process("message-mail", context);

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);
            log.info("New message email sent to: {}", to);
        } catch (MessagingException | MailException e) {
            log.error("Failed to send new message email to {}: {}", to, e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error sending new message email to {}: {}", to, e.getMessage(), e);
        }
    }
}
