package com.lingora.domain;

import jakarta.persistence.*;
import java.time.Instant;

/** An unfinished lesson or mock exam: where the learner stopped and the client-side state to restore. */
@Entity
@Table(name = "learning_session")
public class LearningSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public Long userId;
    public String kind;
    public String refId;
    public String courseId;
    public String languageId;
    public String title;
    public int position;
    public int total;

    @Column(columnDefinition = "json")
    public String state;

    public Instant createdAt;
    public Instant updatedAt;
}
