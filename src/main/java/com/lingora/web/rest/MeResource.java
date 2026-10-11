package com.lingora.web.rest;

import static com.lingora.web.rest.RestSupport.currentUserId;
import static com.lingora.web.rest.RestSupport.found;
import static com.lingora.web.rest.RestSupport.zone;

import com.lingora.config.ApplicationProperties;
import com.lingora.security.AuthoritiesConstants;
import com.lingora.security.SecurityUtils;
import com.lingora.service.MediaService;
import com.lingora.service.learning.Gamification;
import com.lingora.service.learning.LearningService;
import com.lingora.service.learning.LearningService.ActivityInput;
import com.lingora.service.learning.ProfileService;
import com.lingora.service.util.Json;
import java.time.LocalDate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.ObjectNode;

/** The signed-in learner: profile, progress, vocabulary deck, mistakes, attempts and statistics. */
@RestController
@RequestMapping("/api")
public class MeResource {

    private static final String TZ = "X-Timezone";

    private final ProfileService profiles;
    private final LearningService learning;
    private final MediaService media;
    private final ApplicationProperties properties;

    public MeResource(ProfileService profiles, LearningService learning, MediaService media, ApplicationProperties properties) {
        this.profiles = profiles;
        this.learning = learning;
        this.media = media;
        this.properties = properties;
    }

    // ---- profile -----------------------------------------------------------

    @GetMapping("/me")
    public ObjectNode me() {
        return profiles.me(currentUserId());
    }

    @PatchMapping("/me/profile")
    public ObjectNode updateProfile(@RequestBody JsonNode patch) {
        return profiles.update(currentUserId(), patch);
    }

    @GetMapping("/me/export")
    public ResponseEntity<ObjectNode> export() {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"mam-export.json\"")
            .body(learning.export(currentUserId()));
    }

    // ---- activity & lessons ---------------------------------------------------

    @PostMapping("/me/activity")
    public ObjectNode activity(@RequestBody JsonNode body, @RequestHeader(value = TZ, required = false) String tz) {
        return learning.recordClientActivity(currentUserId(), ActivityInput.of(body), zone(tz, properties));
    }

    @PostMapping("/me/lessons/{lessonId}/complete")
    public ObjectNode completeLesson(
        @PathVariable String lessonId,
        @RequestBody JsonNode body,
        @RequestHeader(value = TZ, required = false) String tz
    ) {
        return learning.completeLesson(currentUserId(), lessonId, body, zone(tz, properties));
    }

    @GetMapping("/me/courses")
    public JsonNode courses() {
        return learning.allCourseProgress(currentUserId());
    }

    @GetMapping("/me/courses/{courseId}")
    public ResponseEntity<JsonNode> course(@PathVariable String courseId) {
        return ResponseEntity.ok(learning.courseProgress(currentUserId(), courseId));
    }

    @GetMapping("/me/stats/{year}")
    public JsonNode stats(@PathVariable int year) {
        return learning.yearStats(currentUserId(), Math.max(2000, Math.min(2100, year)));
    }

    @PostMapping("/me/attempts")
    public void logAttempt(@RequestBody JsonNode body) {
        learning.logAttempt(currentUserId(), body);
    }

    @GetMapping("/me/attempts")
    public JsonNode attempts(@RequestParam(defaultValue = "20") int limit) {
        return learning.recentAttempts(currentUserId(), limit);
    }

    // ---- vocabulary deck ------------------------------------------------------

    @GetMapping("/me/vocab")
    public JsonNode words(
        @RequestParam String languageId,
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "300") int limit
    ) {
        return learning.myWords(currentUserId(), languageId, status, limit);
    }

    @GetMapping("/me/vocab/due")
    public JsonNode due(@RequestParam String languageId, @RequestParam(defaultValue = "30") int limit) {
        return learning.dueWords(currentUserId(), languageId, limit);
    }

    @GetMapping("/me/vocab/{vocabId}")
    public ResponseEntity<JsonNode> word(@PathVariable String vocabId) {
        return ResponseEntity.ok(learning.myWord(currentUserId(), vocabId));
    }

    /** Adds one word ({@code {vocabId, status}}) or many ({@code {vocabIds: [...]}}). */
    @PostMapping("/me/vocab")
    public ObjectNode addWords(@RequestBody JsonNode body, @RequestHeader(value = TZ, required = false) String tz) {
        Long uid = currentUserId();
        if (body.has("vocabIds")) return learning.addLessonWords(uid, Json.strings(body, "vocabIds"), zone(tz, properties));
        String vocabId = found(Json.str(body, "vocabId"));
        String status = Json.str(body, "status");
        return learning.addWord(uid, vocabId, status == null ? "learning" : status, zone(tz, properties));
    }

    @PutMapping("/me/vocab/{vocabId}/status")
    public ObjectNode setStatus(@PathVariable String vocabId, @RequestBody JsonNode body) {
        return learning.setWordStatus(currentUserId(), vocabId, Json.str(body, "status"));
    }

    @PostMapping("/me/vocab/{vocabId}/review")
    public ObjectNode review(@PathVariable String vocabId, @RequestBody JsonNode body) {
        return learning.gradeWord(currentUserId(), vocabId, String.valueOf(Json.str(body, "grade")));
    }

    // ---- mistakes ---------------------------------------------------------------

    @PostMapping("/me/mistakes")
    public void recordMistakes(@RequestBody JsonNode body) {
        learning.recordMistakes(currentUserId(), body.isArray() ? body : body.get("items"));
    }

    @GetMapping("/me/mistakes")
    public JsonNode mistakes(@RequestParam String languageId, @RequestParam(defaultValue = "200") int limit) {
        return learning.mistakes(currentUserId(), languageId, limit);
    }

    @GetMapping("/me/mistakes/count")
    public ObjectNode mistakeCount(@RequestParam String languageId) {
        ObjectNode o = Json.obj();
        o.put("count", learning.mistakeCount(currentUserId(), languageId));
        return o;
    }

    @PostMapping("/me/mistakes/{id}/resolve")
    public ObjectNode resolveMistake(@PathVariable String id, @RequestBody JsonNode body) {
        ObjectNode o = Json.obj();
        o.put("cleared", learning.resolveMistake(currentUserId(), id, Json.bool(body, "correct", false)));
        return o;
    }

    @DeleteMapping("/me/mistakes/{id}")
    public void deleteMistake(@PathVariable String id) {
        learning.deleteMistake(currentUserId(), id);
    }

    // ---- leaderboard & media -------------------------------------------------------

    @GetMapping("/leaderboard")
    public JsonNode leaderboard(@RequestParam(required = false) String week, @RequestParam(defaultValue = "50") int limit) {
        String wk = week != null && week.matches("^\\d{4}-W\\d{2}$") ? week : Gamification.weekId(LocalDate.now(zone(null, properties)));
        return learning.leaderboard(wk, limit);
    }

    /** Signed Supabase upload URL; see {@link MediaService} for the folder rules. */
    @PostMapping("/media/sign-upload")
    public ObjectNode signUpload(@RequestBody JsonNode body) {
        return media.signUpload(currentUserId(), SecurityUtils.hasCurrentUserThisAuthority(AuthoritiesConstants.ADMIN), body);
    }
}
