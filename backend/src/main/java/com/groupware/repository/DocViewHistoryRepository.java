package com.groupware.repository;

import com.groupware.domain.DocViewHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DocViewHistoryRepository extends JpaRepository<DocViewHistory, Long> {

    boolean existsByEmployeeIdAndDocumentId(Long employeeId, Long documentId);

    // 내가 최근 열람한 문서 조회용 (가장 최근 열람일시 기준)
    @Query("SELECT h.document FROM DocViewHistory h WHERE h.employee.id = :employeeId GROUP BY h.document ORDER BY MAX(h.viewedAt) DESC")
    Page<com.groupware.domain.ApprovalDocument> findRecentViewedDocsByEmployee(@Param("employeeId") Long employeeId, Pageable pageable);
}
