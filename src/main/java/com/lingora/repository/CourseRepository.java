package com.lingora.repository;

import com.lingora.domain.Course;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, String> {
    List<Course> findAllByPublishedTrueOrderByPosition();

    List<Course> findAllByOrderByPosition();

    long countByLanguageIdAndPublishedTrue(String languageId);
}
