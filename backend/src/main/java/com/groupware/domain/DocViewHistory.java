package com.groupware.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "doc_view_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DocViewHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private ApprovalDocument document;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime viewedAt;

    @Builder
    public DocViewHistory(Employee employee, ApprovalDocument document) {
        this.employee = employee;
        this.document = document;
    }
}
