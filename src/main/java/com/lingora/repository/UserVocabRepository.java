package com.lingora.repository;

import com.lingora.domain.UserVocab;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserVocabRepository extends JpaRepository<UserVocab, Long> {
    Optional<UserVocab> findOneByUserIdAndVocabularyId(Long userId, String vocabularyId);

    List<UserVocab> findAllByUserIdAndVocabularyIdIn(Long userId, Collection<String> vocabularyIds);

    List<UserVocab> findAllByUserIdAndLanguageIdAndDueAtLessThanEqualOrderByDueAt(Long userId, String languageId, Instant now, Pageable pageable);

    List<UserVocab> findAllByUserIdAndLanguageIdOrderByUpdatedAtDesc(Long userId, String languageId, Pageable pageable);

    List<UserVocab> findAllByUserIdAndLanguageIdAndStatusOrderByUpdatedAtDesc(Long userId, String languageId, String status, Pageable pageable);

    List<UserVocab> findAllByUserId(Long userId);
}
