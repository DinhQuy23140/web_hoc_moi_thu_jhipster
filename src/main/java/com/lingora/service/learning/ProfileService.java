package com.lingora.service.learning;

import static com.lingora.service.util.Json.*;

import com.lingora.domain.User;
import com.lingora.domain.UserProfile;
import com.lingora.repository.UserProfileRepository;
import com.lingora.repository.UserRepository;
import com.lingora.security.AuthoritiesConstants;
import com.lingora.service.content.ContentValidationException;
import com.lingora.service.util.Json;
import java.time.Instant;
import java.util.Locale;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

/** Learner profile (gamification counters + preferences), one row per account. */
@Service
@Transactional
public class ProfileService {

    private static final Set<String> UI_LOCALES = Set.of("vi", "en", "ja");
    private static final Set<String> TARGETS = Set.of("en", "ja");

    private final UserProfileRepository profiles;
    private final UserRepository users;

    public ProfileService(UserProfileRepository profiles, UserRepository users) {
        this.profiles = profiles;
        this.users = users;
    }

    public UserProfile getOrCreate(User user) {
        return profiles.findById(user.getId()).orElseGet(() -> create(user, null, true, false));
    }

    public UserProfile create(User user, String displayName, boolean passwordSet, boolean googleLinked) {
        UserProfile p = new UserProfile();
        p.userId = user.getId();
        String name = displayName;
        if (name == null || name.isBlank()) name = user.getFirstName();
        if (name == null || name.isBlank()) name = user.getEmail() != null ? user.getEmail().split("@")[0] : user.getLogin();
        p.displayName = truncate(name.trim(), 60);
        p.photoUrl = user.getImageUrl();
        p.uiLocale = UI_LOCALES.contains(user.getLangKey()) ? user.getLangKey() : "vi";
        p.achievements = "[]";
        p.passwordSet = passwordSet;
        p.googleLinked = googleLinked;
        p.createdAt = user.getCreatedDate() != null ? user.getCreatedDate() : Instant.now();
        return profiles.saveAndFlush(p);
    }

    public void markGoogleLinked(User user, boolean created) {
        UserProfile p = profiles.findById(user.getId()).orElseGet(() -> create(user, null, !created, true));
        p.googleLinked = true;
        if (p.photoUrl == null && user.getImageUrl() != null) p.photoUrl = user.getImageUrl();
    }

    public void markPasswordSet(Long userId) {
        profiles.findById(userId).ifPresent(p -> p.passwordSet = true);
    }

    /** {@code GET /api/me} payload: account, profile and role. */
    @Transactional
    public ObjectNode me(Long userId) {
        User user = users.findOneWithAuthoritiesById(userId).orElseThrow(() -> new ContentValidationException("Tài khoản không tồn tại"));
        UserProfile p = getOrCreate(user);
        ObjectNode o = Json.obj();
        ObjectNode account = o.putObject("user");
        account.put("uid", String.valueOf(user.getId()));
        account.put("email", user.getEmail());
        account.put("emailVerified", user.isActivated());
        account.put("displayName", p.displayName);
        put(account, "photoURL", p.photoUrl);
        ArrayNode providers = account.putArray("providers");
        if (p.passwordSet) providers.add("password");
        if (p.googleLinked) providers.add("google.com");
        o.set("profile", toJson(p, user.getEmail()));
        o.put(
            "admin",
            user.getAuthorities().stream().anyMatch(a -> AuthoritiesConstants.ADMIN.equals(a.getName()))
        );
        return o;
    }

    public ObjectNode profileJson(Long userId) {
        User user = users.findById(userId).orElseThrow();
        return toJson(getOrCreate(user), user.getEmail());
    }

    public ObjectNode update(Long userId, JsonNode patch) {
        User user = users.findById(userId).orElseThrow();
        UserProfile p = getOrCreate(user);
        if (patch.has("displayName")) {
            String name = str(patch, "displayName");
            if (name == null || name.isBlank() || name.trim().length() > 60) throw new ContentValidationException("Tên hiển thị dài 1–60 ký tự");
            p.displayName = name.trim();
            user.setFirstName(truncate(p.displayName, 50));
        }
        if (patch.has("photoURL")) {
            String url = str(patch, "photoURL");
            if (url != null && (url.length() > 512 || !url.startsWith("https://"))) throw new ContentValidationException("Ảnh đại diện không hợp lệ");
            p.photoUrl = url;
            user.setImageUrl(url != null && url.length() <= 256 ? url : null);
        }
        if (patch.has("uiLocale")) {
            String l = str(patch, "uiLocale");
            if (!UI_LOCALES.contains(l)) throw new ContentValidationException("Ngôn ngữ giao diện không hợp lệ");
            p.uiLocale = l;
            user.setLangKey(l);
        }
        if (patch.has("targetLanguage")) {
            String t = str(patch, "targetLanguage");
            if (!TARGETS.contains(t)) throw new ContentValidationException("Ngôn ngữ học không hợp lệ");
            p.targetLanguage = t;
        }
        if (patch.has("dailyGoal")) {
            int g = integer(patch, "dailyGoal", p.dailyGoal);
            if (g < 5 || g > 240) throw new ContentValidationException("Mục tiêu mỗi ngày từ 5 đến 240 phút");
            p.dailyGoal = g;
        }
        return toJson(p, user.getEmail());
    }

    @Transactional(readOnly = true)
    public ObjectNode adminPage(int page, int size) {
        var result = profiles.findAll(
            org.springframework.data.domain.PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 100),
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")
            )
        );
        java.util.Map<Long, String> emails = new java.util.HashMap<>();
        users.findAllById(result.map(p -> p.userId).toList()).forEach(u -> emails.put(u.getId(), u.getEmail()));
        ObjectNode o = Json.obj();
        ArrayNode items = o.putArray("items");
        result.forEach(p -> items.add(toJson(p, emails.get(p.userId))));
        o.put("page", result.getNumber());
        o.put("hasMore", result.hasNext());
        o.put("total", result.getTotalElements());
        return o;
    }

    @Transactional(readOnly = true)
    public ArrayNode searchByEmail(String email) {
        ArrayNode out = Json.arr();
        String q = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        if (q.length() < 2) return out;
        users
            .findAllByEmailContainingIgnoreCase(q, org.springframework.data.domain.PageRequest.of(0, 10))
            .forEach(u -> out.add(toJson(getOrCreate(u), u.getEmail())));
        return out;
    }

    public static ObjectNode toJson(UserProfile p, String email) {
        ObjectNode o = Json.obj();
        o.put("uid", String.valueOf(p.userId));
        o.put("email", email == null ? "" : email);
        o.put("displayName", p.displayName);
        if (p.photoUrl == null) o.putNull("photoURL");
        else o.put("photoURL", p.photoUrl);
        o.put("uiLocale", p.uiLocale);
        o.put("targetLanguage", p.targetLanguage);
        o.put("dailyGoal", p.dailyGoal);
        o.put("xp", p.xp);
        o.put("weeklyXp", p.weeklyXp);
        put(o, "weekId", p.weekId);
        o.put("streak", p.streak);
        o.put("longestStreak", p.longestStreak);
        o.put("streakFreezes", p.streakFreezes);
        if (p.lastActiveDate == null) o.putNull("lastActiveDate");
        else o.put("lastActiveDate", p.lastActiveDate.toString());
        o.put("lessonsCompleted", p.lessonsCompleted);
        o.put("wordsLearned", p.wordsLearned);
        o.put("totalMinutes", Math.round(p.totalMinutes * 10) / 10.0);
        JsonNode ach = read(p.achievements);
        o.set("achievements", ach != null && ach.isArray() ? ach : Json.arr());
        o.put("createdAt", p.createdAt == null ? 0 : p.createdAt.toEpochMilli());
        return o;
    }

    static String truncate(String s, int max) {
        return s == null || s.length() <= max ? s : s.substring(0, max);
    }

    static String lower(String s) {
        return s == null ? null : s.toLowerCase(Locale.ROOT);
    }
}
