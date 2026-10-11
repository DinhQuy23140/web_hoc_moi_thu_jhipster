package com.lingora.config;

import static org.springframework.security.config.Customizer.withDefaults;

import com.lingora.security.*;
import com.lingora.web.filter.SpaWebFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.oauth2.server.resource.web.access.BearerTokenAccessDeniedHandler;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import tech.jhipster.config.JHipsterProperties;

@Configuration
@EnableMethodSecurity(securedEnabled = true)
public class SecurityConfiguration {

    /**
     * The SPA is served by this backend in production. Google Identity Services, the Firebase Auth
     * popup helpers (apis.google.com, *.firebaseapp.com) and Google Fonts are the only third-party
     * scripts/frames/styles; media comes from Supabase Storage (https).
     */
    private static final String CONTENT_SECURITY_POLICY =
        "default-src 'self'; " +
        "script-src 'self' https://accounts.google.com/gsi/client https://apis.google.com; " +
        "style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com data:; " +
        "img-src 'self' data: blob: https:; " +
        "media-src 'self' data: blob: https:; " +
        "connect-src 'self' https://*.supabase.co https://accounts.google.com/gsi/ https://cdn.jsdelivr.net " +
        "https://identitytoolkit.googleapis.com https://securetoken.googleapis.com; " +
        "frame-src https://accounts.google.com/gsi/ https://*.firebaseapp.com https://*.web.app https://www.youtube.com https://www.youtube-nocookie.com; " +
        "worker-src 'self' blob:; " +
        "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors ";

    private final JHipsterProperties jHipsterProperties;

    /** Sites allowed to embed the app in an iframe (e.g. {@code https://huggingface.co} for a Space page). */
    private final String frameAncestors;

    public SecurityConfiguration(JHipsterProperties jHipsterProperties, ApplicationProperties applicationProperties) {
        this.jHipsterProperties = jHipsterProperties;
        String ancestors = applicationProperties.getSecurity().getFrameAncestors();
        this.frameAncestors = ancestors == null ? "" : ancestors.trim();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http.cors(withDefaults())
            .csrf(csrf -> csrf.disable())
            .addFilterAfter(new SpaWebFilter(), BasicAuthenticationFilter.class)
            .headers(headers ->
                headers
                    .contentSecurityPolicy(csp ->
                        csp.policyDirectives(CONTENT_SECURITY_POLICY + (frameAncestors.isEmpty() ? "'none'" : "'self' " + frameAncestors))
                    )
                    .frameOptions(frame -> {
                        if (frameAncestors.isEmpty()) frame.deny();
                        else frame.disable();
                    })
                    .referrerPolicy(referrer -> referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                    .permissionsPolicyHeader(permissions ->
                        permissions.policy("camera=(), geolocation=(), microphone=(self), payment=(), usb=()")
                    )
            )
            .authorizeHttpRequests(authz ->
                // prettier-ignore
                authz
                    .requestMatchers(HttpMethod.POST, "/api/authenticate", "/api/authenticate/google").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/authenticate").permitAll()
                    .requestMatchers("/api/register").permitAll()
                    .requestMatchers("/api/activate").permitAll()
                    .requestMatchers("/api/account/reset-password/init").permitAll()
                    .requestMatchers("/api/account/reset-password/finish").permitAll()
                    .requestMatchers("/api/account/resend-activation").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/public/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/content/lessons/**", "/api/content/exams/**", "/api/content/exams").authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/content/**").permitAll()
                    .requestMatchers("/api/admin/**").hasAuthority(AuthoritiesConstants.ADMIN)
                    .requestMatchers("/api/**").authenticated()
                    .requestMatchers("/v3/api-docs/**").hasAuthority(AuthoritiesConstants.ADMIN)
                    .requestMatchers("/management/health").permitAll()
                    .requestMatchers("/management/health/**").permitAll()
                    .requestMatchers("/management/info").permitAll()
                    .requestMatchers("/management/**").hasAuthority(AuthoritiesConstants.ADMIN)
                    // Angular bundle and client-side routes (forwarded to index.html by SpaWebFilter)
                    .anyRequest().permitAll()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions ->
                exceptions
                    .authenticationEntryPoint(new BearerTokenAuthenticationEntryPoint())
                    .accessDeniedHandler(new BearerTokenAccessDeniedHandler())
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(withDefaults()));
        return http.build();
    }
}
