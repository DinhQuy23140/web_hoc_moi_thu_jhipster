package com.lingora.service;

import com.lingora.config.ApplicationProperties;
import com.lingora.domain.User;
import com.lingora.security.DomainUserDetailsService.UserWithId;
import com.lingora.service.learning.ProfileService;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Predicate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * "Sign in with Google". When Firebase is configured the browser signs in through Firebase
 * Authentication and sends a Firebase ID token (issuer {@code securetoken.google.com/<project>},
 * audience = project id, provider {@code google.com}); otherwise it sends a Google Identity Services
 * ID token (audience = OAuth client id). Either way the signature (JWKS), issuer, audience, expiry and
 * verified email are checked, the token is mapped to a local account and the app issues its own JWT.
 */
@Service
public class GoogleAuthService {

    private static final String GOOGLE_JWKS = "https://www.googleapis.com/oauth2/v3/certs";
    private static final Set<String> GOOGLE_ISSUERS = Set.of("https://accounts.google.com", "accounts.google.com");
    private static final String FIREBASE_JWKS = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
    private static final Set<String> LANGS = Set.of("vi", "en", "ja");

    private final ApplicationProperties properties;
    private final UserService userService;
    private final ProfileService profileService;
    private volatile NimbusJwtDecoder decoder;

    public GoogleAuthService(ApplicationProperties properties, UserService userService, ProfileService profileService) {
        this.properties = properties;
        this.userService = userService;
        this.profileService = profileService;
    }

    public boolean isEnabled() {
        return properties.getFirebase().isEnabled() || hasText(properties.getGoogle().getClientId());
    }

    @Transactional
    public Authentication authenticate(String credential, String langKey) {
        if (!isEnabled()) throw new BadCredentialsException("Google sign-in is not configured");
        Jwt jwt;
        try {
            jwt = decoder().decode(credential);
        } catch (JwtException e) {
            throw new BadCredentialsException("Invalid Google credential", e);
        }
        String email = jwt.getClaimAsString("email");
        if (email == null || !Boolean.TRUE.equals(jwt.getClaimAsBoolean("email_verified"))) {
            throw new BadCredentialsException("Google account email is not verified");
        }
        String name = jwt.getClaimAsString("name");
        UserService.GoogleAccount account = userService.findOrCreateGoogleUser(
            email,
            name,
            jwt.getClaimAsString("picture"),
            LANGS.contains(langKey) ? langKey : null,
            googleSubject(jwt)
        );
        User user = account.user();
        if (account.created()) profileService.create(user, name, false, true);
        else profileService.markGoogleLinked(user, false);
        UserWithId principal = UserWithId.fromUser(user);
        return new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
    }

    /** The Google account id: {@code sub} of a Google token, {@code firebase.identities["google.com"][0]} of a Firebase one. */
    private static String googleSubject(Jwt jwt) {
        if (jwt.getClaim("firebase") instanceof Map<?, ?> firebase && firebase.get("identities") instanceof Map<?, ?> ids) {
            if (ids.get("google.com") instanceof List<?> google && !google.isEmpty()) return String.valueOf(google.get(0));
        }
        return jwt.getSubject();
    }

    private NimbusJwtDecoder decoder() {
        NimbusJwtDecoder d = decoder;
        if (d == null) {
            synchronized (this) {
                if (decoder == null) decoder = properties.getFirebase().isEnabled() ? firebaseDecoder() : googleDecoder();
                d = decoder;
            }
        }
        return d;
    }

    private NimbusJwtDecoder firebaseDecoder() {
        String project = properties.getFirebase().getProjectId();
        String issuer = "https://securetoken.google.com/" + project;
        NimbusJwtDecoder built = NimbusJwtDecoder.withJwkSetUri(FIREBASE_JWKS).build();
        built.setJwtValidator(
            new DelegatingOAuth2TokenValidator<>(
                new JwtTimestampValidator(),
                check(t -> issuer.equals(String.valueOf(t.getClaims().get("iss"))), "Bad issuer"),
                check(t -> t.getAudience() != null && t.getAudience().contains(project), "Bad audience"),
                check(t -> hasText(t.getSubject()), "Missing subject"),
                check(
                    t -> t.getClaim("firebase") instanceof Map<?, ?> f && "google.com".equals(f.get("sign_in_provider")),
                    "Not a Google sign-in"
                )
            )
        );
        return built;
    }

    private NimbusJwtDecoder googleDecoder() {
        String clientId = properties.getGoogle().getClientId();
        NimbusJwtDecoder built = NimbusJwtDecoder.withJwkSetUri(GOOGLE_JWKS).build();
        built.setJwtValidator(
            new DelegatingOAuth2TokenValidator<>(
                new JwtTimestampValidator(),
                check(t -> GOOGLE_ISSUERS.contains(String.valueOf(t.getClaims().get("iss"))), "Bad issuer"),
                check(t -> t.getAudience() != null && t.getAudience().contains(clientId), "Bad audience")
            )
        );
        return built;
    }

    private static OAuth2TokenValidator<Jwt> check(Predicate<Jwt> test, String message) {
        return token ->
            test.test(token)
                ? OAuth2TokenValidatorResult.success()
                : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", message, null));
    }

    private static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }
}
