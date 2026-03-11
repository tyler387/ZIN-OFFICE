package com.groupware.service;

import com.groupware.domain.*;
import com.groupware.dto.request.approval.ApprovalProcessRequest;
import com.groupware.dto.request.approval.ApprovalRejectRequest;
import com.groupware.dto.request.approval.DraftRequest;
import com.groupware.dto.response.approval.ApprovalDetailDto;
import com.groupware.dto.response.approval.ApprovalDocumentDto;
import com.groupware.global.exception.CustomException;
import com.groupware.global.exception.ErrorCode;
import com.groupware.global.util.KoreaTime;
import com.groupware.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprovalService {

    private final ApprovalDocumentRepository documentRepository;
    private final EmployeeRepository employeeRepository;
    private final AttachmentRepository attachmentRepository;
    private final DocNoService docNoService;

    @Transactional
    public Map<String, Object> draftDocument(Long userId, DraftRequest req) {
        Employee submitter = employeeRepository.findById(userId) // userId 와 employeeId 동일하다고 가정 or User 정보로딩 (DataInit시 1:1 매핑되어있고, Controller에서 userId 추출 시 주의해야함. 여기서는 편의상 userId를 EmployeeId로 간주하거나 User의 getEmployee()를 써야함)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND, "직원 정보를 찾을 수 없습니다."));

        ApprovalStatus initialStatus = req.isDraft() ? ApprovalStatus.DRAFT : ApprovalStatus.PENDING;
        String docNo = null;

        if (!req.isDraft()) {
            if (req.getApprovalLines() == null || req.getApprovalLines().isEmpty()) {
                throw new CustomException(ErrorCode.INVALID_INPUT, "상신 시 결재선 지정은 필수입니다.");
            }
            docNo = docNoService.nextDocNo("AP");
        }

        ApprovalDocument document = ApprovalDocument.builder()
                .docNo(docNo)
                .formType(req.getFormType())
                .title(req.getTitle())
                .content(req.getContent())
                .status(initialStatus)
                .isUrgent(req.isUrgent())
                .submitter(submitter)
                .department(submitter.getDepartment())
                .currentStep(1)
                .submittedAt(req.isDraft() ? null : KoreaTime.nowDateTime())
                .build();

        // 첨부파일 매핑
        if (req.getAttachmentIds() != null && !req.getAttachmentIds().isEmpty()) {
            List<Attachment> attachments = attachmentRepository.findAllById(req.getAttachmentIds());
            for (Attachment att : attachments) {
                att.setApprovalDocument(document);
            }
        }

        // 결재선 매핑
        if (req.getApprovalLines() != null) {
            for (DraftRequest.ApprovalLineDto lineDto : req.getApprovalLines()) {
                Employee approver = employeeRepository.findById(lineDto.getApproverId())
                        .orElseThrow(() -> new CustomException(ErrorCode.INVALID_INPUT, "유효하지 않은 결재자입니다."));

                ApprovalLine line = ApprovalLine.builder()
                        .document(document)
                        .step(lineDto.getStep())
                        .type(lineDto.getType())
                        .approver(approver)
                        .status(ApprovalLineStatus.WAITING)
                        .build();

                document.getApprovalLines().add(line);
            }
        }

        ApprovalDocument saved = documentRepository.save(document);

        Map<String, Object> response = new HashMap<>();
        response.put("id", saved.getId());
        response.put("docNo", saved.getDocNo());
        return response;
    }

    public Page<ApprovalDocumentDto> getPendingDocuments(Long userId, Pageable pageable) {
        // userId 기반 Employee 조회 가정 (실제로는 userId -> employee id 매핑 필요)
        // DataInitializer 특성상 User ID == Employee ID 매핑되어 있음
        return documentRepository.findPendingDocumentsByApprover(userId, pageable)
                .map(ApprovalDocumentDto::from);
    }

    public Page<ApprovalDocumentDto> getPlannedDocuments(Long userId, Pageable pageable) {
        return documentRepository.findPlannedDocumentsByApprover(userId, pageable)
                .map(ApprovalDocumentDto::from);
    }

    public Page<ApprovalDocumentDto> getUnreadRefDocuments(Long userId, Pageable pageable) {
        return documentRepository.findUnreadRefDocumentsByApprover(userId, pageable)
                .map(ApprovalDocumentDto::from);
    }

    public long getUnreadRefCount(Long userId) {
        return documentRepository.countUnreadRefDocumentsByApprover(userId);
    }

    public ApprovalDetailDto getDocumentDetail(Long id) {
        ApprovalDocument document = documentRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "결재 문서를 찾을 수 없습니다."));

        return ApprovalDetailDto.from(document);
    }

    @Transactional
    public void approveDocument(Long userId, Long docId, String comment) {
        ApprovalDocument doc = documentRepository.findById(docId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "문서를 찾을 수 없습니다."));

        if (doc.getStatus() != ApprovalStatus.PENDING) {
            throw new CustomException(ErrorCode.INVALID_INPUT, "결재 진행 중인 문서만 승인할 수 있습니다.");
        }

        // 현재 단계의 결재선 확인
        ApprovalLine currentLine = doc.getApprovalLines().stream()
                .filter(l -> l.getStep() == doc.getCurrentStep())
                .filter(l -> l.getApprover().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new CustomException(ErrorCode.ACCESS_DENIED, "현재 결재 순서가 아니거나 권한이 없습니다."));

        currentLine.processLine(ApprovalLineStatus.APPROVED, comment);

        // 다음 결재자가 있는지 확인
        boolean hasNext = doc.getApprovalLines().stream()
                .anyMatch(l -> l.getStep() > doc.getCurrentStep());

        if (hasNext) {
            doc.moveToNextStep();
        } else {
            doc.complete(ApprovalStatus.APPROVED);
            // TODO STEP 6-2: formType='휴가신청서' 최종 승인 시 leaveService.confirm(doc.getId()) 호출
        }

        // TODO STEP 11-1: notificationService.send(기안자, APPROVAL, "결재 승인됨", ...) 호출
    }

    @Transactional
    public void rejectDocument(Long userId, Long docId, String reason) {
        ApprovalDocument doc = documentRepository.findById(docId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "문서를 찾을 수 없습니다."));

        if (doc.getStatus() != ApprovalStatus.PENDING) {
            throw new CustomException(ErrorCode.INVALID_INPUT, "결재 진행 중인 문서만 반려할 수 있습니다.");
        }

        ApprovalLine currentLine = doc.getApprovalLines().stream()
                .filter(l -> l.getStep() == doc.getCurrentStep())
                .filter(l -> l.getApprover().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new CustomException(ErrorCode.ACCESS_DENIED, "현재 결재 순서가 아니거나 권한이 없습니다."));

        currentLine.processLine(ApprovalLineStatus.REJECTED, reason);
        doc.complete(ApprovalStatus.REJECTED);

        // TODO STEP 11-1: notificationService.send(기안자, APPROVAL, "결재 반려됨", ...) 호출
    }

    @Transactional
    public void cancelDocument(Long userId, Long docId) {
        ApprovalDocument doc = documentRepository.findById(docId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "문서를 찾을 수 없습니다."));

        if (!doc.getSubmitter().getId().equals(userId)) {
            throw new CustomException(ErrorCode.ACCESS_DENIED, "자신이 상신한 문서만 취소할 수 있습니다.");
        }

        if (doc.getStatus() != ApprovalStatus.PENDING) {
            throw new CustomException(ErrorCode.INVALID_INPUT, "결재 진행 중인 문서만 취소할 수 있습니다.");
        }

        doc.complete(ApprovalStatus.CANCELLED);
    }

    @Transactional
    public Map<String, Object> resubmitDocument(Long userId, Long docId, DraftRequest req) {
        ApprovalDocument originalDoc = documentRepository.findById(docId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "원본 문서를 찾을 수 없습니다."));

        if (!originalDoc.getSubmitter().getId().equals(userId)) {
            throw new CustomException(ErrorCode.ACCESS_DENIED, "자신이 기안한 문서만 재기안할 수 있습니다.");
        }

        if (originalDoc.getStatus() != ApprovalStatus.REJECTED) {
            throw new CustomException(ErrorCode.INVALID_INPUT, "반려된 문서만 재기안할 수 있습니다.");
        }

        // 새로운 문서로 상신 (formType과 content를 복사, req의 새로운 결재선 사용)
        DraftRequest newReq = new DraftRequest(
                originalDoc.getFormType(),
                req.getTitle() != null ? req.getTitle() : originalDoc.getTitle(),
                req.getContent() != null ? req.getContent() : originalDoc.getContent(),
                req.isUrgent(),
                false, // 재기안은 바로 상신으로 처리
                req.getAttachmentIds(),
                req.getApprovalLines()
        );

        return draftDocument(userId, newReq);
    }

    @Transactional
    public void viewDocument(Long userId, Long docId) {
        ApprovalDocument doc = documentRepository.findById(docId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "문서를 찾을 수 없습니다."));

        // 자신이 CC로 지정된 ApprovalLine 열람 처리
        doc.getApprovalLines().stream()
                .filter(l -> l.getType() == com.groupware.domain.ApprovalLineType.CC)
                .filter(l -> l.getApprover().getId().equals(userId))
                .forEach(com.groupware.domain.ApprovalLine::markAsViewed);
    }

    public Page<ApprovalDocumentDto> getPersonalDocuments(Long userId, String folder, Pageable pageable) {
        Page<ApprovalDocument> docs;
        switch (folder) {
            case "draft":
                docs = documentRepository.findDraftPersonalDocs(userId, pageable);
                break;
            case "temp":
                docs = documentRepository.findTempPersonalDocs(userId, pageable);
                break;
            case "done":
            case "recv":
                docs = documentRepository.findDonePersonalDocs(userId, pageable);
                break;
            case "ref":
                docs = documentRepository.findRefPersonalDocs(userId, pageable);
                break;
            case "send":
                docs = documentRepository.findSendPersonalDocs(userId, pageable);
                break;
            case "official":
                docs = documentRepository.findOfficialPersonalDocs(userId, pageable);
                break;
            case "default":
            default:
                docs = documentRepository.findDefaultPersonalDocs(userId, pageable);
                break;
        }
        return docs.map(ApprovalDocumentDto::from);
    }

    public Page<ApprovalDocumentDto> getDepartmentDocuments(Long userId, Long deptId, String folder, Pageable pageable) {
        Employee user = employeeRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND, "직원 정보를 찾을 수 없습니다."));

        // 권한 체크: 요청자가 해당 deptId 소속이거나 ADMIN 권한이어야 함
        if (!user.getDepartment().getId().equals(deptId) && user.getUser().getRole() != com.groupware.domain.Role.ADMIN) {
            throw new CustomException(ErrorCode.ACCESS_DENIED, "해당 부서 문서함에 접근할 권한이 없습니다.");
        }

        Page<ApprovalDocument> docs;
        switch (folder) {
            case "done":
                docs = documentRepository.findDoneDeptDocs(deptId, pageable);
                break;
            case "ref":
                docs = documentRepository.findRefDeptDocs(deptId, pageable);
                break;
            case "send":
                docs = documentRepository.findSendDeptDocs(deptId, pageable);
                break;
            case "default":
            default:
                docs = documentRepository.findDefaultDeptDocs(deptId, pageable);
                break;
        }
        return docs.map(ApprovalDocumentDto::from);
    }

    public com.groupware.dto.response.approval.ApprovalSummaryDto getApprovalSummary(Long userId) {
        long pendingCount = documentRepository.countPendingDocumentsByApprover(userId);
        long draftCount = documentRepository.countDraftDocumentsBySubmitter(userId);
        long refWaitCount = documentRepository.countUnreadRefDocumentsByApprover(userId);

        return com.groupware.dto.response.approval.ApprovalSummaryDto.builder()
                .pendingCount(pendingCount)
                .draftCount(draftCount)
                .refWaitCount(refWaitCount)
                .build();
    }
}
