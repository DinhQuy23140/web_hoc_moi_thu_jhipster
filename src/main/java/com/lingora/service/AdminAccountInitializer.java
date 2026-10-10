package com.lingora.service;

import com.lingora.config.ApplicationProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/** Ensures the administrator configured by {@code application.admin.*} exists once the application is up. */
@Component
public class AdminAccountInitializer {

    private static final Logger LOG = LoggerFactory.getLogger(AdminAccountInitializer.class);

    private final ApplicationProperties properties;
    private final UserService userService;

    public AdminAccountInitializer(ApplicationProperties properties, UserService userService) {
        this.properties = properties;
        this.userService = userService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void ensureAdmin() {
        ApplicationProperties.Admin admin = properties.getAdmin();
        if (!admin.isConfigured()) return;
        try {
            UserService.AdminAccount account = userService.ensureAdmin(admin.getEmail(), admin.getPassword());
            LOG.info("Administrator {} {}", account.user().getEmail(), account.created() ? "created" : "verified");
        } catch (RuntimeException e) {
            LOG.error("Could not ensure the administrator account {}", admin.getEmail(), e);
        }
    }
}
