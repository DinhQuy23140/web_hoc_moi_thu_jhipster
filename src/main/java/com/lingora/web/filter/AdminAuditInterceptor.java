package com.lingora.web.filter;

import com.lingora.security.SecurityUtils;
import com.lingora.service.admin.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/** Records state-changing admin calls (who, what, result) in the audit log. */
@Component
public class AdminAuditInterceptor implements HandlerInterceptor {

    private final AuditService audit;

    public AdminAuditInterceptor(AuditService audit) {
        this.audit = audit;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        String method = request.getMethod();
        if ("GET".equals(method) || "HEAD".equals(method) || "OPTIONS".equals(method)) return;
        int status = ex != null && response.getStatus() < 400 ? 500 : response.getStatus();
        audit.record(
            SecurityUtils.getCurrentUserId().orElse(null),
            SecurityUtils.getCurrentUserLogin().orElse(null),
            method,
            request.getRequestURI(),
            status,
            request.getRemoteAddr()
        );
    }
}
