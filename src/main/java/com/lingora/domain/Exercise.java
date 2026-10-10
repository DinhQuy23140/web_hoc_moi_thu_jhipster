package com.lingora.domain;

import jakarta.persistence.*;

/** A question; belongs to a lesson block or to an exam section. */
@Entity
@Table(name = "exercise")
public class Exercise {

    @Id
    public String id;

    public Long lessonBlockId;
    public Long examSectionId;
    public int position;
    public String type;

    @Column(columnDefinition = "json")
    public String instruction;

    public String question;
    public String hint;

    @Column(columnDefinition = "json")
    public String prompt;

    @Column(columnDefinition = "json")
    public String options;

    @Column(columnDefinition = "json")
    public String labels;

    @Column(columnDefinition = "json")
    public String answers;

    public Boolean correct;

    /** Matching pairs as [[left, right], ...]. */
    @Column(columnDefinition = "json")
    public String pairs;

    public String audioText;
    public String audioUrl;

    @Column(columnDefinition = "json")
    public String explanation;
}
