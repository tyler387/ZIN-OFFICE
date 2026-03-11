package com.groupware.global.config;

import com.groupware.domain.Role;
import com.groupware.domain.User;
import com.groupware.domain.Department;
import com.groupware.domain.Employee;
import com.groupware.domain.ApprovalDocument;
import com.groupware.domain.ApprovalStatus;
import com.groupware.repository.UserRepository;
import com.groupware.repository.DepartmentRepository;
import com.groupware.repository.EmployeeRepository;
import com.groupware.repository.ApprovalDocumentRepository;
import com.groupware.domain.ApprovalLine;
import com.groupware.domain.ApprovalLineType;
import com.groupware.domain.ApprovalLineStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Profile("!prod") // 운영(prod) 환경에서는 실행하지 않음
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final ApprovalDocumentRepository approvalDocumentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        log.info("=== 테스트용 더미 데이터 초기화를 시작합니다 ===");

        // 부서 생성
        Department ceoOffice = createDept("대표이사실", null, 1);
        Department management = createDept("경영지원본부", null, 2);
        Department generalAffairs = createDept("총무팀", management, 1);
        Department hr = createDept("인사팀", management, 2);
        Department devGroup = createDept("개발본부", null, 3);
        Department devTeam = createDept("개발팀", devGroup, 1);
        Department designTeam = createDept("디자인팀", devGroup, 2);
        Department salesGroup = createDept("영업본부", null, 4);
        Department salesTeam = createDept("영업팀", salesGroup, 1);
        Department marketingTeam = createDept("마케팅팀", salesGroup, 2);

        // 테스트 사용자 및 직원 계정 생성
        createTestUserAndEmployee("admin@company.com", "password123", "관리자", Role.ADMIN, generalAffairs, "대리", null, null);
        createTestUserAndEmployee("hong@company.com", "password123", "홍길동", Role.USER, devTeam, "선임", "010-1234-5678", "본사 12층");
        createTestUserAndEmployee("kim@company.com", "password123", "김철수",  Role.USER, devTeam, "팀장", null, null);
        createTestUserAndEmployee("park@company.com", "password123", "박민수", Role.USER, devTeam, "선임", null, null);
        createTestUserAndEmployee("kimj@company.com", "password123", "김진환", Role.USER, devTeam, "사원", null, null);
        createTestUserAndEmployee("jinh@company.com", "password123", "진환(테스트)", Role.USER, devTeam, "사원", null, null);
        createTestUserAndEmployee("lee@company.com", "password123", "이영희",  Role.USER, marketingTeam, "팀장", null, null);
        createTestUserAndEmployee("choi@company.com", "password123", "최동욱", Role.USER, salesTeam, "팀장", null, null);
        createTestUserAndEmployee("kang@company.com", "password123", "강서연", Role.USER, devGroup, "과장", null, null);
        createTestUserAndEmployee("jung@company.com", "password123", "정호진", Role.USER, management, "과장", null, null);

        // 테스트 전자결재 문서 생성 (홍길동 작성, 휴가신청서 완료 건 5개)
        if (approvalDocumentRepository.count() == 0) {
            userRepository.findByEmail("hong@company.com").ifPresent(user -> {
                Employee hong = user.getEmployee();
                for (int i = 310; i <= 314; i++) {
                    String docNo = "AP-2026-00" + i;
                    ApprovalDocument doc = ApprovalDocument.builder()
                            .docNo(docNo)
                            .formType("휴가신청서")
                            .title("정기 휴가 신청의 건 - " + docNo)
                            .content("연차 휴가를 신청합니다.")
                            .status(ApprovalStatus.APPROVED)
                            .submitter(hong)
                            .department(hong.getDepartment())
                            .currentStep(2)
                            .submittedAt(LocalDateTime.now().minusDays(5))
                            .completedAt(LocalDateTime.now().minusDays(1))
                            .build();
                    approvalDocumentRepository.save(doc);
                }
                log.info("테스트 결재 문서 생성 완료 (5건)");

                // 전사 문서함 및 문서관리용 테스트 문서 15건 생성
                for (int i = 1; i <= 15; i++) {
                    String docNo = String.format("DOC-2026-%05d", i);
                    ApprovalDocument doc = ApprovalDocument.builder()
                            .docNo(docNo)
                            .formType(i % 3 == 0 ? "일반문서" : (i % 3 == 1 ? "협조전" : "공지사항"))
                            .title("전사 문서 테스트 " + i)
                            .content("이것은 전사 문서함 테스트 데이터입니다.")
                            // 10건은 결재 완료된 문서(APPROVED), 5건은 임시저장(DRAFT)
                            .status(i <= 10 ? ApprovalStatus.APPROVED : ApprovalStatus.DRAFT)
                            .isUrgent(false)
                            .submitter(hong)
                            .department(hong.getDepartment())
                            .currentStep(1)
                            .submittedAt(i <= 10 ? LocalDateTime.now().minusDays(i) : null)
                            .completedAt(i <= 10 ? LocalDateTime.now().minusDays(i - 1) : null)
                            .build();
                    approvalDocumentRepository.save(doc);
                }
                log.info("전사 문서 생성 완료 (15건)");

                // 결재 대기, 결재 예정, 참조 문서용 더미 데이터 생성
                Employee kim = userRepository.findByEmail("kim@company.com").get().getEmployee();
                Employee lee = userRepository.findByEmail("lee@company.com").get().getEmployee();
                Employee park = userRepository.findByEmail("park@company.com").get().getEmployee();
                Employee jinh = userRepository.findByEmail("jinh@company.com").get().getEmployee();
                Employee kimj = userRepository.findByEmail("kimj@company.com").get().getEmployee();

                // 1. Pending for Kim, Planned for Lee
                ApprovalDocument doc1 = ApprovalDocument.builder()
                        .docNo("AP-2026-101")
                        .formType("기안서")
                        .title("신규 프로젝트 제안")
                        .content("프로젝트 제안서입니다.")
                        .status(ApprovalStatus.PENDING)
                        .submitter(hong)
                        .department(hong.getDepartment())
                        .currentStep(1)
                        .submittedAt(LocalDateTime.now().minusDays(2))
                        .build();

                doc1.getApprovalLines().add(ApprovalLine.builder().document(doc1).step(1).type(ApprovalLineType.APPROVE).approver(kim).status(ApprovalLineStatus.WAITING).isViewed(false).build());
                doc1.getApprovalLines().add(ApprovalLine.builder().document(doc1).step(2).type(ApprovalLineType.APPROVE).approver(lee).status(ApprovalLineStatus.WAITING).isViewed(false).build());
                doc1.getApprovalLines().add(ApprovalLine.builder().document(doc1).step(3).type(ApprovalLineType.APPROVE).approver(jinh).status(ApprovalLineStatus.WAITING).isViewed(false).build());
                doc1.getApprovalLines().add(ApprovalLine.builder().document(doc1).step(4).type(ApprovalLineType.APPROVE).approver(kimj).status(ApprovalLineStatus.WAITING).isViewed(false).build());
                approvalDocumentRepository.save(doc1);

                // 2. Planned for Kim, Pending for Park
                ApprovalDocument doc2 = ApprovalDocument.builder()
                        .docNo("AP-2026-102")
                        .formType("지출결의서")
                        .title("팀 회식비 지출결의")
                        .content("회식비 지출결의서입니다.")
                        .status(ApprovalStatus.PENDING)
                        .submitter(hong)
                        .department(hong.getDepartment())
                        .currentStep(1)
                        .submittedAt(LocalDateTime.now().minusDays(1))
                        .build();
                        
                doc2.getApprovalLines().add(ApprovalLine.builder().document(doc2).step(1).type(ApprovalLineType.APPROVE).approver(park).status(ApprovalLineStatus.WAITING).isViewed(false).build());
                doc2.getApprovalLines().add(ApprovalLine.builder().document(doc2).step(1).type(ApprovalLineType.APPROVE).approver(jinh).status(ApprovalLineStatus.WAITING).isViewed(false).build());
                doc2.getApprovalLines().add(ApprovalLine.builder().document(doc2).step(1).type(ApprovalLineType.APPROVE).approver(kimj).status(ApprovalLineStatus.WAITING).isViewed(false).build());
                doc2.getApprovalLines().add(ApprovalLine.builder().document(doc2).step(2).type(ApprovalLineType.APPROVE).approver(kim).status(ApprovalLineStatus.WAITING).isViewed(false).build());
                approvalDocumentRepository.save(doc2);

                // 3. Reference for Kim & Lee
                ApprovalDocument doc3 = ApprovalDocument.builder()
                        .docNo("AP-2026-103")
                        .formType("협조전")
                        .title("서버 점검 사전 안내")
                        .content("서버 점검이 있을 예정입니다.")
                        .status(ApprovalStatus.PENDING)
                        .submitter(hong)
                        .department(hong.getDepartment())
                        .currentStep(1)
                        .submittedAt(LocalDateTime.now().minusHours(5))
                        .build();
                doc3.getApprovalLines().add(ApprovalLine.builder().document(doc3).step(1).type(ApprovalLineType.APPROVE).approver(park).status(ApprovalLineStatus.WAITING).isViewed(false).build());
                doc3.getApprovalLines().add(ApprovalLine.builder().document(doc3).step(1).type(ApprovalLineType.CC).approver(kim).status(ApprovalLineStatus.WAITING).isViewed(false).build());
                doc3.getApprovalLines().add(ApprovalLine.builder().document(doc3).step(1).type(ApprovalLineType.CC).approver(lee).status(ApprovalLineStatus.WAITING).isViewed(false).build());
                doc3.getApprovalLines().add(ApprovalLine.builder().document(doc3).step(1).type(ApprovalLineType.CC).approver(jinh).status(ApprovalLineStatus.WAITING).isViewed(false).build());
                doc3.getApprovalLines().add(ApprovalLine.builder().document(doc3).step(1).type(ApprovalLineType.CC).approver(kimj).status(ApprovalLineStatus.WAITING).isViewed(false).build());
                approvalDocumentRepository.save(doc3);
                
                // 추가 더미 데이터 생성

                // 4. Multiple Pending/Planned/Reference Combo
                for (int i = 104; i <= 113; i++) {
                    ApprovalDocument extraDoc = ApprovalDocument.builder()
                            .docNo("AP-2026-" + i)
                            .formType(i % 2 == 0 ? "기안서" : "협조전")
                            .title("추가 테스트 문서 - " + i + "번")
                            .content("결재 대기/예정/참조 추가 테스트 데이터입니다.")
                            .status(ApprovalStatus.PENDING)
                            .submitter(hong)
                            .department(hong.getDepartment())
                            .currentStep(i % 3 == 0 ? 2 : 1) // 일부는 2단계 진행 중
                            .submittedAt(LocalDateTime.now().minusHours(i))
                            .build();

                    // Step 1: Approvers
                    if (i % 3 == 0) {
                        // Step 1 Completed
                        extraDoc.getApprovalLines().add(ApprovalLine.builder().document(extraDoc).step(1).type(ApprovalLineType.APPROVE).approver(park).status(ApprovalLineStatus.APPROVED).isViewed(true).build());
                        // Step 2 Pending (Kim) -> "결재 대기" for Kim
                        extraDoc.getApprovalLines().add(ApprovalLine.builder().document(extraDoc).step(2).type(ApprovalLineType.APPROVE).approver(kim).status(ApprovalLineStatus.WAITING).isViewed(false).build());
                        // Step 3 Planned (Lee) -> "결재 예정" for Lee
                        extraDoc.getApprovalLines().add(ApprovalLine.builder().document(extraDoc).step(3).type(ApprovalLineType.APPROVE).approver(lee).status(ApprovalLineStatus.WAITING).isViewed(false).build());
                    } else if (i % 3 == 1) {
                        // Step 1 Pending (Kimj) -> "결재 대기" for Kimj
                        extraDoc.getApprovalLines().add(ApprovalLine.builder().document(extraDoc).step(1).type(ApprovalLineType.APPROVE).approver(kimj).status(ApprovalLineStatus.WAITING).isViewed(false).build());
                        // Step 2 Planned (Jinh) -> "결재 예정" for Jinh
                        extraDoc.getApprovalLines().add(ApprovalLine.builder().document(extraDoc).step(2).type(ApprovalLineType.APPROVE).approver(jinh).status(ApprovalLineStatus.WAITING).isViewed(false).build());
                        // Step 3 Planned (Kim) -> "결재 예정" for Kim
                        extraDoc.getApprovalLines().add(ApprovalLine.builder().document(extraDoc).step(3).type(ApprovalLineType.APPROVE).approver(kim).status(ApprovalLineStatus.WAITING).isViewed(false).build());
                    } else {
                        // Step 1 Pending (Lee) -> "결재 대기" for Lee
                        extraDoc.getApprovalLines().add(ApprovalLine.builder().document(extraDoc).step(1).type(ApprovalLineType.APPROVE).approver(lee).status(ApprovalLineStatus.WAITING).isViewed(false).build());
                        // Step 2 Planned (Park) -> "결재 예정" for Park
                        extraDoc.getApprovalLines().add(ApprovalLine.builder().document(extraDoc).step(2).type(ApprovalLineType.APPROVE).approver(park).status(ApprovalLineStatus.WAITING).isViewed(false).build());
                    }

                    // Reference/CC (Always step 1) -> "참조/열람 대기" for assigned users
                    if (i % 2 == 0) {
                        extraDoc.getApprovalLines().add(ApprovalLine.builder().document(extraDoc).step(1).type(ApprovalLineType.CC).approver(jinh).status(ApprovalLineStatus.WAITING).isViewed(false).build());
                        extraDoc.getApprovalLines().add(ApprovalLine.builder().document(extraDoc).step(1).type(ApprovalLineType.CC).approver(kim).status(ApprovalLineStatus.WAITING).isViewed(false).build());
                    } else {
                        extraDoc.getApprovalLines().add(ApprovalLine.builder().document(extraDoc).step(1).type(ApprovalLineType.CC).approver(lee).status(ApprovalLineStatus.WAITING).isViewed(false).build());
                        extraDoc.getApprovalLines().add(ApprovalLine.builder().document(extraDoc).step(1).type(ApprovalLineType.CC).approver(kimj).status(ApprovalLineStatus.WAITING).isViewed(false).build());
                    }

                    approvalDocumentRepository.save(extraDoc);
                }
                
                log.info("결재 대기/예정/참조 테스트 데이터 결재선 생성 완료 (추가 문서 포함)");
            });
        }

        log.info("=== 더미 데이터 초기화 완료 ===");
    }
    
    private Department createDept(String name, Department parentDept, int displayOrder) {
        Department dept = Department.builder()
                .name(name)
                .parentDept(parentDept)
                .displayOrder(displayOrder)
                .build();
        return departmentRepository.save(dept);
    }

    private void createTestUserAndEmployee(String email, String password, String name, Role role, Department department, String position, String phone, String officeLocation) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User user = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .name(name)
                    .role(role)
                    .build();
            userRepository.save(user);
            
            Employee employee = Employee.builder()
                    .user(user)
                    .department(department)
                    .name(name)
                    .position(position)
                    .phone(phone)
                    .officeLocation(officeLocation)
                    .build();
            employeeRepository.save(employee);
            
            log.info("테스트 사용자/직원 생성 완료: email={}, name={}, position={}", email, name, position);
        } else {
            log.info("테스트 사용자 이미 존재: email={}", email);
        }
    }
}
