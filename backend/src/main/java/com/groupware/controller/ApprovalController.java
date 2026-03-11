package com.groupware.controller;

import com.groupware.dto.request.approval.ApprovalProcessRequest;
import com.groupware.dto.request.approval.ApprovalRejectRequest;
import com.groupware.dto.request.approval.DraftRequest;
import com.groupware.dto.response.approval.ApprovalDetailDto;
import com.groupware.dto.response.approval.ApprovalDocumentDto;
import com.groupware.dto.response.approval.ApprovalDetailDto;
import com.groupware.dto.response.approval.ApprovalDocumentDto;
import com.groupware.dto.response.approval.ApprovalSummaryDto;
import com.groupware.global.jwt.JwtTokenProvider;
import com.groupware.service.ApprovalService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/approval")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;
    private final JwtTokenProvider jwtTokenProvider;

    private Long getUserIdFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            return jwtTokenProvider.getUserIdFromToken(token);
        }
        return null;
    }

    /**
     * 상신/임시저장
     */
    @PostMapping("/draft")
    public ResponseEntity<Map<String, Object>> draftDocument(HttpServletRequest request, @RequestBody DraftRequest draftRequest) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(approvalService.draftDocument(userId, draftRequest));
    }

    /**
     * 내가 결재해야 할 문서 목록 페이징 (PENDING)
     */
    @GetMapping("/pending")
    public ResponseEntity<Page<ApprovalDocumentDto>> getPendingDocuments(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
            
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(approvalService.getPendingDocuments(userId, PageRequest.of(page, size)));
    }

    /**
     * 결재 예정 문서 목록 페이징 (PLANNED)
     */
    @GetMapping("/planned")
    public ResponseEntity<Page<ApprovalDocumentDto>> getPlannedDocuments(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(approvalService.getPlannedDocuments(userId, PageRequest.of(page, size)));
    }

    /**
     * 참조/열람 대기 문서 목록 페이징 (REFERENCE)
     */
    @GetMapping("/reference")
    public ResponseEntity<Page<ApprovalDocumentDto>> getUnreadRefDocuments(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(approvalService.getUnreadRefDocuments(userId, PageRequest.of(page, size)));
    }

    /**
     * 참조/열람 대기 문서 개수 조회 (헤더/사이드바 뱃지용)
     */
    @GetMapping("/reference/count")
    public ResponseEntity<Long> getUnreadRefCount(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(approvalService.getUnreadRefCount(userId));
    }

    /**
     * 결재 문서 상세 조회
     */
    /**
     * 결재 문서 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApprovalDetailDto> getDocumentDetail(@PathVariable Long id) {
        return ResponseEntity.ok(approvalService.getDocumentDetail(id));
    }

    /**
     * 개인 문서함 조회
     */
    @GetMapping("/personal/{folder}")
    public ResponseEntity<Page<ApprovalDocumentDto>> getPersonalDocuments(
            HttpServletRequest request,
            @PathVariable String folder,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(approvalService.getPersonalDocuments(userId, folder, PageRequest.of(page, size)));
    }

    /**
     * 부서 문서함 조회
     */
    @GetMapping("/dept/{deptId}/{folder}")
    public ResponseEntity<Page<ApprovalDocumentDto>> getDepartmentDocuments(
            HttpServletRequest request,
            @PathVariable Long deptId,
            @PathVariable String folder,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(approvalService.getDepartmentDocuments(userId, deptId, folder, PageRequest.of(page, size)));
    }

    /**
     * 결재함 요약 정보 (카운트)
     */
    @GetMapping("/summary")
    public ResponseEntity<ApprovalSummaryDto> getApprovalSummary(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(approvalService.getApprovalSummary(userId));
    }

    /**
     * 결재 승인
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<Void> approveDocument(
            HttpServletRequest request,
            @PathVariable Long id,
            @RequestBody(required = false) ApprovalProcessRequest processRequest) {
        Long userId = getUserIdFromRequest(request);
        String comment = (processRequest != null) ? processRequest.getComment() : null;
        approvalService.approveDocument(userId, id, comment);
        return ResponseEntity.ok().build();
    }

    /**
     * 결재 반려
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<Void> rejectDocument(
            HttpServletRequest request,
            @PathVariable Long id,
            @RequestBody ApprovalRejectRequest rejectRequest) {
        Long userId = getUserIdFromRequest(request);
        approvalService.rejectDocument(userId, id, rejectRequest.getReason());
        return ResponseEntity.ok().build();
    }

    /**
     * 기안 취소
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelDocument(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long userId = getUserIdFromRequest(request);
        approvalService.cancelDocument(userId, id);
        return ResponseEntity.ok().build();
    }

    /**
     * 반려 문서 재기안
     */
    @PostMapping("/{id}/resubmit")
    public ResponseEntity<Map<String, Object>> resubmitDocument(
            HttpServletRequest request,
            @PathVariable Long id,
            @RequestBody DraftRequest draftRequest) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(approvalService.resubmitDocument(userId, id, draftRequest));
    }

    /**
     * 참조 문서 열람 처리
     */
    @PutMapping("/{id}/view")
    public ResponseEntity<Void> viewDocument(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long userId = getUserIdFromRequest(request);
        approvalService.viewDocument(userId, id);
        return ResponseEntity.ok().build();
    }
}
