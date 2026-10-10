package com.lingora.repository;

import com.lingora.domain.CourseProgress;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseProgressRepository extends JpaRepository<CourseProgress, Long> {
    Optional<CourseProgress> findOneByUserIdAndCourseId(Long userId, String courseId);

    List<CourseProgress> findAllByUserIdOrderByUpdatedAtDesc(Long userId, Pageable pageable);
}
