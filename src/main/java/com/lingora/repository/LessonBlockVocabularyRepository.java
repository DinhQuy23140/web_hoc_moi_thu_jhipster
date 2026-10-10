package com.lingora.repository;

import com.lingora.domain.LessonBlockVocabulary;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface LessonBlockVocabularyRepository extends JpaRepository<LessonBlockVocabulary, LessonBlockVocabulary.Key> {
    List<LessonBlockVocabulary> findAllByLessonBlockIdInOrderByPosition(Collection<Long> blockIds);

    @Query(
        "select j.vocabularyId from LessonBlockVocabulary j, LessonBlock b where j.lessonBlockId = b.id and b.lessonId = ?1 " +
        "order by b.position, j.position"
    )
    List<String> findVocabularyIdsByLessonId(String lessonId);
}
