package com.lingora.service.content;

import static com.lingora.service.content.ContentMapper.*;

import com.lingora.domain.*;
import com.lingora.repository.*;
import com.lingora.service.util.Json;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

/**
 * Read side of the learning content. Content is read by every learner and changes rarely,
 * so assembled documents are kept in the {@value #CACHE} cache and evicted on admin writes.
 */
@Service
@Transactional(readOnly = true)
public class ContentQueryService {

    public static final String CACHE = "lingora.content";

    private final LanguageRepository languages;
    private final CertificateRepository certificates;
    private final CertificateCourseRepository certificateCourses;
    private final CourseRepository courses;
    private final CourseUnitRepository units;
    private final LessonRepository lessons;
    private final LessonBlockRepository blocks;
    private final LessonBlockVocabularyRepository blockVocab;
    private final LessonBlockGrammarRepository blockGrammar;
    private final VocabularyRepository vocabularies;
    private final GrammarPointRepository grammar;
    private final ExamRepository exams;
    private final ExamSectionRepository sections;
    private final ExerciseRepository exercises;

    public ContentQueryService(
        LanguageRepository languages,
        CertificateRepository certificates,
        CertificateCourseRepository certificateCourses,
        CourseRepository courses,
        CourseUnitRepository units,
        LessonRepository lessons,
        LessonBlockRepository blocks,
        LessonBlockVocabularyRepository blockVocab,
        LessonBlockGrammarRepository blockGrammar,
        VocabularyRepository vocabularies,
        GrammarPointRepository grammar,
        ExamRepository exams,
        ExamSectionRepository sections,
        ExerciseRepository exercises
    ) {
        this.languages = languages;
        this.certificates = certificates;
        this.certificateCourses = certificateCourses;
        this.courses = courses;
        this.units = units;
        this.lessons = lessons;
        this.blocks = blocks;
        this.blockVocab = blockVocab;
        this.blockGrammar = blockGrammar;
        this.vocabularies = vocabularies;
        this.grammar = grammar;
        this.exams = exams;
        this.sections = sections;
        this.exercises = exercises;
    }

    @Cacheable(cacheNames = CACHE, key = "'languages'")
    public ArrayNode languages() {
        Map<String, Long> counts = courses
            .findAllByPublishedTrueOrderByPosition()
            .stream()
            .collect(Collectors.groupingBy(c -> c.languageId, Collectors.counting()));
        ArrayNode out = Json.arr();
        languages.findAllByOrderByPosition().forEach(l -> out.add(toJson(l, counts.getOrDefault(l.id, 0L))));
        return out;
    }

    @Cacheable(cacheNames = CACHE, key = "'certificates'")
    public ArrayNode certificates() {
        List<Course> allCourses = courses.findAllByOrderByPosition();
        Map<String, Integer> coursePos = new HashMap<>();
        allCourses.forEach(c -> coursePos.put(c.id, c.position));
        Map<String, List<String>> linked = certificateCourses
            .findAll()
            .stream()
            .collect(Collectors.groupingBy(cc -> cc.certificateId, Collectors.mapping(cc -> cc.courseId, Collectors.toList())));
        Map<String, List<String>> examIds = exams
            .findAllByOrderByPosition()
            .stream()
            .collect(Collectors.groupingBy(e -> e.certificateId, LinkedHashMap::new, Collectors.mapping(e -> e.id, Collectors.toList())));

        ArrayNode out = Json.arr();
        for (Certificate c : certificates.findAllByOrderByPosition()) {
            List<String> ids = new ArrayList<>(allCourses.stream().filter(x -> c.id.equals(x.certificateId)).map(x -> x.id).toList());
            linked
                .getOrDefault(c.id, List.of())
                .stream()
                .filter(id -> !ids.contains(id))
                .sorted(Comparator.comparing(id -> coursePos.getOrDefault(id, Integer.MAX_VALUE)))
                .forEach(ids::add);
            out.add(toJson(c, ids, examIds.getOrDefault(c.id, List.of())));
        }
        return out;
    }

    @Cacheable(cacheNames = CACHE, key = "'courses'")
    public ArrayNode courses() {
        ArrayNode out = Json.arr();
        courses.findAllByPublishedTrueOrderByPosition().forEach(c -> out.add(toJson(c)));
        return out;
    }

    /** Published course, or null. */
    @Cacheable(cacheNames = CACHE, key = "'course:' + #id")
    public ObjectNode course(String id) {
        return courses.findById(id).filter(c -> c.published).map(ContentMapper::toJson).orElse(null);
    }

    public ArrayNode allCourses() {
        ArrayNode out = Json.arr();
        courses.findAllByOrderByPosition().forEach(c -> out.add(toJson(c)));
        return out;
    }

    @Cacheable(cacheNames = CACHE, key = "'outline:' + #courseId")
    public ObjectNode outline(String courseId) {
        List<CourseUnit> unitRows = units.findAllByCourseIdOrderByPosition(courseId);
        if (unitRows.isEmpty() && !courses.existsById(courseId)) return null;
        Map<String, List<Lesson>> byUnit = lessons
            .findAllByCourseIdOrderByPosition(courseId)
            .stream()
            .collect(Collectors.groupingBy(l -> l.unitId));
        ObjectNode o = Json.obj();
        o.put("id", courseId);
        o.put("courseId", courseId);
        ArrayNode unitArr = o.putArray("units");
        for (CourseUnit u : unitRows) {
            ObjectNode uj = unitToJson(u);
            ArrayNode ls = (ArrayNode) uj.get("lessons");
            byUnit.getOrDefault(u.id, List.of()).forEach(l -> ls.add(lessonSummary(l)));
            unitArr.add(uj);
        }
        return o;
    }

    @Cacheable(cacheNames = CACHE, key = "'lesson:' + #id")
    public ObjectNode lesson(String id) {
        Lesson lesson = lessons.findById(id).orElse(null);
        if (lesson == null) return null;
        ObjectNode o = lessonHeader(lesson);
        ArrayNode contents = o.putArray("contents");

        List<LessonBlock> blockRows = blocks.findAllByLessonIdOrderByPosition(id);
        List<Long> blockIds = blockRows.stream().map(b -> b.id).toList();
        if (blockIds.isEmpty()) return o;

        Map<Long, List<Exercise>> exByBlock = exercises
            .findAllByLessonBlockIdInOrderByPosition(blockIds)
            .stream()
            .collect(Collectors.groupingBy(e -> e.lessonBlockId));

        List<LessonBlockVocabulary> vocabLinks = blockVocab.findAllByLessonBlockIdInOrderByPosition(blockIds);
        Map<String, Vocabulary> vocabById = vocabularies
            .findAllById(vocabLinks.stream().map(v -> v.vocabularyId).collect(Collectors.toSet()))
            .stream()
            .collect(Collectors.toMap(v -> v.id, Function.identity()));

        List<LessonBlockGrammar> grammarLinks = blockGrammar.findAllByLessonBlockIdInOrderByPosition(blockIds);
        Map<String, GrammarPoint> grammarById = grammar
            .findAllById(grammarLinks.stream().map(g -> g.grammarPointId).collect(Collectors.toSet()))
            .stream()
            .collect(Collectors.toMap(g -> g.id, Function.identity()));

        for (LessonBlock b : blockRows) {
            ObjectNode bj = blockToJson(b);
            switch (b.type) {
                case "VOCABULARY" -> {
                    ArrayNode items = bj.putArray("items");
                    vocabLinks
                        .stream()
                        .filter(v -> v.lessonBlockId.equals(b.id))
                        .map(v -> vocabById.get(v.vocabularyId))
                        .filter(Objects::nonNull)
                        .forEach(v -> items.add(itemToJson(v)));
                }
                case "GRAMMAR" -> {
                    ArrayNode points = bj.putArray("points");
                    grammarLinks
                        .stream()
                        .filter(g -> g.lessonBlockId.equals(b.id))
                        .map(g -> grammarById.get(g.grammarPointId))
                        .filter(Objects::nonNull)
                        .forEach(g -> points.add(toJson(g)));
                }
                case "EXERCISE" -> {
                    ArrayNode ex = bj.putArray("exercises");
                    exByBlock.getOrDefault(b.id, List.of()).forEach(e -> ex.add(toJson(e)));
                }
                case "READING", "LISTENING" -> {
                    ArrayNode qs = bj.putArray("questions");
                    exByBlock.getOrDefault(b.id, List.of()).forEach(e -> qs.add(toJson(e)));
                }
                default -> {}
            }
            contents.add(bj);
        }
        return o;
    }

    @Cacheable(cacheNames = CACHE, key = "'exams:' + #certificateId")
    public ArrayNode exams(String certificateId) {
        ArrayNode out = Json.arr();
        exams.findAllByCertificateIdOrderByPosition(certificateId).forEach(e -> out.add(assembleExam(e)));
        return out;
    }

    @Cacheable(cacheNames = CACHE, key = "'exam:' + #id")
    public ObjectNode exam(String id) {
        return exams.findById(id).map(this::assembleExam).orElse(null);
    }

    private ObjectNode assembleExam(Exam e) {
        ObjectNode o = examHeader(e);
        ArrayNode sectionArr = Json.arr();
        List<ExamSection> rows = sections.findAllByExamIdOrderByPosition(e.id);
        Map<Long, List<Exercise>> qs = rows.isEmpty()
            ? Map.of()
            : exercises
                .findAllByExamSectionIdInOrderByPosition(rows.stream().map(s -> s.id).toList())
                .stream()
                .collect(Collectors.groupingBy(x -> x.examSectionId));
        for (ExamSection s : rows) {
            ObjectNode sj = sectionToJson(s);
            ArrayNode arr = (ArrayNode) sj.get("questions");
            qs.getOrDefault(s.id, List.of()).forEach(x -> arr.add(toJson(x)));
            sectionArr.add(sj);
        }
        o.set("sections", sectionArr);
        return o;
    }

    public ObjectNode vocabPage(String languageId, String level, String keyword, int page, int size) {
        String prefix = keyword == null || keyword.isBlank() ? null : escapeLike(keyword.trim().toLowerCase(Locale.ROOT));
        Page<Vocabulary> result = vocabularies.search(
            languageId,
            level == null || level.isBlank() ? null : level,
            prefix,
            PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100))
        );
        ObjectNode o = Json.obj();
        ArrayNode items = o.putArray("items");
        result.forEach(v -> items.add(toJson(v)));
        o.put("page", result.getNumber());
        o.put("hasMore", result.hasNext());
        o.put("total", result.getTotalElements());
        return o;
    }

    @Cacheable(cacheNames = CACHE, key = "'vocab:' + #id")
    public ObjectNode vocab(String id) {
        return vocabularies.findById(id).map(ContentMapper::toJson).orElse(null);
    }

    @Cacheable(cacheNames = CACHE, key = "'pool:' + #languageId + ':' + #level")
    public ArrayNode vocabPool(String languageId, String level) {
        PageRequest first = PageRequest.of(0, 400, Sort.by("id"));
        List<Vocabulary> rows = level == null || level.isBlank()
            ? vocabularies.findAllByLanguageId(languageId, first)
            : vocabularies.findAllByLanguageIdAndLevel(languageId, level, first);
        ArrayNode out = Json.arr();
        rows.forEach(v -> out.add(toJson(v)));
        return out;
    }

    /** First candidate (surface form, then base forms) that exists in the dictionary. */
    public ObjectNode lookup(String languageId, List<String> candidates) {
        List<String> list = candidates
            .stream()
            .map(c -> c.trim().toLowerCase(Locale.ROOT))
            .filter(c -> !c.isEmpty() && c.length() <= 100)
            .distinct()
            .limit(10)
            .toList();
        if (list.isEmpty()) return null;
        List<Vocabulary> found = new ArrayList<>(vocabularies.findAllByLanguageIdAndWordLcIn(languageId, list));
        found.addAll(vocabularies.findAllByLanguageIdAndReadingIn(languageId, list));
        for (String w : list) {
            for (Vocabulary v : found) {
                if (w.equals(v.wordLc) || w.equals(v.reading)) return toJson(v);
            }
        }
        return null;
    }

    static String escapeLike(String s) {
        return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }

    /** Lesson / exam documents keyed by id for the admin editor (same shape as the public API). */
    public JsonNode adminDocument(String collection, String id) {
        return switch (collection) {
            case "languages" -> languages.findById(id).map(l -> (JsonNode) toJson(l, courses.countByLanguageIdAndPublishedTrue(l.id))).orElse(null);
            case "certificates" -> {
                for (JsonNode c : certificates()) if (id.equals(c.get("id").asString())) yield c;
                yield null;
            }
            case "courses" -> courses.findById(id).map(c -> (JsonNode) toJson(c)).orElse(null);
            case "outlines" -> outline(id);
            case "lessons" -> lesson(id);
            case "exams" -> exam(id);
            case "vocabularies" -> vocab(id);
            default -> throw new ContentValidationException("Bộ sưu tập không hợp lệ: " + collection);
        };
    }
}
