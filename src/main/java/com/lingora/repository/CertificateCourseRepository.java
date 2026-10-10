package com.lingora.repository;

import com.lingora.domain.CertificateCourse;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface CertificateCourseRepository extends JpaRepository<CertificateCourse, CertificateCourse.Key> {
    List<CertificateCourse> findAllByCertificateId(String certificateId);

    @Modifying
    @Query("delete from CertificateCourse c where c.certificateId = ?1")
    void deleteByCertificateId(String certificateId);
}
