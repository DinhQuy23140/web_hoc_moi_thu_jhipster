package com.lingora.web.filter;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.lingora.config.ApplicationProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Fixed-window rate limit per client IP on credential endpoints (login, sign-up, password reset,
 * activation resend) to slow down brute force and email bombing.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private static final Set<String> PATHS = Set.of(
        "/api/authenticate",
        "/api/authenticate/google",
        "/api/register",
        "/api/account/reset-password/init",
        "/api/account/reset-password/finish",
        "/api/account/resend-activation"
    );

    private final int limit;
    private final Cache<String, AtomicInteger> counters = Caffeine.newBuilder()
        .expireAfterWrite(Duration.ofMinutes(1))
        .maximumSize(100_000)
        .build();

    public AuthRateLimitFilter(ApplicationProperties properties) {
        this.limit = properties.getRateLimit().getAuthPerMinute();
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !"POST".equals(request.getMethod()) || !PATHS.contains(request.getRequestURI().substring(request.getContextPath().length()));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
        String key = request.getRemoteAddr() + "|" + request.getRequestURI();
        int count = counters.get(key, k -> new AtomicInteger()).incrementAndGet();
        if (limit > 0 && count > limit) {
            response.setStatus(429);
            response.setHeader("Retry-After", "60");
            response.setContentType("application/problem+json");
            response.getWriter().write("{\"status\":429,\"title\":\"Too Many Requests\",\"detail\":\"Bạn thao tác quá nhanh, vui lòng thử lại sau 1 phút.\"}");
            return;
        }
        filterChain.doFilter(request, response);
    }
}
