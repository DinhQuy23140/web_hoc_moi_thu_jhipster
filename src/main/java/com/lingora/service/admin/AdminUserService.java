package com.lingora.service.admin;

import com.lingora.domain.AccountLock;
import com.lingora.domain.Authority;
import com.lingora.domain.User;
import com.lingora.domain.UserProfile;
import com.lingora.repository.AccountLockRepository;
import com.lingora.repository.AuthorityRepository;
import com.lingora.repository.UserProfileRepository;
import com.lingora.repository.UserRepository;
import com.lingora.security.AccountStatusCache;
import com.lingora.security.AuthoritiesConstants;
import com.lingora.service.MailService;
import com.lingora.service.UserService;
import com.lingora.service.content.ContentValidationException;
import com.lingora.service.learning.LearningService;
import com.lingora.service.learning.NotFoundException;
import com.lingora.service.learning.ProfileService;
import com.lingora.service.learning.SessionService;
import com.lingora.service.util.Json;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

/** Account management for admins: search, details, lock/unlock, admin role, emails, deletion. */
@Service
@Transactional
public class AdminUserService {

    private final UserRepository users;
    private final UserProfileRepository profiles;
    private final AuthorityRepository authorities;
    private final AccountLockRepository locks;
    private final LearningService learning;
    private final SessionService sessions;
    private final UserService userService;
    private final MailService mail;
    private final AccountStatusCache statuses;
    private final CacheManager cacheManager;

    @PersistenceContext
    private EntityManager em;

    public AdminUserService(
        UserRepository users,
        UserProfileRepository profiles,
        AuthorityRepository authorities,
        AccountLockRepository locks,
        LearningService learning,
        SessionService sessions,
        UserService userService,
        MailService mail,
        AccountStatusCache statuses,
        CacheManager cacheManager
    ) {
        this.users = users;
        this.profiles = profiles;
        this.authorities = authorities;
        this.locks = locks;
        this.learning = learning;
        this.sessions = sessions;
        this.userService = userService;
        this.mail = mail;
        this.statuses = statuses;
        this.cacheManager = cacheManager;
    }

    @Transactional(readOnly = true)
    public ObjectNode page(String query, int page, int size) {
        PageRequest pr = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by(Sort.Direction.DESC, "createdDate"));
        String q = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        Page<User> result = q.isEmpty() ? users.findAll(pr) : searchPage(q, pr);
        Map<Long, UserProfile> byId = new HashMap<>();
        profiles.findAllById(result.map(User::getId).toList()).forEach(p -> byId.put(p.userId, p));
        ObjectNode o = Json.obj();
        ArrayNode items = o.putArray("items");
        result.forEach(u -> items.add(row(u, byId.get(u.getId()))));
        o.put("page", result.getNumber());
        o.put("hasMore", result.hasNext());
        o.put("total", result.getTotalElements());
        return o;
    }

    private Page<User> searchPage(String q, PageRequest pr) {
        String like = "%" + q.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
        String where =
            " from User u where lower(u.email) like :q escape '\\' or lower(u.login) like :q escape '\\' or lower(u.firstName) like :q escape '\\'";
        List<User> list = em
            .createQuery("select u" + where + " order by u.createdDate desc", User.class)
            .setParameter("q", like)
            .setFirstResult((int) pr.getOffset())
            .setMaxResults(pr.getPageSize())
            .getResultList();
        long total = em.createQuery("select count(u)" + where, Long.class).setParameter("q", like).getSingleResult();
        return new PageImpl<>(list, pr, total);
    }

    @Transactional(readOnly = true)
    public ObjectNode detail(Long userId) {
        User u = load(userId);
        ObjectNode o = row(u, profiles.findById(userId).orElse(null));
        o.set("courses", learning.allCourseProgress(userId));
        o.set("attempts", learning.recentAttempts(userId, 15));
        o.set("sessions", sessions.forAdmin(userId));
        o.put("vocabCount", count("select count(*) from user_vocab where user_id = ?1", userId));
        o.put("mistakeCount", count("select count(*) from mistake where user_id = ?1", userId));
        o.put("activeDays30", count("select count(*) from day_stat where user_id = ?1 and day >= current_date - interval 29 day", userId));
        return o;
    }

    /** Suspends / restores an account; a locked account's tokens are rejected within seconds. */
    public ObjectNode setLocked(Long actorId, String actorLogin, Long userId, boolean locked, String reason) {
        if (Objects.equals(actorId, userId) && locked) throw new ContentValidationException("Không thể tự khóa tài khoản của chính mình");
        User u = load(userId);
        if (locked) {
            AccountLock lock = locks.findById(userId).orElseGet(AccountLock::new);
            lock.userId = userId;
            lock.reason = reason == null || reason.isBlank() ? null : reason.trim().substring(0, Math.min(500, reason.trim().length()));
            lock.lockedBy = actorLogin;
            lock.lockedAt = Instant.now();
            locks.save(lock);
        } else if (locks.existsById(userId)) {
            locks.deleteById(userId);
        }
        locks.flush();
        statuses.invalidate(u.getId());
        return detail(userId);
    }

    /** Confirms a pending registration on the learner's behalf (e.g. activation email never arrived). */
    public ObjectNode activate(Long userId) {
        User u = load(userId);
        if (!u.isActivated()) {
            u.setActivated(true);
            u.setActivationKey(null);
            changed(u);
        }
        return detail(userId);
    }

    public ObjectNode setAdmin(Long actorId, Long userId, boolean admin) {
        if (Objects.equals(actorId, userId) && !admin) throw new ContentValidationException("Không thể tự gỡ quyền quản trị của chính mình");
        User u = load(userId);
        Authority role = authorities.findById(AuthoritiesConstants.ADMIN).orElseThrow();
        if (admin) u.getAuthorities().add(role);
        else u.getAuthorities().removeIf(a -> AuthoritiesConstants.ADMIN.equals(a.getName()));
        authorities.findById(AuthoritiesConstants.USER).ifPresent(u.getAuthorities()::add);
        changed(u);
        return detail(userId);
    }

    /** Sends the standard reset-password email (only works for activated accounts). */
    public void sendPasswordReset(Long userId) {
        User u = load(userId);
        if (!u.isActivated()) throw new ContentValidationException("Tài khoản chưa kích hoạt");
        userService.requestPasswordReset(u.getEmail()).ifPresent(mail::sendPasswordResetMail);
    }

    public void resendActivation(Long userId) {
        User u = load(userId);
        if (u.isActivated()) throw new ContentValidationException("Tài khoản đã được kích hoạt");
        userService.prepareActivationResend(u.getEmail()).ifPresent(mail::sendActivationEmail);
    }

    /** Deletes the account; learner data goes with it (ON DELETE CASCADE). */
    public void delete(Long actorId, Long userId) {
        if (Objects.equals(actorId, userId)) throw new ContentValidationException("Không thể tự xóa tài khoản của chính mình");
        User u = load(userId);
        userService.deleteUser(u.getLogin());
        statuses.invalidate(userId);
    }

    private void changed(User u) {
        users.saveAndFlush(u);
        evict(UserRepository.USERS_BY_LOGIN_CACHE, u.getLogin());
        if (u.getEmail() != null) evict(UserRepository.USERS_BY_EMAIL_CACHE, u.getEmail());
        statuses.invalidate(u.getId());
    }

    private void evict(String cache, String key) {
        var c = cacheManager.getCache(cache);
        if (c != null && key != null) c.evictIfPresent(key);
    }

    private User load(Long userId) {
        return users.findOneWithAuthoritiesById(userId).orElseThrow(() -> new NotFoundException("Không tìm thấy tài khoản"));
    }

    private long count(String sql, Long userId) {
        return ((Number) em.createNativeQuery(sql).setParameter(1, userId).getSingleResult()).longValue();
    }

    private ObjectNode row(User u, UserProfile p) {
        ObjectNode o = p != null ? ProfileService.toJson(p, u.getEmail()) : Json.obj();
        if (p == null) {
            o.put("uid", String.valueOf(u.getId()));
            o.put("email", u.getEmail() == null ? "" : u.getEmail());
            o.put("displayName", u.getFirstName() == null ? u.getLogin() : u.getFirstName());
        }
        o.put("userId", u.getId());
        o.put("login", u.getLogin());
        o.put("activated", u.isActivated());
        AccountLock lock = locks.findById(u.getId()).orElse(null);
        o.put("locked", lock != null);
        if (lock != null) {
            Json.put(o, "lockReason", lock.reason);
            o.put("lockedAt", lock.lockedAt.toEpochMilli());
        }
        o.put("admin", u.getAuthorities().stream().anyMatch(a -> AuthoritiesConstants.ADMIN.equals(a.getName())));
        o.put("pendingActivation", !u.isActivated() && u.getActivationKey() != null);
        o.put("registeredAt", u.getCreatedDate() == null ? 0 : u.getCreatedDate().toEpochMilli());
        o.put("googleLinked", p != null && p.googleLinked);
        return o;
    }
}
