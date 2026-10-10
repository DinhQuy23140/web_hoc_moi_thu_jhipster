package com.lingora.repository;

import com.lingora.domain.Attempt;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttemptRepository extends JpaRepository<Attempt, Long> {
    List<Attempt> findAllByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
