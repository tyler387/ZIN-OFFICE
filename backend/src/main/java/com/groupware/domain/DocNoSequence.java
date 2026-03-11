package com.groupware.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "doc_no_sequence", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"prefix", "doc_year"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DocNoSequence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 10)
    private String prefix; // "AP", "DOC", 등

    @Column(name = "doc_year", nullable = false)
    private int docYear;      // 2026 등

    @Column(nullable = false)
    private int lastSeq;   // 마지막 채번 번호

    @Builder
    public DocNoSequence(String prefix, int docYear, int lastSeq) {
        this.prefix = prefix;
        this.docYear = docYear;
        this.lastSeq = lastSeq;
    }

    public void incrementSeq() {
        this.lastSeq++;
    }
}
