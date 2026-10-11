package com.lingora.security;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Current account status (deleted / locked / admin / password stamp) per user, re-read from the database at most
 * every {@link #TTL_MS}. JWTs stay valid until they expire, so this is what makes locking
 * an account, revoking the admin role or changing the password effective almost immediately.
 */
@Component
public class AccountStatusCache {

    public record Status(boolean exists, boolean locked, boolean admin, String passwordStamp, long checkedAt) {}

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
        return refresh(userId);
    }

    /** Re-reads the status now, e.g. when issuing a token so that its password stamp is current. */
    @Transactional(readOnly = true)
    public Status refresh(Long userId) {
        Status s = load(userId, System.currentTimeMillis());
        if (cache.size() > MAX_ENTRIES) cache.clear();
        cache.put(userId, s);
        return s;
    }

    public void invalidate(Long userId) {
        cache.remove(userId);
    }

    /** Short fingerprint of the password hash: changes with every password change and reveals nothing usable. */
    static String passwordStamp(String passwordHash) {
        if (passwordHash == null) return "";
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(passwordHash.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest).substring(0, 16);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    @SuppressWarnings("unchecked")
    private Status load(Long userId, long now) {
        List<Object> found = em.createNativeQuery("select password_hash from jhi_user where id = ?1").setParameter(1, userId).getResultList();
        if (found.isEmpty()) return new Status(false, true, false, "", now);
        boolean locked = count("select count(*) from account_lock where user_id = ?1", userId, null) > 0;
        boolean admin = count("select count(*) from jhi_user_authority where user_id = ?1 and authority_name = ?2", userId, AuthoritiesConstants.ADMIN) > 0;
        return new Status(true, locked, admin, passwordStamp((String) found.get(0)), now);
    }

    private long count(String sql, Long userId, String authority) {
        var q = em.createNativeQuery(sql).setParameter(1, userId);
        if (authority != null) q.setParameter(2, authority);
        return ((Number) q.getSingleResult()).longValue();
    }
}
