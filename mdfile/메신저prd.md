# PRD — 메신저 (Messenger)

| 항목 | 내용 |
|------|------|
| 문서 버전 | v4.0 (3차 검증 반영) |
| 대상 조직 | ZIN Corporation (200인) |
| 기술 스택 | Spring Boot 3.x / Java 17 / JWT / Redis / PostgreSQL / STOMP WebSocket |
| 멀티 테넌트 전략 | Row-level (tenant_id 컬럼 방식) |
| 문서 상태 | 검토 완료 |

---

## 1. 개요 (Overview)

### 1.1 기능 목적
- 사내 구성원 간 실시간 메시지 송수신 및 파일 공유 환경 제공
- 부서/채널 기반 그룹 커뮤니케이션 및 공지 전달 체계 구축

### 1.2 해결하려는 문제
- 이메일 중심 소통으로 인한 응답 지연
- 파일 공유 및 대화 이력 관리 부재
- 부서/프로젝트 단위 채널 분리 미흡
- 공지 전달 및 읽음 확인 수단 부재

---

## 2. 사용자 시나리오 (User Scenario)

### 2.1 1:1 메시지 (DM)
1. 사용자가 조직도에서 상대방 선택 후 DM 시작
2. 기존 DM 채팅방이 있으면 해당 방으로 진입, 없으면 자동 생성
3. STOMP WebSocket으로 실시간 메시지 송수신
4. 상대방이 메시지를 읽으면 "읽음" 표시
5. DM 채팅방은 퇴장 불가

### 2.2 그룹/채널 대화
1. 사용자가 GROUP 또는 CHANNEL 채팅방 생성 — 생성자가 OWNER 자동 지정
2. OWNER가 멤버 초대
3. 멤버들이 실시간으로 메시지 송수신
4. OWNER는 멤버 강퇴, OWNER 위임, 타인 메시지 삭제 가능
5. OWNER 퇴장 시 다른 멤버에게 위임 필수 — 멤버 없으면 채팅방 INACTIVE

### 2.3 파일 공유
1. 사용자가 파일 업로드 (최대 50MB, 허용 확장자 제한)
2. 서버에서 채팅방 멤버 여부 검증 후 저장
3. 파일 메시지로 채팅방에 표시
4. 수신자는 인증 기반 다운로드 URL(만료 1시간)로 다운로드

### 2.4 공지톡
1. 시스템 관리자가 공지 내용 작성 후 대상(전체 / 특정 부서) 선택
2. 발송 즉시 대상 사용자에게 `/user/queue/notice` WebSocket 이벤트 전송
3. 수신자 읽음 상태 `message_reads`에 필수 기록
4. 관리자가 공지별 읽음 현황 조회

### 2.5 WebSocket 재연결
1. Access Token 만료 시 서버가 `/user/queue/errors` 에러 프레임 전송 후 연결 종료
2. 클라이언트가 `POST /api/auth/refresh`로 토큰 재발급
3. 새 토큰으로 WebSocket 재연결
4. `before` 커서 파라미터로 미수신 메시지 동기화

---

## 3. 기능 요구사항 (Functional Requirements)

### 3.1 채팅방
1. 채팅방 유형: DM / GROUP / DEPARTMENT / CHANNEL
2. DM: `(tenant_id, user_a_id, user_b_id)` UNIQUE로 중복 생성 차단 — `user_a_id < user_b_id` UUID 문자열 정렬 강제 (애플리케이션 레벨)
3. GROUP / CHANNEL: 생성 시 생성자가 OWNER 자동 지정
4. DEPARTMENT: 조직도 PRD 부서 생성 시 자동 생성, 부서 INACTIVE 시 채팅방 INACTIVE
5. 채팅방 목록: 마지막 메시지 기준 내림차순 정렬, 안 읽은 메시지 수 포함
6. 채팅방 나가기: DM 퇴장 불가, GROUP / CHANNEL 퇴장 가능
7. OWNER 퇴장: 다른 멤버에게 위임 후 퇴장 — 멤버 없으면 채팅방 INACTIVE 처리
8. 퇴장 후 재초대 가능 (`left_at` 갱신)
9. 멤버 초대: OWNER만 가능

### 3.2 메시지
10. 텍스트 / 파일 메시지 전송 (STOMP 우선, REST fallback)
11. 메시지 수정: 본인만 가능, 수정 이력 `message_edits` 저장, `is_edited=true` 플래그 설정
12. FILE 타입 메시지 수정 불가
13. 메시지 삭제: 본인 또는 채팅방 OWNER만 가능, Soft Delete (`is_deleted=true`, `content=null`)
14. 답장(reply): `parent_message_id` 참조 — 원본 삭제 시 "삭제된 메시지입니다" 표시 유지
15. 중복 전송 방지: `idempotency_key` UNIQUE, 중복 시 기존 메시지 반환
16. WebSocket 재연결 시 `before` 커서로 미수신 메시지 동기화
17. 사용자 탈퇴 시 메시지 유지, `sender_id=null`, UI에 "알 수 없음" 표시

### 3.3 파일
18. 업로드 시 채팅방 멤버 여부 서버 검증
19. 허용 확장자: `pdf / docx / xlsx / pptx / png / jpg / jpeg / gif / zip`
20. 최대 파일 크기: 50MB
21. 파일 메시지 삭제 시 실제 파일 보존 (Open Question #3)
22. 다운로드 URL: 인증 기반, 만료 1시간, 채팅방 멤버만 접근 가능
23. `chat_files`는 `message_id`와 1:1 연결

### 3.4 읽음 확인
24. DM: 상대방 읽음 시 "읽음" 표시
25. GROUP / DEPARTMENT / CHANNEL: 읽은 인원 수 및 상세 목록 조회 가능
26. 읽음 처리: `lastReadMessageId` 기준 해당 방의 이전 메시지 일괄 read 처리
27. 안 읽은 메시지 수: Redis 카운터 캐싱 — 채팅방 입장 시 0으로 초기화
28. 멀티 디바이스 읽음 동기화: 읽음 처리 시 동일 계정 다른 디바이스에 `/user/queue/sync` WebSocket 이벤트 전송

### 3.5 공지톡
29. 시스템 관리자만 생성 가능 (`permission_key: chat:notice:write`)
30. 대상: 전체(ALL) / 특정 부서(DEPARTMENT) — DEPARTMENT 선택 시 `targetDeptId` 필수
31. `message_type=NOTICE`, 일반 메시지와 UI 구분
32. 읽음 필수 기록 (`message_reads`)
33. 공지 발송 시 대상 사용자에게 `/user/queue/notice` WebSocket 이벤트 전송

### 3.6 검색
34. `keyword` 최소 2자 필수
35. 메시지 내용 검색 (`is_deleted=false`만), 채팅방 단위 또는 전체 범위
36. 파일명 검색 (LIKE)
37. 페이징 지원 (default 20, max 100)
38. 테넌트 격리 필수 — 타 테넌트 데이터 검색 결과 노출 금지

### 3.7 권한
39. 일반 사용자: 메시지 송수신, 파일 업로드, GROUP / CHANNEL 생성
40. 채팅방 OWNER: 멤버 초대 / 강퇴, OWNER 위임, 타인 메시지 삭제
41. 시스템 관리자: 공지톡 발송
42. Admin PRD RBAC 연계 (`chat:message:read`, `chat:message:write`, `chat:notice:write`)

---

## 4. 비기능 요구사항 (Non-functional Requirements)

| 항목 | 요구사항 | 비고 |
|------|----------|------|
| 실시간 통신 | STOMP over WebSocket, TLS 1.2 이상 | |
| WebSocket 인증 | CONNECT 프레임 `Authorization: Bearer {accessToken}` | 만료 시 ERROR 프레임 후 연결 종료 |
| 성능 | 메시지 전송 응답 200ms 이하 | P99 기준 |
| 성능 | 채팅방 목록 조회 300ms 이하 | P99 기준 |
| 캐싱 | 안 읽은 메시지 수 Redis 카운터 | 채팅방 입장 시 초기화 |
| 확장성 | 동시 사용자 200인 기준 | ZIN Corporation 조직 규모 |
| 가용성 | SLA 99.9% | 월 다운타임 약 43분 |
| 보안 | 채팅방 멤버 여부 서버 검증 | 파일 업로드 / 다운로드 / 메시지 조회 공통 |

---

## 5. 데이터 요구사항 (Data Requirements)

> **멀티 테넌트 전략:** Row-level 분리 (단일 DB, 모든 테이블에 `tenant_id` 컬럼으로 데이터 격리)

### 5.1 chat_rooms

| 필드 | 타입 | 설명 |
|------|------|------|
| room_id | PK (UUID) | 채팅방 ID |
| tenant_id | FK → tenants.tenant_id | 테넌트 |
| room_type | enum | DM / GROUP / DEPARTMENT / CHANNEL |
| name | varchar(200) nullable | 채팅방 이름 (DM은 null) |
| dept_id | FK → departments.dept_id (nullable) | DEPARTMENT 타입 시 연결 부서 |
| owner_id | FK → users.user_id (nullable) | GROUP / CHANNEL OWNER |
| user_a_id | FK → users.user_id (nullable) | DM 전용 (user_a < user_b UUID 정렬) |
| user_b_id | FK → users.user_id (nullable) | DM 전용 |
| is_active | boolean default true | 활성 여부 |
| created_at | datetime | 생성일 |
| updated_at | datetime | 수정일 |

> UNIQUE: `(tenant_id, user_a_id, user_b_id)` WHERE `room_type='DM'` — DM 중복 방지
> `user_a_id < user_b_id` UUID 문자열 정렬 강제 (애플리케이션 레벨)

### 5.2 chat_room_members

| 필드 | 타입 | 설명 |
|------|------|------|
| room_id | FK → chat_rooms.room_id | 채팅방 (PK 일부) |
| user_id | FK → users.user_id | 사용자 (PK 일부) |
| role | enum | OWNER / MEMBER |
| joined_at | datetime | 입장 일시 |
| left_at | datetime nullable | 퇴장 일시 (null이면 현재 멤버) |

> PK: `(room_id, user_id)` 복합키
> DM 타입은 `left_at` 업데이트 불가

### 5.3 chat_messages

| 필드 | 타입 | 설명 |
|------|------|------|
| message_id | PK (UUID) | 메시지 ID |
| room_id | FK → chat_rooms.room_id | 채팅방 |
| sender_id | FK → users.user_id (nullable) | 발신자 (탈퇴 사용자는 null) |
| message_type | enum | TEXT / FILE / NOTICE |
| content | text nullable | 메시지 내용 (삭제 시 null, FILE 타입 null 가능) |
| parent_message_id | FK → chat_messages.message_id (nullable) | 답장 대상 메시지 |
| is_deleted | boolean default false | 삭제 여부 |
| is_edited | boolean default false | 수정 여부 |
| idempotency_key | varchar(100) nullable | 중복 전송 방지 키 (테넌트 단위 UNIQUE) |
| created_at | datetime | 생성일 |
| updated_at | datetime | 수정일 |

### 5.4 message_edits

| 필드 | 타입 | 설명 |
|------|------|------|
| edit_id | PK (bigint) | 자동 증가 |
| message_id | FK → chat_messages.message_id | 수정된 메시지 |
| old_content | text | 수정 전 내용 |
| edited_by | FK → users.user_id | 수정한 사용자 |
| edited_at | datetime | 수정 일시 |

### 5.5 message_reads

| 필드 | 타입 | 설명 |
|------|------|------|
| message_id | FK → chat_messages.message_id | 메시지 (PK 일부) |
| user_id | FK → users.user_id | 사용자 (PK 일부) |
| read_at | datetime | 읽은 일시 |

> PK: `(message_id, user_id)` 복합키

### 5.6 chat_files

| 필드 | 타입 | 설명 |
|------|------|------|
| file_id | PK (UUID) | 파일 ID |
| message_id | FK → chat_messages.message_id (UNIQUE) | 연결된 메시지 (1:1) |
| tenant_id | FK → tenants.tenant_id | 테넌트 |
| file_name | varchar(500) | 파일명 |
| file_size | bigint | 파일 크기 (bytes) |
| file_path | varchar(1000) | 저장 경로 |
| content_type | varchar(200) | MIME 타입 |
| is_deleted | boolean default false | 파일 삭제 추적 |
| uploaded_at | datetime | 업로드 일시 |

### 5.7 notice_targets

| 필드 | 타입 | 설명 |
|------|------|------|
| notice_id | FK → chat_messages.message_id | 공지 메시지 (PK 일부) |
| target_type | enum | ALL / DEPARTMENT (PK 일부) |
| target_id | varchar(100) nullable | DEPARTMENT인 경우 dept_id (PK 일부) |

> PK: `(notice_id, target_type, target_id)` 복합키

---

## 6. WebSocket (STOMP)

> 엔드포인트: `ws(s)://groupware.zin.com/ws`
> 인증: CONNECT 프레임 `Authorization: Bearer {accessToken}`
> Token 만료: 서버가 `/user/queue/errors` 에러 전송 후 연결 종료 → 클라이언트 `POST /api/auth/refresh` 후 재연결

### 6.1 구독 토픽

| 토픽 | 설명 |
|------|------|
| `/topic/room.{roomId}` | 채팅방 메시지 수신 |
| `/topic/room.{roomId}.read` | 읽음 상태 변경 이벤트 |
| `/topic/room.{roomId}.members` | 멤버 입퇴장 이벤트 |
| `/user/queue/notice` | 공지톡 수신 (개인) |
| `/user/queue/sync` | 멀티 디바이스 읽음 동기화 이벤트 |
| `/user/queue/errors` | 에러 알림 (토큰 만료 등) |

### 6.2 메시지 전송 (STOMP SEND)

**Destination: `/app/chat.send`**
```json
{
  "roomId": "uuid",
  "content": "안녕하세요",
  "messageType": "TEXT",
  "parentMessageId": null,
  "idempotencyKey": "client-uuid"
}
```

### 6.3 읽음 처리 (STOMP SEND)

**Destination: `/app/chat.read`**
```json
{
  "roomId": "uuid",
  "lastReadMessageId": "uuid"
}
```

> `lastReadMessageId` 포함 이전 메시지 전체 읽음 처리

### 6.4 서버 → 클라이언트 페이로드

**메시지 수신 (`/topic/room.{roomId}`)**
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

**읽음 이벤트 (`/topic/room.{roomId}.read`)**
```json
{
  "userId": "uuid",
  "lastReadMessageId": "uuid",
  "readAt": "2025-01-01T12:00:00Z"
}
```

**멤버 이벤트 (`/topic/room.{roomId}.members`)**
```json
{
  "eventType": "JOINED",
  "userId": "uuid",
  "userName": "홍길동"
}
```

> `eventType`: JOINED / LEFT / OWNER_CHANGED

---

## 7. API 설계 (API Design)

> 모든 API는 `Authorization: Bearer {accessToken}` 헤더 필수.

---

### 7.1 채팅방

#### GET /api/chat/rooms — 채팅방 목록 조회

**Query Parameters:** `page` (default: 0), `size` (default: 20)

**Response 200**
```json
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

---

#### POST /api/chat/rooms — 채팅방 생성

**Request**
```json
{
  "roomType": "GROUP",
  "name": "프로젝트 A",
  "memberIds": ["uuid-1", "uuid-2"]
}
```

> DM 생성 시 `memberIds`에 상대방 userId 1개만 입력

**Response 201**
```json
{
  "roomId": "uuid",
  "message": "채팅방이 생성되었습니다."
}
```

**Response 400**
```json
{
  "code": "DM_REQUIRES_ONE_MEMBER",
  "message": "DM 생성 시 memberIds는 1개여야 합니다."
}
```

**Response 400**
```json
{
  "code": "INVALID_ROOM_TYPE",
  "message": "올바르지 않은 채팅방 유형입니다."
}
```

**Response 409**
```json
{
  "code": "DM_ALREADY_EXISTS",
  "message": "이미 존재하는 DM 채팅방입니다."
}
```

---

#### GET /api/chat/rooms/{roomId} — 채팅방 상세 조회

**Response 200**
```json
{
  "roomId": "uuid",
  "roomType": "GROUP",
  "name": "프로젝트 A",
  "memberCount": 5,
  "members": [
    { "userId": "uuid", "name": "홍길동", "role": "OWNER" }
  ],
  "pinnedNotice": { "messageId": "uuid", "content": "공지 내용" }
}
```

**Response 403**
```json
{
  "code": "NOT_ROOM_MEMBER",
  "message": "채팅방 멤버가 아닙니다."
}
```

**Response 404**
```json
{
  "code": "ROOM_NOT_FOUND",
  "message": "채팅방을 찾을 수 없습니다."
}
```

---

#### POST /api/chat/rooms/{roomId}/members — 멤버 초대

**Request** _(OWNER만 가능)_
```json
{
  "userIds": ["uuid-1", "uuid-2"]
}
```

**Response 200**
```json
{
  "message": "멤버가 초대되었습니다."
}
```

**Response 400**
```json
{
  "code": "ALREADY_MEMBER",
  "message": "이미 채팅방 멤버입니다."
}
```

**Response 403**
```json
{
  "code": "NOT_OWNER",
  "message": "OWNER 권한이 필요합니다."
}
```

**Response 404**
```json
{
  "code": "ROOM_NOT_FOUND",
  "message": "채팅방을 찾을 수 없습니다."
}
```

---

#### DELETE /api/chat/rooms/{roomId}/members/{userId} — 멤버 강퇴

_(OWNER만 가능, 자기 자신 강퇴 불가)_

**Response 200**
```json
{
  "message": "멤버가 강퇴되었습니다."
}
```

**Response 400**
```json
{
  "code": "CANNOT_KICK_SELF",
  "message": "자기 자신을 강퇴할 수 없습니다."
}
```

**Response 403**
```json
{
  "code": "NOT_OWNER",
  "message": "OWNER 권한이 필요합니다."
}
```

**Response 404**
```json
{
  "code": "MEMBER_NOT_FOUND",
  "message": "채팅방 멤버를 찾을 수 없습니다."
}
```

---

#### PUT /api/chat/rooms/{roomId}/owner — OWNER 위임

**Request** _(현재 OWNER만 가능)_
```json
{
  "newOwnerId": "uuid"
}
```

**Response 200**
```json
{
  "message": "OWNER가 위임되었습니다."
}
```

**Response 403**
```json
{
  "code": "NOT_OWNER",
  "message": "OWNER 권한이 필요합니다."
}
```

**Response 404**
```json
{
  "code": "MEMBER_NOT_FOUND",
  "message": "채팅방 멤버를 찾을 수 없습니다."
}
```

---

#### DELETE /api/chat/rooms/{roomId}/leave — 채팅방 퇴장

**Response 200**
```json
{
  "message": "채팅방에서 퇴장했습니다."
}
```

**Response 400**
```json
{
  "code": "DM_CANNOT_LEAVE",
  "message": "DM 채팅방은 퇴장할 수 없습니다."
}
```

**Response 400**
```json
{
  "code": "OWNER_CANNOT_LEAVE",
  "message": "OWNER는 위임 후 퇴장할 수 있습니다."
}
```

---

### 7.2 메시지

#### GET /api/chat/rooms/{roomId}/messages — 메시지 목록 (커서 기반)

**Query Parameters:** `before` (messageId, 선택), `size` (default: 50, max: 100)

**Response 200**
```json
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
```

**Response 403**
```json
{
  "code": "NOT_ROOM_MEMBER",
  "message": "채팅방 멤버가 아닙니다."
}
```

---

#### POST /api/chat/messages — 메시지 전송 (REST fallback)

**Request**
```json
{
  "roomId": "uuid",
  "content": "안녕하세요",
  "messageType": "TEXT",
  "parentMessageId": null,
  "idempotencyKey": "client-uuid"
}
```

**Response 201**
```json
{
  "messageId": "uuid",
  "createdAt": "2025-01-01T12:00:00Z"
}
```

**Response 403**
```json
{
  "code": "NOT_ROOM_MEMBER",
  "message": "채팅방 멤버가 아닙니다."
}
```

**Response 409** _(idempotencyKey 중복 시 기존 메시지 반환)_
```json
{
  "code": "DUPLICATE_MESSAGE",
  "messageId": "uuid",
  "message": "이미 전송된 메시지입니다."
}
```

---

#### PUT /api/chat/messages/{messageId} — 메시지 수정

**Request**
```json
{
  "content": "수정된 내용"
}
```

**Response 200**
```json
{
  "message": "메시지가 수정되었습니다."
}
```

**Response 400**
```json
{
  "code": "DELETED_MESSAGE",
  "message": "삭제된 메시지는 수정할 수 없습니다."
}
```

**Response 400**
```json
{
  "code": "FILE_MESSAGE_CANNOT_EDIT",
  "message": "파일 메시지는 수정할 수 없습니다."
}
```

**Response 403**
```json
{
  "code": "NOT_MESSAGE_OWNER",
  "message": "본인 메시지만 수정할 수 있습니다."
}
```

**Response 404**
```json
{
  "code": "MESSAGE_NOT_FOUND",
  "message": "메시지를 찾을 수 없습니다."
}
```

---

#### DELETE /api/chat/messages/{messageId} — 메시지 삭제 (Soft Delete)

_(본인 또는 채팅방 OWNER만 가능)_

**Response 200**
```json
{
  "message": "메시지가 삭제되었습니다."
}
```

**Response 403**
```json
{
  "code": "FORBIDDEN",
  "message": "본인 또는 채팅방 OWNER만 삭제할 수 있습니다."
}
```

**Response 404**
```json
{
  "code": "MESSAGE_NOT_FOUND",
  "message": "메시지를 찾을 수 없습니다."
}
```

---

### 7.3 파일

#### POST /api/chat/rooms/{roomId}/files — 파일 업로드

**Request** `Content-Type: multipart/form-data`

| 필드 | 설명 |
|------|------|
| `file` | 업로드 파일 (최대 50MB, 허용 확장자: pdf/docx/xlsx/pptx/png/jpg/jpeg/gif/zip) |

**Response 201**
```json
{
  "fileId": "uuid",
  "messageId": "uuid",
  "fileName": "report.pdf",
  "fileSize": 1048576,
  "downloadUrl": "https://...",
  "expiresAt": "2025-01-01T13:00:00Z"
}
```

**Response 400**
```json
{
  "code": "FILE_SIZE_EXCEEDED",
  "message": "파일 크기는 50MB 이하여야 합니다."
}
```

**Response 400**
```json
{
  "code": "FILE_TYPE_NOT_ALLOWED",
  "message": "허용되지 않는 파일 형식입니다."
}
```

**Response 403**
```json
{
  "code": "NOT_ROOM_MEMBER",
  "message": "채팅방 멤버가 아닙니다."
}
```

---

#### GET /api/chat/files/{fileId}/download — 다운로드 URL 발급

**Response 200**
```json
{
  "downloadUrl": "https://...",
  "expiresAt": "2025-01-01T13:00:00Z"
}
```

**Response 401**
```json
{
  "code": "UNAUTHORIZED",
  "message": "인증이 필요합니다."
}
```

**Response 403**
```json
{
  "code": "NOT_ROOM_MEMBER",
  "message": "채팅방 멤버가 아닙니다."
}
```

**Response 404**
```json
{
  "code": "FILE_NOT_FOUND",
  "message": "파일을 찾을 수 없습니다."
}
```

---

#### GET /api/chat/rooms/{roomId}/files — 채팅방 파일 목록 조회

**Query Parameters:** `page` (default: 0), `size` (default: 20, max: 100)

**Response 200**
```json
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
```

**Response 403**
```json
{
  "code": "NOT_ROOM_MEMBER",
  "message": "채팅방 멤버가 아닙니다."
}
```

---

### 7.4 읽음 확인

#### GET /api/chat/messages/{messageId}/reads — 읽음 사용자 목록 조회

**Response 200**
```json
{
  "readCount": 5,
  "totalCount": 10,
  "readers": [
    { "userId": "uuid", "name": "홍길동", "readAt": "2025-01-01T12:00:00Z" }
  ]
}
```

**Response 403**
```json
{
  "code": "NOT_ROOM_MEMBER",
  "message": "채팅방 멤버가 아닙니다."
}
```

---

### 7.5 공지톡

#### POST /api/chat/notices — 공지톡 발송

_(시스템 관리자만 가능 — `chat:notice:write` Permission 필요)_

**Request**
```json
{
  "content": "전사 공지입니다.",
  "targetType": "ALL",
  "targetDeptId": null
}
```

> `targetType=DEPARTMENT` 시 `targetDeptId` 필수

**Response 201**
```json
{
  "messageId": "uuid",
  "message": "공지가 발송되었습니다."
}
```

**Response 400**
```json
{
  "code": "TARGET_REQUIRED",
  "message": "DEPARTMENT 대상 공지 시 targetDeptId는 필수입니다."
}
```

**Response 403**
```json
{
  "code": "FORBIDDEN",
  "message": "공지톡 발송 권한이 없습니다."
}
```

---

#### GET /api/chat/notices/{messageId}/reads — 공지 읽음 현황 조회

**Query Parameters:** `page` (default: 0), `size` (default: 50)

**Response 200**
```json
{
  "totalTarget": 200,
  "readCount": 150,
  "unreadCount": 50,
  "readers": [
    { "userId": "uuid", "name": "홍길동", "readAt": "2025-01-01T12:00:00Z" }
  ],
  "page": 0,
  "totalElements": 150
}
```

---

### 7.6 검색

#### GET /api/chat/search — 메시지 / 파일 검색

**Query Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `keyword` | string | 검색어 (필수, 최소 2자) |
| `roomId` | UUID | 특정 채팅방 범위 검색 (선택) |
| `type` | enum | MESSAGE / FILE (선택) |
| `page` | int | 페이지 번호 (default: 0) |
| `size` | int | 페이지 크기 (default: 20, max: 100) |

> 삭제 메시지 (`is_deleted=true`) 검색 결과 제외

**Response 200**
```json
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
```

**Response 400**
```json
{
  "code": "KEYWORD_TOO_SHORT",
  "message": "검색어는 최소 2자 이상이어야 합니다."
}
```

---

## 8. 에러 코드 (Error Codes)

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
| MEMBER_NOT_FOUND | 404 | 채팅방 멤버 미존재 (강퇴 / 위임 시) |
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
| UNAUTHORIZED | 401 | 인증 필요 |
| FORBIDDEN | 403 | 권한 없음 |

---

## 9. UI/UX 고려사항 (UI/UX Considerations)

- 채팅방 목록: 마지막 메시지 미리보기 및 안 읽은 메시지 수 뱃지 표시
- 삭제된 메시지는 내용 대신 "삭제된 메시지입니다" 회색 텍스트 표시
- 수정된 메시지는 "(수정됨)" 레이블 표시
- 답장 메시지는 원본 메시지 미리보기와 함께 표시 — 원본 삭제 시 "삭제된 메시지입니다" 유지
- OWNER 퇴장 시 위임 대상 선택 모달 표시
- DM 목록에서 상대방 이름 / 프로필 이미지 표시
- 공지톡은 일반 메시지와 시각적으로 구분 (배경색, 아이콘)
- 파일 업로드 진행률 표시
- Access Token 만료 시 재연결 중 안내 스피너 표시
- 멀티 디바이스 읽음 동기화: 다른 디바이스에서 읽으면 현재 디바이스의 뱃지 즉시 초기화

---

## 10. 예외 케이스 (Edge Cases)

| 상황 | 처리 방식 |
|------|----------|
| DM 중복 생성 시도 | 409 DM_ALREADY_EXISTS 반환 |
| DM 퇴장 시도 | 400 DM_CANNOT_LEAVE 반환 |
| DM 생성 시 memberIds != 1 | 400 DM_REQUIRES_ONE_MEMBER 반환 |
| OWNER가 위임 없이 퇴장 시도 | 400 OWNER_CANNOT_LEAVE 반환 |
| 마지막 멤버 퇴장 (OWNER 포함) | 채팅방 INACTIVE 처리 |
| 강퇴된 멤버 재초대 | left_at 갱신 후 재입장 처리 |
| 자기 자신 강퇴 시도 | 400 CANNOT_KICK_SELF 반환 |
| 삭제된 메시지 수정 시도 | 400 DELETED_MESSAGE 반환 |
| FILE 타입 메시지 수정 시도 | 400 FILE_MESSAGE_CANNOT_EDIT 반환 |
| idempotencyKey 중복 전송 | 409 DUPLICATE_MESSAGE 반환, 기존 messageId 응답 |
| 탈퇴 사용자 메시지 | 메시지 유지, sender_id=null, "알 수 없음" 표시 |
| 답장 원본 메시지 삭제 | "삭제된 메시지입니다" 표시 유지 |
| Access Token 만료 (WebSocket) | /user/queue/errors 에러 수신 → 클라이언트 /auth/refresh 후 재연결 |
| WebSocket 연결 끊김 후 재접속 | before 커서로 미수신 메시지 동기화 |
| 파일 50MB 초과 업로드 | 400 FILE_SIZE_EXCEEDED 반환 |
| 허용되지 않는 확장자 업로드 | 400 FILE_TYPE_NOT_ALLOWED 반환 |
| 채팅방 멤버 아닌 사용자 파일 업로드 | 403 NOT_ROOM_MEMBER 반환 |
| 채팅방 멤버 아닌 사용자 다운로드 시도 | 403 NOT_ROOM_MEMBER 반환 |
| 검색어 2자 미만 | 400 KEYWORD_TOO_SHORT 반환 |
| DEPARTMENT 부서 INACTIVE | 해당 채팅방 INACTIVE 처리 |
| 공지 대상이 DEPARTMENT인데 targetDeptId 미입력 | 400 TARGET_REQUIRED 반환 |

---

## 11. 오픈 이슈 (Open Questions)

| # | 이슈 | 영향도 | 현재 상태 |
|---|------|--------|----------|
| 1 | 메시지 보관 기간 (영구 vs 기간 제한) | High | 미결 — 법무 / 보안 정책 확인 필요 |
| 2 | 파일 저장소 (온프레미스 vs S3 호환) | High | 미결 — Admin PRD 스토리지 정책과 통일 권고 |
| 3 | 파일 메시지 삭제 시 실제 파일 삭제 여부 | Medium | 현재 보존 정책. 스토리지 비용 고려 후 결정 필요 |
| 4 | 메시지 E2E 암호화 적용 여부 | High | 미결 — 적용 시 서버 측 검색 불가, 구조 전면 변경 필요 |
| 5 | 채널 공개 / 비공개 정책 | Medium | 미결 — 비공개 채널은 초대 기반 구조 설계 필요 |
| 6 | 알림 시스템 연동 (푸시 / 이메일) | Medium | 미결 — 별도 Notification PRD 설계 필요 |
| 7 | Elasticsearch 도입 여부 | Medium | 현재 DB LIKE 기반. 200인 규모 불필요, 확장 시 검토 |
| 8 | 오프라인 메시지 큐 처리 | Medium | 미결 — 클라이언트 재전송 정책 상세 설계 필요 |
