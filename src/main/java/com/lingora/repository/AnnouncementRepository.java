package com.lingora.repository;

import com.lingora.domain.Announcement;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findAllByOrderByCreatedAtDesc();

    List<Announcement> findAllByActiveTrueOrderByCreatedAtDesc();
}
