package com.lingora.service.admin;

import com.lingora.config.ApplicationProperties;
import com.lingora.domain.Course;
import com.lingora.repository.CourseRepository;
import com.lingora.service.learning.SessionService;
import com.lingora.service.util.Json;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

/** Aggregates for the admin dashboard (activity, sign-ups, popular courses, attempts). */
@Service
@Transactional(readOnly = true)
public class AdminStatsService {

    @PersistenceContext
    private EntityManager em;

    private final CourseRepository courses;
    private final SessionService sessions;
    private final ApplicationProperties properties;

    public AdminStatsService(CourseRepository courses, SessionService sessions, ApplicationProperties properties) {
        this.courses = courses;
        this.sessions = sessions;
        this.properties = properties;
    }

    public ObjectNode overview(int days) {
        int n = Math.max(7, Math.min(days, 90));
        ZoneId zone = ZoneId.of(properties.getDefaultZone());
        LocalDate today = LocalDate.now(zone);
        LocalDate from = today.minusDays(n - 1L);
        Instant now = Instant.now();

        ObjectNode o = Json.obj();
        ObjectNode totals = o.putObject("totals");
        totals.put("users", scalar("select count(*) from jhi_user"));
        totals.put("activatedUsers", scalar("select count(*) from jhi_user where activated = true"));
        totals.put("admins", scalar("select count(*) from jhi_user_authority where authority_name = 'ROLE_ADMIN'"));
        totals.put("courses", scalar("select count(*) from course"));
        totals.put("publishedCourses", scalar("select count(*) from course where published = true"));
        totals.put("lessons", scalar("select count(*) from lesson"));
        totals.put("vocabularies", scalar("select count(*) from vocabulary"));
        totals.put("exams", scalar("select count(*) from exam"));
        totals.put("mistakes", scalar("select count(*) from mistake"));

        ObjectNode activity = o.putObject("activity");
        activity.put("activeToday", activeSince(today));
        activity.put("active7d", activeSince(today.minusDays(6)));
        activity.put("active30d", activeSince(today.minusDays(29)));
        activity.put("newUsers7d", count("select count(*) from jhi_user where created_date >= ?1", Timestamp.from(now.minus(Duration.ofDays(7)))));
        activity.put("lessons7d", count("select coalesce(sum(lessons), 0) from day_stat where day >= ?1", Date.valueOf(today.minusDays(6))));
        activity.put(
            "minutes7d",
            Math.round(number("select coalesce(sum(minutes), 0) from day_stat where day >= ?1", Date.valueOf(today.minusDays(6))))
        );
        activity.put("inProgressSessions", sessions.activeSince(now.minus(Duration.ofDays(7))));

        o.set("series", series(from, today));
        o.set("topCourses", topCourses());
        o.set("attempts", attempts(now.minus(Duration.ofDays(30))));
        return o;
    }

    private ArrayNode series(LocalDate from, LocalDate to) {
        Map<LocalDate, Object[]> byDay = new HashMap<>();
        for (Object[] r : rows(
            "select day, count(distinct user_id), coalesce(sum(xp), 0), coalesce(sum(lessons), 0), coalesce(sum(minutes), 0) " +
            "from day_stat where day >= ?1 group by day",
            Date.valueOf(from)
        )) {
            byDay.put(toLocalDate(r[0]), r);
        }
        Map<LocalDate, Long> signups = new HashMap<>();
        ZoneId zone = ZoneId.of(properties.getDefaultZone());
        Instant since = from.atStartOfDay(zone).toInstant();
        for (Object v : column("select created_date from jhi_user where created_date >= ?1", Timestamp.from(since))) {
            Instant created = toInstant(v);
            if (created != null) signups.merge(LocalDate.ofInstant(created, zone), 1L, Long::sum);
        }
        ArrayNode out = Json.arr();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            Object[] r = byDay.get(d);
            ObjectNode day = out.addObject();
            day.put("day", d.toString());
            day.put("active", r == null ? 0 : ((Number) r[1]).longValue());
            day.put("xp", r == null ? 0 : ((Number) r[2]).longValue());
            day.put("lessons", r == null ? 0 : ((Number) r[3]).longValue());
            day.put("minutes", r == null ? 0 : Math.round(((Number) r[4]).doubleValue()));
            day.put("signups", signups.getOrDefault(d, 0L));
        }
        return out;
    }

    private ArrayNode topCourses() {
        List<Object[]> top = rows(
            "select course_id, count(*), avg(percent), sum(case when percent >= 100 then 1 else 0 end) " +
            "from course_progress group by course_id order by count(*) desc limit 8"
        );
        Map<String, Course> byId = new HashMap<>();
        courses.findAllById(top.stream().map(r -> (String) r[0]).toList()).forEach(c -> byId.put(c.id, c));
        ArrayNode out = Json.arr();
        for (Object[] r : top) {
            ObjectNode c = out.addObject();
            String id = (String) r[0];
            Course course = byId.get(id);
            c.put("courseId", id);
            if (course != null) {
                Json.putRaw(c, "title", course.title);
                Json.put(c, "emoji", course.emoji);
                Json.put(c, "languageId", course.languageId);
            }
            c.put("learners", ((Number) r[1]).longValue());
            c.put("avgPercent", Math.round(((Number) r[2]).doubleValue()));
            c.put("completed", ((Number) r[3]).longValue());
        }
        return out;
    }

    private ArrayNode attempts(Instant since) {
        ArrayNode out = Json.arr();
        for (Object[] r : rows(
            "select kind, count(*), avg(score) from attempt where created_at >= ?1 group by kind order by count(*) desc",
            Timestamp.from(since)
        )) {
            ObjectNode a = out.addObject();
            a.put("kind", (String) r[0]);
            a.put("count", ((Number) r[1]).longValue());
            a.put("avgScore", Math.round(((Number) r[2]).doubleValue()));
        }
        return out;
    }

    private long activeSince(LocalDate day) {
        return count("select count(distinct user_id) from day_stat where day >= ?1", Date.valueOf(day));
    }

    private long scalar(String sql) {
        return ((Number) em.createNativeQuery(sql).getSingleResult()).longValue();
    }

    private long count(String sql, Object param) {
        return ((Number) em.createNativeQuery(sql).setParameter(1, param).getSingleResult()).longValue();
    }

    private double number(String sql, Object param) {
        return ((Number) em.createNativeQuery(sql).setParameter(1, param).getSingleResult()).doubleValue();
    }

    @SuppressWarnings("unchecked")
    private List<Object[]> rows(String sql, Object... params) {
        var q = em.createNativeQuery(sql);
        for (int i = 0; i < params.length; i++) q.setParameter(i + 1, params[i]);
        return q.getResultList();
    }

    @SuppressWarnings("unchecked")
    private List<Object> column(String sql, Object param) {
        return em.createNativeQuery(sql).setParameter(1, param).getResultList();
    }

    private static LocalDate toLocalDate(Object v) {
        if (v instanceof LocalDate d) return d;
        if (v instanceof Date d) return d.toLocalDate();
        return LocalDate.parse(String.valueOf(v).substring(0, 10));
    }

    private static Instant toInstant(Object v) {
        if (v == null) return null;
        if (v instanceof Instant i) return i;
        if (v instanceof Timestamp t) return t.toInstant();
        if (v instanceof java.time.LocalDateTime l) return l.atZone(ZoneId.systemDefault()).toInstant();
        if (v instanceof java.time.OffsetDateTime odt) return odt.toInstant();
        return null;
    }
}
