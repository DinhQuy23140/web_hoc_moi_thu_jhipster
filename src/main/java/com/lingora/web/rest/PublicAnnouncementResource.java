package com.lingora.web.rest;

import com.lingora.service.admin.AnnouncementService;
import java.time.Duration;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.node.ArrayNode;

/** Announcements currently shown to every visitor. */
@RestController
@RequestMapping("/api/public")
public class PublicAnnouncementResource {

    private final AnnouncementService announcements;

    public PublicAnnouncementResource(AnnouncementService announcements) {
        this.announcements = announcements;
    }

    @GetMapping("/announcements")
    public ResponseEntity<ArrayNode> announcements() {
        return ResponseEntity.ok().cacheControl(CacheControl.maxAge(Duration.ofMinutes(1)).cachePublic()).body(announcements.active());
    }
}
