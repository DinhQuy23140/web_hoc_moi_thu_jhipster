package com.lingora.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "lesson")
public class Lesson {

    @Id
    public String id;

    public String courseId;
    public String unitId;
    public String languageId;
    public int position;

    @Column(columnDefinition = "json")
    public String title;

    public int minutes;
    public int xp;

    /** Content types present in the lesson, e.g. ["VOCABULARY","EXERCISE"] (for outline badges). */
    @Column(columnDefinition = "json")
    public String kinds;
}
