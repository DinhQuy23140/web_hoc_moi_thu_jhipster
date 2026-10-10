package com.lingora.repository;

import com.lingora.domain.Language;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LanguageRepository extends JpaRepository<Language, String> {
    List<Language> findAllByOrderByPosition();
}
