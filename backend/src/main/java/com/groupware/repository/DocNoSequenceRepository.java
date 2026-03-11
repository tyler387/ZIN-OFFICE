package com.groupware.repository;

import com.groupware.domain.DocNoSequence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DocNoSequenceRepository extends JpaRepository<DocNoSequence, Long> {
    Optional<DocNoSequence> findByPrefixAndDocYear(String prefix, int docYear);
}
