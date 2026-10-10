package com.lingora.service.content;

import static com.lingora.service.content.ContentMapper.*;
import static com.lingora.service.util.Json.*;

import com.lingora.domain.*;
import com.lingora.repository.*;
import com.lingora.service.util.Json;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.*;
import java.util.function.Function;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;

/**
 * Write side of the learning content, used by the admin editor and the seed importer.
 * Entities carry plain id columns (no JPA associations), so parents are flushed before
 * children to keep foreign keys satisfied.
 */
@Service
@Transactional
public class ContentWriteService {

    private static final Pattern ID = Pattern.compile("^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$");

    @PersistenceContext
    private EntityManager em;

    private final CertificateCourseRepository certificateCourses;
    private final CourseUnitRepository units;
    private final LessonRepository lessons;
    private final LessonBlockRepository blocks;
    private final VocabularyRepository vocabularies;
    private final ExamSectionRepository sections;

    public ContentWriteService(
        CertificateCourseRepository certificateCourses,
        CourseUnitRepository units,
        LessonRepository lessons,
        LessonBlockRepository blocks,
        VocabularyRepository vocabularies,
        ExamSectionRepository sections
    ) {
        this.certificateCourses = certificateCourses;
        this.units = units;
        this.lessons = lessons;
        this.blocks = blocks;
        this.vocabularies = vocabularies;
        this.sections = sections;
    }

    // ---- admin entry points (evict the content cache) --------------------

    @CacheEvict(cacheNames = ContentQueryService.CACHE, allEntries = true)
    public void save(String collection, String id, JsonNode body) {
        checkId(id);
        if (body == null || !body.isObject()) throw new ContentValidationException("Nội dung phải là một đối tượng JSON");
        switch (collection) {
            case "languages" -> saveLanguage(id, body);
            case "certificates" -> {
                saveCertificate(id, body);
                relinkCertificate(id, body);
            }
            case "courses" -> saveCourse(id, body);
            case "outlines" -> saveOutline(id, body);
            case "lessons" -> saveLesson(id, body);
            case "exams" -> saveExam(id, body);
            case "vocabularies" -> saveVocabulary(id, body);
            default -> throw new ContentValidationException("Bộ sưu tập không hợp lệ: " + collection);
        }
    }

    @CacheEvict(cacheNames = ContentQueryService.CACHE, allEntries = true)
    public void delete(String collection, String id) {
        checkId(id);
        Class<?> type = switch (collection) {
            case "languages" -> Language.class;
            case "certificates" -> Certificate.class;
            case "courses" -> Course.class;
            case "lessons" -> Lesson.class;
            case "exams" -> Exam.class;
            case "vocabularies" -> Vocabulary.class;
            case "outlines" -> null;
            default -> throw new ContentValidationException("Bộ sưu tập không hợp lệ: " + collection);
        };
        if (type == null) {
            units.deleteAll(units.findAllByCourseIdOrderByPosition(id));
            return;
        }
        Object entity = em.find(type, id);
        if (entity != null) em.remove(entity);
    }

    @CacheEvict(cacheNames = ContentQueryService.CACHE, allEntries = true)
    public void evictAll() {
        // eviction only
    }

    // ---- per collection --------------------------------------------------

    public void saveLanguage(String id, JsonNode j) {
        em.merge(language(id, j));
        em.flush();
    }

    public void saveCertificate(String id, JsonNode j) {
        em.merge(certificate(id, j));
        em.flush();
    }

    /** Extra courses listed in {@code courseIds} that are not directly owned by the certificate. */
    public void relinkCertificate(String id, JsonNode j) {
        certificateCourses.deleteByCertificateId(id);
        for (String courseId : new LinkedHashSet<>(strings(j, "courseIds"))) {
            Course c = em.find(Course.class, courseId);
            if (c == null || id.equals(c.certificateId)) continue;
            em.persist(new CertificateCourse(id, courseId));
        }
        em.flush();
    }

    public void saveCourse(String id, JsonNode j) {
        em.merge(course(id, j));
        em.flush();
    }

    public void saveOutline(String courseId, JsonNode j) {
        Course course = em.find(Course.class, courseId);
        if (course == null) throw new ContentValidationException("Không tìm thấy khoá học: " + courseId);

        List<JsonNode> unitNodes = new ArrayList<>();
        JsonNode us = j.get("units");
        if (us != null && us.isArray()) us.forEach(unitNodes::add);

        Set<String> keep = new HashSet<>();
        for (int i = 0; i < unitNodes.size(); i++) {
            CourseUnit u = unit(courseId, i, unitNodes.get(i));
            if (!keep.add(u.id)) throw new ContentValidationException("Trùng mã chương: " + u.id);
            CourseUnit existing = em.find(CourseUnit.class, u.id);
            if (existing != null && !courseId.equals(existing.courseId)) {
                throw new ContentValidationException("Chương " + u.id + " thuộc khoá học khác");
            }
            em.merge(u);
        }
        em.flush();

        int position = 0;
        int lessonCount = 0;
        for (JsonNode un : unitNodes) {
            String unitId = str(un, "id");
            JsonNode ls = un.get("lessons");
            if (ls == null || !ls.isArray()) continue;
            for (JsonNode s : ls) {
                String lessonId = required(s, "id");
                checkId(lessonId);
                Lesson l = em.find(Lesson.class, lessonId);
                boolean isNew = l == null;
                if (isNew) {
                    l = new Lesson();
                    l.id = lessonId;
                    l.courseId = courseId;
                    l.languageId = course.languageId;
                    l.kinds = "[]";
                } else if (!courseId.equals(l.courseId)) {
                    throw new ContentValidationException("Bài học " + lessonId + " thuộc khoá học khác");
                }
                l.unitId = unitId;
                l.position = ++position;
                if (s.has("title")) l.title = raw(s, "title");
                if (l.title == null) l.title = write(Json.obj().put("vi", lessonId).put("en", lessonId));
                l.minutes = integer(s, "minutes", l.minutes == 0 ? 10 : l.minutes);
                l.xp = integer(s, "xp", l.xp == 0 ? 20 : l.xp);
                if (s.has("kinds")) l.kinds = raw(s, "kinds");
                if (isNew) em.persist(l);
                lessonCount++;
            }
        }
        em.flush();

        for (CourseUnit u : units.findAllByCourseIdOrderByPosition(courseId)) {
            if (!keep.contains(u.id)) em.remove(u);
        }
        course.unitCount = unitNodes.size();
        course.lessonCount = lessonCount;
        em.flush();
    }

    public void saveVocabulary(String id, JsonNode j) {
        em.merge(vocabulary(id, null, j));
        em.flush();
    }

    /** Replaces a lesson and all its blocks; vocabulary and grammar referenced by blocks are upserted. */
    public void saveLesson(String id, JsonNode j) {
        Lesson lesson = lesson(id, j);
        if (em.find(CourseUnit.class, lesson.unitId) == null) {
            throw new ContentValidationException("Không tìm thấy chương: " + lesson.unitId);
        }
        em.merge(lesson);
        em.flush();
        blocks.deleteByLessonId(id);

        Map<String, JsonNode> vocabItems = new LinkedHashMap<>();
        Map<String, JsonNode> grammarPoints = new LinkedHashMap<>();
        List<Object> children = new ArrayList<>();

        JsonNode contents = j.get("contents");
        int pos = 0;
        if (contents != null && contents.isArray()) {
            for (JsonNode c : contents) {
                LessonBlock b = block(id, pos++, c);
                em.persist(b);
                switch (b.type) {
                    case "VOCABULARY" -> {
                        int i = 0;
                        Set<String> seen = new HashSet<>();
                        for (JsonNode item : iter(c.get("items"))) {
                            String vid = required(item, "id");
                            checkId(vid);
                            if (!seen.add(vid)) continue;
                            vocabItems.putIfAbsent(vid, item);
                            children.add(new LessonBlockVocabulary(b.id, vid, i++));
                        }
                    }
                    case "GRAMMAR" -> {
                        int i = 0;
                        Set<String> seen = new HashSet<>();
                        for (JsonNode p : iter(c.get("points"))) {
                            String gid = required(p, "id");
                            checkId(gid);
                            if (!seen.add(gid)) continue;
                            grammarPoints.putIfAbsent(gid, p);
                            children.add(new LessonBlockGrammar(b.id, gid, i++));
                        }
                    }
                    case "EXERCISE" -> addExercises(children, c.get("exercises"), b.id, null);
                    case "READING", "LISTENING" -> addExercises(children, c.get("questions"), b.id, null);
                    default -> {}
                }
            }
        }

        upsertVocabulary(vocabItems, lesson.languageId);
        grammarPoints.values().forEach(p -> em.merge(grammar(lesson.languageId, p)));
        em.flush();
        children.forEach(em::persist);
        em.flush();
    }

    public void saveExam(String id, JsonNode j) {
        Exam exam = exam(id, j);
        em.merge(exam);
        em.flush();
        sections.deleteByExamId(id);
        List<Object> children = new ArrayList<>();
        int pos = 0;
        for (JsonNode s : iter(j.get("sections"))) {
            ExamSection section = section(id, pos++, s);
            em.persist(section);
            addExercises(children, s.get("questions"), null, section.id);
        }
        children.forEach(em::persist);
        em.flush();
    }

    // ---- helpers ---------------------------------------------------------

    private void addExercises(List<Object> out, JsonNode list, Long blockId, Long sectionId) {
        int i = 0;
        for (JsonNode x : iter(list)) {
            Exercise e = exercise(i++, x);
            checkId(e.id);
            e.lessonBlockId = blockId;
            e.examSectionId = sectionId;
            out.add(e);
        }
    }

    private void upsertVocabulary(Map<String, JsonNode> items, String languageId) {
        if (items.isEmpty()) return;
        Map<String, Vocabulary> existing = vocabularies
            .findAllById(items.keySet())
            .stream()
            .collect(Collectors.toMap(v -> v.id, Function.identity()));
        items.forEach((vid, item) -> {
            Vocabulary fresh = vocabulary(vid, languageId, item);
            Vocabulary row = existing.get(vid);
            if (row == null) {
                em.persist(fresh);
                return;
            }
            if (!Objects.equals(row.word, fresh.word)) {
                row.word = fresh.word;
                row.wordLc = fresh.wordLc;
            }
            row.reading = fresh.reading;
            row.romaji = fresh.romaji;
            row.ipa = fresh.ipa;
            row.pos = fresh.pos;
            if (!sameJson(row.meaning, fresh.meaning)) row.meaning = fresh.meaning;
            row.example = fresh.example;
            row.exampleReading = fresh.exampleReading;
            if (!sameJson(row.exampleMeaning, fresh.exampleMeaning)) row.exampleMeaning = fresh.exampleMeaning;
            if (fresh.level != null) row.level = fresh.level;
            if (fresh.topic != null) row.topic = fresh.topic;
            if (fresh.audioUrl != null) row.audioUrl = fresh.audioUrl;
            if (fresh.imageUrl != null) row.imageUrl = fresh.imageUrl;
        });
    }

    /** MySQL normalizes JSON text, so compare parsed trees to avoid no-op updates. */
    private static boolean sameJson(String a, String b) {
        if (Objects.equals(a, b)) return true;
        if (a == null || b == null) return false;
        return Objects.equals(read(a), read(b));
    }

    private static Iterable<JsonNode> iter(JsonNode n) {
        if (n == null || !n.isArray()) return List.of();
        List<JsonNode> out = new ArrayList<>();
        n.forEach(out::add);
        return out;
    }

    static void checkId(String id) {
        if (id == null || !ID.matcher(id).matches()) throw new ContentValidationException("Mã không hợp lệ: " + id);
    }
}
