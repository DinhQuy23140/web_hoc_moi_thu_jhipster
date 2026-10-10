package com.lingora.repository;

import com.lingora.domain.LessonBlockGrammar;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonBlockGrammarRepository extends JpaRepository<LessonBlockGrammar, LessonBlockGrammar.Key> {
    List<LessonBlockGrammar> findAllByLessonBlockIdInOrderByPosition(Collection<Long> blockIds);
}
