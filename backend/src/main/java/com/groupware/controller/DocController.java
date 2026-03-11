package com.groupware.controller;

import com.groupware.dto.request.doc.DocCreateRequest;
import com.groupware.dto.response.doc.DocDetailDto;
import com.groupware.dto.response.doc.DocListDto;
import com.groupware.global.jwt.JwtTokenProvider;
import com.groupware.service.DocService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/docs")
@RequiredArgsConstructor
public class DocController {

    private final DocService docService;
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
     * 전사 문서함 전체 조회
     */
    @GetMapping("/all")
    public ResponseEntity<Page<DocListDto>> getAllDocs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "all") String formType) {
        return ResponseEntity.ok(docService.getAllDocs(formType, PageRequest.of(page, size)));
    }

    /**
     * 문서 관리 (recent, updated, pending-approval, pending-register)
     */
    @GetMapping("/manage/{category}")
    public ResponseEntity<Page<DocListDto>> getManageDocs(
            HttpServletRequest request,
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(docService.getManageDocs(userId, category, PageRequest.of(page, size)));
    }

    /**
     * 단순 문서 등록 (결재 없이)
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createDoc(
            HttpServletRequest request,
            @RequestBody DocCreateRequest req) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(docService.createDoc(userId, req));
    }

    /**
     * 문서 읽기 및 상세 정보 조회 (조회수 증가 및 이력 추가)
     */
    @GetMapping("/{id}")
    public ResponseEntity<DocDetailDto> getDocDetail(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(docService.getDocDetail(userId, id));
    }
}
