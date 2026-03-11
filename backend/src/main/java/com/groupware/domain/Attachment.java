package com.groupware.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "attachment")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 실제로는 파일명, 경로, 사이즈 등의 필드가 추가될 예정 (다음 STEP 대상)
    private String originalFileName;
    private String storedFilePath;
    private long fileSize;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id")
    private ApprovalDocument approvalDocument;

    // TODO: 생성자/Builder 등은 실제 파일 업로드 구현 시점에 확장
    
    // 문서와 매핑하기 위한 임시 메서드
    public void setApprovalDocument(ApprovalDocument approvalDocument) {
        this.approvalDocument = approvalDocument;
    }
}
