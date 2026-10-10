package com.lingora.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "lesson_block_vocabulary")
@IdClass(LessonBlockVocabulary.Key.class)
public class LessonBlockVocabulary {

    @Id
    public Long lessonBlockId;

    @Id
    public String vocabularyId;

    public int position;

    public LessonBlockVocabulary() {}

    public LessonBlockVocabulary(Long lessonBlockId, String vocabularyId, int position) {
        this.lessonBlockId = lessonBlockId;
        this.vocabularyId = vocabularyId;
        this.position = position;
    }

    public static class Key implements Serializable {

        public Long lessonBlockId;
        public String vocabularyId;

        @Override
        public boolean equals(Object o) {
            return o instanceof Key k && Objects.equals(lessonBlockId, k.lessonBlockId) && Objects.equals(vocabularyId, k.vocabularyId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(lessonBlockId, vocabularyId);
        }
    }
}
