package com.groupware.dto.response.approval;

import com.groupware.domain.ApprovalDocument;
import com.groupware.domain.ApprovalStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ApprovalDocumentDto {
    private Long id;
    private String docNo;
    private String formType;
    private String title;
    private SubmitterDto submitter;
    private LocalDateTime submittedAt;
    private boolean isUrgent;
    private ApprovalStatus status;

    @Getter
    @Builder
    public static class SubmitterDto {
        private String name;
        private String departmentName;
    }

    public static ApprovalDocumentDto from(ApprovalDocument doc) {
        return ApprovalDocumentDto.builder()
                .id(doc.getId())
                .docNo(doc.getDocNo())
                .formType(doc.getFormType())
                .title(doc.getTitle())
                .submitter(SubmitterDto.builder()
                        .name(doc.getSubmitter().getName())
                        .departmentName(doc.getDepartment().getName())
                        .build())
                .submittedAt(doc.getSubmittedAt())
                .isUrgent(doc.isUrgent())
                .status(doc.getStatus())
                .build();
    }
}
