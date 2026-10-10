package com.lingora.domain;

import jakarta.persistence.*;
import java.time.Instant;

/** A question the learner got wrong, kept until answered correctly twice in a row. */
@Entity
@Table(name = "mistake")
public class Mistake {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public Long userId;
    public String mistakeKey;
    public String languageId;
    public String source;
    public String refId;
    public String title;

    @Column(columnDefinition = "json")
    public String exercise;

    public int wrong;
    public int streak;
    public Instant lastWrong;
}
