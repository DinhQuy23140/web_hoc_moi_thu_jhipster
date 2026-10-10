package com.lingora.repository;

import com.lingora.domain.LearningSession;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface LearningSessionRepository extends JpaRepository<LearningSession, Long> {
    Optional<LearningSession> findOneByUserIdAndKindAndRefId(Long userId, String kind, String refId);

    List<LearningSession> findAllByUserIdAndUpdatedAtAfterOrderByUpdatedAtDesc(Long userId, Instant after, Pageable pageable);

    List<LearningSession> findAllByUserIdAndKindAndUpdatedAtAfterOrderByUpdatedAtDesc(Long userId, String kind, Instant after, Pageable pageable);

    List<LearningSession> findAllByUserIdOrderByUpdatedAtDesc(Long userId, Pageable pageable);

    long countByUserId(Long userId);

    long countByUpdatedAtAfter(Instant after);

    @Modifying
    @Query("delete from LearningSession s where s.userId = ?1 and s.kind = ?2 and s.refId = ?3")
    int deleteOne(Long userId, String kind, String refId);

    @Modifying
    @Query("delete from LearningSession s where s.updatedAt < ?1")
    int deleteOlderThan(Instant before);
}
