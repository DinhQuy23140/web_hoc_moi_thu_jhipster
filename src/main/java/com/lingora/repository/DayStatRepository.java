package com.lingora.repository;

import com.lingora.domain.DayStat;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface DayStatRepository extends JpaRepository<DayStat, Long> {
    Optional<DayStat> findOneByUserIdAndDay(Long userId, LocalDate day);

    /** XP of the day read from the database (not a possibly stale managed entity). */
    @Query("select d.xp from DayStat d where d.userId = :userId and d.day = :day")
    Optional<Integer> findXp(Long userId, LocalDate day);

    List<DayStat> findAllByUserIdAndDayBetween(Long userId, LocalDate from, LocalDate to);

    List<DayStat> findAllByUserId(Long userId);

    /** Atomic increment; safe when the same learner sends concurrent requests. */
    @Modifying
    @Query(
        value = "insert into day_stat (user_id, day, minutes, xp, lessons, exercises) values (:userId, :day, :minutes, :xp, :lessons, :exercises) " +
        "on duplicate key update minutes = minutes + :minutes, xp = xp + :xp, lessons = lessons + :lessons, exercises = exercises + :exercises",
        nativeQuery = true
    )
    void increment(Long userId, LocalDate day, double minutes, int xp, int lessons, int exercises);
}
