package com.lingora.repository;

import com.lingora.domain.UserProfile;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    List<UserProfile> findAllByWeekIdAndWeeklyXpGreaterThanOrderByWeeklyXpDesc(String weekId, int minXp, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from UserProfile p where p.userId = ?1")
    Optional<UserProfile> lockById(Long userId);
}
