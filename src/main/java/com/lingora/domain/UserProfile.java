package com.lingora.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

/** Learner profile and gamification counters, 1:1 with {@link User}. */
@Entity
@Table(name = "user_profile")
public class UserProfile {

    @Id
    public Long userId;

    public String displayName;
    public String photoUrl;
    public String uiLocale = "vi";
    public String targetLanguage = "en";
    public int dailyGoal = 15;
    public int xp;
    public int weeklyXp;
    public String weekId;
    public int streak;
    public int longestStreak;
    public int streakFreezes;
    public LocalDate lastActiveDate;
    public int lessonsCompleted;
    public int wordsLearned;
    public double totalMinutes;

    @Column(columnDefinition = "json")
    public String achievements;

    public boolean passwordSet = true;
    public boolean googleLinked;
    public Instant createdAt;
}
