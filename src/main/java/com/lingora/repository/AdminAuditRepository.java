package com.lingora.repository;

import com.lingora.domain.AdminAudit;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AdminAuditRepository extends JpaRepository<AdminAudit, Long> {
    Page<AdminAudit> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Modifying
    @Query("delete from AdminAudit a where a.createdAt < :before")
    int deleteOlderThan(@Param("before") Instant before);
}
