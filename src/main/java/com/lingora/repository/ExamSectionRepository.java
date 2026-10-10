package com.lingora.repository;

import com.lingora.domain.ExamSection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface ExamSectionRepository extends JpaRepository<ExamSection, Long> {
    List<ExamSection> findAllByExamIdOrderByPosition(String examId);

    @Modifying
    @Query("delete from ExamSection s where s.examId = ?1")
    void deleteByExamId(String examId);
}
