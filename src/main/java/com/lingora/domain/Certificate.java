package com.lingora.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "certificate")
public class Certificate {

    @Id
    public String id;

    public String languageId;
    public String code;
    public String name;
    public String fullName;
    public String organizer;
    public String color;
    public int position;
    public Integer durationMinutes;
    public String website;

    @Column(columnDefinition = "json")
    public String description;

    @Column(columnDefinition = "json")
    public String levels;

    @Column(columnDefinition = "json")
    public String sections;

    @Column(columnDefinition = "json")
    public String scoring;

    @Column(columnDefinition = "json")
    public String validity;

    @Column(columnDefinition = "json")
    public String tips;
}
