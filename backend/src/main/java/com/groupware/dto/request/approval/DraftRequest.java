package com.groupware.dto.request.approval;

import com.groupware.domain.ApprovalLineType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class DraftRequest {
    private String formType;
    private String title;
    private String content;
    private boolean isUrgent;
    private boolean isDraft; // true면 임시저장
    private List<Long> attachmentIds;
    private List<ApprovalLineDto> approvalLines;

    @Getter
    public static class ApprovalLineDto {
        private int step;
        private ApprovalLineType type;
        private Long approverId;
    }
}
