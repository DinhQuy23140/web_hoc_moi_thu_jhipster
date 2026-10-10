package com.lingora.service.admin;

import com.lingora.domain.AdminAudit;
import com.lingora.repository.AdminAuditRepository;
import com.lingora.service.util.Json;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

/** Log of every state-changing admin request, kept for a year. */
@Service
public class AuditService {

    private static final Logger LOG = LoggerFactory.getLogger(AuditService.class);
    private static final long RETENTION_DAYS = 365;

    private final AdminAuditRepository repo;

    public AuditService(AdminAuditRepository repo) {
        this.repo = repo;
    }

    @Async
    @Transactional
    public void record(Long actorId, String actorLogin, String method, String path, int status, String ip) {
        try {
            AdminAudit a = new AdminAudit();
            a.actorId = actorId;
            a.actorLogin = cut(actorLogin, 50);
            a.method = cut(method, 8);
            a.path = cut(path, 500);
            a.status = status;
            a.ip = cut(ip, 64);
            a.createdAt = Instant.now();
            repo.save(a);
        } catch (RuntimeException e) {
            LOG.warn("Could not write admin audit entry: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public ObjectNode page(int page, int size) {
        Page<AdminAudit> result = repo.findAllByOrderByCreatedAtDesc(PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100)));
        ObjectNode o = Json.obj();
        ArrayNode items = o.putArray("items");
        for (AdminAudit a : result) {
            ObjectNode r = items.addObject();
            r.put("id", a.id);
            if (a.actorId != null) r.put("actorId", a.actorId);
            r.put("actorLogin", a.actorLogin);
            r.put("method", a.method);
            r.put("path", a.path);
            r.put("status", a.status);
            r.put("ip", a.ip);
            r.put("createdAt", a.createdAt.toEpochMilli());
        }
        o.put("page", result.getNumber());
        o.put("hasMore", result.hasNext());
        o.put("total", result.getTotalElements());
        return o;
    }

    @Scheduled(cron = "0 45 3 * * *")
    @Transactional
    public void purgeOld() {
        repo.deleteOlderThan(Instant.now().minus(RETENTION_DAYS, ChronoUnit.DAYS));
    }

    private static String cut(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max);
    }
}
