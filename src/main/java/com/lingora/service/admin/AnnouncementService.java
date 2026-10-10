package com.lingora.service.admin;

import com.lingora.domain.Announcement;
import com.lingora.repository.AnnouncementRepository;
import com.lingora.service.content.ContentValidationException;
import com.lingora.service.learning.NotFoundException;
import com.lingora.service.util.Json;
import java.time.Instant;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

/** Site-wide banners managed by admins (message localized in vi / en / ja). */
@Service
@Transactional
public class AnnouncementService {

    private static final Set<String> LEVELS = Set.of("info", "success", "warning");
    private static final String[] LOCALES = { "vi", "en", "ja" };
    private static final int MAX_MESSAGE = 500;
    private static final long PUBLIC_TTL_MS = 60_000;

    private final AnnouncementRepository repo;
    private volatile ArrayNode publicCache;
    private volatile long publicCachedAt;

    public AnnouncementService(AnnouncementRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public ArrayNode all() {
        ArrayNode arr = Json.arr();
        repo.findAllByOrderByCreatedAtDesc().forEach(a -> arr.add(toJson(a)));
        return arr;
    }

    /** Active announcements whose time window contains now; cached for a minute. */
    @Transactional(readOnly = true)
    public ArrayNode active() {
        long now = System.currentTimeMillis();
        ArrayNode cached = publicCache;
        if (cached != null && now - publicCachedAt < PUBLIC_TTL_MS) return cached;
        Instant t = Instant.ofEpochMilli(now);
        ArrayNode arr = Json.arr();
        repo
            .findAllByActiveTrueOrderByCreatedAtDesc()
            .stream()
            .filter(a -> (a.startsAt == null || !a.startsAt.isAfter(t)) && (a.endsAt == null || a.endsAt.isAfter(t)))
            .limit(5)
            .forEach(a -> arr.add(toJson(a)));
        publicCache = arr;
        publicCachedAt = now;
        return arr;
    }

    public ObjectNode create(JsonNode body) {
        Announcement a = new Announcement();
        a.createdAt = Instant.now();
        apply(a, body);
        return toJson(repo.save(a));
    }

    public ObjectNode update(Long id, JsonNode body) {
        Announcement a = repo.findById(id).orElseThrow(() -> new NotFoundException("Không tìm thấy thông báo"));
        apply(a, body);
        return toJson(repo.save(a));
    }

    public void delete(Long id) {
        repo.deleteById(id);
        publicCache = null;
    }

    private void apply(Announcement a, JsonNode body) {
        if (body == null || !body.isObject()) throw new ContentValidationException("Dữ liệu không hợp lệ");
        ObjectNode message = Json.obj();
        JsonNode m = body.path("message");
        boolean any = false;
        for (String loc : LOCALES) {
            String text = m.path(loc).asString("").trim();
            if (text.length() > MAX_MESSAGE) throw new ContentValidationException("Nội dung thông báo quá dài (tối đa " + MAX_MESSAGE + " ký tự)");
            message.put(loc, text);
            any |= !text.isEmpty();
        }
        if (!any) throw new ContentValidationException("Cần nhập nội dung thông báo");
        String level = body.path("level").asString("info");
        if (!LEVELS.contains(level)) throw new ContentValidationException("Mức độ không hợp lệ");
        String link = body.path("linkUrl").asString("").trim();
        if (!link.isEmpty() && (link.length() > 500 || !(link.startsWith("https://") || (link.startsWith("/") && !link.startsWith("//"))))) {
            throw new ContentValidationException("Liên kết phải bắt đầu bằng https:// hoặc /");
        }
        Instant starts = instant(body.path("startsAt"));
        Instant ends = instant(body.path("endsAt"));
        if (starts != null && ends != null && !ends.isAfter(starts)) throw new ContentValidationException("Thời gian kết thúc phải sau thời gian bắt đầu");
        a.message = Json.write(message);
        a.level = level;
        a.linkUrl = link.isEmpty() ? null : link;
        a.active = body.path("active").asBoolean(true);
        a.startsAt = starts;
        a.endsAt = ends;
        a.updatedAt = Instant.now();
        publicCache = null;
    }

    private static Instant instant(JsonNode n) {
        if (n == null || n.isNull() || n.isMissingNode()) return null;
        if (n.isNumber()) return n.asLong() > 0 ? Instant.ofEpochMilli(n.asLong()) : null;
        String s = n.asString("").trim();
        if (s.isEmpty()) return null;
        try {
            return Instant.parse(s);
        } catch (RuntimeException e) {
            throw new ContentValidationException("Thời gian không hợp lệ");
        }
    }

    static ObjectNode toJson(Announcement a) {
        ObjectNode o = Json.obj();
        o.put("id", a.id);
        o.set("message", Json.read(a.message));
        o.put("level", a.level);
        if (a.linkUrl != null) o.put("linkUrl", a.linkUrl);
        else o.putNull("linkUrl");
        o.put("active", a.active);
        o.put("startsAt", a.startsAt == null ? 0 : a.startsAt.toEpochMilli());
        o.put("endsAt", a.endsAt == null ? 0 : a.endsAt.toEpochMilli());
        o.put("createdAt", a.createdAt == null ? 0 : a.createdAt.toEpochMilli());
        o.put("updatedAt", a.updatedAt == null ? 0 : a.updatedAt.toEpochMilli());
        return o;
    }
}
