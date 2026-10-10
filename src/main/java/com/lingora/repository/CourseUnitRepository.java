package com.lingora.repository;

import com.lingora.domain.CourseUnit;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseUnitRepository extends JpaRepository<CourseUnit, String> {
    List<CourseUnit> findAllByCourseIdOrderByPosition(String courseId);
}
