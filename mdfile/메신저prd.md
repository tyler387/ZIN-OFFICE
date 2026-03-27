# PRD — 메신저 (Messenger) v3.0 [AI 컨텍스트용]

> 스택: Spring Boot 3.x / Java 17 / JWT / Redis / PostgreSQL / STOMP WebSocket
> 대상: ZIN Corporation 200인 | 멀티 테넌트: Row-level (tenant_id)

---

## 1. 핵심 정책

| 항목 | 값 |
|------|----|
| 실시간 통신 | STOMP over WebSocket, TLS 1.2 이상 |
| WebSocket 인증 | CONNECT 프레임 `Authorization: Bearer {accessToken}` 헤더, 만료 시 ERROR 프레임 후 연결 끊김 |
| Access Token 만료 처리 | WebSocket 유지 중 만료 시 `/user/queue/errors` 에러 수신 → 클라이언트가 REST /auth/refresh 후 재연결 |
| 메시지 저장 | DB 영구 저장 (보관 기간 Open Question) |
| 메시지 삭제 | Soft Delete (is_deleted=true), "삭제된 메시지입니다" 표시 |
| 메시지 수정 | 수정 이력 message_edits 저장, is_edited=true 플래그 |
| 채팅방 유형 | DM / GROUP / DEPARTMENT / CHANNEL |
| DM 중복 방지 | (tenant_id, user_a_id, user_b_id) UNIQUE — user_a < user_b 정렬 고정 |
| 읽음 처리 | message_reads 테이블, lastReadMessageId 기반 일괄 처리 |
| 안 읽은 메시지 수 | Redis 카운터 캐싱 (채팅방 입장 시 초기화) |
| 파일 업로드 | 최대 50MB, 허용 확장자: pdf/docx/xlsx/pptx/png/jpg/jpeg/gif/zip |
| 파일 다운로드 URL | 인증 기반, 만료 1시간 |
| 공지톡 | 관리자 전용, 전체/부서 대상, 읽음 필수 기록 |
| 검색 | DB LIKE 기반, keyword 최소 2자, 삭제 메시지 검색 제외 |
| 멀티 디바이스 | 동일 계정 다중 연결 허용, 읽음 상태 계정 단위 동기화 |
| OWNER 퇴장 | 다른 멤버에게 OWNER 위임 후 퇴장 가능 (멤버 없으면 채팅방 INACTIVE) |
| 사용자 탈퇴 | 메시지 유지, sender_id null, "알 수 없음" 표시 |

---

## 2. 기능 요구사항

### 채팅방
1. 채팅방 유형: DM / GROUP / DEPARTMENT / CHANNEL
2. DM: (tenant_id, user_a_id, user_b_id) UNIQUE로 중복 생성 차단
3. GROUP / CHANNEL: 생성 시 생성자가 OWNER 자동 지정
4. DEPARTMENT: Org PRD 부서 생성 시 자동 생성, 부서 INACTIVE 시 채팅방 INACTIVE
5. 채팅방 목록: 마지막 메시지 기준 내림차순, 안 읽은 메시지 수 포함
6. 채팅방 나가기: DM 퇴장 불가, GROUP/CHANNEL 퇴장 가능
7. OWNER 퇴장: 다른 멤버에게 위임 후 퇴장, 멤버 없으면 채팅방 INACTIVE
8. 퇴장 후 재초대 가능 (left_at 갱신)
9. 멤버 초대: OWNER만 가능

### 메시지
10. 텍스트 / 파일 메시지 전송 (STOMP 우선, REST fallback)
11. 메시지 수정: 본인만, 수정 이력 message_edits 저장, is_edited=true
12. 메시지 삭제: 본인 또는 채팅방 OWNER, Soft Delete
13. 답장(reply): parent_message_id 참조, 원본 삭제 시 "삭제된 메시지" 표시 유지
14. 중복 전송 방지: idempotency_key UNIQUE, 중복 시 기존 메시지 반환
15. WebSocket 연결 끊김 후 재접속 시 before 커서로 미수신 메시지 동기화
16. 삭제된 메시지 content는 null 처리, is_deleted=true 유지

### 파일
17. 업로드 시 채팅방 멤버 여부 서버 검증
18. 파일 메시지 삭제 시 실제 파일 보존 (Open Question #3)
19. 다운로드 URL: 인증 기반, 만료 1시간, 채팅방 멤버만 접근 가능
20. chat_files는 message_id와 1:1 연결

### 읽음 확인
21. DM: 상대방 읽음 시 "읽음" 표시
22. GROUP/DEPARTMENT/CHANNEL: 읽은 인원 수, 상세 목록 조회
23. 읽음 처리: lastReadMessageId 기준 해당 방의 이전 메시지 일괄 read 처리
24. 안 읽은 메시지 수: Redis 카운터, 채팅방 입장 시 0으로 초기화
25. 멀티 디바이스 읽음 동기화: 읽음 처리 시 동일 계정 다른 디바이스에 WebSocket 이벤트 전송

### 공지톡
26. 시스템 관리자만 생성 가능 (permission_key: chat:notice:write)
27. 대상: 전체(ALL) / 특정 부서(DEPARTMENT)
28. message_type=NOTICE, 일반 메시지와 UI 구분
29. 읽음 필수 기록 (message_reads)
30. 공지 발송 시 대상 사용자 `/user/queue/notice` WebSocket 이벤트 전송

### 검색
31. keyword 최소 2자 필수
32. 메시지 내용 검색 (is_deleted=false만), 채팅방 단위 / 전체
33. 파일명 검색 (LIKE)
34. 페이징 (default 20, max 100)
35. 테넌트 격리 필수

### 권한
36. 일반 사용자: 메시지 송수신, 파일 업로드, GROUP/CHANNEL 생성
37. 채팅방 OWNER: 멤버 초대/강퇴, OWNER 위임, 타인 메시지 삭제
38. 시스템 관리자: 공지톡 발송
39. Admin PRD RBAC 연계 (chat:read, chat:write, chat:notice:write)

---

## 3. 데이터 테이블

### chat_rooms
```
room_id     PK UUID
tenant_id   FK → tenants
room_type   enum DM/GROUP/DEPARTMENT/CHANNEL
name        varchar(200) nullable  -- DM은 null
dept_id     FK → departments nullable  -- DEPARTMENT 타입 시
owner_id    FK → users nullable  -- GROUP/CHANNEL OWNER
user_a_id   FK → users nullable  -- DM 전용 (user_a < user_b UUID 정렬)
user_b_id   FK → users nullable  -- DM 전용
is_active   boolean default true
created_at  datetime
updated_at  datetime
```

> UNIQUE: (tenant_id, user_a_id, user_b_id) WHERE room_type='DM' — DM 중복 방지
> user_a_id < user_b_id UUID 문자열 정렬 강제 (애플리케이션 레벨)

### chat_room_members
```
room_id     FK → chat_rooms  -- PK(room_id, user_id)
user_id     FK → users
role        enum OWNER/MEMBER
joined_at   datetime
left_at     datetime nullable  -- null이면 현재 멤버
```

> DM 타입은 left_at 업데이트 불가

### chat_messages
```
message_id        PK UUID
room_id           FK → chat_rooms
sender_id         FK → users nullable  -- 탈퇴 사용자는 null
message_type      enum TEXT/FILE/NOTICE
content           text nullable  -- 삭제 시 null, FILE 타입 null 가능
parent_message_id FK → chat_messages nullable
is_deleted        boolean default false
is_edited         boolean default false
idempotency_key   varchar(100) nullable  -- UNIQUE per tenant
created_at        datetime
updated_at        datetime
```

### message_edits
```
edit_id     PK bigint auto
message_id  FK → chat_messages
old_content text
edited_by   FK → users
edited_at   datetime
```

### message_reads
```
message_id  FK → chat_messages  -- PK(message_id, user_id)
user_id     FK → users
read_at     datetime
```

### chat_files
```
file_id      PK UUID
message_id   FK → chat_messages UNIQUE
tenant_id    FK → tenants
file_name    varchar(500)
file_size    bigint  -- bytes
file_path    varchar(1000)
content_type varchar(200)  -- MIME type
is_deleted   boolean default false  -- [추가] 파일 삭제 추적
uploaded_at  datetime
```

### notice_targets
```
notice_id   FK → chat_messages  -- PK(notice_id, target_type, target_id)
target_type enum ALL/DEPARTMENT
target_id   varchar(100) nullable  -- DEPARTMENT인 경우 dept_id
```

---

## 4. WebSocket (STOMP)

> 엔드포인트: `ws(s)://groupware.zin.com/ws`
> 인증: CONNECT 프레임 `Authorization: Bearer {accessToken}`
> Token 만료: 서버가 `/user/queue/errors` 에러 전송 후 연결 종료 → 클라이언트 REST /auth/refresh 후 재연결

### 구독 토픽
| 토픽 | 설명 |
|------|------|
| `/topic/room.{roomId}` | 채팅방 메시지 수신 |
| `/topic/room.{roomId}.read` | 읽음 상태 변경 이벤트 |
| `/topic/room.{roomId}.members` | 멤버 입퇴장 이벤트 `[추가]` |
| `/user/queue/notice` | 공지톡 수신 (개인) |
| `/user/queue/sync` | 멀티 디바이스 읽음 동기화 이벤트 `[추가]` |
| `/user/queue/errors` | 에러 알림 (토큰 만료 등) |

### 메시지 전송 (STOMP SEND)
```json
// Destination: /app/chat.send
{
  "roomId": "uuid",
  "content": "안녕하세요",
  "messageType": "TEXT",
  "parentMessageId": null,
  "idempotencyKey": "client-uuid"
}
```

### 읽음 처리 (STOMP SEND)
```json
// Destination: /app/chat.read
{
  "roomId": "uuid",
  "lastReadMessageId": "uuid"  -- 이 메시지 포함 이전 전체 읽음 처리
}
```

### 서버 → 클라이언트 메시지 페이로드 (`/topic/room.{roomId}`)
```json
{
  "messageId": "uuid",
  "roomId": "uuid",
  "senderId": "uuid",
  "senderName": "홍길동",
  "messageType": "TEXT",
  "content": "안녕하세요",
  "parentMessageId": null,
  "isDeleted": false,
  "isEdited": false,
  "createdAt": "2025-01-01T12:00:00Z"
}
```

### 읽음 이벤트 페이로드 (`/topic/room.{roomId}.read`)
```json
{
  "userId": "uuid",
  "lastReadMessageId": "uuid",
  "readAt": "2025-01-01T12:00:00Z"
}
```

### 멤버 이벤트 페이로드 (`/topic/room.{roomId}.members`) `[추가]`
```json
{
  "eventType": "JOINED",  -- JOINED / LEFT / OWNER_CHANGED
  "userId": "uuid",
  "userName": "홍길동"
}
```

---

## 5. REST API

> 모든 API: `Authorization: Bearer {accessToken}`

### 5.1 채팅방

#### GET /api/chat/rooms — 채팅방 목록
```json
// Query: page(default:0), size(default:20)
// 200
{
  "rooms": [
    {
      "roomId": "uuid",
      "roomType": "DM",
      "name": "홍길동",
      "lastMessage": "안녕하세요",
      "lastMessageAt": "2025-01-01T12:00:00Z",
      "unreadCount": 3
    }
  ],
  "page": 0,
  "totalElements": 12
}
```

#### POST /api/chat/rooms — 채팅방 생성
```json
// Request
{
  "roomType": "GROUP",
  "name": "프로젝트 A",
  "memberIds": ["uuid-1", "uuid-2"]
}
// DM: memberIds에 상대방 userId 1개만

// 201
{ "roomId": "uuid", "message": "채팅방이 생성되었습니다." }

// 400 INVALID_ROOM_TYPE
// 400 DM_REQUIRES_ONE_MEMBER (DM인데 memberIds != 1)
// 409 DM_ALREADY_EXISTS
```

#### GET /api/chat/rooms/{roomId} — 채팅방 상세
```json
// 200
{
  "roomId": "uuid",
  "roomType": "GROUP",
  "name": "프로젝트 A",
  "memberCount": 5,
  "members": [{ "userId": "uuid", "name": "홍길동", "role": "OWNER" }],
  "pinnedNotice": { "messageId": "uuid", "content": "공지 내용" }
}

// 403 NOT_ROOM_MEMBER
// 404 ROOM_NOT_FOUND
```

#### POST /api/chat/rooms/{roomId}/members — 멤버 초대 `[추가]`
```json
// Request (OWNER만 가능)
{ "userIds": ["uuid-1", "uuid-2"] }

// 200
{ "message": "멤버가 초대되었습니다." }

// 400 ALREADY_MEMBER
// 403 NOT_OWNER
// 404 ROOM_NOT_FOUND
```

#### DELETE /api/chat/rooms/{roomId}/members/{userId} — 멤버 강퇴 `[추가]`
```json
// OWNER만 가능, 자기 자신 강퇴 불가

// 200
{ "message": "멤버가 강퇴되었습니다." }

// 400 CANNOT_KICK_SELF
// 403 NOT_OWNER
// 404 MEMBER_NOT_FOUND
```

#### PUT /api/chat/rooms/{roomId}/owner — OWNER 위임 `[추가]`
```json
// Request (현재 OWNER만)
{ "newOwnerId": "uuid" }

// 200
{ "message": "OWNER가 위임되었습니다." }

// 403 NOT_OWNER
// 404 MEMBER_NOT_FOUND
```

#### DELETE /api/chat/rooms/{roomId}/leave — 채팅방 퇴장
```json
// 200
{ "message": "채팅방에서 퇴장했습니다." }

// 400 DM_CANNOT_LEAVE
// 400 OWNER_CANNOT_LEAVE (위임 먼저 필요)
```

---

### 5.2 메시지

#### GET /api/chat/rooms/{roomId}/messages — 메시지 목록 (커서 기반)
```json
// Query: before(messageId), size(default:50, max:100)
// 200
{
  "messages": [
    {
      "messageId": "uuid",
      "senderId": "uuid",
      "senderName": "홍길동",
      "messageType": "TEXT",
      "content": "안녕하세요",
      "isDeleted": false,
      "isEdited": true,
      "unreadCount": 3,
      "parentMessage": { "messageId": "uuid", "content": "원본" },
      "createdAt": "2025-01-01T12:00:00Z"
    }
  ],
  "hasMore": true
}

// 403 NOT_ROOM_MEMBER
```

#### POST /api/chat/messages — 메시지 전송 (REST fallback)
```json
// Request
{
  "roomId": "uuid",
  "content": "안녕하세요",
  "messageType": "TEXT",
  "parentMessageId": null,
  "idempotencyKey": "client-uuid"
}

// 201
{ "messageId": "uuid", "createdAt": "2025-01-01T12:00:00Z" }

// 403 NOT_ROOM_MEMBER
// 409 DUPLICATE_MESSAGE (기존 messageId 반환)
```

#### PUT /api/chat/messages/{messageId} — 메시지 수정
```json
// Request
{ "content": "수정된 내용" }

// 200
{ "message": "메시지가 수정되었습니다." }

// 400 DELETED_MESSAGE
// 400 FILE_MESSAGE_CANNOT_EDIT (FILE 타입 수정 불가) `[추가]`
// 403 NOT_MESSAGE_OWNER
// 404 MESSAGE_NOT_FOUND
```

#### DELETE /api/chat/messages/{messageId} — 메시지 삭제 (Soft Delete)
```json
// 200
{ "message": "메시지가 삭제되었습니다." }

// 403 FORBIDDEN (본인 또는 OWNER만)
// 404 MESSAGE_NOT_FOUND
```

---

### 5.3 파일

#### POST /api/chat/rooms/{roomId}/files — 파일 업로드
```json
// Request: multipart/form-data, file

// 201
{
  "fileId": "uuid",
  "messageId": "uuid",
  "fileName": "report.pdf",
  "fileSize": 1048576,
  "downloadUrl": "https://...",
  "expiresAt": "2025-01-01T13:00:00Z"
}

// 400 FILE_SIZE_EXCEEDED
// 400 FILE_TYPE_NOT_ALLOWED
// 403 NOT_ROOM_MEMBER
```

#### GET /api/chat/files/{fileId}/download — 다운로드 URL 발급
```json
// 200
{ "downloadUrl": "https://...", "expiresAt": "2025-01-01T13:00:00Z" }

// 401 UNAUTHORIZED
// 403 NOT_ROOM_MEMBER
// 404 FILE_NOT_FOUND
```

#### GET /api/chat/rooms/{roomId}/files — 채팅방 파일 목록 `[추가]`
```json
// Query: page(default:0), size(default:20, max:100)
// 200
{
  "files": [
    {
      "fileId": "uuid",
      "fileName": "report.pdf",
      "fileSize": 1048576,
      "uploadedBy": "홍길동",
      "uploadedAt": "2025-01-01T12:00:00Z",
      "downloadUrl": "https://...",
      "expiresAt": "2025-01-01T13:00:00Z"
    }
  ],
  "page": 0,
  "totalElements": 5
}

// 403 NOT_ROOM_MEMBER
```

---

### 5.4 읽음 확인

#### GET /api/chat/messages/{messageId}/reads — 읽음 사용자 목록
```json
// 200
{
  "readCount": 5,
  "totalCount": 10,
  "readers": [{ "userId": "uuid", "name": "홍길동", "readAt": "2025-01-01T12:00:00Z" }]
}

// 403 NOT_ROOM_MEMBER
```

---

### 5.5 공지톡

#### POST /api/chat/notices — 공지톡 발송 (ADMIN)
```json
// Request
{
  "content": "전사 공지입니다.",
  "targetType": "ALL",
  "targetDeptId": null
}

// 201
{ "messageId": "uuid", "message": "공지가 발송되었습니다." }

// 400 TARGET_REQUIRED
// 403 FORBIDDEN
```

#### GET /api/chat/notices/{messageId}/reads — 공지 읽음 현황
```json
// Query: page(default:0), size(default:50)
// 200
{
  "totalTarget": 200,
  "readCount": 150,
  "unreadCount": 50,
  "readers": [{ "userId": "uuid", "name": "홍길동", "readAt": "2025-01-01T12:00:00Z" }],
  "page": 0,
  "totalElements": 150
}
```

---

### 5.6 검색

#### GET /api/chat/search — 메시지 / 파일 검색
```json
// Query: keyword(필수, 최소 2자), roomId(선택), type(MESSAGE/FILE, 선택),
//        page(default:0), size(default:20, max:100)
// 삭제 메시지(is_deleted=true) 검색 제외

// 200
{
  "results": [
    {
      "type": "MESSAGE",
      "messageId": "uuid",
      "roomId": "uuid",
      "roomName": "프로젝트 A",
      "content": "안녕하세요",
      "senderName": "홍길동",
      "createdAt": "2025-01-01T12:00:00Z"
    }
  ],
  "page": 0,
  "totalElements": 5
}

// 400 KEYWORD_TOO_SHORT
```

---

## 6. 주요 에러 코드

| 코드 | HTTP | 설명 |
|------|------|------|
| ROOM_NOT_FOUND | 404 | 채팅방 미존재 |
| NOT_ROOM_MEMBER | 403 | 채팅방 멤버 아님 |
| NOT_OWNER | 403 | OWNER 권한 필요 |
| DM_ALREADY_EXISTS | 409 | DM 중복 생성 |
| DM_CANNOT_LEAVE | 400 | DM 퇴장 불가 |
| DM_REQUIRES_ONE_MEMBER | 400 | DM 생성 시 memberIds != 1 |
| OWNER_CANNOT_LEAVE | 400 | OWNER 위임 후 퇴장 필요 |
| ALREADY_MEMBER | 400 | 이미 채팅방 멤버 |
| CANNOT_KICK_SELF | 400 | 자기 자신 강퇴 불가 |
| MEMBER_NOT_FOUND | 404 | 채팅방 멤버 아님 (강퇴/위임 시) |
| MESSAGE_NOT_FOUND | 404 | 메시지 미존재 |
| NOT_MESSAGE_OWNER | 403 | 본인 메시지 아님 |
| DELETED_MESSAGE | 400 | 삭제된 메시지 수정 시도 |
| FILE_MESSAGE_CANNOT_EDIT | 400 | FILE 타입 메시지 수정 불가 |
| DUPLICATE_MESSAGE | 409 | idempotencyKey 중복 |
| FILE_SIZE_EXCEEDED | 400 | 파일 50MB 초과 |
| FILE_TYPE_NOT_ALLOWED | 400 | 허용되지 않는 확장자 |
| FILE_NOT_FOUND | 404 | 파일 미존재 |
| TARGET_REQUIRED | 400 | 공지 대상 부서 미지정 |
| KEYWORD_TOO_SHORT | 400 | 검색어 2자 미만 |
| INVALID_ROOM_TYPE | 400 | 잘못된 채팅방 유형 |

---

## 7. 오픈 이슈

| # | 이슈 | 영향도 | 현재 상태 |
|---|------|--------|----------|
| 1 | 메시지 보관 기간 (영구 vs 기간 제한) | High | 미결 — 법무/보안 정책 확인 필요 |
| 2 | 파일 저장소 (온프레미스 vs S3 호환) | High | 미결 — Admin PRD 스토리지 정책과 통일 권고 |
| 3 | 파일 메시지 삭제 시 실제 파일 삭제 여부 | Medium | 현재 보존 정책. 스토리지 비용 고려 결정 필요 |
| 4 | 메시지 E2E 암호화 적용 여부 | High | 미결 — 적용 시 서버 측 검색 불가, 구조 전면 변경 필요 |
| 5 | 채널 공개/비공개 정책 | Medium | 미결 — 비공개 채널은 초대 기반 구조 설계 필요 |
| 6 | 알림 시스템 연동 (푸시/이메일) | Medium | 미결 — 별도 Notification PRD 설계 필요 |
| 7 | Elasticsearch 도입 여부 | Medium | 현재 DB LIKE 기반. 200인 불필요, 확장 시 검토 |
| 8 | 오프라인 메시지 큐 처리 | Medium | 미결 — 클라이언트 재전송 정책 상세 설계 필요 |

---

## 8. 변경 이력

| 버전 | 변경 내용 | 일자 |
|------|----------|------|
| v1.0 | 최초 작성 | - |
| v2.0 | 1차 검증 반영: STOMP 스펙 추가, WebSocket 인증 명시, REST API 전 항목 완성, 채팅방 유형 확정, DM 퇴장 불가/OWNER 위임 정책, reply 기능, idempotency_key, message_edits/notice_targets 테이블 추가, 파일 다운로드 URL 만료 명시, 읽음 REST API, 에러 코드 정의 | - |
| v3.0 | 2차 검증 반영: DM 중복 방지 UNIQUE 제약 설계 추가(user_a/user_b 정렬), Access Token 만료 WebSocket 처리 흐름 명시, 멤버 초대/강퇴/OWNER 위임 API 추가, 채팅방 파일 목록 API 추가, 멤버 입퇴장 WebSocket 토픽 추가(/topic/room.{roomId}.members), 멀티 디바이스 읽음 동기화 토픽 추가(/user/queue/sync), 안 읽은 메시지 수 Redis 카운터 정책 명시, 읽음 처리 lastReadMessageId 일괄 방식 명시, FILE 타입 메시지 수정 불가 정책 추가, 삭제 메시지 검색 제외 명시, 메시지 목록 응답에 unreadCount/isEdited 추가, chat_files is_deleted 필드 추가, DM 생성 시 memberIds 검증 에러 추가, 공지 읽음 현황 페이징 추가 | - |
