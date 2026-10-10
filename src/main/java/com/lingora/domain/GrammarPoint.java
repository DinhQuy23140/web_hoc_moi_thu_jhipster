package com.lingora.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "grammar_point")
public class GrammarPoint {

    @Id
    public String id;

    public String languageId;
    public String title;
    public String structure;

    @Column(columnDefinition = "json")
    public String explanation;

    @Column(columnDefinition = "json")
    public String examples;

    @Column(columnDefinition = "json")
    public String note;
}
