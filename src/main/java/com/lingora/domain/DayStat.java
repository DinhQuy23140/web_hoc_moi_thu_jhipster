package com.lingora.domain;

import jakarta.persistence.*;
import java.time.LocalDate;

/** Daily study totals of a learner (heatmap, statistics, daily goal). */
@Entity
@Table(name = "day_stat")
public class DayStat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public Long userId;
    public LocalDate day;
    public double minutes;
    public int xp;
    public int lessons;
    public int exercises;
}
