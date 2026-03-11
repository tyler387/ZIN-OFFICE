package com.groupware.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "approval_line")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ApprovalLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private ApprovalDocument document;

    @Column(nullable = false)
    private int step; // 1차, 2차 결재 순서

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalLineType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id", nullable = false)
    private Employee approver;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalLineStatus status = ApprovalLineStatus.WAITING;

    @Column(length = 500)
    private String comment;

    @Column(nullable = false)
    private boolean isViewed = false; // CC 열람 여부

    // 해당 결재자가 처리한 시간
    private LocalDateTime processedAt;

    @Builder
    public ApprovalLine(ApprovalDocument document, int step, ApprovalLineType type, Employee approver, ApprovalLineStatus status, String comment, boolean isViewed, LocalDateTime processedAt) {
        this.document = document;
        this.step = step;
        this.type = type;
        this.approver = approver;
        this.status = status != null ? status : ApprovalLineStatus.WAITING;
        this.comment = comment;
        this.isViewed = isViewed;
        this.processedAt = processedAt;
    }

    public void processLine(ApprovalLineStatus status, String comment) {
        this.status = status;
        this.comment = comment;
        this.processedAt = LocalDateTime.now();
    }
    
    public void markAsViewed() {
        this.isViewed = true;
    }
}
