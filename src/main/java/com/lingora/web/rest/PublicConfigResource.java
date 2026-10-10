package com.lingora.web.rest;

import com.lingora.config.ApplicationProperties;
import com.lingora.service.MediaService;
import com.lingora.service.util.Json;
import java.time.Duration;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.node.ObjectNode;

/** Runtime configuration the SPA needs before sign-in (no secrets). */
@RestController
@RequestMapping("/api/public")
public class PublicConfigResource {

    private final ApplicationProperties properties;
    private final MediaService media;

    public PublicConfigResource(ApplicationProperties properties, MediaService media) {
        this.properties = properties;
        this.media = media;
    }

    @GetMapping("/config")
    public ResponseEntity<ObjectNode> config() {
        ObjectNode o = Json.obj();
        ApplicationProperties.Firebase firebase = properties.getFirebase();
        if (firebase.isEnabled()) {
            ObjectNode f = o.putObject("firebase");
            f.put("apiKey", firebase.getApiKey());
            f.put(
                "authDomain",
                firebase.getAuthDomain().isBlank() ? firebase.getProjectId() + ".firebaseapp.com" : firebase.getAuthDomain()
            );
            f.put("projectId", firebase.getProjectId());
            if (!firebase.getAppId().isBlank()) f.put("appId", firebase.getAppId());
            o.put("googleClientId", "");
        } else {
            o.putNull("firebase");
            o.put("googleClientId", properties.getGoogle().getClientId());
        }
        o.put("storageEnabled", media.isEnabled());
        return ResponseEntity.ok().cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)).cachePublic()).body(o);
    }
}
