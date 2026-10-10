package com.lingora.web.rest;

import static com.lingora.web.rest.RestSupport.currentUserId;

import com.lingora.service.learning.SessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.ObjectNode;

/** Resume points of the signed-in learner's unfinished lessons and mock exams. */
@RestController
@RequestMapping("/api/me/sessions")
public class SessionResource {

    private final SessionService sessions;

    public SessionResource(SessionService sessions) {
        this.sessions = sessions;
    }

    @GetMapping
    public JsonNode list(@RequestParam(required = false) String kind, @RequestParam(defaultValue = "10") int limit) {
        return sessions.list(currentUserId(), kind, limit);
    }

    /** 200 with an empty body when there is nothing to resume. */
    @GetMapping("/{kind}/{refId}")
    public ResponseEntity<ObjectNode> get(@PathVariable String kind, @PathVariable String refId) {
        return ResponseEntity.ok(sessions.get(currentUserId(), kind, refId));
    }

    @PutMapping("/{kind}/{refId}")
    public ObjectNode save(@PathVariable String kind, @PathVariable String refId, @RequestBody JsonNode body) {
        return sessions.save(currentUserId(), kind, refId, body);
    }

    @DeleteMapping("/{kind}/{refId}")
    public void delete(@PathVariable String kind, @PathVariable String refId) {
        sessions.delete(currentUserId(), kind, refId);
    }
}
