package com.lingora.repository;

import com.lingora.domain.LessonBlock;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface LessonBlockRepository extends JpaRepository<LessonBlock, Long> {
    List<LessonBlock> findAllByLessonIdOrderByPosition(String lessonId);

    @Modifying
    @Query("delete from LessonBlock b where b.lessonId = ?1")
    void deleteByLessonId(String lessonId);
}
