package com.lingora.domain;

import jakarta.persistence.*;

/**
 * One content block of a lesson (VOCABULARY, GRAMMAR, READING, LISTENING, SPEAKING, VIDEO, EXERCISE).
 * Vocabulary items, grammar points and exercises are stored in their own tables; the remaining
 * type-specific fields (passage, script, prompts, video URL...) are kept in {@code data}.
 */
@Entity
@Table(name = "lesson_block")
public class LessonBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public String lessonId;
    public int position;
    public String type;

    @Column(columnDefinition = "json")
    public String title;

    @Column(columnDefinition = "json")
    public String data;
}
