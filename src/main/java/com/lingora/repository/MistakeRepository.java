package com.lingora.repository;

import com.lingora.domain.Mistake;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MistakeRepository extends JpaRepository<Mistake, Long> {
    Optional<Mistake> findOneByUserIdAndMistakeKey(Long userId, String mistakeKey);

    List<Mistake> findAllByUserIdAndMistakeKeyIn(Long userId, Collection<String> keys);

    List<Mistake> findAllByUserIdAndLanguageIdOrderByLastWrongDesc(Long userId, String languageId, Pageable pageable);

    long countByUserIdAndLanguageId(Long userId, String languageId);

    List<Mistake> findAllByUserId(Long userId);
}
