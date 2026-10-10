package com.lingora.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "course_progress")
public class CourseProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public Long userId;
    public String courseId;
    public String lastLessonId;
    public int percent;
    public Instant startedAt;
    public Instant updatedAt;
}
