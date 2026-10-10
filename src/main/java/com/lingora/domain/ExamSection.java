package com.lingora.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "exam_section")
public class ExamSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public String examId;
    public int position;
    public String kind;

    @Column(columnDefinition = "json")
    public String title;

    public String passage;
}
