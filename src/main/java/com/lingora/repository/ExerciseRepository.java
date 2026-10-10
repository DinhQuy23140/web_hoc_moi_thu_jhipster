package com.lingora.repository;

import com.lingora.domain.Exercise;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ExerciseRepository extends JpaRepository<Exercise, String> {
    List<Exercise> findAllByLessonBlockIdInOrderByPosition(Collection<Long> blockIds);

    List<Exercise> findAllByExamSectionIdInOrderByPosition(Collection<Long> sectionIds);

    @Query("select count(e) from Exercise e, LessonBlock b where e.lessonBlockId = b.id and b.lessonId = ?1")
    long countByLessonId(String lessonId);
}
