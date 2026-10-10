package com.lingora.domain;

import jakarta.persistence.*;

/** A language that can be learned (English, Japanese...). JSON columns hold raw JSON text. */
@Entity
@Table(name = "language")
public class Language {

    @Id
    public String id;

    public String code;

    @Column(columnDefinition = "json")
    public String name;

    public String nativeName;
    public String flag;
    public String speechLang;

    @Column(columnDefinition = "json")
    public String levels;

    public int position;
    public boolean active = true;
}
