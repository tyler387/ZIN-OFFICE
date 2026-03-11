package com.groupware.dto.response.doc;

import com.groupware.domain.ApprovalDocument;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class DocDetailDto {
    private Long id;
    private String formType;
    private String title;
    private String content;
    private String docNo;
    private SubmitterDto submitter;
    private DeptDto department;
    private LocalDateTime completedAt;
    private List<Long> attachments; // ID list instead of full attachment to simplify
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

    public static DocDetailDto from(ApprovalDocument doc, List<Long> attachmentIds) {
        return DocDetailDto.builder()
                .id(doc.getId())
                .formType(doc.getFormType())
                .title(doc.getTitle())
                .content(doc.getContent())
                .docNo(doc.getDocNo())
                .submitter(SubmitterDto.builder().name(doc.getSubmitter().getName()).build())
                .department(DeptDto.builder().name(doc.getDepartment().getName()).build())
                .completedAt(doc.getCompletedAt())
                .viewCount(doc.getViewCount())
                .attachments(attachmentIds)
                .build();
    }
}
