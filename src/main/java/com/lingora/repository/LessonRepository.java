package com.lingora.repository;

import com.lingora.domain.Lesson;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonRepository extends JpaRepository<Lesson, String> {
    List<Lesson> findAllByCourseIdOrderByPosition(String courseId);

    long countByCourseId(String courseId);
}
