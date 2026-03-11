package com.groupware.service;

import com.groupware.domain.ApprovalDocument;
import com.groupware.domain.ApprovalStatus;
import com.groupware.domain.DocViewHistory;
import com.groupware.domain.Employee;
import com.groupware.dto.request.doc.DocCreateRequest;
import com.groupware.dto.response.doc.DocDetailDto;
import com.groupware.dto.response.doc.DocListDto;
import com.groupware.global.exception.CustomException;
import com.groupware.global.exception.ErrorCode;
import com.groupware.global.util.KoreaTime;
import com.groupware.repository.ApprovalDocumentRepository;
import com.groupware.repository.DocViewHistoryRepository;
import com.groupware.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocService {

    private final ApprovalDocumentRepository documentRepository;
    private final DocViewHistoryRepository docViewHistoryRepository;
    private final EmployeeRepository employeeRepository;
    private final DocNoService docNoService;

    public Page<DocListDto> getAllDocs(String formType, Pageable pageable) {
        String filterType = (formType == null || formType.isEmpty()) ? "all" : formType;
        return documentRepository.findAllApprovedDocs(filterType, pageable)
                .map(DocListDto::from);
    }

    public Page<DocListDto> getManageDocs(Long userId, String category, Pageable pageable) {
        Page<ApprovalDocument> docs;

        switch (category) {
            case "recent":
                docs = docViewHistoryRepository.findRecentViewedDocsByEmployee(userId, pageable);
                break;
            case "updated":
                docs = documentRepository.findUpdatedDocs(KoreaTime.nowDateTime().minusDays(7), pageable);
                break;
            case "pending-approval":
                docs = documentRepository.findPendingDocumentsByApprover(userId, pageable);
                break;
            case "pending-register":
                docs = documentRepository.findTempPersonalDocs(userId, pageable);
                break;
            default:
                throw new CustomException(ErrorCode.INVALID_INPUT, "유효하지 않은 관리 카테고리입니다.");
        }

        return docs.map(DocListDto::from);
    }

    @Transactional
    public Map<String, Object> createDoc(Long userId, DocCreateRequest req) {
        Employee submitter = employeeRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다."));

        String docNo = docNoService.nextDocNo("DOC");

        ApprovalDocument document = ApprovalDocument.builder()
                .docNo(docNo)
                .formType(req.getFormType() != null ? req.getFormType() : "일반문서") // 미지정시 '일반문서'
                .title(req.getTitle())
                .content(req.getContent())
                .status(ApprovalStatus.DRAFT) // 단순 문서 등록은 결재 전(DRAFT) 상태로 시작
                .isUrgent(false)
                .submitter(submitter)
                .department(submitter.getDepartment())
                .currentStep(1) // 결재 없으므로 1
                .build();

        ApprovalDocument saved = documentRepository.save(document);

        Map<String, Object> response = new HashMap<>();
        response.put("id", saved.getId());
        response.put("docNo", saved.getDocNo());
        return response;
    }

    @Transactional
    public DocDetailDto getDocDetail(Long userId, Long docId) {
        Employee user = employeeRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다."));

        ApprovalDocument doc = documentRepository.findById(docId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "문서를 찾을 수 없습니다."));

        // 조회수 증가
        doc.incrementViewCount();

        // 열람 이력 기록
        DocViewHistory history = DocViewHistory.builder()
                .employee(user)
                .document(doc)
                .build();
        docViewHistoryRepository.save(history);

        // TODO: 첨부파일 리스트 연동 (현재는 빈 리스트 반환)
        return DocDetailDto.from(doc, Collections.emptyList());
    }
}
