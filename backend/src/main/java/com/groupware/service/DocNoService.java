package com.groupware.service;

import com.groupware.domain.DocNoSequence;
import com.groupware.global.util.KoreaTime;
import com.groupware.repository.DocNoSequenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DocNoService {

    private final DocNoSequenceRepository docNoSequenceRepository;

    /**
     * 지정된 prefix(예: "AP", "DOC")에 대해 다음 채번 번호를 발급한다.
     * 트랜잭션 전파 수준을 REQUIRES_NEW로 설정하여, 부모 트랜잭션이 롤백되어도 채번은 롤백되지 않게 할 수 있으나
     * 본 과제에서는 단순 synchronized 처리를 통해 동시성을 제어한다.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public synchronized String nextDocNo(String prefix) {
        int currentYear = KoreaTime.nowDate().getYear();

        DocNoSequence sequence = docNoSequenceRepository.findByPrefixAndDocYear(prefix, currentYear)
                .orElseGet(() -> DocNoSequence.builder()
                        .prefix(prefix)
                        .docYear(currentYear)
                        .lastSeq(0)
                        .build());

        sequence.incrementSeq();
        docNoSequenceRepository.saveAndFlush(sequence);

        return String.format("%s-%d-%05d", prefix, currentYear, sequence.getLastSeq());
    }
}
