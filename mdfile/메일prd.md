# PRD — 메일 (Mail) v3.0 [AI 컨텍스트용]

> 스택: Spring Boot 3.x / Java 17 / JWT / Redis / PostgreSQL / SMTP
> 대상: ZIN Corporation 200인 | 멀티 테넌트: Row-level (tenant_id)

---

## 1. 핵심 정책

| 항목 | 값 |
|------|----|
| 발송 방식 | SMTP + TLS 1.2 이상, DKIM 서명, SPF/DMARC 준수 |
| 스레드 | MESSAGE_ID / IN_REPLY_TO / REFERENCES 기반 그룹화 |
| 메일 삭제 | Soft Delete (status=DELETED → TRASH), 30일 후 Hard Delete 배치 |
| 임시저장 | 30초 자동저장, 수동저장, status=DRAFT, 전송 완료 시 자동 삭제 |
| 첨부파일 | 일반 최대 25MB, 대용량은 Presigned URL 방식, 바이러스 스캔 필수 (PENDING→CLEAN/INFECTED) |
| 파일 다운로드 | 인증 기반 Presigned URL, 만료 1시간, INFECTED 파일 다운로드 차단 |
| 미발송 첨부파일 | 업로드 후 24시간 내 메일 전송 없으면 고아 파일 배치 삭제 |
| 예약 발송 | 큐 저장, 실패 시 최대 3회 exponential backoff 재시도, 최종 실패 시 발신자 알림 |
| 검색 | DB Full-text 인덱스 기반, keyword 최소 2자, DRAFT/DELETED 메일 검색 제외 |
| 스팸 | 자동 분류 + 사용자 신고, SPAM 폴더 자동 이동, 오탐 복구 가능 |
| 수신확인 | read receipt 요청 시 트래킹, 수신자 거부 옵션 제공, 발신자만 조회 가능 |
| 사용자 quota | 기본 5GB, 80%/90% 도달 시 경고 알림, 초과 시 수신 차단 |
| 멀티 테넌트 | Row-level (tenant_id) |
| 공유 메일함 | READ / WRITE / ADMIN 권한, 멤버 제거 API 포함 |
| 자동분류 | 발신자/도메인/제목 키워드 조건, 폴더 이동/태그/삭제/전달 액션, order_no 우선순위 |
| 태그 수정 | 태그명/색상 수정 API 제공 |
| 스팸 신고 | POST /api/mail/{mailId}/spam, 복구 POST /api/mail/{mailId}/not-spam |
| 차단 발신자 | GET/POST/DELETE /api/mail/blocked-senders |

---

## 2. 기능 요구사항

### 메일함 구조
1. 기본 폴더: INBOX / SENT / DRAFT / TRASH / SPAM — 삭제/수정 불가
2. 사용자 정의 폴더: 생성/수정/삭제, 계층 구조 허용
3. 폴더별 미읽음 메일 수 표시
4. 메일 상태: UNREAD / READ / STARRED / IMPORTANT / DELETED / SPAM / DRAFT

### 메일 작성 / 전송
5. 수신자 To / CC / BCC 입력, 주소록/조직도 자동완성
6. HTML 리치 텍스트 에디터 제공
7. SMTP 발송, DKIM 서명, SPF/DMARC 준수
8. 전송 즉시 SENT 폴더 저장, Draft 자동 삭제
9. 수신확인 요청 옵션 — 수신자 거부 가능
10. 외부 수신자 발송 지원

### 임시저장
11. 30초 자동저장 (status=DRAFT)
12. 수동저장 지원
13. 전송 완료 시 Draft 자동 삭제

### 스레드
14. 모든 메일은 thread_id로 그룹화
15. MESSAGE_ID / IN_REPLY_TO / REFERENCES 헤더 기반 연결
16. 답장 / 전체답장 시 동일 thread_id 유지
17. 스레드 내 최신 메일 기준 정렬

### 첨부파일
18. 일반 첨부: 최대 25MB
19. 대용량: 25MB 초과 시 Presigned URL 링크 방식
20. 업로드 즉시 바이러스 스캔 (비동기), PENDING→CLEAN/INFECTED
21. 전송 시 CLEAN 상태만 허용, INFECTED 다운로드 차단
22. 허용 확장자 화이트리스트 (exe/bat/sh/cmd 등 차단)
23. 미사용 첨부파일: 업로드 후 24시간 내 메일 전송 없으면 배치 삭제

### 검색
24. Full-text 검색: 제목 / 본문 / 발신자 / 수신자
25. 필터: 날짜 범위 / 발신자 / 첨부 포함 여부 / 폴더
26. DRAFT / DELETED(TRASH) 메일 검색 결과 제외
27. 스레드 단위 그룹핑, 결과 페이징 (default 20, max 100)
28. keyword 최소 2자

### 스팸 / 차단
29. 사용자 스팸 신고 → SPAM 폴더 이동, 차단 리스트 추가 선택
30. 스팸 오탐 복구: SPAM → INBOX 이동
31. 서버 측 스팸 자동 분류
32. 차단 발신자 목록 CRUD

### 메일함 공유 / 그룹메일
33. 공유 메일함 생성 (대표 주소)
34. 멤버 권한: READ / WRITE / ADMIN
35. WRITE: 발송/답장, ADMIN: 멤버 추가/제거/권한 변경
36. 멤버 제거 API 제공

### 수신확인
37. 발신 시 read receipt 요청 옵션
38. 수신자 열람 시 mail_read_receipts 기록
39. 수신자는 거부 가능
40. 발신자만 수신확인 현황 조회 가능

### 예약 발송
41. 예약 시간 지정 → scheduled_mails 큐 저장
42. 발송 전 취소 가능
43. 실패 시 최대 3회 exponential backoff 재시도, 최종 실패 시 발신자 알림

### 태그 / 중요메일
44. 태그 CRUD (이름/색상 수정 포함)
45. 메일에 태그 적용 / 제거
46. STARRED / IMPORTANT 상태 토글

### 자동분류
47. 조건: 발신자 / 도메인 / 제목 키워드
48. 액션: 폴더 이동 / 태그 적용 / 삭제 / 전달
49. order_no 우선순위, 수신 시 순서대로 평가
50. 규칙 활성화/비활성화 (is_active)
51. 규칙 수정 API 제공

### 삭제 정책
52. 삭제: status=DELETED, TRASH 폴더 이동
53. TRASH 30일 후 Hard Delete 배치
54. 영구 삭제: TRASH 내 메일만 즉시 삭제 가능

### Quota
55. 기본 5GB, used_bytes는 메일 본문+첨부 합산
56. 80% 도달 시 경고 알림, 90% 도달 시 재경고, 100% 초과 시 수신 차단

---

## 3. 데이터 테이블

### mails
```
mail_id           PK UUID
tenant_id         FK → tenants
thread_id         varchar(500) FK → mail_threads
subject           varchar(1000)
body              text
body_type         enum HTML/PLAIN
sender_id         FK → users nullable  -- 외부 발신 시 null
sender_email      varchar(255)  -- 실제 발신 주소
status            enum UNREAD/READ/STARRED/IMPORTANT/DELETED/SPAM/DRAFT
folder_id         FK → mail_folders nullable
is_scheduled      boolean default false
scheduled_at      datetime nullable
request_receipt   boolean default false  -- 수신확인 요청 여부
message_id_header varchar(500) UNIQUE  -- RFC 2822 MESSAGE-ID
in_reply_to       varchar(500) nullable
references_header text nullable
created_at        datetime
updated_at        datetime
```

### mail_recipients
```
id       PK bigint auto
mail_id  FK → mails
user_id  FK → users nullable
email    varchar(255)
type     enum TO/CC/BCC
read_at  datetime nullable
```

### mail_attachments
```
file_id       PK UUID
mail_id       FK → mails nullable  -- 사전 업로드 시 null, 전송 후 연결
tenant_id     FK → tenants
file_name     varchar(500)
file_size     bigint
file_path     varchar(1000)
content_type  varchar(200)
is_large      boolean default false
scan_result   enum PENDING/CLEAN/INFECTED default PENDING
uploaded_at   datetime
linked_at     datetime nullable  -- 메일과 연결된 시각
```

> `mail_id IS NULL AND linked_at IS NULL AND uploaded_at < NOW()-24h` → 배치 고아 파일 삭제 대상

### mail_folders
```
folder_id  PK UUID
tenant_id  FK → tenants
user_id    FK → users
parent_id  FK self nullable
name       varchar(200)
is_system  boolean default false
order_no   int default 0
created_at datetime
updated_at datetime
```

> UNIQUE: (user_id, parent_id, name)

### mail_threads
```
thread_id    varchar(500) PK
tenant_id    FK → tenants
subject      varchar(1000)
mail_count   int default 1
last_mail_at datetime
created_at   datetime
```

### mail_tags
```
tag_id     PK UUID
tenant_id  FK → tenants
user_id    FK → users
name       varchar(100)
color      varchar(7) nullable
created_at datetime
updated_at datetime  -- [추가] 수정 이력
```

> UNIQUE: (user_id, name)

### mail_tag_mappings
```
mail_id FK → mails  -- PK(mail_id, tag_id)
tag_id  FK → mail_tags
```

### mail_read_receipts
```
id           PK bigint auto
mail_id      FK → mails
recipient_id FK → users
read_at      datetime
ip_address   varchar(45)
```

> UNIQUE: (mail_id, recipient_id) — 중복 수신확인 방지

### scheduled_mails
```
id            PK bigint auto
mail_id       FK → mails
tenant_id     FK → tenants
scheduled_at  datetime
status        enum PENDING/SENT/FAILED/CANCELLED
retry_count   int default 0
last_tried_at datetime nullable
created_at    datetime
```

### mail_filter_rules
```
rule_id         PK UUID
tenant_id       FK → tenants
user_id         FK → users
order_no        int
condition_type  enum SENDER/DOMAIN/SUBJECT_KEYWORD
condition_value varchar(500)
action_type     enum MOVE_FOLDER/APPLY_TAG/DELETE/FORWARD
action_value    varchar(500) nullable
is_active       boolean default true
created_at      datetime
updated_at      datetime  -- [추가]
```

### blocked_senders
```
id         PK bigint auto
tenant_id  FK → tenants
user_id    FK → users
email      varchar(255)
created_at datetime
```

> UNIQUE: (user_id, email)

### shared_mailboxes
```
mailbox_id PK UUID
tenant_id  FK → tenants
address    varchar(255) UNIQUE
name       varchar(200)
created_at datetime
updated_at datetime  -- [추가]
```

### shared_mailbox_members
```
mailbox_id FK → shared_mailboxes  -- PK(mailbox_id, user_id)
user_id    FK → users
role       enum READ/WRITE/ADMIN
created_at datetime
updated_at datetime  -- [추가] 권한 변경 이력
```

### user_mail_quotas
```
user_id      FK → users PK
tenant_id    FK → tenants
quota_bytes  bigint default 5368709120  -- 5GB
used_bytes   bigint default 0
updated_at   datetime
```

---

## 4. API

> 모든 API: `Authorization: Bearer {accessToken}`

### 4.1 메일 목록 / 조회

#### GET /api/mail/folders/{folderId}/mails — 폴더별 메일 목록
```json
// Query: page(default:0), size(default:20, max:100), status(선택)
// 200
{
  "mails": [
    {
      "mailId": "uuid",
      "threadId": "uuid",
      "subject": "프로젝트 논의",
      "senderEmail": "hong@zin.com",
      "senderName": "홍길동",
      "preview": "안녕하세요...",
      "hasAttachment": true,
      "isRead": false,
      "isStarred": false,
      "createdAt": "2025-01-01T12:00:00Z"
    }
  ],
  "page": 0,
  "totalElements": 42,
  "totalPages": 3,
  "unreadCount": 5
}

// 403 NOT_FOLDER_OWNER
// 404 FOLDER_NOT_FOUND
```

#### GET /api/mail/threads/{threadId} — 스레드 전체 조회
```json
// 200
{
  "threadId": "uuid",
  "subject": "프로젝트 논의",
  "mailCount": 3,
  "mails": [
    {
      "mailId": "uuid",
      "senderEmail": "hong@zin.com",
      "senderName": "홍길동",
      "recipients": [{ "email": "kim@zin.com", "type": "TO" }],
      "body": "<p>안녕하세요...</p>",
      "hasAttachment": true,
      "isRead": true,
      "createdAt": "2025-01-01T12:00:00Z"
    }
  ]
}

// 404 THREAD_NOT_FOUND
```

#### GET /api/mail/{mailId} — 메일 상세 조회
```json
// 열람 시 status UNREAD → READ 자동 전환
// 200
{
  "mailId": "uuid",
  "threadId": "uuid",
  "subject": "프로젝트 논의",
  "senderEmail": "hong@zin.com",
  "recipients": [{ "email": "kim@zin.com", "name": "김철수", "type": "TO" }],
  "body": "<p>안녕하세요...</p>",
  "bodyType": "HTML",
  "attachments": [{ "fileId": "uuid", "fileName": "report.pdf", "fileSize": 1048576 }],
  "isRead": true,
  "isStarred": false,
  "tags": [{ "tagId": "uuid", "name": "업무", "color": "#2E75B6" }],
  "requestReceipt": false,
  "createdAt": "2025-01-01T12:00:00Z"
}

// 403 FORBIDDEN
// 404 MAIL_NOT_FOUND
```

---

### 4.2 메일 작성 / 전송

#### POST /api/mail/send — 메일 전송
```json
// Request
{
  "to": ["kim@zin.com", "lee@external.com"],
  "cc": [],
  "bcc": [],
  "subject": "프로젝트 논의",
  "body": "<p>안녕하세요</p>",
  "bodyType": "HTML",
  "attachmentIds": ["uuid-1"],
  "requestReadReceipt": false,
  "inReplyTo": null,
  "draftId": null
}

// 201
{ "mailId": "uuid", "threadId": "uuid", "message": "메일이 전송되었습니다." }

// 400 RECIPIENT_REQUIRED
// 400 ATTACHMENT_NOT_READY (scan_result=PENDING)
// 400 INFECTED_ATTACHMENT (scan_result=INFECTED)
// 400 QUOTA_EXCEEDED
// 404 ATTACHMENT_NOT_FOUND
```

#### POST /api/mail/draft — 임시저장
```json
// Request (전 필드 선택)
{ "subject": "작성 중", "body": "<p>내용</p>", "to": ["kim@zin.com"] }

// 200 (기존 draft 업데이트) / 201 (신규)
{ "draftId": "uuid", "savedAt": "2025-01-01T12:00:00Z" }
```

#### POST /api/mail/schedule — 예약 발송
```json
// Request (send와 동일 + scheduledAt)
{
  "to": ["kim@zin.com"],
  "subject": "예약 메일",
  "body": "<p>내용</p>",
  "scheduledAt": "2025-01-02T09:00:00Z"
}

// 201
{ "mailId": "uuid", "scheduledAt": "2025-01-02T09:00:00Z", "message": "예약이 등록되었습니다." }

// 400 PAST_SCHEDULED_TIME
// 400 ATTACHMENT_NOT_READY
```

#### DELETE /api/mail/schedule/{mailId} — 예약 취소
```json
// 200
{ "message": "예약이 취소되었습니다." }

// 400 ALREADY_SENT
// 404 MAIL_NOT_FOUND
```

---

### 4.3 메일 상태 관리

#### PATCH /api/mail/{mailId}/status — 상태 변경
```json
// Request
{ "status": "STARRED" }

// 200
// 400 INVALID_STATUS
// 404 MAIL_NOT_FOUND
```

#### POST /api/mail/{mailId}/move — 폴더 이동
```json
// Request
{ "folderId": "uuid" }

// 200
// 404 MAIL_NOT_FOUND / FOLDER_NOT_FOUND
```

#### DELETE /api/mail/{mailId} — 메일 삭제 (TRASH 이동)
```json
// 200
{ "message": "메일이 휴지통으로 이동되었습니다." }

// 404 MAIL_NOT_FOUND
```

#### DELETE /api/mail/{mailId}/permanent — 영구 삭제
```json
// TRASH 내 메일만 가능
// 200
// 400 NOT_IN_TRASH
// 404 MAIL_NOT_FOUND
```

#### POST /api/mail/{mailId}/spam — 스팸 신고 `[추가]`
```json
// Request
{ "blockSender": true }  -- 차단 리스트 동시 추가 여부

// 200
{ "message": "스팸으로 신고되었습니다." }

// 404 MAIL_NOT_FOUND
```

#### POST /api/mail/{mailId}/not-spam — 스팸 복구 `[추가]`
```json
// 200
{ "message": "받은편지함으로 이동되었습니다." }

// 400 NOT_SPAM_MAIL
// 404 MAIL_NOT_FOUND
```

---

### 4.4 첨부파일

#### POST /api/mail/attachments — 사전 업로드
```json
// Request: multipart/form-data, file

// 202
{
  "fileId": "uuid",
  "fileName": "report.pdf",
  "fileSize": 1048576,
  "scanStatus": "PENDING"
}

// 400 FILE_SIZE_EXCEEDED
// 400 FILE_TYPE_NOT_ALLOWED
```

#### GET /api/mail/attachments/{fileId}/status — 스캔 상태 조회
```json
// 200
{ "fileId": "uuid", "scanStatus": "CLEAN" }
// scanStatus: PENDING / CLEAN / INFECTED
```

#### GET /api/mail/attachments/{fileId}/download — 다운로드 URL 발급
```json
// 200
{ "downloadUrl": "https://...", "expiresAt": "2025-01-01T13:00:00Z" }

// 400 INFECTED_FILE
// 401 UNAUTHORIZED
// 403 FORBIDDEN
// 404 FILE_NOT_FOUND
```

---

### 4.5 폴더 관리

#### GET /api/mail/folders — 폴더 목록 (트리)
```json
// 200
{
  "folders": [
    {
      "folderId": "uuid",
      "name": "받은편지함",
      "isSystem": true,
      "unreadCount": 5,
      "children": []
    }
  ]
}
```

#### POST /api/mail/folders — 폴더 생성
```json
// Request
{ "parentId": null, "name": "업무", "orderNo": 1 }

// 201
{ "folderId": "uuid", "message": "폴더가 생성되었습니다." }

// 409 FOLDER_NAME_DUPLICATED
```

#### PUT /api/mail/folders/{folderId} — 폴더 수정
```json
// Request
{ "name": "업무-2025", "orderNo": 2 }

// 200
// 400 SYSTEM_FOLDER_PROTECTED
// 409 FOLDER_NAME_DUPLICATED
```

#### DELETE /api/mail/folders/{folderId} — 폴더 삭제
```json
// 200
// 400 SYSTEM_FOLDER_PROTECTED
// 400 FOLDER_HAS_CHILDREN
// 400 FOLDER_HAS_MAILS
```

---

### 4.6 검색

#### GET /api/mail/search — 메일 검색
```json
// Query: keyword(필수, 최소 2자), folderId(선택), from, to,
//        dateFrom, dateTo, hasAttachment(boolean),
//        page(default:0), size(default:20, max:100)
// DRAFT/DELETED 메일 제외

// 200
{
  "results": [
    {
      "mailId": "uuid",
      "threadId": "uuid",
      "subject": "프로젝트 논의",
      "preview": "...키워드 포함...",
      "senderEmail": "hong@zin.com",
      "hasAttachment": true,
      "createdAt": "2025-01-01T12:00:00Z"
    }
  ],
  "page": 0,
  "totalElements": 12,
  "totalPages": 1
}

// 400 KEYWORD_TOO_SHORT
```

---

### 4.7 태그

#### GET /api/mail/tags — 태그 목록
```json
// 200
{ "tags": [{ "tagId": "uuid", "name": "업무", "color": "#2E75B6" }] }
```

#### POST /api/mail/tags — 태그 생성
```json
// Request
{ "name": "긴급", "color": "#C00000" }
// 201 / 409 TAG_NAME_DUPLICATED
```

#### PUT /api/mail/tags/{tagId} — 태그 수정 `[추가]`
```json
// Request
{ "name": "중요업무", "color": "#1F4E79" }

// 200
// 404 TAG_NOT_FOUND
// 409 TAG_NAME_DUPLICATED
```

#### DELETE /api/mail/tags/{tagId} — 태그 삭제
```json
// 200 (mail_tag_mappings 함께 삭제)
// 404 TAG_NOT_FOUND
```

#### POST /api/mail/{mailId}/tags — 메일 태그 적용
```json
// Request
{ "tagIds": ["uuid-1"] }
// 200 / 404 MAIL_NOT_FOUND / TAG_NOT_FOUND
```

#### DELETE /api/mail/{mailId}/tags/{tagId} — 메일 태그 제거 `[추가]`
```json
// 200
// 404 MAIL_NOT_FOUND / TAG_NOT_FOUND
```

---

### 4.8 자동분류 규칙

#### GET /api/mail/filter-rules — 규칙 목록
```json
// 200
{ "rules": [{ "ruleId": "uuid", "conditionType": "SENDER", "conditionValue": "spam@evil.com",
  "actionType": "MOVE_FOLDER", "actionValue": "folderId", "orderNo": 1, "isActive": true }] }
```

#### POST /api/mail/filter-rules — 규칙 생성
```json
// Request
{
  "conditionType": "SENDER",
  "conditionValue": "newsletter@example.com",
  "actionType": "MOVE_FOLDER",
  "actionValue": "folder-uuid",
  "orderNo": 1
}
// 201 / 400 INVALID_CONDITION / 404 FOLDER_NOT_FOUND
```

#### PUT /api/mail/filter-rules/{ruleId} — 규칙 수정 `[추가]`
```json
// Request (변경할 필드만)
{ "isActive": false, "orderNo": 2 }

// 200
// 404 RULE_NOT_FOUND
```

#### DELETE /api/mail/filter-rules/{ruleId} — 규칙 삭제
```json
// 200 / 404 RULE_NOT_FOUND
```

---

### 4.9 차단 발신자 `[추가]`

#### GET /api/mail/blocked-senders — 차단 목록 조회
```json
// 200
{ "blockedSenders": [{ "id": 1, "email": "spam@evil.com", "createdAt": "2025-01-01T12:00:00Z" }] }
```

#### POST /api/mail/blocked-senders — 차단 추가
```json
// Request
{ "email": "spam@evil.com" }
// 201 / 409 ALREADY_BLOCKED
```

#### DELETE /api/mail/blocked-senders/{id} — 차단 해제
```json
// 200 / 404 BLOCKED_SENDER_NOT_FOUND
```

---

### 4.10 수신확인

#### GET /api/mail/{mailId}/read-receipts — 수신확인 현황
```json
// 발신자만 조회 가능
// 200
{
  "totalRecipients": 5,
  "readCount": 3,
  "unreadCount": 2,
  "receipts": [{ "email": "kim@zin.com", "readAt": "2025-01-01T12:30:00Z" }]
}

// 403 NOT_MAIL_SENDER
// 404 MAIL_NOT_FOUND
```

---

### 4.11 공유 메일함

#### GET /api/mail/shared-mailboxes — 내 공유 메일함 목록
```json
// 200
{ "mailboxes": [{ "mailboxId": "uuid", "address": "sales@zin.com", "name": "영업팀", "role": "WRITE" }] }
```

#### POST /api/admin/shared-mailboxes — 생성 (ADMIN)
```json
// Request
{ "address": "support@zin.com", "name": "고객지원팀",
  "members": [{ "userId": "uuid", "role": "WRITE" }] }
// 201 / 409 ADDRESS_DUPLICATED
```

#### POST /api/admin/shared-mailboxes/{mailboxId}/members — 멤버 추가
```json
// Request
{ "userId": "uuid", "role": "READ" }
// 200 / 400 ALREADY_MEMBER / 404 MAILBOX_NOT_FOUND
```

#### PATCH /api/admin/shared-mailboxes/{mailboxId}/members/{userId} — 권한 변경 `[추가]`
```json
// Request
{ "role": "ADMIN" }
// 200 / 404 MAILBOX_NOT_FOUND / MEMBER_NOT_FOUND
```

#### DELETE /api/admin/shared-mailboxes/{mailboxId}/members/{userId} — 멤버 제거 `[추가]`
```json
// 200
// 400 CANNOT_REMOVE_LAST_ADMIN (마지막 ADMIN 제거 불가)
// 404 MAILBOX_NOT_FOUND / MEMBER_NOT_FOUND
```

---

### 4.12 Quota

#### GET /api/mail/quota — quota 조회
```json
// 200
{
  "quotaBytes": 5368709120,
  "usedBytes": 2147483648,
  "usedPercent": 40.0,
  "warningLevel": null  -- null / WARNING_80 / WARNING_90 / EXCEEDED
}
```

---

## 5. 주요 에러 코드

| 코드 | HTTP | 설명 |
|------|------|------|
| MAIL_NOT_FOUND | 404 | 메일 미존재 |
| THREAD_NOT_FOUND | 404 | 스레드 미존재 |
| FOLDER_NOT_FOUND | 404 | 폴더 미존재 |
| NOT_FOLDER_OWNER | 403 | 폴더 소유자 아님 |
| FOLDER_NAME_DUPLICATED | 409 | 동일 위치 동명 폴더 |
| FOLDER_HAS_CHILDREN | 400 | 하위 폴더 존재 시 삭제 |
| FOLDER_HAS_MAILS | 400 | 메일 존재 시 폴더 삭제 |
| SYSTEM_FOLDER_PROTECTED | 400 | 시스템 폴더 수정/삭제 불가 |
| RECIPIENT_REQUIRED | 400 | 수신자 없음 |
| ATTACHMENT_NOT_READY | 400 | 스캔 PENDING 상태 전송 |
| INFECTED_ATTACHMENT | 400 | 감염 첨부파일 전송 시도 |
| INFECTED_FILE | 400 | 감염 파일 다운로드 시도 |
| ATTACHMENT_NOT_FOUND | 404 | 첨부파일 미존재 |
| FILE_NOT_FOUND | 404 | 파일 미존재 |
| FILE_SIZE_EXCEEDED | 400 | 25MB 초과 |
| FILE_TYPE_NOT_ALLOWED | 400 | 허용되지 않는 확장자 |
| QUOTA_EXCEEDED | 400 | quota 초과 |
| PAST_SCHEDULED_TIME | 400 | 과거 시간 예약 |
| ALREADY_SENT | 400 | 이미 발송된 예약 취소 |
| NOT_IN_TRASH | 400 | TRASH 외 영구 삭제 시도 |
| NOT_SPAM_MAIL | 400 | SPAM 아닌 메일 복구 시도 |
| NOT_MAIL_SENDER | 403 | 발신자 아님 (수신확인 조회) |
| TAG_NOT_FOUND | 404 | 태그 미존재 |
| TAG_NAME_DUPLICATED | 409 | 태그명 중복 |
| RULE_NOT_FOUND | 404 | 자동분류 규칙 미존재 |
| INVALID_CONDITION | 400 | 자동분류 조건 오류 |
| KEYWORD_TOO_SHORT | 400 | 검색어 2자 미만 |
| INVALID_STATUS | 400 | 유효하지 않은 상태값 |
| ADDRESS_DUPLICATED | 409 | 공유 메일함 주소 중복 |
| MAILBOX_NOT_FOUND | 404 | 공유 메일함 미존재 |
| ALREADY_MEMBER | 400 | 이미 멤버 |
| MEMBER_NOT_FOUND | 404 | 멤버 미존재 |
| CANNOT_REMOVE_LAST_ADMIN | 400 | 마지막 ADMIN 제거 불가 |
| ALREADY_BLOCKED | 409 | 이미 차단된 발신자 |
| BLOCKED_SENDER_NOT_FOUND | 404 | 차단 항목 미존재 |

---

## 6. 오픈 이슈

| # | 이슈 | 영향도 | 현재 상태 |
|---|------|--------|----------|
| 1 | IMAP 지원 여부 vs 자체 API | High | 미결 — IMAP 지원 시 별도 IMAP 서버 운영 필요 |
| 2 | 검색엔진 Elasticsearch 도입 여부 | Medium | 현재 DB Full-text 기반. 200인 불필요, 확장 시 검토 |
| 3 | 메일 보관 기간 정책 | High | 미결 — 법무/컴플라이언스 확인 필요. 현재 TRASH 30일 후 삭제 |
| 4 | 대용량 첨부 스토리지 (온프레미스 vs S3 호환) | High | 미결 — Admin PRD / Messenger PRD 스토리지 정책과 통일 권고 |
| 5 | 외부 메일 수신 (MX 레코드 / SMTP 인바운드) | High | 미결 — 외부 수신 지원 시 인바운드 SMTP 서버 구축 필요 |
| 6 | 바이러스 스캔 서비스 선택 | Medium | 미결 — ClamAV(오픈소스) vs 상용 서비스 결정 필요 |
| 7 | quota 초과 알림 연동 방식 | Low | 미결 — Notification PRD 연계 필요 (80%/90% 경고) |
| 8 | 공유 메일함 발송 시 발신자 표시 방식 | Medium | 미결 — "홍길동 via sales@zin.com" 형태 등 정책 결정 필요 |

---

## 7. 변경 이력

| 버전 | 변경 내용 | 일자 |
|------|----------|------|
| v1.0 | 최초 작성 | - |
| v2.0 | 1차 검증 반영: REST API 전 항목 완성, 멀티 테넌트 추가, 테이블 대폭 보완, 첨부 사전 업로드/스캔 흐름 추가, 폴더 CRUD 완성, 영구 삭제 추가, 수신확인/공유 메일함/Quota/자동분류 API 추가 | - |
| v3.0 | 2차 검증 반영: 태그 수정 API 추가(PUT /tags/{tagId}), 메일 태그 제거 API 추가(DELETE /{mailId}/tags/{tagId}), 스팸 신고/복구 API 추가, 차단 발신자 CRUD API 추가, 공유 메일함 권한 변경/멤버 제거 API 추가(CANNOT_REMOVE_LAST_ADMIN), 자동분류 규칙 수정 API 추가, 메일 상세 조회 시 UNREAD→READ 자동 전환 명시, 미사용 첨부파일 24시간 배치 삭제 정책 추가, mail_attachments linked_at 필드 추가, mail_read_receipts UNIQUE 제약 추가, INFECTED_ATTACHMENT/NOT_SPAM_MAIL 에러 코드 추가, quota warningLevel 응답 필드 추가, 검색 DRAFT/DELETED 제외 명시, 공유 메일함 발송자 표시 Open Question 추가 | - |
