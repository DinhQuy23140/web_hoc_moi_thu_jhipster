package com.lingora.service.learning;

import static com.lingora.service.util.Json.*;

import com.lingora.domain.*;
import com.lingora.repository.*;
import com.lingora.service.content.ContentValidationException;
import com.lingora.service.util.Json;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

/**
 * All learner writes: XP / streak / achievements, course progress, vocabulary deck (FSRS),
 * mistake notebook, attempts and statistics. Every write locks the learner's profile row so
 * concurrent requests of the same learner are serialized and counters stay consistent.
 */
@Service
@Transactional
public class LearningService {

    private static final Set<String> VOCAB_STATUS = Set.of("learning", "known", "difficult");
    private static final Set<String> ATTEMPT_KINDS = Set.of("lesson", "exam", "game", "review", "challenge");
    private static final Set<String> MISTAKE_SOURCES = Set.of("lesson", "exam", "challenge", "game");
    private static final int MISTAKE_CLEAR_STREAK = 2;

    private final UserProfileRepository profiles;
    private final UserRepository users;
    private final ProfileService profileService;
    private final DayStatRepository dayStats;
    private final LessonRepository lessons;
    private final CourseRepository courses;
    private final ExerciseRepository exercises;
    private final LessonBlockVocabularyRepository blockVocab;
    private final LessonProgressRepository lessonProgress;
    private final CourseProgressRepository courseProgress;
    private final VocabularyRepository vocabularies;
    private final UserVocabRepository userVocab;
    private final MistakeRepository mistakes;
    private final AttemptRepository attempts;

    public LearningService(
        UserProfileRepository profiles,
        UserRepository users,
        ProfileService profileService,
        DayStatRepository dayStats,
        LessonRepository lessons,
        CourseRepository courses,
        ExerciseRepository exercises,
        LessonBlockVocabularyRepository blockVocab,
        LessonProgressRepository lessonProgress,
        CourseProgressRepository courseProgress,
        VocabularyRepository vocabularies,
        UserVocabRepository userVocab,
        MistakeRepository mistakes,
        AttemptRepository attempts
    ) {
        this.profiles = profiles;
        this.users = users;
        this.profileService = profileService;
        this.dayStats = dayStats;
        this.lessons = lessons;
        this.courses = courses;
        this.exercises = exercises;
        this.blockVocab = blockVocab;
        this.lessonProgress = lessonProgress;
        this.courseProgress = courseProgress;
        this.vocabularies = vocabularies;
        this.userVocab = userVocab;
        this.mistakes = mistakes;
        this.attempts = attempts;
    }

    // ------------------------------------------------------------------ activity

    public record ActivityInput(int xp, double minutes, int lessons, int exercises, int words) {
        public static ActivityInput of(JsonNode j) {
            return new ActivityInput(
                clamp(integer(j, "xp", 0), 0, Gamification.MAX_XP_PER_WRITE),
                Math.max(0, Math.min(240, number(j, "minutes", 0))),
                clamp(integer(j, "lessons", 0), 0, 5),
                clamp(integer(j, "exercises", 0), 0, 500),
                clamp(integer(j, "words", 0), 0, 500)
            );
        }
    }

    private UserProfile lockProfile(Long userId) {
        return profiles
            .lockById(userId)
            .orElseGet(() -> {
                User user = users.findById(userId).orElseThrow(() -> new NotFoundException("Tài khoản không tồn tại"));
                profileService.create(user, null, true, false);
                return profiles.lockById(userId).orElseThrow();
            });
    }

    /**
     * Activity reported by the browser. The XP must be backed by answered exercises and stops once the day's
     * total reaches {@link Gamification#MAX_CLIENT_XP_PER_DAY}; lessons and words only come from server-side flows.
     */
    public ObjectNode recordClientActivity(Long userId, ActivityInput in, ZoneId zone) {
        lockProfile(userId);
        int earnedToday = dayStats.findXp(userId, LocalDate.now(zone)).orElse(0);
        int xp = Math.min(in.xp(), in.exercises() * Gamification.MAX_CLIENT_XP_PER_EXERCISE + Gamification.MAX_CLIENT_XP_BONUS);
        xp = Math.max(0, Math.min(xp, Gamification.MAX_CLIENT_XP_PER_DAY - earnedToday));
        return recordActivity(userId, new ActivityInput(xp, in.minutes(), 0, in.exercises(), 0), zone);
    }

    public ObjectNode recordActivity(Long userId, ActivityInput in, ZoneId zone) {
        UserProfile p = lockProfile(userId);
        LocalDate today = LocalDate.now(zone);
        String wk = Gamification.weekId(today);
        double minutes = Math.round(in.minutes() * 10) / 10.0;
        double before = dayStats.findOneByUserIdAndDay(userId, today).map(d -> d.minutes).orElse(0.0);

        int xp = Math.max(0, in.xp());
        boolean goalReached = before < p.dailyGoal && before + minutes >= p.dailyGoal;
        if (goalReached) xp += Gamification.XP_DAILY_GOAL;

        int freezesBefore = p.streakFreezes;
        Gamification.StreakUpdate s = Gamification.nextStreak(p.lastActiveDate, p.streak, today, p.streakFreezes);
        if (s.changed() && s.streak() > 0 && s.streak() % 7 == 0) xp += Gamification.XP_STREAK_7;
        xp = Math.min(xp, Gamification.MAX_XP_PER_WRITE);

        p.weeklyXp = (wk.equals(p.weekId) ? p.weeklyXp : 0) + xp;
        p.weekId = wk;
        p.xp += xp;
        p.streak = s.streak();
        p.streakFreezes = s.freezes();
        p.longestStreak = Math.max(p.longestStreak, s.streak());
        p.lastActiveDate = today;
        p.lessonsCompleted += in.lessons();
        p.wordsLearned += in.words();
        p.totalMinutes += minutes;

        List<String> owned = new ArrayList<>();
        JsonNode ach = read(p.achievements);
        if (ach != null && ach.isArray()) ach.forEach(x -> owned.add(x.asString()));
        List<String> unlocked = Gamification.newAchievements(p, owned);
        if (!unlocked.isEmpty()) {
            ArrayNode all = Json.arr();
            owned.forEach(all::add);
            unlocked.forEach(all::add);
            p.achievements = write(all);
        }
        dayStats.increment(userId, today, minutes, xp, in.lessons(), in.exercises());

        ObjectNode o = Json.obj();
        o.put("xpGained", xp);
        o.put("streak", s.streak());
        o.put("goalReached", goalReached);
        ArrayNode u = o.putArray("unlocked");
        unlocked.forEach(u::add);
        o.put("usedFreezes", s.usedFreezes());
        o.put("freezeEarned", s.freezes() > freezesBefore);
        o.put("day", today.toString());
        o.set("profile", ProfileService.toJson(p, users.findById(userId).map(User::getEmail).orElse("")));
        return o;
    }

    // ------------------------------------------------------------------ lessons & courses

    public ObjectNode completeLesson(Long userId, String lessonId, JsonNode body, ZoneId zone) {
        lockProfile(userId);
        Lesson lesson = lessons.findById(lessonId).orElseThrow(() -> new NotFoundException("Không tìm thấy bài học"));
        int max = (int) exercises.countByLessonId(lessonId);
        int total = clamp(integer(body, "total", 0), 0, max);
        int correct = clamp(integer(body, "correct", 0), 0, total);
        double minutes = Math.max(0, Math.min(240, number(body, "minutes", 0)));
        int score = total > 0 ? Math.round(correct * 100f / total) : 100;
        Instant now = Instant.now();

        LessonProgress lp = lessonProgress.findOneByUserIdAndLessonId(userId, lessonId).orElse(null);
        boolean firstTime = lp == null;
        if (lp == null) {
            lp = new LessonProgress();
            lp.userId = userId;
            lp.courseId = lesson.courseId;
            lp.lessonId = lessonId;
            lp.completedAt = now;
        }
        lp.bestScore = Math.max(lp.bestScore, score);
        lp.attempts++;
        lessonProgress.saveAndFlush(lp);

        long done = lessonProgress.countByUserIdAndCourseId(userId, lesson.courseId);
        int totalLessons = courses
            .findById(lesson.courseId)
            .map(c -> c.lessonCount > 0 ? c.lessonCount : (int) lessons.countByCourseId(c.id))
            .orElse(1);
        int percent = (int) Math.min(100, Math.round(done * 100.0 / Math.max(1, totalLessons)));

        CourseProgress cp = courseProgress.findOneByUserIdAndCourseId(userId, lesson.courseId).orElse(null);
        if (cp == null) {
            cp = new CourseProgress();
            cp.userId = userId;
            cp.courseId = lesson.courseId;
            cp.startedAt = now;
        }
        cp.lastLessonId = lessonId;
        cp.percent = percent;
        cp.updatedAt = now;
        courseProgress.save(cp);

        int added = addWords(userId, blockVocab.findVocabularyIdsByLessonId(lessonId), "learning");
        int xp = correct * Gamification.XP_EXERCISE_CORRECT;
        if (firstTime) xp += Gamification.XP_LESSON_COMPLETE;
        if (total > 0 && correct == total) xp += Gamification.XP_PERFECT_LESSON;

        ObjectNode result = recordActivity(userId, new ActivityInput(xp, minutes, firstTime ? 1 : 0, total, added), zone);
        Attempt a = new Attempt();
        a.userId = userId;
        a.kind = "lesson";
        a.refId = lessonId;
        a.title = ProfileService.truncate(defaultString(str(body, "title"), lessonId), 255);
        a.score = score;
        a.correctCount = correct;
        a.total = total;
        a.durationSec = (int) Math.round(minutes * 60);
        a.createdAt = now;
        attempts.save(a);

        result.put("percent", percent);
        result.put("firstTime", firstTime);
        result.put("wordsAdded", added);
        return result;
    }

    @Transactional(readOnly = true)
    public ObjectNode courseProgress(Long userId, String courseId) {
        return courseProgress
            .findOneByUserIdAndCourseId(userId, courseId)
            .map(cp -> courseJson(cp, lessonProgress.findAllByUserIdAndCourseIdIn(userId, List.of(courseId))))
            .orElse(null);
    }

    @Transactional(readOnly = true)
    public ArrayNode allCourseProgress(Long userId) {
        List<CourseProgress> list = courseProgress.findAllByUserIdOrderByUpdatedAtDesc(userId, PageRequest.of(0, 50));
        Map<String, List<LessonProgress>> byCourse = list.isEmpty()
            ? Map.of()
            : lessonProgress
                .findAllByUserIdAndCourseIdIn(userId, list.stream().map(c -> c.courseId).toList())
                .stream()
                .collect(Collectors.groupingBy(l -> l.courseId));
        ArrayNode out = Json.arr();
        list.forEach(cp -> out.add(courseJson(cp, byCourse.getOrDefault(cp.courseId, List.of()))));
        return out;
    }

    private static ObjectNode courseJson(CourseProgress cp, List<LessonProgress> done) {
        ObjectNode o = Json.obj();
        o.put("courseId", cp.courseId);
        ArrayNode completed = o.putArray("completed");
        ObjectNode scores = o.putObject("scores");
        done
            .stream()
            .sorted(Comparator.comparing(l -> l.completedAt))
            .forEach(l -> {
                completed.add(l.lessonId);
                scores.put(l.lessonId, l.bestScore);
            });
        if (cp.lastLessonId == null) o.putNull("lastLessonId");
        else o.put("lastLessonId", cp.lastLessonId);
        o.put("percent", cp.percent);
        o.put("startedAt", cp.startedAt.toEpochMilli());
        o.put("updatedAt", cp.updatedAt.toEpochMilli());
        return o;
    }

    // ------------------------------------------------------------------ vocabulary deck

    /** Adds words to the deck, skipping existing ones; returns how many were new. */
    public int addWords(Long userId, Collection<String> vocabIds, String status) {
        if (vocabIds.isEmpty()) return 0;
        String st = checkStatus(status);
        Set<String> ids = new LinkedHashSet<>(vocabIds);
        userVocab.findAllByUserIdAndVocabularyIdIn(userId, ids).forEach(uv -> ids.remove(uv.vocabularyId));
        if (ids.isEmpty()) return 0;
        Instant now = Instant.now();
        List<UserVocab> fresh = new ArrayList<>();
        for (Vocabulary v : vocabularies.findAllById(ids)) {
            UserVocab uv = new UserVocab();
            uv.userId = userId;
            uv.vocabularyId = v.id;
            uv.languageId = v.languageId;
            uv.status = st;
            uv.dueAt = now;
            uv.updatedAt = now;
            fresh.add(uv);
        }
        userVocab.saveAll(fresh);
        return fresh.size();
    }

    /** Adds one word (or changes its status when already in the deck). */
    public ObjectNode addWord(Long userId, String vocabId, String status, ZoneId zone) {
        lockProfile(userId);
        int added = addWords(userId, List.of(vocabId), status);
        ObjectNode o = Json.obj();
        if (added == 0) {
            setWordStatus(userId, vocabId, status);
        } else {
            o.set("activity", recordActivity(userId, new ActivityInput(0, 0, 0, 0, 1), zone));
        }
        o.put("added", added > 0);
        o.set("word", myWord(userId, vocabId));
        return o;
    }

    public ObjectNode addLessonWords(Long userId, List<String> vocabIds, ZoneId zone) {
        lockProfile(userId);
        int added = addWords(userId, vocabIds.stream().limit(500).toList(), "learning");
        ObjectNode o = Json.obj();
        o.put("added", added);
        if (added > 0) o.set("activity", recordActivity(userId, new ActivityInput(0, 0, 0, 0, added), zone));
        return o;
    }

    public ObjectNode setWordStatus(Long userId, String vocabId, String status) {
        UserVocab uv = userVocab.findOneByUserIdAndVocabularyId(userId, vocabId).orElseThrow(() -> new NotFoundException("Từ chưa có trong sổ"));
        uv.status = checkStatus(status);
        uv.updatedAt = Instant.now();
        return wordJson(uv, vocabularies.findById(vocabId).orElse(null));
    }

    public ObjectNode gradeWord(Long userId, String vocabId, String gradeText) {
        Srs.Grade grade;
        try {
            grade = Srs.Grade.parse(gradeText);
        } catch (RuntimeException e) {
            throw new ContentValidationException("Mức đánh giá không hợp lệ");
        }
        UserVocab uv = userVocab.findOneByUserIdAndVocabularyId(userId, vocabId).orElseThrow(() -> new NotFoundException("Từ chưa có trong sổ"));
        long now = System.currentTimeMillis();
        Srs.State next = Srs.review(
            new Srs.State(
                uv.ease,
                uv.intervalDays,
                uv.reps,
                uv.lapses,
                uv.dueAt.toEpochMilli(),
                uv.stability,
                uv.difficulty,
                uv.lastReview == null ? null : uv.lastReview.toEpochMilli()
            ),
            grade,
            now
        );
        uv.ease = next.ease();
        uv.intervalDays = next.interval();
        uv.reps = next.reps();
        uv.lapses = next.lapses();
        uv.dueAt = Instant.ofEpochMilli(next.due());
        uv.stability = next.stability();
        uv.difficulty = next.difficulty();
        uv.lastReview = next.lastReview() == null ? null : Instant.ofEpochMilli(next.lastReview());
        if (grade == Srs.Grade.AGAIN) uv.wrongCount++;
        else uv.correctCount++;
        if (grade == Srs.Grade.AGAIN) uv.status = "difficult";
        else if (Srs.mastery(next.interval(), next.reps()) >= 3) uv.status = "known";
        else if (!("difficult".equals(uv.status) && grade == Srs.Grade.HARD)) uv.status = "learning";
        uv.updatedAt = Instant.ofEpochMilli(now);
        return wordJson(uv, vocabularies.findById(vocabId).orElse(null));
    }

    @Transactional(readOnly = true)
    public ObjectNode myWord(Long userId, String vocabId) {
        return userVocab
            .findOneByUserIdAndVocabularyId(userId, vocabId)
            .map(uv -> wordJson(uv, vocabularies.findById(vocabId).orElse(null)))
            .orElse(null);
    }

    @Transactional(readOnly = true)
    public ArrayNode dueWords(Long userId, String languageId, int max) {
        return wordsJson(
            userVocab.findAllByUserIdAndLanguageIdAndDueAtLessThanEqualOrderByDueAt(
                userId,
                languageId,
                Instant.now(),
                PageRequest.of(0, clamp(max, 1, 200))
            )
        );
    }

    @Transactional(readOnly = true)
    public ArrayNode myWords(Long userId, String languageId, String status, int max) {
        PageRequest page = PageRequest.of(0, clamp(max, 1, 1000));
        List<UserVocab> list = status == null || status.isBlank()
            ? userVocab.findAllByUserIdAndLanguageIdOrderByUpdatedAtDesc(userId, languageId, page)
            : userVocab.findAllByUserIdAndLanguageIdAndStatusOrderByUpdatedAtDesc(userId, languageId, checkStatus(status), page);
        return wordsJson(list);
    }

    private ArrayNode wordsJson(List<UserVocab> list) {
        Map<String, Vocabulary> rows = vocabularies
            .findAllById(list.stream().map(u -> u.vocabularyId).collect(Collectors.toSet()))
            .stream()
            .collect(Collectors.toMap(v -> v.id, Function.identity()));
        ArrayNode out = Json.arr();
        list.forEach(uv -> out.add(wordJson(uv, rows.get(uv.vocabularyId))));
        return out;
    }

    private static ObjectNode wordJson(UserVocab uv, Vocabulary v) {
        ObjectNode o = Json.obj();
        o.put("vocabId", uv.vocabularyId);
        o.put("languageId", uv.languageId);
        if (v != null) {
            o.put("word", v.word);
            put(o, "reading", v.reading != null ? v.reading : v.ipa);
            putRaw(o, "meaning", v.meaning);
            put(o, "example", v.example);
        }
        o.put("status", uv.status);
        o.put("ease", uv.ease);
        o.put("interval", uv.intervalDays);
        o.put("reps", uv.reps);
        o.put("lapses", uv.lapses);
        o.put("due", uv.dueAt.toEpochMilli());
        o.put("correct", uv.correctCount);
        o.put("wrong", uv.wrongCount);
        o.put("updatedAt", uv.updatedAt.toEpochMilli());
        if (uv.stability != null) o.put("stability", uv.stability);
        if (uv.difficulty != null) o.put("difficulty", uv.difficulty);
        if (uv.lastReview != null) o.put("lastReview", uv.lastReview.toEpochMilli());
        return o;
    }

    private static String checkStatus(String status) {
        if (!VOCAB_STATUS.contains(status)) throw new ContentValidationException("Trạng thái từ không hợp lệ");
        return status;
    }

    // ------------------------------------------------------------------ mistakes

    public void recordMistakes(Long userId, JsonNode items) {
        if (items == null || !items.isArray()) return;
        lockProfile(userId);
        Instant now = Instant.now();
        Map<String, JsonNode> byKey = new LinkedHashMap<>();
        int n = 0;
        for (JsonNode it : items) {
            if (n++ >= 100) break;
            JsonNode ex = it.get("exercise");
            if (ex == null || !ex.isObject() || str(ex, "id") == null) continue;
            String refId = defaultString(str(it, "refId"), "");
            byKey.put(mistakeKey(refId, str(ex, "id")), it);
        }
        if (byKey.isEmpty()) return;
        Map<String, Mistake> existing = mistakes
            .findAllByUserIdAndMistakeKeyIn(userId, byKey.keySet())
            .stream()
            .collect(Collectors.toMap(m -> m.mistakeKey, Function.identity()));
        byKey.forEach((key, it) -> {
            String exercise = write(it.get("exercise"));
            if (exercise.length() > 20_000) throw new ContentValidationException("Câu hỏi quá lớn");
            String source = str(it, "source");
            if (!MISTAKE_SOURCES.contains(source)) throw new ContentValidationException("Nguồn lỗi sai không hợp lệ");
            Mistake m = existing.get(key);
            if (m == null) {
                m = new Mistake();
                m.userId = userId;
                m.mistakeKey = key;
                m.wrong = 0;
            }
            m.languageId = ProfileService.truncate(defaultString(str(it, "languageId"), "en"), 8);
            m.source = source;
            m.refId = ProfileService.truncate(str(it, "refId"), 200);
            m.title = ProfileService.truncate(str(it, "title"), 200);
            m.exercise = exercise;
            m.wrong++;
            m.streak = 0;
            m.lastWrong = now;
            mistakes.save(m);
        });
    }

    @Transactional(readOnly = true)
    public ArrayNode mistakes(Long userId, String languageId, int max) {
        ArrayNode out = Json.arr();
        mistakes
            .findAllByUserIdAndLanguageIdOrderByLastWrongDesc(userId, languageId, PageRequest.of(0, clamp(max, 1, 500)))
            .forEach(m -> out.add(mistakeJson(m)));
        return out;
    }

    @Transactional(readOnly = true)
    public long mistakeCount(Long userId, String languageId) {
        return mistakes.countByUserIdAndLanguageId(userId, languageId);
    }

    /** Returns true when the mistake left the notebook. */
    public boolean resolveMistake(Long userId, String key, boolean correct) {
        Mistake m = mistakes.findOneByUserIdAndMistakeKey(userId, key).orElseThrow(() -> new NotFoundException("Không tìm thấy lỗi sai"));
        if (!correct) {
            m.streak = 0;
            m.wrong++;
            m.lastWrong = Instant.now();
            return false;
        }
        if (m.streak + 1 >= MISTAKE_CLEAR_STREAK) {
            mistakes.delete(m);
            return true;
        }
        m.streak++;
        return false;
    }

    public void deleteMistake(Long userId, String key) {
        mistakes.findOneByUserIdAndMistakeKey(userId, key).ifPresent(mistakes::delete);
    }

    private static ObjectNode mistakeJson(Mistake m) {
        ObjectNode o = Json.obj();
        o.put("id", m.mistakeKey);
        o.put("languageId", m.languageId);
        o.put("source", m.source);
        o.put("refId", m.refId == null ? "" : m.refId);
        o.put("title", m.title == null ? "" : m.title);
        putRaw(o, "exercise", m.exercise);
        o.put("wrong", m.wrong);
        o.put("streak", m.streak);
        o.put("lastWrong", m.lastWrong.toEpochMilli());
        return o;
    }

    static String mistakeKey(String refId, String exerciseId) {
        String k = (refId + "~" + exerciseId).replaceAll("[^\\w.-]", "_");
        return k.length() > 300 ? k.substring(0, 300) : k;
    }

    // ------------------------------------------------------------------ attempts & stats

    public void logAttempt(Long userId, JsonNode j) {
        String kind = str(j, "kind");
        if (!ATTEMPT_KINDS.contains(kind)) throw new ContentValidationException("Loại lượt làm bài không hợp lệ");
        Attempt a = new Attempt();
        a.userId = userId;
        a.kind = kind;
        a.refId = ProfileService.truncate(str(j, "refId"), 100);
        a.title = ProfileService.truncate(str(j, "title"), 255);
        a.score = clamp(integer(j, "score", 0), 0, 100);
        a.total = clamp(integer(j, "total", 0), 0, 1000);
        a.correctCount = clamp(integer(j, "correct", 0), 0, a.total);
        a.durationSec = clamp(integer(j, "durationSec", 0), 0, 6 * 3600);
        a.createdAt = Instant.now();
        attempts.save(a);
    }

    @Transactional(readOnly = true)
    public ArrayNode recentAttempts(Long userId, int n) {
        ArrayNode out = Json.arr();
        attempts.findAllByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, clamp(n, 1, 200))).forEach(a -> out.add(attemptJson(a)));
        return out;
    }

    private static ObjectNode attemptJson(Attempt a) {
        ObjectNode o = Json.obj();
        o.put("id", String.valueOf(a.id));
        o.put("kind", a.kind);
        o.put("refId", a.refId == null ? "" : a.refId);
        o.put("title", a.title == null ? "" : a.title);
        o.put("score", a.score);
        o.put("correct", a.correctCount);
        o.put("total", a.total);
        o.put("durationSec", a.durationSec);
        o.put("createdAt", a.createdAt.toEpochMilli());
        return o;
    }

    @Transactional(readOnly = true)
    public ObjectNode yearStats(Long userId, int year) {
        ObjectNode o = Json.obj();
        ObjectNode days = o.putObject("days");
        dayStats
            .findAllByUserIdAndDayBetween(userId, LocalDate.of(year, 1, 1), LocalDate.of(year, 12, 31))
            .forEach(d -> days.set(d.day.toString(), dayJson(d)));
        return o;
    }

    private static ObjectNode dayJson(DayStat d) {
        ObjectNode o = Json.obj();
        o.put("m", Math.round(d.minutes * 10) / 10.0);
        o.put("xp", d.xp);
        o.put("l", d.lessons);
        o.put("e", d.exercises);
        return o;
    }

    @Transactional(readOnly = true)
    public ArrayNode leaderboard(String weekId, int n) {
        ArrayNode out = Json.arr();
        profiles
            .findAllByWeekIdAndWeeklyXpGreaterThanOrderByWeeklyXpDesc(weekId, 0, PageRequest.of(0, clamp(n, 1, 100)))
            .forEach(p -> {
                ObjectNode o = Json.obj();
                o.put("uid", String.valueOf(p.userId));
                o.put("displayName", p.displayName);
                if (p.photoUrl == null) o.putNull("photoURL");
                else o.put("photoURL", p.photoUrl);
                o.put("xp", p.weeklyXp);
                o.put("updatedAt", 0);
                out.add(o);
            });
        return out;
    }

    /** Everything stored about the learner (GDPR-style export). */
    @Transactional(readOnly = true)
    public ObjectNode export(Long userId) {
        ObjectNode o = Json.obj();
        o.put("exportedAt", Instant.now().toString());
        o.set("profile", profileService.profileJson(userId));
        o.set("courses", allCourseProgress(userId));
        o.set("vocab", wordsJson(userVocab.findAllByUserId(userId)));
        ArrayNode att = o.putArray("attempts");
        attempts.findAllByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 5000)).forEach(a -> att.add(attemptJson(a)));
        ObjectNode days = o.putObject("stats");
        dayStats.findAllByUserId(userId).forEach(d -> days.set(d.day.toString(), dayJson(d)));
        ArrayNode ms = o.putArray("mistakes");
        mistakes.findAllByUserId(userId).forEach(m -> ms.add(mistakeJson(m)));
        return o;
    }

    // ------------------------------------------------------------------ helpers

    static int clamp(int v, int min, int max) {
        return Math.max(min, Math.min(max, v));
    }

    static String defaultString(String s, String def) {
        return s == null ? def : s;
    }
}
