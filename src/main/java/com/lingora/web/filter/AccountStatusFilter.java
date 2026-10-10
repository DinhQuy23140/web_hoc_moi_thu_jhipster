package com.lingora.web.filter;

import com.lingora.security.AccountStatusCache;
import com.lingora.security.SecurityUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Runs after the Spring Security chain (which has already validated the JWT) and rejects
 * requests of accounts that were locked or deleted, and admin calls of users whose admin
 * role was revoked, without waiting for their tokens to expire.
 */
@Component
public class AccountStatusFilter extends OncePerRequestFilter {

    private final AccountStatusCache statuses;

    public AccountStatusFilter(AccountStatusCache statuses) {
        this.statuses = statuses;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return !uri.startsWith("/api/") || uri.startsWith("/api/public/") || uri.startsWith("/api/authenticate");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws ServletException, IOException {
        Optional<Long> userId = SecurityUtils.getCurrentUserId();
        if (userId.isPresent()) {
            AccountStatusCache.Status s = statuses.get(userId.orElseThrow());
            if (!s.exists() || s.locked()) {
                reject(response, HttpStatus.UNAUTHORIZED, "account-locked");
                return;
            }
            if (request.getRequestURI().startsWith("/api/admin/") && !s.admin()) {
                reject(response, HttpStatus.FORBIDDEN, "not-admin");
                return;
            }
        }
        chain.doFilter(request, response);
    }

    private static void reject(HttpServletResponse response, HttpStatus status, String code) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"status\":" + status.value() + ",\"code\":\"" + code + "\"}");
    }
}
