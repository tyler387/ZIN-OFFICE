package com.groupware.dto.response.approval;

import com.groupware.domain.ApprovalDocument;
import com.groupware.domain.ApprovalLine;
import com.groupware.domain.ApprovalLineStatus;
import com.groupware.domain.ApprovalLineType;
import com.groupware.domain.ApprovalStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class ApprovalDetailDto {
    private Long id;
    private String docNo;
    private String formType;
    private String title;
    private String content;
    private ApprovalStatus status;
    private boolean isUrgent;
    private SubmitterDetailDto submitter;
    private LocalDateTime submittedAt;
    private LocalDateTime completedAt;
    private List<ApprovalLineDetailDto> approvalLines;

    @Getter
    @Builder
    public static class SubmitterDetailDto {
        private String name;
        private String departmentName;
        private String position;
    }

    @Getter
    @Builder
    public static class ApprovalLineDetailDto {
        private int step;
        private ApprovalLineType type;
        private ApproverDto approver;
        private ApprovalLineStatus status;
        private String comment;
        private LocalDateTime processedAt;
    }

    @Getter
    @Builder
    public static class ApproverDto {
        private String name;
        private String position;
    }

    public static ApprovalDetailDto from(ApprovalDocument doc) {
        return ApprovalDetailDto.builder()
                .id(doc.getId())
                .docNo(doc.getDocNo())
                .formType(doc.getFormType())
                .title(doc.getTitle())
                .content(doc.getContent())
                .status(doc.getStatus())
                .isUrgent(doc.isUrgent())
                .submitter(SubmitterDetailDto.builder()
                        .name(doc.getSubmitter().getName())
                        .departmentName(doc.getDepartment().getName())
                        .position(doc.getSubmitter().getPosition())
                        .build())
                .submittedAt(doc.getSubmittedAt())
                .completedAt(doc.getCompletedAt())
                .approvalLines(doc.getApprovalLines().stream()
                        .map(ApprovalDetailDto::fromLine)
                        .collect(Collectors.toList()))
                .build();
    }

    private static ApprovalLineDetailDto fromLine(ApprovalLine line) {
        return ApprovalLineDetailDto.builder()
                .step(line.getStep())
                .type(line.getType())
                .approver(ApproverDto.builder()
                        .name(line.getApprover().getName())
                        .position(line.getApprover().getPosition())
                        .build())
                .status(line.getStatus())
                .comment(line.getComment())
                .processedAt(line.getProcessedAt())
                .build();
    }
}
