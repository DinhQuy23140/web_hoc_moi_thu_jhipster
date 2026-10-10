package com.lingora.domain;

import jakarta.persistence.*;
import java.time.Instant;

/** Site-wide banner shown to learners while active and inside its time window. */
@Entity
@Table(name = "announcement")
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    /** Localized text: {@code {"vi": "...", "en": "...", "ja": "..."}}. */
    @Column(columnDefinition = "json")
    public String message;

    public String level = "info";
    public String linkUrl;
    public boolean active = true;
    public Instant startsAt;
    public Instant endsAt;
    public Instant createdAt;
    public Instant updatedAt;
}
