package com.groupware.repository;

import com.groupware.domain.ApprovalDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ApprovalDocumentRepository extends JpaRepository<ApprovalDocument, Long> {

    // 결재자(approverId)가 처리해야 할 대기 중인 문서 페이징 조회
    @Query("SELECT DISTINCT d FROM ApprovalDocument d " +
            "JOIN d.approvalLines l " +
            "WHERE d.status = 'PENDING' " +
            "AND l.approver.id = :approverId " +
            "AND l.step = d.currentStep " +
            "AND l.status = 'WAITING' " +
            "ORDER BY d.isUrgent DESC, d.submittedAt ASC")
    Page<ApprovalDocument> findPendingDocumentsByApprover(@Param("approverId") Long approverId, Pageable pageable);

    // 내가 처리해야 할 대기 중인 문서 수 (PENDING)
    @Query("SELECT COUNT(DISTINCT d) FROM ApprovalDocument d " +
            "JOIN d.approvalLines l " +
            "WHERE d.status = 'PENDING' " +
            "AND l.approver.id = :approverId " +
            "AND l.step = d.currentStep " +
            "AND l.status = 'WAITING'")
    long countPendingDocumentsByApprover(@Param("approverId") Long approverId);

    // 내가 기안한 진행중인 문서 수 (DRAFT)
    @Query("SELECT COUNT(d) FROM ApprovalDocument d " +
            "WHERE d.submitter.id = :submitterId AND d.status = 'PENDING'")
    long countDraftDocumentsBySubmitter(@Param("submitterId") Long submitterId);

    // 내가 참조자로 있고, 아직 열람하지 않은 문서 수 (refWait)
    @Query("SELECT COUNT(DISTINCT d) FROM ApprovalDocument d " +
            "JOIN d.approvalLines l " +
            "WHERE l.approver.id = :approverId " +
            "AND l.type = 'CC' AND l.isViewed = false " +
            "AND d.status IN ('PENDING', 'APPROVED')") // 보통 진행중이거나 완료된 문서를 참조
    long countUnreadRefDocumentsByApprover(@Param("approverId") Long approverId);

    // 내가 참조자로 있고, 아직 열람하지 않은 문서 목록 페이징 (Reference/Unread)
    @Query("SELECT DISTINCT d FROM ApprovalDocument d " +
            "JOIN d.approvalLines l " +
            "WHERE l.approver.id = :approverId " +
            "AND l.type = 'CC' AND l.isViewed = false " +
            "AND d.status IN ('PENDING', 'APPROVED') " +
            "ORDER BY d.createdAt DESC")
    Page<ApprovalDocument> findUnreadRefDocumentsByApprover(@Param("approverId") Long approverId, Pageable pageable);

    // 내 결재 순서가 아직 오지 않은 결재 진행 중 문서 (Planned)
    @Query("SELECT DISTINCT d FROM ApprovalDocument d " +
            "JOIN d.approvalLines l " +
            "WHERE d.status = 'PENDING' " +
            "AND l.approver.id = :approverId " +
            "AND l.type != 'CC' " +
            "AND l.step > d.currentStep " +
            "AND l.status = 'WAITING' " +
            "ORDER BY d.submittedAt ASC")
    Page<ApprovalDocument> findPlannedDocumentsByApprover(@Param("approverId") Long approverId, Pageable pageable);

    // 1. default: 내가 기안한 문서 전체 (DRAFT 제외)
    @Query("SELECT d FROM ApprovalDocument d WHERE d.submitter.id = :submitterId AND d.status != 'DRAFT' ORDER BY d.createdAt DESC")
    Page<ApprovalDocument> findDefaultPersonalDocs(@Param("submitterId") Long submitterId, Pageable pageable);

    // 2. draft: 내가 기안 + status IN (PENDING, APPROVED, REJECTED)
    @Query("SELECT d FROM ApprovalDocument d WHERE d.submitter.id = :submitterId AND d.status IN ('PENDING', 'APPROVED', 'REJECTED') ORDER BY d.createdAt DESC")
    Page<ApprovalDocument> findDraftPersonalDocs(@Param("submitterId") Long submitterId, Pageable pageable);

    // 3. temp: 내가 기안 + status = DRAFT
    @Query("SELECT d FROM ApprovalDocument d WHERE d.submitter.id = :submitterId AND d.status = 'DRAFT' ORDER BY d.createdAt DESC")
    Page<ApprovalDocument> findTempPersonalDocs(@Param("submitterId") Long submitterId, Pageable pageable);

    // 4. done / recv: 내가 결재자(approver)이고 APPROVED 처리한 문서
    @Query("SELECT DISTINCT d FROM ApprovalDocument d JOIN d.approvalLines l WHERE l.approver.id = :approverId AND l.status = 'APPROVED' ORDER BY d.createdAt DESC")
    Page<ApprovalDocument> findDonePersonalDocs(@Param("approverId") Long approverId, Pageable pageable);

    // 5. ref: 내가 CC인 문서
    @Query("SELECT DISTINCT d FROM ApprovalDocument d JOIN d.approvalLines l WHERE l.approver.id = :approverId AND l.type = 'CC' ORDER BY d.createdAt DESC")
    Page<ApprovalDocument> findRefPersonalDocs(@Param("approverId") Long approverId, Pageable pageable);

    // 6. send: 내가 기안 + status = APPROVED
    @Query("SELECT d FROM ApprovalDocument d WHERE d.submitter.id = :submitterId AND d.status = 'APPROVED' ORDER BY d.createdAt DESC")
    Page<ApprovalDocument> findSendPersonalDocs(@Param("submitterId") Long submitterId, Pageable pageable);

    // 7. official: formType='협조전' + 내가 관련된 문서 (기안자이거나 결재선에 포함)
    @Query("SELECT DISTINCT d FROM ApprovalDocument d LEFT JOIN d.approvalLines l WHERE d.formType = '협조전' AND (d.submitter.id = :userId OR l.approver.id = :userId) ORDER BY d.createdAt DESC")
    Page<ApprovalDocument> findOfficialPersonalDocs(@Param("userId") Long userId, Pageable pageable);

    // --- 부서 문서함 쿼리 ---

    // dept - default: 해당 부서에서 기안한 모든 결재 진행/완료/반려 문서
    @Query("SELECT d FROM ApprovalDocument d WHERE d.department.id = :deptId AND d.status != 'DRAFT' AND d.status != 'CANCELLED' ORDER BY d.createdAt DESC")
    Page<ApprovalDocument> findDefaultDeptDocs(@Param("deptId") Long deptId, Pageable pageable);

    // dept - done: 해당 부서 소속 직원이 결재(APPROVED)한 문서
    @Query("SELECT DISTINCT d FROM ApprovalDocument d JOIN d.approvalLines l WHERE l.approver.department.id = :deptId AND l.status = 'APPROVED' ORDER BY d.createdAt DESC")
    Page<ApprovalDocument> findDoneDeptDocs(@Param("deptId") Long deptId, Pageable pageable);

    // dept - ref: 해당 부서 소속 직원이 참조(CC)로 포함된 문서
    @Query("SELECT DISTINCT d FROM ApprovalDocument d JOIN d.approvalLines l WHERE l.approver.department.id = :deptId AND l.type = 'CC' ORDER BY d.createdAt DESC")
    Page<ApprovalDocument> findRefDeptDocs(@Param("deptId") Long deptId, Pageable pageable);

    // dept - send: 해당 부서에서 기안하여 최종 승인(APPROVED)된 문서
    @Query("SELECT d FROM ApprovalDocument d WHERE d.department.id = :deptId AND d.status = 'APPROVED' ORDER BY d.createdAt DESC")
    Page<ApprovalDocument> findSendDeptDocs(@Param("deptId") Long deptId, Pageable pageable);

    // --- 전사 문서함 및 문서 관리 쿼리 ---

    // 전체 문서함 (APPROVED)
    @Query("SELECT d FROM ApprovalDocument d WHERE d.status = 'APPROVED' " +
           "AND (:formType = 'all' OR d.formType = :formType) " +
           "ORDER BY d.completedAt DESC")
    Page<ApprovalDocument> findAllApprovedDocs(@Param("formType") String formType, Pageable pageable);

    // 최근 N일 내 업데이트된 문서 (updated)
    @Query("SELECT d FROM ApprovalDocument d WHERE d.updatedAt >= :thresholdDate ORDER BY d.updatedAt DESC")
    Page<ApprovalDocument> findUpdatedDocs(@Param("thresholdDate") java.time.LocalDateTime thresholdDate, Pageable pageable);
}
