package com.lingora.web.rest;

import static com.lingora.web.rest.RestSupport.found;

import com.lingora.repository.*;
import com.lingora.service.MediaService;
import com.lingora.service.content.ContentImportService;
import com.lingora.service.content.ContentQueryService;
import com.lingora.service.content.ContentValidationException;
import com.lingora.service.content.ContentWriteService;
import com.lingora.service.learning.ProfileService;
import com.lingora.service.util.Json;
import java.nio.file.Path;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.ObjectNode;

/** Admin content management (requires {@code ROLE_ADMIN}). */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority(\"" + com.lingora.security.AuthoritiesConstants.ADMIN + "\")")
public class AdminContentResource {

    private final ContentQueryService query;
    private final ContentWriteService writer;
    private final ContentImportService importer;
    private final ProfileService profiles;
    private final MediaService media;
    private final UserRepository users;
    private final CourseRepository courses;
    private final LessonRepository lessons;
    private final VocabularyRepository vocabularies;
    private final CertificateRepository certificates;
    private final ExamRepository exams;

    public AdminContentResource(
        ContentQueryService query,
        ContentWriteService writer,
        ContentImportService importer,
        ProfileService profiles,
        MediaService media,
        UserRepository users,
        CourseRepository courses,
        LessonRepository lessons,
        VocabularyRepository vocabularies,
        CertificateRepository certificates,
        ExamRepository exams
    ) {
        this.query = query;
        this.writer = writer;
        this.importer = importer;
        this.profiles = profiles;
        this.media = media;
        this.users = users;
        this.courses = courses;
        this.lessons = lessons;
        this.vocabularies = vocabularies;
        this.certificates = certificates;
        this.exams = exams;
    }

    @GetMapping("/stats/counts")
    public ObjectNode counts() {
        ObjectNode o = Json.obj();
        o.put("users", users.count());
        o.put("courses", courses.count());
        o.put("lessons", lessons.count());
        o.put("vocabularies", vocabularies.count());
        o.put("certificates", certificates.count());
        o.put("exams", exams.count());
        return o;
    }

    @GetMapping("/content/all-courses")
    public JsonNode allCourses() {
        return query.allCourses();
    }

    @GetMapping("/content/{collection}/{id}")
    public JsonNode get(@PathVariable String collection, @PathVariable String id) {
        return found(query.adminDocument(collection, id));
    }

    @PutMapping("/content/{collection}/{id}")
    public JsonNode save(@PathVariable String collection, @PathVariable String id, @RequestBody JsonNode body) {
        try {
            writer.save(collection, id, body);
        } catch (DataIntegrityViolationException e) {
            throw new ContentValidationException("Dữ liệu không hợp lệ hoặc tham chiếu không tồn tại: " + e.getMostSpecificCause().getMessage());
        }
        return query.adminDocument(collection, id);
    }

    @DeleteMapping("/content/{collection}/{id}")
    public void delete(@PathVariable String collection, @PathVariable String id) {
        writer.delete(collection, id);
    }

    /** Re-imports {@code seed/out}: content rows are upserted, learner data is kept. */
    @PostMapping("/content/import")
    public ObjectNode reimport() {
        Path dir = importer.resolveSeedDir();
        if (dir == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thư mục seed/out");
        return importer.importFrom(dir);
    }

    @GetMapping("/learners")
    public ObjectNode learners(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "25") int size) {
        return profiles.adminPage(page, size);
    }

    @GetMapping("/learners/search")
    public JsonNode searchLearners(@RequestParam String email) {
        return profiles.searchByEmail(email);
    }

    @GetMapping("/media")
    public JsonNode listMedia(@RequestParam String folder) {
        return media.list(folder);
    }
}
