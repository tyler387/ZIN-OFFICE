package com.groupware.repository;

import com.groupware.domain.ApprovalLine;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApprovalLineRepository extends JpaRepository<ApprovalLine, Long> {
}
