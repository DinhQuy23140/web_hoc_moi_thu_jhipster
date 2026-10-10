package com.lingora.repository;

import com.lingora.domain.Certificate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CertificateRepository extends JpaRepository<Certificate, String> {
    List<Certificate> findAllByOrderByPosition();
}
