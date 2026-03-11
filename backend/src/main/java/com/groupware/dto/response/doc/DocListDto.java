package com.groupware.dto.response.doc;

import com.groupware.domain.ApprovalDocument;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class DocListDto {
    private Long id;
    private String formType;
    private String title;
    private boolean hasAttachment;
    private SubmitterDto drafter;
    private DeptDto dept;
    private String docNo;
    private LocalDateTime completedAt;
    private int viewCount;

    @Getter
    @Builder
    public static class SubmitterDto {
        private String name;
    }

    @Getter
    @Builder
    public static class DeptDto {
        private String name;
    }

    public static DocListDto from(ApprovalDocument doc) {
        return DocListDto.builder()
                .id(doc.getId())
                .formType(doc.getFormType())
                .title(doc.getTitle())
                .hasAttachment(doc.getApprovalLines() != null && !doc.getApprovalLines().isEmpty()) // 이건 샘플, 실제 파일은 Attachment 엔티티
                .drafter(SubmitterDto.builder().name(doc.getSubmitter().getName()).build())
                .dept(DeptDto.builder().name(doc.getDepartment().getName()).build())
                .docNo(doc.getDocNo())
                .completedAt(doc.getCompletedAt())
                .viewCount(doc.getViewCount())
                .build();
    }
}
