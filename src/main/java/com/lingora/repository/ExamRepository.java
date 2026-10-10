package com.lingora.repository;

import com.lingora.domain.Exam;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamRepository extends JpaRepository<Exam, String> {
    List<Exam> findAllByCertificateIdOrderByPosition(String certificateId);

    List<Exam> findAllByOrderByPosition();
}
