package com.lingora.domain;

import jakarta.persistence.*;
import java.time.Instant;

/** History entry of a finished lesson, exam, game, review session or challenge. */
@Entity
@Table(name = "attempt")
public class Attempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public Long userId;
    public String kind;
    public String refId;
    public String title;
    public int score;
    public int correctCount;
    public int total;
    public int durationSec;
    public Instant createdAt;
}
