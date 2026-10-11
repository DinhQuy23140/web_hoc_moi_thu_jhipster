package com.lingora.repository;

import com.lingora.domain.Vocabulary;
import java.util.Collection;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface VocabularyRepository extends JpaRepository<Vocabulary, String> {
    /** Prefix search on the lowercase word; {@code level} and {@code prefix} are optional. */
    @Query(
        "select v from Vocabulary v where v.languageId = :languageId and (:level is null or v.level = :level) " +
        "and (:prefix is null or v.wordLc like concat(:prefix, '%')) order by v.wordLc, v.id"
    )
    Page<Vocabulary> search(String languageId, String level, String prefix, Pageable pageable);

    /** Ids in id order: every entry of {@code level}, or without a level only regular words (no kana chart or single kanji). */
    @Query(
        "select v.id from Vocabulary v where v.languageId = :languageId and (:level is null or v.level = :level) " +
        "and (:level is not null or (v.level <> 'KANA' and coalesce(v.pos, '') <> 'kanji')) order by v.id"
    )
    List<String> findPoolIds(String languageId, String level);

    List<Vocabulary> findAllByLanguageIdAndWordLcIn(String languageId, Collection<String> words);

    List<Vocabulary> findAllByLanguageIdAndReadingIn(String languageId, Collection<String> readings);
}
