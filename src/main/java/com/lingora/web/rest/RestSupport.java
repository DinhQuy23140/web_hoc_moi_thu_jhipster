package com.lingora.web.rest;

import com.lingora.config.ApplicationProperties;
import com.lingora.security.SecurityUtils;
import java.time.DateTimeException;
import java.time.Duration;
import java.time.ZoneId;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

/** Small helpers shared by the Lingora REST controllers. */
final class RestSupport {

    private RestSupport() {}

    static Long currentUserId() {
        return SecurityUtils.getCurrentUserId().orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    /** Learner's IANA time zone from the {@code X-Timezone} header (streaks and daily stats are per local day). */
    static ZoneId zone(String header, ApplicationProperties properties) {
        if (header != null && !header.isBlank() && header.length() <= 64) {
            try {
                return ZoneId.of(header.trim());
            } catch (DateTimeException ignored) {
                // fall back to the default zone
            }
        }
        return ZoneId.of(properties.getDefaultZone());
    }

    static <T> ResponseEntity<T> cached(T body, Duration maxAge, boolean shared) {
        if (body == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        CacheControl cc = CacheControl.maxAge(maxAge);
        cc = shared ? cc.cachePublic() : cc.cachePrivate();
        return ResponseEntity.ok().cacheControl(cc).body(body);
    }

    static <T> T found(T body) {
        if (body == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return body;
    }
}
