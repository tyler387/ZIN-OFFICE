# PRD — 전자결재 (Approval) v3.0 [AI 컨텍스트용]

> 스택: Spring Boot 3.x / Java 17 / JWT / Redis / PostgreSQL
> 대상: ZIN Corporation 200인 | 멀티 테넌트: Row-level (tenant_id)

---

## 1. 핵심 정책

| 항목 | 값 |
|------|----|
| 멀티 테넌트 | Row-level (tenant_id) |
| 문서 삭제 | Soft Delete (is_deleted=true), DRAFT 상태만 삭제 가능 |
| 버전 관리 | 재기안 시 version+1, parent_doc_id로 원본 참조 |
| 보안등급 | PUBLIC / INTERNAL / CONFIDENTIAL — 등급별 조회 권한 분리 |
| 결재 순서 | order_no 기반 순차 처리, 병렬(AGREEMENT)은 동일 order_no |
| 병렬 결재 완료 조건 | 동일 order_no 내 AGREEMENT 전원 승인 시 다음 단계로 진행 |
| 회수 조건 | 다음 결재자 status=PENDING 상태일 때만 가능, 이미 처리 시 불가 |
| 반려 | 사유 필수 (최소 10자), 반려 시 전체 라인 REJECTED 처리 |
| 재기안 | REJECTED/WITHDRAWN 문서만 가능, 작성자만, 원본 내용 복사 |
| 위임 | 기간 기반, 중첩 불가, 위임 이력에 delegated_by 기록 |
| 전자서명 | SHA-256 해시 저장, 서명 없이 결재 불가 (선택 여부 Open Question) |
| 감사 로그 | Immutable (DB DELETE/UPDATE 권한 제거), 보관 기간 Open Question |
| 알림 | Messenger + Mail PRD 연계, 3회 retry, fallback 채널 |
| PDF 다운로드 | 워터마크(사용자명 + 시각), CONFIDENTIAL 다운로드 감사 로그 필수 |
| 중복 결재 방지 | (doc_id, user_id, order_no) UNIQUE 제약 |
| 참조자 | approval_referees 테이블, 열람 전용, 알림 수신 |
| 첨부파일 바이러스 스캔 | 업로드 시 스캔 필수, INFECTED 차단 (Mail PRD 정책과 동일) |
| 문서 수정 시 결재선 재설정 | DRAFT 수정 후 결재선도 함께 수정 가능 |

---

## 2. 상태 머신

### 문서 상태
| 상태 | 설명 |
|------|------|
| DRAFT | 작성 중 (수정/삭제 가능) |
| SUBMITTED | 상신 완료 (수정 불가) |
| IN_PROGRESS | 결재 진행 중 |
| APPROVED | 최종 승인 완료 |
| REJECTED | 반려 |
| WITHDRAWN | 회수 |

### 전이 규칙
```
DRAFT       → SUBMITTED    : 상신 (작성자)
SUBMITTED   → IN_PROGRESS  : 첫 결재자 처리 시작 (자동)
IN_PROGRESS → APPROVED     : 마지막 결재자 승인
IN_PROGRESS → REJECTED     : 결재자 반려 → 전체 라인 REJECTED 처리
IN_PROGRESS → WITHDRAWN    : 작성자 회수 (다음 결재자 PENDING 상태일 때만)
REJECTED    → (신규 DRAFT) : 재기안 (원본 유지, 신규 doc_id 생성)
WITHDRAWN   → (신규 DRAFT) : 재기안 (원본 유지, 신규 doc_id 생성)
```

### approval_lines 상태
| 상태 | 설명 |
|------|------|
| PENDING | 대기 중 (이전 단계 미완료) |
| IN_PROGRESS | 현재 결재 차례 |
| APPROVED | 승인 완료 |
| REJECTED | 반려 |
| SKIPPED | 전결/자동 스킵 처리됨 |
| DELEGATED | 위임 처리됨 (delegated_to로 이관) |
| PRE_APPROVED | 선결 완료 (해당 순서 도달 시 자동 APPROVED 처리) |

---

## 3. 기능 요구사항

### 문서 관리
1. 문서 생성 / 수정 (DRAFT만) / Soft Delete (DRAFT만)
2. 버전 관리: 재기안 시 version+1, parent_doc_id로 원본 참조
3. DRAFT 수정 시 결재선/참조자/첨부파일 함께 수정 가능
4. 보안등급: PUBLIC / INTERNAL / CONFIDENTIAL
   - CONFIDENTIAL: 결재선 참여자 + 참조자 + 관리자만 조회
   - INTERNAL: 동일 테넌트 내 전체 조회
5. 첨부파일: 업로드 시 바이러스 스캔 필수, INFECTED 첨부 차단
6. 문서 양식(template) 기반 생성 지원

### 결재선 엔진
7. 자동 결재선 생성: 조직도 기반 / 직급 기반 / 조건 기반(금액, 부서)
8. 수동 결재선 지정 가능
9. 결재 타입: APPROVAL / AGREEMENT / REVIEW / AUDIT / HOLD
10. 병렬 결재: AGREEMENT 동일 order_no, 전원 승인 시 다음 단계 진행
11. 참조자: approval_referees 테이블, 열람 전용, 결재 이벤트 알림 수신

### 결재 처리
12. 승인 / 반려 / 보류
13. 선결: 순서 도달 전 사전 처리 → status=PRE_APPROVED, 도달 시 자동 APPROVED
14. 전결: 현재 결재자 이하 전체 SKIPPED 처리 후 APPROVED
15. 대결: 위임받은 사람이 처리, approval_lines.delegated_to 기록
16. 후결: 처리 완료 후 소급 결재, 법적 유효성 Open Question
17. 결재 순서 강제: 이전 order_no 미완료 시 처리 불가 (NOT_YOUR_TURN)
18. 결재 의견 선택 입력

### 반려 / 재기안
19. 반려 시 사유 필수 (최소 10자)
20. 반려 시 나머지 라인 전부 REJECTED 처리, 작성자 알림
21. 재기안: REJECTED/WITHDRAWN 문서 기반 신규 DRAFT, parent_doc_id 참조, version+1
22. 재기안은 원작성자만 가능

### 회수
23. 다음 결재자 PENDING 상태일 때만 가능
24. 회수 시 전체 approval_lines SKIPPED 처리
25. 회수 후 재기안 가능

### 전자서명
26. 결재 처리 시 signatureData 수신 (이미지 base64 또는 PIN hash)
27. SHA-256 해시 생성 → approval_lines.signature_hash 저장
28. 서명 위변조 검증 API 제공
29. 서명 필수 여부: Open Question (조직 정책에 따라 결정)

### 위임
30. 기간 지정 위임 (start_date ~ end_date)
31. 위임 중첩 불가 (동일 user_id 활성 위임 1개만)
32. 수임자가 이미 위임 중이면 차단
33. 본인 위임 차단
34. 위임 취소: 미시작 또는 진행 중 위임만 가능 (만료 후 취소 불가)
35. 위임된 결재 이력에 delegated_by(원위임자) 기록

### 감사 로그
36. 기록 대상: 상신/승인/반려/회수/위임/재기안/선결/전결/다운로드
37. Immutable (DB UPDATE/DELETE 권한 제거)
38. 보관 기간: Open Question

### 알림
39. 이벤트: 상신 → 첫 결재자 / 결재 완료 → 다음 결재자 / 반려 → 작성자 / 최종 승인 → 작성자+참조자 / 회수 → 결재자
40. 채널: Messenger PRD + Mail PRD
41. 실패 시 최대 3회 exponential backoff, fallback 채널 전환

### 다운로드
42. HTML / PDF 변환
43. 워터마크: 다운로드 사용자명 + 시각
44. CONFIDENTIAL 다운로드 시 감사 로그 필수 기록

### 권한
45. Admin PRD RBAC 연계 (approval:read, approval:write, approval:admin)
46. 작성자: 기안/수정/삭제(DRAFT)/회수/재기안
47. 결재자: 승인/반려/보류/선결/전결
48. 참조자: 열람 전용
49. 관리자: 전체 문서 조회/양식 관리/결재선 템플릿 관리

---

## 4. 비기능 요구사항

| 항목 | 요구사항 | 비고 |
|------|----------|------|
| 성능 | 결재 처리 ≤ 1초 | P99 기준 |
| 성능 | 문서 목록 조회 ≤ 500ms | 페이징 P99 |
| 확장성 | 수평 확장 가능 구조 | |
| 보안 | TLS 1.2 이상, RBAC, Audit | |
| 가용성 | SLA 99.9% | 월 다운타임 약 43분 |
| 로그 | 전 결재 이벤트 기록 | Immutable |

---

## 5. 데이터 테이블

### documents
```
doc_id          PK UUID
tenant_id       FK → tenants
title           varchar(500)
content         text  -- HTML 본문
doc_type        varchar(100)  -- 예: EXPENSE, VACATION, PURCHASE
template_id     FK → doc_templates nullable
status          enum DRAFT/SUBMITTED/IN_PROGRESS/APPROVED/REJECTED/WITHDRAWN
security_level  enum PUBLIC/INTERNAL/CONFIDENTIAL default INTERNAL
version         int default 1
parent_doc_id   FK self nullable  -- 재기안 원본 참조
is_deleted      boolean default false
created_by      FK → users
submitted_at    datetime nullable
completed_at    datetime nullable
created_at      datetime
updated_at      datetime
```

### approval_lines
```
line_id          PK UUID
doc_id           FK → documents
tenant_id        FK → tenants
user_id          FK → users   -- 원래 지정된 결재자
delegated_to     FK → users nullable  -- 위임받은 실제 처리자
delegated_by     FK → users nullable  -- 위임한 사람 (delegations.user_id)
approval_type    enum APPROVAL/AGREEMENT/REVIEW/AUDIT/HOLD
order_no         int
status           enum PENDING/IN_PROGRESS/APPROVED/REJECTED/SKIPPED/DELEGATED/PRE_APPROVED
comment          text nullable
rejection_reason varchar(2000) nullable
signature_hash   varchar(256) nullable
is_pre_approved  boolean default false
processed_by     FK → users nullable  -- 실제 처리한 사람 (대결 시 delegated_to)
processed_at     datetime nullable
created_at       datetime
```

> UNIQUE: (doc_id, user_id, order_no)

### approval_referees (참조자) `[추가]`
```
id        PK bigint auto
doc_id    FK → documents
user_id   FK → users
added_at  datetime
```

> UNIQUE: (doc_id, user_id)

### approval_history
```
hist_id     PK bigint auto
tenant_id   FK → tenants
doc_id      FK → documents
line_id     FK → approval_lines nullable
action      enum DRAFTED/SUBMITTED/APPROVED/REJECTED/WITHDRAWN/DELEGATED/RE_DRAFTED/DOWNLOADED/PRE_APPROVED/FULL_APPROVED
user_id     FK → users
ip_address  varchar(45)
user_agent  varchar(500)
before_data JSON nullable
after_data  JSON nullable
created_at  datetime
```

> Immutable: DB 레벨 UPDATE/DELETE 권한 제거

### delegations
```
delegation_id PK UUID
tenant_id     FK → tenants
user_id       FK → users  -- 위임자
delegate_id   FK → users  -- 수임자
start_date    date
end_date      date
is_active     boolean default true
reason        varchar(500) nullable
created_at    datetime
cancelled_at  datetime nullable
```

> 동일 user_id에서 is_active=true인 레코드 최대 1개 (애플리케이션 레벨)
> UNIQUE: 기간 중복 방지 (user_id, start_date, end_date 체크)

### doc_templates
```
template_id  PK UUID
tenant_id    FK → tenants
name         varchar(200)
content      text
doc_type     varchar(100)
is_active    boolean default true
created_by   FK → users
created_at   datetime
updated_at   datetime
```

> UNIQUE: (tenant_id, name)

### approval_attachments
```
file_id      PK UUID
doc_id       FK → documents
tenant_id    FK → tenants
file_name    varchar(500)
file_size    bigint
file_path    varchar(1000)
content_type varchar(200)
scan_result  enum PENDING/CLEAN/INFECTED default PENDING  -- [추가]
uploaded_by  FK → users
uploaded_at  datetime
```

### approval_line_templates
```
template_id   PK UUID
tenant_id     FK → tenants
doc_type      varchar(100)
name          varchar(200)
lines         JSON  -- [{orderNo, role, approvalType}]
condition     JSON nullable  -- {amountGte, deptId 등}
is_active     boolean default true
created_at    datetime
updated_at    datetime  -- [추가]
```

---

## 6. API

> 모든 API: `Authorization: Bearer {accessToken}`

### 6.1 문서 관리

#### POST /api/approval/documents — 기안 생성
```json
// Request
{
  "title": "2025년 1월 지출결의서",
  "docType": "EXPENSE",
  "templateId": "uuid",
  "content": "<p>지출 내역...</p>",
  "securityLevel": "INTERNAL",
  "attachmentIds": ["uuid-1"],
  "approvalLines": [
    { "userId": "uuid", "approvalType": "APPROVAL", "orderNo": 1 },
    { "userId": "uuid", "approvalType": "APPROVAL", "orderNo": 2 }
  ],
  "referees": ["uuid-3"]
}

// 201
{ "docId": "uuid", "version": 1, "message": "기안이 생성되었습니다." }

// 400 INVALID_APPROVAL_LINE
// 400 DUPLICATE_APPROVER
// 400 ATTACHMENT_NOT_READY (스캔 PENDING)
// 400 INFECTED_ATTACHMENT
```

#### GET /api/approval/documents — 문서 목록
```json
// Query: tab(MY_DRAFT/PENDING_MY_APPROVAL/COMPLETED/REFERENCE),
//        status, docType, page(default:0), size(default:20, max:100)
// 200
{
  "documents": [
    {
      "docId": "uuid",
      "title": "2025년 1월 지출결의서",
      "docType": "EXPENSE",
      "status": "IN_PROGRESS",
      "securityLevel": "INTERNAL",
      "version": 1,
      "createdBy": "홍길동",
      "currentApprover": "김철수",
      "createdAt": "2025-01-01T09:00:00Z"
    }
  ],
  "page": 0,
  "totalElements": 42,
  "totalPages": 3
}
```

#### GET /api/approval/documents/{docId} — 문서 상세
```json
// 200
{
  "docId": "uuid",
  "title": "2025년 1월 지출결의서",
  "docType": "EXPENSE",
  "content": "<p>...</p>",
  "status": "IN_PROGRESS",
  "securityLevel": "INTERNAL",
  "version": 1,
  "parentDocId": null,
  "createdBy": { "userId": "uuid", "name": "홍길동" },
  "approvalLines": [
    {
      "lineId": "uuid",
      "userId": "uuid",
      "userName": "김철수",
      "approvalType": "APPROVAL",
      "orderNo": 1,
      "status": "APPROVED",
      "comment": "승인합니다",
      "processedBy": "uuid",
      "processedAt": "2025-01-01T10:00:00Z"
    }
  ],
  "referees": [{ "userId": "uuid", "name": "이영희" }],
  "attachments": [{ "fileId": "uuid", "fileName": "영수증.pdf", "fileSize": 102400 }],
  "submittedAt": "2025-01-01T09:05:00Z",
  "createdAt": "2025-01-01T09:00:00Z"
}

// 403 FORBIDDEN (보안등급 접근 불가)
// 404 DOCUMENT_NOT_FOUND
```

#### PUT /api/approval/documents/{docId} — 문서 수정 (DRAFT만)
```json
// Request (변경할 필드만, 결재선/참조자/첨부 포함 수정 가능)
{
  "title": "수정된 제목",
  "content": "<p>수정...</p>",
  "approvalLines": [
    { "userId": "uuid", "approvalType": "APPROVAL", "orderNo": 1 }
  ],
  "referees": ["uuid-2"],
  "attachmentIds": ["uuid-new"]
}

// 200
// 400 NOT_DRAFT
// 404 DOCUMENT_NOT_FOUND
```

#### DELETE /api/approval/documents/{docId} — 문서 삭제 (DRAFT, Soft Delete)
```json
// 200
// 400 NOT_DRAFT
// 403 NOT_CREATOR
// 404 DOCUMENT_NOT_FOUND
```

---

### 6.2 결재 처리

#### POST /api/approval/documents/{docId}/submit — 상신
```json
// 200
{ "docId": "uuid", "status": "IN_PROGRESS", "message": "상신되었습니다." }

// 400 NOT_DRAFT
// 400 INVALID_APPROVAL_LINE (결재선 없음)
// 403 NOT_CREATOR
// 404 DOCUMENT_NOT_FOUND
```

#### POST /api/approval/documents/{docId}/approve — 승인
```json
// Request
{
  "lineId": "uuid",
  "comment": "승인합니다.",
  "signatureData": "base64_encoded_signature"
}

// 200
{ "docId": "uuid", "lineStatus": "APPROVED", "docStatus": "IN_PROGRESS", "message": "승인되었습니다." }
// 마지막 결재자 승인 시 docStatus = "APPROVED"

// 400 NOT_YOUR_TURN
// 400 ALREADY_PROCESSED
// 400 DOCUMENT_NOT_IN_PROGRESS
// 403 NOT_APPROVER
// 404 DOCUMENT_NOT_FOUND / LINE_NOT_FOUND
```

#### POST /api/approval/documents/{docId}/reject — 반려
```json
// Request
{
  "lineId": "uuid",
  "rejectionReason": "예산 초과로 반려합니다. 금액 조정 후 재기안 바랍니다."
}

// 200
{ "docId": "uuid", "docStatus": "REJECTED", "message": "반려되었습니다." }

// 400 REJECTION_REASON_TOO_SHORT (10자 미만)
// 400 NOT_YOUR_TURN
// 400 ALREADY_PROCESSED
// 403 NOT_APPROVER
// 404 DOCUMENT_NOT_FOUND / LINE_NOT_FOUND
```

#### POST /api/approval/documents/{docId}/hold — 보류
```json
// Request
{ "lineId": "uuid", "comment": "추가 검토 필요" }

// 200
{ "lineStatus": "PENDING", "message": "보류 처리되었습니다." }

// 400 NOT_YOUR_TURN
// 403 NOT_APPROVER
```

#### POST /api/approval/documents/{docId}/withdraw — 회수
```json
// 200
{ "docId": "uuid", "docStatus": "WITHDRAWN", "message": "회수되었습니다." }

// 400 CANNOT_WITHDRAW
// 403 NOT_CREATOR
// 404 DOCUMENT_NOT_FOUND
```

#### POST /api/approval/documents/{docId}/redraft — 재기안
```json
// 201
{
  "newDocId": "uuid",
  "parentDocId": "uuid",
  "version": 2,
  "message": "재기안이 생성되었습니다."
}

// 400 CANNOT_REDRAFT
// 403 NOT_CREATOR
// 404 DOCUMENT_NOT_FOUND
```

---

### 6.3 특수 결재

#### POST /api/approval/documents/{docId}/pre-approve — 선결
```json
// Request
{ "lineId": "uuid", "comment": "선결 처리합니다.", "signatureData": "base64..." }

// 200
{ "lineStatus": "PRE_APPROVED", "message": "선결 처리되었습니다. 해당 순서 도달 시 자동 반영됩니다." }

// 400 ALREADY_PROCESSED
// 403 NOT_APPROVER
// 404 LINE_NOT_FOUND
```

#### POST /api/approval/documents/{docId}/full-approve — 전결
```json
// Request
{ "lineId": "uuid", "comment": "전결 처리합니다." }

// 200
{ "docId": "uuid", "docStatus": "APPROVED", "message": "전결 처리되었습니다." }

// 400 NOT_YOUR_TURN
// 403 NOT_APPROVER
```

---

### 6.4 위임

#### GET /api/approval/delegations — 위임 목록
```json
// Query: isActive(boolean, 선택)
// 200
{
  "delegations": [
    {
      "delegationId": "uuid",
      "delegateName": "김철수",
      "startDate": "2025-01-10",
      "endDate": "2025-01-20",
      "reason": "출장",
      "isActive": true
    }
  ]
}
```

#### POST /api/approval/delegations — 위임 등록
```json
// Request
{
  "delegateId": "uuid",
  "startDate": "2025-01-10",
  "endDate": "2025-01-20",
  "reason": "출장"
}

// 201
{ "delegationId": "uuid", "message": "위임이 등록되었습니다." }

// 400 DELEGATION_OVERLAP
// 400 SELF_DELEGATION
// 400 DELEGATE_ALREADY_DELEGATING
// 400 PAST_START_DATE (시작일이 과거) `[추가]`
```

#### DELETE /api/approval/delegations/{delegationId} — 위임 취소
```json
// 200
{ "message": "위임이 취소되었습니다." }

// 400 ALREADY_EXPIRED
// 403 NOT_DELEGATION_OWNER `[추가]`
// 404 DELEGATION_NOT_FOUND
```

---

### 6.5 첨부파일 `[추가]`

#### POST /api/approval/attachments — 첨부파일 업로드
```json
// Request: multipart/form-data, file

// 202
{ "fileId": "uuid", "fileName": "report.pdf", "scanStatus": "PENDING" }

// 400 FILE_SIZE_EXCEEDED (50MB 초과)
// 400 FILE_TYPE_NOT_ALLOWED
```

#### GET /api/approval/attachments/{fileId}/status — 스캔 상태 조회
```json
// 200
{ "fileId": "uuid", "scanStatus": "CLEAN" }
// PENDING / CLEAN / INFECTED
```

#### GET /api/approval/attachments/{fileId}/download — 다운로드 URL 발급
```json
// 200
{ "downloadUrl": "https://...", "expiresAt": "2025-01-01T13:00:00Z" }

// 400 INFECTED_FILE
// 403 FORBIDDEN
// 404 FILE_NOT_FOUND
```

---

### 6.6 문서 양식 (ADMIN)

#### GET /api/admin/approval/templates — 양식 목록
```json
// 200
{ "templates": [{ "templateId": "uuid", "name": "지출결의서", "docType": "EXPENSE", "isActive": true }] }
```

#### POST /api/admin/approval/templates — 양식 생성
```json
{ "name": "지출결의서", "docType": "EXPENSE", "content": "<p>양식...</p>" }
// 201 / 409 TEMPLATE_NAME_DUPLICATED
```

#### PUT /api/admin/approval/templates/{templateId} — 양식 수정
```json
{ "name": "수정된 양식명", "content": "<p>...</p>", "isActive": true }
// 200 / 404 TEMPLATE_NOT_FOUND
```

#### DELETE /api/admin/approval/templates/{templateId} — 양식 삭제 `[추가]`
```json
// 200
// 400 TEMPLATE_IN_USE (사용 중인 문서 있음)
// 404 TEMPLATE_NOT_FOUND
```

---

### 6.7 결재선 템플릿 (ADMIN)

#### GET /api/admin/approval/line-templates — 목록
```json
// 200
{ "templates": [{ "templateId": "uuid", "name": "지출결의 결재선", "docType": "EXPENSE", "isActive": true }] }
```

#### POST /api/admin/approval/line-templates — 생성
```json
{
  "name": "지출결의 결재선",
  "docType": "EXPENSE",
  "lines": [
    { "role": "TEAM_LEADER", "approvalType": "APPROVAL", "orderNo": 1 },
    { "role": "DEPT_HEAD", "approvalType": "APPROVAL", "orderNo": 2 }
  ],
  "condition": { "amountGte": 1000000 }
}
// 201
```

#### PUT /api/admin/approval/line-templates/{templateId} — 수정 `[추가]`
```json
{ "name": "수정된 결재선", "isActive": false }
// 200 / 404 LINE_TEMPLATE_NOT_FOUND
```

---

### 6.8 감사 로그

#### GET /api/admin/approval/history — 이력 조회
```json
// Query: docId, userId, action, dateFrom, dateTo, page(default:0), size(default:20, max:100)
// 200
{
  "history": [
    {
      "histId": 1,
      "docId": "uuid",
      "docTitle": "2025년 1월 지출결의서",
      "action": "APPROVED",
      "userId": "uuid",
      "userName": "김철수",
      "ipAddress": "192.168.0.1",
      "createdAt": "2025-01-01T10:00:00Z"
    }
  ],
  "page": 0,
  "totalElements": 100,
  "totalPages": 5
}
```

---

### 6.9 전자서명 검증

#### GET /api/approval/documents/{docId}/signature-verify — 서명 검증
```json
// 200
{
  "docId": "uuid",
  "signatures": [
    {
      "lineId": "uuid",
      "userName": "김철수",
      "signatureHash": "sha256...",
      "isValid": true,
      "processedAt": "2025-01-01T10:00:00Z"
    }
  ],
  "allValid": true
}

// 403 FORBIDDEN
// 404 DOCUMENT_NOT_FOUND
```

---

### 6.10 다운로드

#### GET /api/approval/documents/{docId}/download — PDF/HTML 다운로드
```json
// Query: format(PDF/HTML, default:PDF)
// Response: Content-Disposition: attachment
// 워터마크: 다운로드 사용자명 + 시각 삽입
// CONFIDENTIAL: 감사 로그 자동 기록

// 403 FORBIDDEN
// 404 DOCUMENT_NOT_FOUND
```

---

## 7. 주요 에러 코드

| 코드 | HTTP | 설명 |
|------|------|------|
| DOCUMENT_NOT_FOUND | 404 | 문서 미존재 |
| LINE_NOT_FOUND | 404 | 결재라인 미존재 |
| NOT_DRAFT | 400 | DRAFT 아닌 문서 수정/삭제 |
| NOT_CREATOR | 403 | 작성자 아님 |
| NOT_APPROVER | 403 | 결재자 아님 |
| NOT_YOUR_TURN | 400 | 결재 순서 아님 |
| ALREADY_PROCESSED | 400 | 이미 처리된 결재 |
| DOCUMENT_NOT_IN_PROGRESS | 400 | 결재 진행 중 아닌 문서 처리 시도 |
| CANNOT_WITHDRAW | 400 | 회수 불가 (이미 처리됨) |
| CANNOT_REDRAFT | 400 | 재기안 불가 상태 |
| INVALID_APPROVAL_LINE | 400 | 결재선 구성 오류 (결재자 없음 등) |
| DUPLICATE_APPROVER | 400 | 동일 결재자 중복 |
| REJECTION_REASON_TOO_SHORT | 400 | 반려 사유 10자 미만 |
| DELEGATION_NOT_FOUND | 404 | 위임 미존재 |
| DELEGATION_OVERLAP | 400 | 위임 기간 중복 |
| SELF_DELEGATION | 400 | 본인 위임 시도 |
| DELEGATE_ALREADY_DELEGATING | 400 | 수임자가 이미 위임 중 |
| ALREADY_EXPIRED | 400 | 만료된 위임 취소 시도 |
| NOT_DELEGATION_OWNER | 403 | 위임 소유자 아님 |
| PAST_START_DATE | 400 | 위임 시작일이 과거 |
| FORBIDDEN | 403 | 보안등급 접근 불가 |
| TEMPLATE_NOT_FOUND | 404 | 문서 양식 미존재 |
| TEMPLATE_NAME_DUPLICATED | 409 | 양식명 중복 |
| TEMPLATE_IN_USE | 400 | 사용 중인 양식 삭제 시도 |
| LINE_TEMPLATE_NOT_FOUND | 404 | 결재선 템플릿 미존재 |
| ATTACHMENT_NOT_READY | 400 | 스캔 PENDING 첨부 전송 |
| INFECTED_ATTACHMENT | 400 | 감염 첨부파일 전송 |
| INFECTED_FILE | 400 | 감염 파일 다운로드 |
| FILE_NOT_FOUND | 404 | 파일 미존재 |
| FILE_SIZE_EXCEEDED | 400 | 파일 크기 초과 |
| FILE_TYPE_NOT_ALLOWED | 400 | 허용되지 않는 확장자 |

---

## 8. 오픈 이슈

| # | 이슈 | 영향도 | 현재 상태 |
|---|------|--------|----------|
| 1 | 공인전자문서 법적 범위 (전자서명법 적용 여부) | High | 미결 — 법무팀 확인 필요, 공인인증 시 외부 CA 연동 |
| 2 | 감사 로그 보관 기간 | High | 미결 — 법무/컴플라이언스 확인 필요 |
| 3 | 결재선 조건 기반 자동 생성 엔진 상세 설계 | High | 미결 — 금액/부서 조건 로직 별도 설계 필요 |
| 4 | 전자서명 필수 여부 | Medium | 미결 — 조직 정책에 따라 선택적 적용 여부 결정 필요 |
| 5 | 후결(사후 승인) 법적 유효성 | Medium | 미결 — 법무 확인 필요 |
| 6 | PDF 변환 라이브러리 선택 | Medium | 미결 — iText vs Flying Saucer vs 외부 서비스 |
| 7 | 첨부파일 크기 제한 (현재 미정, 50MB 임시 적용) | Medium | 미결 — 조직 정책 결정 필요 |
| 8 | 외부 ERP 연동 | Medium | 비포함 (추후 확장) |
| 9 | AI 결재 추천 | Low | 비포함 (추후 확장) |

---

## 9. 변경 이력

| 버전 | 변경 내용 | 일자 |
|------|----------|------|
| v1.0 | 최초 작성 | - |
| v2.0 | 1차 검증 반영: 멀티 테넌트 추가, API 전 항목 완성, 상태 머신 명확화, 테이블 대폭 보완, 상신/재기안/선결/전결/위임 CRUD/양식/결재선 템플릿/서명 검증/감사 로그/PDF API 추가 | - |
| v3.0 | 2차 검증 반영: approval_referees 테이블 추가, approval_lines에 processed_by/delegated_by 필드 추가, approval_lines status에 PRE_APPROVED 추가, 병렬 결재 전원 승인 완료 조건 명시, 반려 시 나머지 라인 전부 REJECTED 처리 명시, 문서 수정 시 결재선/참조자/첨부 함께 수정 가능 명시, 문서 삭제 NOT_CREATOR 에러 추가, 승인 Response에 lineStatus/docStatus 분리, LINE_NOT_FOUND/DOCUMENT_NOT_IN_PROGRESS 에러 추가, 위임 시작일 과거 검증(PAST_START_DATE), 위임 소유자 검증(NOT_DELEGATION_OWNER), 첨부파일 업로드/스캔/다운로드 API 추가, 첨부 바이러스 스캔 정책 추가, doc_templates UNIQUE 제약 추가, approval_attachments scan_result 필드 추가, approval_line_templates updated_at 추가, 문서 양식 삭제 API 추가(TEMPLATE_IN_USE), 결재선 템플릿 수정 API 추가, 감사 로그 응답에 docTitle 추가, 전자서명 필수 여부 Open Question 추가, 첨부 크기 제한 Open Question 추가 | - |
