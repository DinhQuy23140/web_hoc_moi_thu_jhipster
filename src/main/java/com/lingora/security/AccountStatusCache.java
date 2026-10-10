package com.lingora.security;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Current account status (deleted / locked / admin) per user, re-read from the database at most
 * every {@link #TTL_MS}. JWTs stay valid until they expire, so this is what makes locking
 * an account or revoking the admin role effective almost immediately.
 */
@Component
public class AccountStatusCache {

    public record Status(boolean exists, boolean locked, boolean admin, long checkedAt) {}

    static final long TTL_MS = 30_000;
    private static final int MAX_ENTRIES = 50_000;

    @PersistenceContext
    private EntityManager em;

    private final ConcurrentHashMap<Long, Status> cache = new ConcurrentHashMap<>();

    @Transactional(readOnly = true)
    public Status get(Long userId) {
        long now = System.currentTimeMillis();
        Status s = cache.get(userId);
        if (s != null && now - s.checkedAt() < TTL_MS) return s;
        s = load(userId, now);
        if (cache.size() > MAX_ENTRIES) cache.clear();
        cache.put(userId, s);
        return s;
    }

    public void invalidate(Long userId) {
        cache.remove(userId);
    }

    @SuppressWarnings("unchecked")
    private Status load(Long userId, long now) {
        List<Object> found = em.createNativeQuery("select id from jhi_user where id = ?1").setParameter(1, userId).getResultList();
        if (found.isEmpty()) return new Status(false, true, false, now);
        boolean locked = count("select count(*) from account_lock where user_id = ?1", userId, null) > 0;
        boolean admin = count("select count(*) from jhi_user_authority where user_id = ?1 and authority_name = ?2", userId, AuthoritiesConstants.ADMIN) > 0;
        return new Status(true, locked, admin, now);
    }

    private long count(String sql, Long userId, String authority) {
        var q = em.createNativeQuery(sql).setParameter(1, userId);
        if (authority != null) q.setParameter(2, authority);
        return ((Number) q.getSingleResult()).longValue();
    }
}
