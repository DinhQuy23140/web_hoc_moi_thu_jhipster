package com.lingora.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "vocabulary")
public class Vocabulary {

    @Id
    public String id;

    public String languageId;
    public String word;
    public String wordLc;
    public String reading;
    public String romaji;
    public String ipa;
    public String pos;

    @Column(columnDefinition = "json")
    public String meaning;

    public String example;
    public String exampleReading;

    @Column(columnDefinition = "json")
    public String exampleMeaning;

    public String level;
    public String topic;

    @Column(columnDefinition = "json")
    public String tags;

    public String audioUrl;
    public String imageUrl;
}
