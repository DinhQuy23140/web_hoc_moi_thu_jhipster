package com.lingora.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "course")
public class Course {

    @Id
    public String id;

    public String languageId;
    public String certificateId;
    public String level;
    public String cefr;
    public String emoji;
    public String color;
    public String coverUrl;
    public int difficulty = 1;

    @Column(columnDefinition = "json")
    public String title;

    @Column(columnDefinition = "json")
    public String subtitle;

    @Column(columnDefinition = "json")
    public String description;

    @Column(columnDefinition = "json")
    public String outcomes;

    @Column(columnDefinition = "json")
    public String tags;

    public int unitCount;
    public int lessonCount;
    public int vocabCount;
    public int estimatedHours;
    public int position;
    public boolean published = true;
}
