package com.lingora.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties specific to Lingora.
 * <p>
 * Properties are configured in the {@code application.yml} file.
 * See {@link tech.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
public class ApplicationProperties {

    private final Liquibase liquibase = new Liquibase();
    private final Seed seed = new Seed();
    private final Supabase supabase = new Supabase();
    private final Google google = new Google();
    private final Firebase firebase = new Firebase();
    private final Mail mail = new Mail();
    private final RateLimit rateLimit = new RateLimit();

    /** Time zone used when the client does not send one (streaks, daily stats, weekly leaderboard). */
    private String defaultZone = "Asia/Ho_Chi_Minh";

    // jhipster-needle-application-properties-property

    public Liquibase getLiquibase() {
        return liquibase;
    }

    public Seed getSeed() {
        return seed;
    }

    public Supabase getSupabase() {
        return supabase;
    }

    public Google getGoogle() {
        return google;
    }

    public Firebase getFirebase() {
        return firebase;
    }

    public Mail getMail() {
        return mail;
    }

    public RateLimit getRateLimit() {
        return rateLimit;
    }

    public String getDefaultZone() {
        return defaultZone;
    }

    public void setDefaultZone(String defaultZone) {
        this.defaultZone = defaultZone;
    }

    // jhipster-needle-application-properties-property-getter

    public static class Liquibase {

        private Boolean asyncStart = true;

        public Boolean getAsyncStart() {
            return asyncStart;
        }

        public void setAsyncStart(Boolean asyncStart) {
            this.asyncStart = asyncStart;
        }
    }

    public static class Seed {

        /** Folder containing the JSON files produced by {@code seed/build.mjs}. */
        private String path = "seed/out";

        /** Import the seed on startup when the content tables are empty. */
        private boolean autoImport = false;

        public String getPath() {
            return path;
        }

        public void setPath(String path) {
            this.path = path;
        }

        public boolean isAutoImport() {
            return autoImport;
        }

        public void setAutoImport(boolean autoImport) {
            this.autoImport = autoImport;
        }
    }

    public static class Supabase {

        private String url = "";
        /** Service role key, only used server side to sign uploads. Never expose it to the browser. */
        private String serviceKey = "";
        private String bucket = "media";

        public boolean isEnabled() {
            return url != null && !url.isBlank() && serviceKey != null && !serviceKey.isBlank();
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public String getServiceKey() {
            return serviceKey;
        }

        public void setServiceKey(String serviceKey) {
            this.serviceKey = serviceKey;
        }

        public String getBucket() {
            return bucket;
        }

        public void setBucket(String bucket) {
            this.bucket = bucket;
        }
    }

    public static class Google {

        /** OAuth 2.0 web client id; Google sign-in is disabled when empty. */
        private String clientId = "";

        public String getClientId() {
            return clientId;
        }

        public void setClientId(String clientId) {
            this.clientId = clientId;
        }
    }

    /**
     * Firebase Authentication, used only for the "Sign in with Google" popup: the browser gets a
     * Firebase ID token, the backend verifies it and issues its own JWT. All values are public
     * (they are sent to the browser); Google sign-in via Firebase is disabled when projectId is empty.
     */
    public static class Firebase {

        private String projectId = "";
        private String apiKey = "";
        private String authDomain = "";
        private String appId = "";

        public boolean isEnabled() {
            return projectId != null && !projectId.isBlank() && apiKey != null && !apiKey.isBlank();
        }

        public String getProjectId() {
            return projectId;
        }

        public void setProjectId(String projectId) {
            this.projectId = projectId;
        }

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }

        public String getAuthDomain() {
            return authDomain;
        }

        public void setAuthDomain(String authDomain) {
            this.authDomain = authDomain;
        }

        public String getAppId() {
            return appId;
        }

        public void setAppId(String appId) {
            this.appId = appId;
        }
    }

    public static class Mail {

        /** Log activation / reset links (handy in dev without an SMTP server). */
        private boolean logLinks = false;

        public boolean isLogLinks() {
            return logLinks;
        }

        public void setLogLinks(boolean logLinks) {
            this.logLinks = logLinks;
        }
    }

    public static class RateLimit {

        /** Max requests per IP per minute on sensitive auth endpoints. */
        private int authPerMinute = 20;

        public int getAuthPerMinute() {
            return authPerMinute;
        }

        public void setAuthPerMinute(int authPerMinute) {
            this.authPerMinute = authPerMinute;
        }
    }

    // jhipster-needle-application-properties-property-class
}
