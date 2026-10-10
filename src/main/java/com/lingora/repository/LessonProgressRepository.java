package com.lingora.repository;

import com.lingora.domain.LessonProgress;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {
    Optional<LessonProgress> findOneByUserIdAndLessonId(Long userId, String lessonId);

    List<LessonProgress> findAllByUserIdAndCourseIdIn(Long userId, Collection<String> courseIds);

    List<LessonProgress> findAllByUserId(Long userId);

    long countByUserIdAndCourseId(Long userId, String courseId);
}
