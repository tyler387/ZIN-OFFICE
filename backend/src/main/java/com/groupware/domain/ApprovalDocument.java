package com.groupware.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "approval_document")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ApprovalDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 문서번호 형식: AP-2026-00001 (상신 시 부여, 임시저장은 null)
    @Column(unique = true)
    private String docNo;

    // 양식명: '연차신청서', '지출결의서' 등 (동적으로 사용)
    @Column(nullable = false)
    private String formType;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus status;

    @Column(nullable = false)
    private boolean isUrgent = false;

    // 기안자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitter_id", nullable = false)
    private Employee submitter;

    // 기안 부서
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    // 현재 결재 단계 (1부터 시작)
    @Column(nullable = false)
    private int currentStep = 1;

    // 상신일시
    private LocalDateTime submittedAt;

    // 완료일시 (승인/반려 최종 완료 시)
    private LocalDateTime completedAt;

    // 조회수
    @Column(nullable = false)
    private int viewCount = 0;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ApprovalLine> approvalLines = new ArrayList<>();

    @Builder
    public ApprovalDocument(String docNo, String formType, String title, String content, ApprovalStatus status, boolean isUrgent, Employee submitter, Department department, int currentStep, LocalDateTime submittedAt, LocalDateTime completedAt) {
        this.docNo = docNo;
        this.formType = formType;
        this.title = title;
        this.content = content;
        this.status = status;
        this.isUrgent = isUrgent;
        this.submitter = submitter;
        this.department = department;
        this.currentStep = currentStep;
        this.submittedAt = submittedAt;
        this.completedAt = completedAt;
    }

    public void updateDocNo(String docNo) {
        this.docNo = docNo;
    }

    public void updateStatus(ApprovalStatus status) {
        this.status = status;
    }

    public void submit(String docNo) {
        this.docNo = docNo;
        this.status = ApprovalStatus.PENDING;
        this.submittedAt = LocalDateTime.now();
    }

    public void complete(ApprovalStatus status) {
        this.status = status;
        this.completedAt = LocalDateTime.now();
    }

    public void moveToNextStep() {
        this.currentStep++;
    }

    public void incrementViewCount() {
        this.viewCount++;
    }
}
