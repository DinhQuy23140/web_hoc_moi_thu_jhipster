package com.lingora.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "lesson_progress")
public class LessonProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public Long userId;
    public String courseId;
    public String lessonId;
    public int bestScore;
    public int attempts;
    public Instant completedAt;
}
