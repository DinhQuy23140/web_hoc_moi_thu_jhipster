package com.lingora.service.learning;

import static com.lingora.service.util.Json.*;

import com.lingora.domain.LearningSession;
import com.lingora.repository.LearningSessionRepository;
import com.lingora.service.content.ContentValidationException;
import com.lingora.service.util.Json;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

/**
 * Resume points for unfinished lessons and mock exams. The client owns the shape of
 * {@code state} (answers, current step, timer...); the server only bounds its size and
 * keeps the newest sessions per learner.
 */
@Service
@Transactional
public class SessionService {

    static final Set<String> KINDS = Set.of("lesson", "exam");
    static final Duration TTL = Duration.ofDays(30);
    static final int MAX_PER_USER = 30;
    static final int MAX_STATE_CHARS = 200_000;
    private static final Pattern REF_ID = Pattern.compile("^[\\w.:-]{1,100}$");

    private final LearningSessionRepository sessions;

    public SessionService(LearningSessionRepository sessions) {
        this.sessions = sessions;
    }

    @Transactional(readOnly = true)
    public ArrayNode list(Long userId, String kind, int limit) {
        Instant after = Instant.now().minus(TTL);
        PageRequest page = PageRequest.of(0, Math.max(1, Math.min(limit, MAX_PER_USER)));
        List<LearningSession> rows = kind == null || kind.isBlank()
            ? sessions.findAllByUserIdAndUpdatedAtAfterOrderByUpdatedAtDesc(userId, after, page)
            : sessions.findAllByUserIdAndKindAndUpdatedAtAfterOrderByUpdatedAtDesc(userId, checkKind(kind), after, page);
        ArrayNode out = Json.arr();
        rows.forEach(s -> out.add(toJson(s, false)));
        return out;
    }

    @Transactional(readOnly = true)
    public ObjectNode get(Long userId, String kind, String refId) {
        return sessions
            .findOneByUserIdAndKindAndRefId(userId, checkKind(kind), checkRef(refId))
            .filter(s -> s.updatedAt.isAfter(Instant.now().minus(TTL)))
            .map(s -> toJson(s, true))
            .orElse(null);
    }

    public ObjectNode save(Long userId, String kind, String refId, JsonNode body) {
        String k = checkKind(kind);
        String ref = checkRef(refId);
        JsonNode stateNode = body == null ? null : body.get("state");
        String state = Json.write(stateNode);
        if (state != null && state.length() > MAX_STATE_CHARS) throw new ContentValidationException("Dữ liệu phiên học quá lớn");
        if (state != null && !stateNode.isObject()) throw new ContentValidationException("Trạng thái phiên học không hợp lệ");

        Instant now = Instant.now();
        LearningSession s = sessions.findOneByUserIdAndKindAndRefId(userId, k, ref).orElse(null);
        if (s == null) {
            s = new LearningSession();
            s.userId = userId;
            s.kind = k;
            s.refId = ref;
            s.createdAt = now;
        }
        s.courseId = str(body, "courseId", 100);
        s.languageId = str(body, "languageId", 8);
        s.title = str(body, "title", 200);
        s.total = Math.max(0, Math.min(integer(body, "total", 0), 10_000));
        s.position = Math.max(0, Math.min(integer(body, "position", 0), s.total == 0 ? 10_000 : s.total));
        s.state = state;
        s.updatedAt = now;
        sessions.save(s);
        trim(userId);
        return toJson(s, false);
    }

    public void delete(Long userId, String kind, String refId) {
        sessions.deleteOne(userId, checkKind(kind), checkRef(refId));
    }

    /** Keeps only the newest {@link #MAX_PER_USER} sessions of a learner. */
    private void trim(Long userId) {
        if (sessions.countByUserId(userId) <= MAX_PER_USER) return;
        List<LearningSession> all = sessions.findAllByUserIdOrderByUpdatedAtDesc(userId, PageRequest.of(0, 500));
        sessions.deleteAll(all.subList(Math.min(MAX_PER_USER, all.size()), all.size()));
    }

    @Scheduled(cron = "0 30 3 * * *")
    public void purgeExpired() {
        sessions.deleteOlderThan(Instant.now().minus(TTL));
    }

    @Transactional(readOnly = true)
    public long activeSince(Instant after) {
        return sessions.countByUpdatedAtAfter(after);
    }

    @Transactional(readOnly = true)
    public ArrayNode forAdmin(Long userId) {
        ArrayNode out = Json.arr();
        sessions.findAllByUserIdOrderByUpdatedAtDesc(userId, PageRequest.of(0, 20)).forEach(s -> out.add(toJson(s, false)));
        return out;
    }

    static ObjectNode toJson(LearningSession s, boolean withState) {
        ObjectNode o = Json.obj();
        o.put("kind", s.kind);
        o.put("refId", s.refId);
        put(o, "courseId", s.courseId);
        put(o, "languageId", s.languageId);
        put(o, "title", s.title);
        o.put("position", s.position);
        o.put("total", s.total);
        o.put("percent", s.total > 0 ? Math.round(s.position * 100f / s.total) : 0);
        o.put("updatedAt", s.updatedAt.toEpochMilli());
        if (withState) {
            JsonNode st = read(s.state);
            if (st != null) o.set("state", st);
            else o.putObject("state");
        }
        return o;
    }

    private static String checkKind(String kind) {
        if (!KINDS.contains(kind)) throw new ContentValidationException("Loại phiên học không hợp lệ");
        return kind;
    }

    private static String checkRef(String refId) {
        if (refId == null || !REF_ID.matcher(refId).matches()) throw new ContentValidationException("Mã bài không hợp lệ");
        return refId;
    }
}
