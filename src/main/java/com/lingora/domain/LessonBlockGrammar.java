package com.lingora.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "lesson_block_grammar")
@IdClass(LessonBlockGrammar.Key.class)
public class LessonBlockGrammar {

    @Id
    public Long lessonBlockId;

    @Id
    public String grammarPointId;

    public int position;

    public LessonBlockGrammar() {}

    public LessonBlockGrammar(Long lessonBlockId, String grammarPointId, int position) {
        this.lessonBlockId = lessonBlockId;
        this.grammarPointId = grammarPointId;
        this.position = position;
    }

    public static class Key implements Serializable {

        public Long lessonBlockId;
        public String grammarPointId;

        @Override
        public boolean equals(Object o) {
            return o instanceof Key k && Objects.equals(lessonBlockId, k.lessonBlockId) && Objects.equals(grammarPointId, k.grammarPointId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(lessonBlockId, grammarPointId);
        }
    }
}
