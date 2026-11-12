package com.zora.zora.service;

import com.zora.zora.config.MailConfig;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.core.io.ClassPathResource;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

import java.util.Properties;

public class MailService {

    private final JavaMailSender mailSender;
    private final String from;

    private MailService() {
        MailConfig config = MailConfig.getInstance();

        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(config.getHost());
        sender.setPort(config.getPort());
        sender.setUsername(config.getUsername());
        sender.setPassword(config.getPassword());
        sender.setDefaultEncoding("UTF-8");

        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");

        this.mailSender = sender;
        this.from = config.getFrom();

    }

    private static class Holder {
        private static final MailService INSTANCE = new MailService();
    }

    public static MailService getInstance() {
        return Holder.INSTANCE;
    }

    public void send(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    public void sendHTML(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new IllegalStateException("Failed to send HTML email", e);
        }
    }

    public void sendRecoveryCode(String to, String code) {
        try {
            var resource = new ClassPathResource(
                    "templates/emails/password-recovery.html"
            );

            String html = new String(
                    resource.getInputStream().readAllBytes(),
                    StandardCharsets.UTF_8
            );

            html = html.replace("{{CODE}}", code);

            sendHTML(
                    to,
                    "Zora - Password Recovery",
                    html
            );

        } catch (IOException e) {
            throw new IllegalStateException(
                    "Failed to load password recovery email template", e
            );
        }
    }

    public void sendWelcomeMessage(String to, String username) {
        try {
            var resource = new ClassPathResource(
                    "templates/emails/welcome-message.html"
            );

            String html = new String(
                    resource.getInputStream().readAllBytes(),
                    StandardCharsets.UTF_8
            );

            html = html.replace("{{USERNAME}}", username);

            sendHTML(
                    to,
                    "Welcome to Zora – Your Account Has Been Created!",
                    html
            );

        } catch (IOException e) {
            throw new IllegalStateException(
                    "Failed to load password recovery email template", e
            );
        }
    }
}
