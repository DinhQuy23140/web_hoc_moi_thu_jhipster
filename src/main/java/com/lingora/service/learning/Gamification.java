package com.lingora.service.learning;

import com.lingora.domain.UserProfile;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.IsoFields;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.function.Predicate;

/** Server-side port of {@code app/src/app/core/gamification.ts}; both must stay in sync. */
public final class Gamification {

    public static final int XP_LESSON_COMPLETE = 20;
    public static final int XP_PERFECT_LESSON = 10;
    public static final int XP_EXERCISE_CORRECT = 2;
    public static final int XP_DAILY_GOAL = 30;
    public static final int XP_STREAK_7 = 100;
    /** Per-request XP ceiling. */
    public static final int MAX_XP_PER_WRITE = 500;
    public static final int MAX_STREAK_FREEZES = 2;

    private Gamification() {}

    public record StreakUpdate(int streak, boolean changed, int freezes, int usedFreezes) {}

    /**
     * Learning again today keeps the streak, learning the day after the last active day increases it.
     * Missed days are covered by streak freezes when owned; one freeze is earned every 7-day milestone.
     */
    public static StreakUpdate nextStreak(LocalDate lastActive, int streak, LocalDate today, int freezes) {
        if (today.equals(lastActive)) return new StreakUpdate(Math.max(streak, 1), false, freezes, 0);
        int next = 1;
        int used = 0;
        if (lastActive != null) {
            long missed = ChronoUnit.DAYS.between(lastActive, today) - 1;
            if (missed == 0) next = streak + 1;
            else if (missed > 0 && missed <= freezes && streak > 0) {
                next = streak + 1;
                used = (int) missed;
            }
        }
        int left = freezes - used;
        if (next % 7 == 0) left = Math.min(MAX_STREAK_FREEZES, left + 1);
        return new StreakUpdate(next, true, left, used);
    }

    /** ISO-8601 week id, e.g. {@code 2026-W41}. */
    public static String weekId(LocalDate d) {
        return String.format("%d-W%02d", d.get(IsoFields.WEEK_BASED_YEAR), d.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR));
    }

    private record Achievement(String id, Predicate<UserProfile> test) {}

    private static final List<Achievement> ACHIEVEMENTS = List.of(
        new Achievement("first-lesson", p -> p.lessonsCompleted >= 1),
        new Achievement("lessons-10", p -> p.lessonsCompleted >= 10),
        new Achievement("lessons-50", p -> p.lessonsCompleted >= 50),
        new Achievement("streak-3", p -> p.longestStreak >= 3),
        new Achievement("streak-7", p -> p.longestStreak >= 7),
        new Achievement("streak-30", p -> p.longestStreak >= 30),
        new Achievement("words-50", p -> p.wordsLearned >= 50),
        new Achievement("words-300", p -> p.wordsLearned >= 300),
        new Achievement("xp-1000", p -> p.xp >= 1000),
        new Achievement("xp-5000", p -> p.xp >= 5000),
        new Achievement("time-600", p -> p.totalMinutes >= 600)
    );

    /** Ids of achievements unlocked by the (already updated) profile that are not owned yet. */
    public static List<String> newAchievements(UserProfile p, Collection<String> owned) {
        List<String> out = new ArrayList<>();
        for (Achievement a : ACHIEVEMENTS) {
            if (!owned.contains(a.id()) && a.test().test(p)) out.add(a.id());
        }
        return out;
    }
}
