package com.lingora.service.content;

import static com.lingora.service.util.Json.*;

import com.lingora.domain.*;
import java.util.Collection;
import java.util.Set;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

/** Converts between rows and the JSON documents used by the Angular client. */
public final class ContentMapper {

    /** Block fields stored in dedicated tables instead of {@code lesson_block.data}. */
    static final Set<String> BLOCK_COLUMNS = Set.of("type", "title", "items", "points", "exercises", "questions");

    private ContentMapper() {}

    // ---- language -------------------------------------------------------

    public static ObjectNode toJson(Language l, long courseCount) {
        ObjectNode o = obj();
        o.put("id", l.id);
        o.put("code", l.code);
        putRaw(o, "name", l.name);
        put(o, "nativeName", l.nativeName);
        put(o, "flag", l.flag);
        put(o, "speechLang", l.speechLang);
        putRaw(o, "levels", l.levels);
        o.put("order", l.position);
        o.put("active", l.active);
        o.put("courseCount", courseCount);
        return o;
    }

    public static Language language(String id, JsonNode j) {
        Language l = new Language();
        l.id = id;
        l.code = defaultIfNull(str(j, "code"), id);
        l.name = raw(j, "name");
        l.nativeName = str(j, "nativeName");
        l.flag = str(j, "flag");
        l.speechLang = str(j, "speechLang");
        l.levels = raw(j, "levels");
        l.position = integer(j, "order", 0);
        l.active = bool(j, "active", true);
        return l;
    }

    // ---- certificate ----------------------------------------------------

    public static ObjectNode toJson(Certificate c, Collection<String> courseIds, Collection<String> examIds) {
        ObjectNode o = obj();
        o.put("id", c.id);
        o.put("languageId", c.languageId);
        o.put("code", c.code);
        o.put("name", c.name);
        put(o, "fullName", c.fullName);
        put(o, "organizer", c.organizer);
        put(o, "color", c.color);
        o.put("order", c.position);
        put(o, "durationMinutes", c.durationMinutes);
        put(o, "website", c.website);
        putRaw(o, "description", c.description);
        putRaw(o, "levels", c.levels);
        putRaw(o, "sections", c.sections);
        putRaw(o, "scoring", c.scoring);
        putRaw(o, "validity", c.validity);
        putRaw(o, "tips", c.tips);
        ArrayNode courses = o.putArray("courseIds");
        courseIds.forEach(courses::add);
        ArrayNode exams = o.putArray("examIds");
        examIds.forEach(exams::add);
        return o;
    }

    public static Certificate certificate(String id, JsonNode j) {
        Certificate c = new Certificate();
        c.id = id;
        c.languageId = required(j, "languageId");
        c.code = defaultIfNull(str(j, "code"), id);
        c.name = defaultIfNull(str(j, "name"), id);
        c.fullName = str(j, "fullName");
        c.organizer = str(j, "organizer");
        c.color = str(j, "color");
        c.position = integer(j, "order", 0);
        c.durationMinutes = integerOrNull(j, "durationMinutes");
        c.website = str(j, "website");
        c.description = raw(j, "description");
        c.levels = raw(j, "levels");
        c.sections = raw(j, "sections");
        c.scoring = raw(j, "scoring");
        c.validity = raw(j, "validity");
        c.tips = raw(j, "tips");
        return c;
    }

    // ---- course ---------------------------------------------------------

    public static ObjectNode toJson(Course c) {
        ObjectNode o = obj();
        o.put("id", c.id);
        o.put("languageId", c.languageId);
        put(o, "certificateId", c.certificateId);
        put(o, "level", c.level);
        put(o, "cefr", c.cefr);
        put(o, "emoji", c.emoji);
        put(o, "color", c.color);
        put(o, "coverUrl", c.coverUrl);
        o.put("difficulty", c.difficulty);
        putRaw(o, "title", c.title);
        putRaw(o, "subtitle", c.subtitle);
        putRaw(o, "description", c.description);
        putRaw(o, "outcomes", c.outcomes);
        putRaw(o, "tags", c.tags);
        o.put("unitCount", c.unitCount);
        o.put("lessonCount", c.lessonCount);
        o.put("vocabCount", c.vocabCount);
        o.put("estimatedHours", c.estimatedHours);
        o.put("order", c.position);
        o.put("published", c.published);
        return o;
    }

    public static Course course(String id, JsonNode j) {
        Course c = new Course();
        c.id = id;
        c.languageId = required(j, "languageId");
        c.certificateId = str(j, "certificateId");
        c.level = str(j, "level");
        c.cefr = str(j, "cefr");
        c.emoji = str(j, "emoji");
        c.color = str(j, "color");
        c.coverUrl = str(j, "coverUrl");
        c.difficulty = integer(j, "difficulty", 1);
        c.title = raw(j, "title");
        c.subtitle = raw(j, "subtitle");
        c.description = raw(j, "description");
        c.outcomes = raw(j, "outcomes");
        c.tags = raw(j, "tags");
        c.unitCount = integer(j, "unitCount", 0);
        c.lessonCount = integer(j, "lessonCount", 0);
        c.vocabCount = integer(j, "vocabCount", 0);
        c.estimatedHours = integer(j, "estimatedHours", 0);
        c.position = integer(j, "order", 0);
        c.published = bool(j, "published", true);
        return c;
    }

    // ---- outline --------------------------------------------------------

    public static ObjectNode unitToJson(CourseUnit u) {
        ObjectNode o = obj();
        o.put("id", u.id);
        putRaw(o, "title", u.title);
        putRaw(o, "description", u.description);
        o.putArray("lessons");
        return o;
    }

    public static ObjectNode lessonSummary(Lesson l) {
        ObjectNode o = obj();
        o.put("id", l.id);
        putRaw(o, "title", l.title);
        o.put("minutes", l.minutes);
        o.put("xp", l.xp);
        putRaw(o, "kinds", l.kinds);
        return o;
    }

    public static CourseUnit unit(String courseId, int position, JsonNode j) {
        CourseUnit u = new CourseUnit();
        u.id = required(j, "id");
        u.courseId = courseId;
        u.position = position;
        u.title = raw(j, "title");
        u.description = raw(j, "description");
        return u;
    }

    // ---- lesson ---------------------------------------------------------

    public static ObjectNode lessonHeader(Lesson l) {
        ObjectNode o = obj();
        o.put("id", l.id);
        o.put("courseId", l.courseId);
        o.put("languageId", l.languageId);
        o.put("unitId", l.unitId);
        o.put("order", l.position);
        putRaw(o, "title", l.title);
        o.put("minutes", l.minutes);
        o.put("xp", l.xp);
        return o;
    }

    public static Lesson lesson(String id, JsonNode j) {
        Lesson l = new Lesson();
        l.id = id;
        l.courseId = required(j, "courseId");
        l.unitId = required(j, "unitId");
        l.languageId = required(j, "languageId");
        l.position = integer(j, "order", 0);
        l.title = raw(j, "title");
        l.minutes = integer(j, "minutes", 10);
        l.xp = integer(j, "xp", 20);
        ArrayNode kinds = arr();
        JsonNode contents = j.get("contents");
        if (contents != null && contents.isArray()) {
            java.util.LinkedHashSet<String> seen = new java.util.LinkedHashSet<>();
            for (JsonNode c : contents) {
                String t = str(c, "type");
                if (t != null) seen.add(t);
            }
            seen.forEach(kinds::add);
        }
        l.kinds = write(kinds);
        return l;
    }

    public static ObjectNode blockToJson(LessonBlock b) {
        ObjectNode o = obj();
        o.put("type", b.type);
        putRaw(o, "title", b.title);
        JsonNode data = read(b.data);
        if (data != null && data.isObject()) {
            data.properties().forEach(e -> o.set(e.getKey(), e.getValue()));
        }
        return o;
    }

    public static LessonBlock block(String lessonId, int position, JsonNode j) {
        LessonBlock b = new LessonBlock();
        b.lessonId = lessonId;
        b.position = position;
        b.type = required(j, "type");
        b.title = raw(j, "title");
        ObjectNode data = obj();
        j.properties().forEach(e -> {
            if (!BLOCK_COLUMNS.contains(e.getKey())) data.set(e.getKey(), e.getValue());
        });
        b.data = data.isEmpty() ? null : write(data);
        return b;
    }

    // ---- vocabulary -----------------------------------------------------

    public static ObjectNode toJson(Vocabulary v) {
        ObjectNode o = obj();
        o.put("id", v.id);
        o.put("languageId", v.languageId);
        o.put("word", v.word);
        put(o, "wordLc", v.wordLc);
        put(o, "reading", v.reading);
        put(o, "romaji", v.romaji);
        put(o, "ipa", v.ipa);
        put(o, "pos", v.pos);
        putRaw(o, "meaning", v.meaning);
        put(o, "example", v.example);
        put(o, "exampleReading", v.exampleReading);
        putRaw(o, "exampleMeaning", v.exampleMeaning);
        put(o, "level", v.level);
        put(o, "topic", v.topic);
        putRaw(o, "tags", v.tags);
        put(o, "audioUrl", v.audioUrl);
        put(o, "imageUrl", v.imageUrl);
        return o;
    }

    /** Lesson flavour of a vocabulary row (no search fields). */
    public static ObjectNode itemToJson(Vocabulary v) {
        ObjectNode o = toJson(v);
        o.remove("languageId");
        o.remove("wordLc");
        o.remove("tags");
        return o;
    }

    public static Vocabulary vocabulary(String id, String fallbackLanguageId, JsonNode j) {
        Vocabulary v = new Vocabulary();
        v.id = id;
        v.languageId = defaultIfNull(str(j, "languageId"), fallbackLanguageId);
        v.word = required(j, "word");
        String lc = str(j, "wordLc");
        v.wordLc = truncate(lc != null ? lc : v.word.toLowerCase(java.util.Locale.ROOT), 255);
        v.reading = str(j, "reading");
        v.romaji = str(j, "romaji");
        v.ipa = str(j, "ipa");
        v.pos = str(j, "pos");
        v.meaning = raw(j, "meaning");
        v.example = str(j, "example");
        v.exampleReading = str(j, "exampleReading");
        v.exampleMeaning = raw(j, "exampleMeaning");
        v.level = str(j, "level");
        v.topic = str(j, "topic");
        JsonNode tags = j.get("tags");
        if (isAbsent(tags)) {
            ArrayNode t = arr();
            if (v.level != null) t.add(v.level.toLowerCase(java.util.Locale.ROOT));
            v.tags = write(t);
        } else {
            v.tags = write(tags);
        }
        v.audioUrl = str(j, "audioUrl");
        v.imageUrl = str(j, "imageUrl");
        return v;
    }

    // ---- grammar --------------------------------------------------------

    public static ObjectNode toJson(GrammarPoint g) {
        ObjectNode o = obj();
        o.put("id", g.id);
        o.put("title", g.title);
        put(o, "structure", g.structure);
        putRaw(o, "explanation", g.explanation);
        putRaw(o, "examples", g.examples);
        putRaw(o, "note", g.note);
        return o;
    }

    public static GrammarPoint grammar(String languageId, JsonNode j) {
        GrammarPoint g = new GrammarPoint();
        g.id = required(j, "id");
        g.languageId = languageId;
        g.title = required(j, "title");
        g.structure = str(j, "structure");
        g.explanation = raw(j, "explanation");
        g.examples = raw(j, "examples");
        g.note = raw(j, "note");
        return g;
    }

    // ---- exercise -------------------------------------------------------

    public static ObjectNode toJson(Exercise e) {
        ObjectNode o = obj();
        o.put("id", e.id);
        o.put("type", e.type);
        putRaw(o, "instruction", e.instruction);
        put(o, "question", e.question);
        put(o, "hint", e.hint);
        putRaw(o, "prompt", e.prompt);
        putRaw(o, "options", e.options);
        putRaw(o, "labels", e.labels);
        putRaw(o, "answers", e.answers);
        put(o, "correct", e.correct);
        putRaw(o, "pairs", e.pairs);
        put(o, "audioText", e.audioText);
        put(o, "audioUrl", e.audioUrl);
        putRaw(o, "explanation", e.explanation);
        return o;
    }

    public static Exercise exercise(int position, JsonNode j) {
        Exercise e = new Exercise();
        e.id = required(j, "id");
        e.position = position;
        e.type = required(j, "type");
        e.instruction = raw(j, "instruction");
        e.question = str(j, "question");
        e.hint = str(j, "hint");
        e.prompt = raw(j, "prompt");
        e.options = raw(j, "options");
        e.labels = raw(j, "labels");
        e.answers = raw(j, "answers");
        e.correct = boolOrNull(j, "correct");
        e.pairs = raw(j, "pairs");
        e.audioText = str(j, "audioText");
        e.audioUrl = str(j, "audioUrl");
        e.explanation = raw(j, "explanation");
        return e;
    }

    // ---- exam -----------------------------------------------------------

    public static ObjectNode examHeader(Exam e) {
        ObjectNode o = obj();
        o.put("id", e.id);
        o.put("certificateId", e.certificateId);
        o.put("languageId", e.languageId);
        put(o, "level", e.level);
        putRaw(o, "title", e.title);
        put(o, "durationMinutes", e.durationMinutes);
        put(o, "passPercent", e.passPercent);
        o.put("questionCount", e.questionCount);
        o.put("order", e.position);
        return o;
    }

    public static Exam exam(String id, JsonNode j) {
        Exam e = new Exam();
        e.id = id;
        e.certificateId = required(j, "certificateId");
        e.languageId = required(j, "languageId");
        e.level = str(j, "level");
        e.title = raw(j, "title");
        e.durationMinutes = integerOrNull(j, "durationMinutes");
        e.passPercent = integerOrNull(j, "passPercent");
        e.position = integer(j, "order", 0);
        int count = 0;
        JsonNode sections = j.get("sections");
        if (sections != null && sections.isArray()) {
            for (JsonNode s : sections) {
                JsonNode q = s.get("questions");
                count += q != null && q.isArray() ? q.size() : 0;
            }
        }
        e.questionCount = count;
        return e;
    }

    public static ObjectNode sectionToJson(ExamSection s) {
        ObjectNode o = obj();
        putRaw(o, "title", s.title);
        o.put("kind", s.kind);
        put(o, "passage", s.passage);
        o.putArray("questions");
        return o;
    }

    public static ExamSection section(String examId, int position, JsonNode j) {
        ExamSection s = new ExamSection();
        s.examId = examId;
        s.position = position;
        s.kind = defaultIfNull(str(j, "kind"), "mixed");
        s.title = raw(j, "title");
        s.passage = str(j, "passage");
        return s;
    }

    // ---- helpers --------------------------------------------------------

    static String required(JsonNode j, String field) {
        String v = str(j, field);
        if (v == null) throw new ContentValidationException("Thiếu trường bắt buộc: " + field);
        return v;
    }

    static String defaultIfNull(String v, String def) {
        return v == null ? def : v;
    }

    static String truncate(String s, int max) {
        return s == null || s.length() <= max ? s : s.substring(0, max);
    }
}
