package com.lingora.domain;

import jakarta.persistence.*;
import java.time.Instant;

/** A word in a learner's deck with its spaced-repetition (FSRS) state. */
@Entity
@Table(name = "user_vocab")
public class UserVocab {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public Long userId;
    public String vocabularyId;
    public String languageId;
    public String status;
    public double ease = 2.5;
    public double intervalDays;
    public int reps;
    public int lapses;
    public Instant dueAt;
    public Double stability;
    public Double difficulty;
    public Instant lastReview;
    public int correctCount;
    public int wrongCount;
    public Instant updatedAt;
}
