package com.groupware.domain;

public enum ApprovalStatus {
    DRAFT,      // 임시저장
    PENDING,    // 결재대기/진행중
    APPROVED,   // 결재완료
    REJECTED,   // 반려
    CANCELLED   // 기안취소
}
