package com.lingora.web.rest;

import static com.lingora.web.rest.RestSupport.cached;

import com.lingora.service.content.ContentQueryService;
import java.time.Duration;
import java.util.Arrays;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;

/**
 * Learning content. Catalog endpoints are public and cacheable by browsers/CDNs;
 * lessons and exams require a signed-in learner (see {@code SecurityConfiguration}).
 */
@RestController
@RequestMapping("/api/content")
public class ContentResource {

    private static final Duration CATALOG = Duration.ofMinutes(10);
    private static final Duration DOCUMENT = Duration.ofMinutes(30);

    private final ContentQueryService content;

    public ContentResource(ContentQueryService content) {
        this.content = content;
    }

    @GetMapping("/languages")
    public ResponseEntity<JsonNode> languages() {
        return cached(content.languages(), CATALOG, true);
    }

    @GetMapping("/certificates")
    public ResponseEntity<JsonNode> certificates() {
        return cached(content.certificates(), CATALOG, true);
    }

    @GetMapping("/courses")
    public ResponseEntity<JsonNode> courses() {
        return cached(content.courses(), CATALOG, true);
    }

    @GetMapping("/courses/{id}")
    public ResponseEntity<JsonNode> course(@PathVariable String id) {
        return cached(content.course(id), CATALOG, true);
    }

    @GetMapping("/outlines/{courseId}")
    public ResponseEntity<JsonNode> outline(@PathVariable String courseId) {
        return cached(content.outline(courseId), CATALOG, true);
    }

    @GetMapping("/vocab")
    public ResponseEntity<JsonNode> vocabPage(
        @RequestParam String languageId,
        @RequestParam(required = false) String level,
        @RequestParam(required = false) String keyword,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "30") int size
    ) {
        return cached(content.vocabPage(languageId, level, keyword, page, size), Duration.ofMinutes(5), true);
    }

    @GetMapping("/vocab/pool")
    public ResponseEntity<JsonNode> vocabPool(@RequestParam String languageId, @RequestParam(required = false) String level) {
        return cached(content.vocabPool(languageId, level == null ? "" : level), DOCUMENT, true);
    }

    @GetMapping("/vocab/lookup")
    public ResponseEntity<JsonNode> lookup(@RequestParam String languageId, @RequestParam String words) {
        JsonNode found = content.lookup(languageId, Arrays.asList(words.split(",")));
        return ResponseEntity.ok().cacheControl(org.springframework.http.CacheControl.maxAge(DOCUMENT).cachePublic()).body(found);
    }

    @GetMapping("/vocab/{id}")
    public ResponseEntity<JsonNode> vocab(@PathVariable String id) {
        return cached(content.vocab(id), DOCUMENT, true);
    }

    @GetMapping("/lessons/{id}")
    public ResponseEntity<JsonNode> lesson(@PathVariable String id) {
        return cached(content.lesson(id), DOCUMENT, false);
    }

    @GetMapping("/exams")
    public ResponseEntity<JsonNode> exams(@RequestParam String certificateId) {
        return cached(content.exams(certificateId), DOCUMENT, false);
    }

    @GetMapping("/exams/{id}")
    public ResponseEntity<JsonNode> exam(@PathVariable String id) {
        return cached(content.exam(id), DOCUMENT, false);
    }
}
