package com.lingora.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "course_unit")
public class CourseUnit {

    @Id
    public String id;

    public String courseId;
    public int position;

    @Column(columnDefinition = "json")
    public String title;

    @Column(columnDefinition = "json")
    public String description;
}
