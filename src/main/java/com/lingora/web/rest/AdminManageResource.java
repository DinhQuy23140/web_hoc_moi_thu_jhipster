package com.lingora.web.rest;

import static com.lingora.web.rest.RestSupport.currentUserId;

import com.lingora.security.AuthoritiesConstants;
import com.lingora.security.SecurityUtils;
import com.lingora.service.admin.AdminStatsService;
import com.lingora.service.admin.AdminUserService;
import com.lingora.service.admin.AnnouncementService;
import com.lingora.service.admin.AuditService;
import com.lingora.service.util.Json;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

/** Site management for admins: analytics, learner accounts, announcements and the audit log. */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
public class AdminManageResource {

    private final AdminStatsService stats;
    private final AdminUserService accounts;
    private final AnnouncementService announcements;
    private final AuditService audit;

    public AdminManageResource(AdminStatsService stats, AdminUserService accounts, AnnouncementService announcements, AuditService audit) {
        this.stats = stats;
        this.accounts = accounts;
        this.announcements = announcements;
        this.audit = audit;
    }

    @GetMapping("/stats/overview")
    public ObjectNode overview(@RequestParam(defaultValue = "30") int days) {
        return stats.overview(days);
    }

    @GetMapping("/accounts")
    public ObjectNode accounts(
        @RequestParam(required = false) String q,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return accounts.page(q, page, size);
    }

    @GetMapping("/accounts/{id}")
    public ObjectNode account(@PathVariable Long id) {
        return accounts.detail(id);
    }

    @PutMapping("/accounts/{id}/lock")
    public ObjectNode setLocked(@PathVariable Long id, @RequestBody JsonNode body) {
        return accounts.setLocked(
            currentUserId(),
            SecurityUtils.getCurrentUserLogin().orElse(null),
            id,
            Json.bool(body, "locked", true),
            Json.str(body, "reason", 500)
        );
    }

    @PostMapping("/accounts/{id}/activate")
    public ObjectNode activate(@PathVariable Long id) {
        return accounts.activate(id);
    }

    @PutMapping("/accounts/{id}/role")
    public ObjectNode setRole(@PathVariable Long id, @RequestBody JsonNode body) {
        return accounts.setAdmin(currentUserId(), id, Json.bool(body, "admin", false));
    }

    @PostMapping("/accounts/{id}/password-reset")
    public ResponseEntity<Void> passwordReset(@PathVariable Long id) {
        accounts.sendPasswordReset(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/accounts/{id}/resend-activation")
    public ResponseEntity<Void> resendActivation(@PathVariable Long id) {
        accounts.resendActivation(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/accounts/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        accounts.delete(currentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/announcements")
    public ArrayNode announcements() {
        return announcements.all();
    }

    @PostMapping("/announcements")
    public ObjectNode createAnnouncement(@RequestBody JsonNode body) {
        return announcements.create(body);
    }

    @PutMapping("/announcements/{id}")
    public ObjectNode updateAnnouncement(@PathVariable Long id, @RequestBody JsonNode body) {
        return announcements.update(id, body);
    }

    @DeleteMapping("/announcements/{id}")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable Long id) {
        announcements.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/audit")
    public ObjectNode audit(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "30") int size) {
        return audit.page(page, size);
    }
}
