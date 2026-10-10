package com.lingora.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "exam")
public class Exam {

    @Id
    public String id;

    public String certificateId;
    public String languageId;
    public String level;

    @Column(columnDefinition = "json")
    public String title;

    public Integer durationMinutes;
    public Integer passPercent;
    public int questionCount;
    public int position;
}
