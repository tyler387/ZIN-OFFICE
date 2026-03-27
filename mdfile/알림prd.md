# PRD 2차 검증 보고서 — 알림(Notification) 시스템

| 항목 | 내용 |
|------|------|
| 검증 회차 | 2차 (1차 검증 보고서 반영 후 추가 정밀 검토) |
| 검증 대상 | 알림(Notification) PRD 원문 + 1차 검증 보고서 |
| 검증 기준 | 로그인·인증 / 관리자 콘솔 / 메신저 / 메일 / 전자결재 / 조직도 PRD v3.0 |
| 문서 상태 | **2차 검증 완료 — 추가 수정 권고 포함** |

---

## 검증 방법론

1차 검증이 주로 **연계 PRD 불일치 및 명백한 누락 필드** 중심이었다면, 2차는 다음 영역을 집중 점검합니다.

- 비기능 요구사항 수치의 실현 가능성 및 일관성
- 상태 머신(State Machine) 완결성 및 전이 규칙 누락
- 보안·인증 정책의 구현 수준 상세 검토
- WebSocket 실시간 알림 연동의 구체적 설계 누락
- Internal API 설계의 완결성 및 호출 규약
- 에러 코드 체계 및 예외 케이스 누락
- 운영·모니터링·배포 관점 공백
- 1차에서 제안한 권고안의 자체 모순 또는 추가 검토 필요 사항

---

## 결함 분류 기준

| 등급 | 정의 |
|------|------|
| 🔴 Critical | 구현 불가, 데이터 정합성 파괴, 보안 취약점 수준 |
| 🟡 Major | 기능 완결성·운영 안정성에 영향 |
| 🟢 Minor | 개선 권고, 명확성 향상 수준 |

---

## 1. 비기능 요구사항 검증

### 1.1 성능 수치 모순

| # | 등급 | 항목 | 현황 | 권고 |
|---|------|------|------|------|
| 1 | 🔴 | **"95% 알림 1초 이내 전달" 지표 측정 주체 미정의** | "전달"이 Queue 적재 완료인지, Worker 발송 완료인지, 수신자 단말 수신인지 불명확. 외부 SMTP·FCM 응답 시간은 제어 불가 영역으로 SLA 책임 범위가 모호함 | 지표를 "Worker 발송 요청 완료 기준 P95 1초 이내"로 범위를 명시하고, SMTP·Push 외부 채널 전달은 별도 지표(best-effort)로 분리 |
| 2 | 🟡 | **"초당 1,000건" 처리량 근거 없음** | 대상 조직이 ZIN Corporation 200인. 동시 이벤트 폭발 시나리오 없이 1,000건/초 수치만 명시. 메신저 PRD 피크 트래픽과도 연계 계산이 없음 | 200인 조직 기준 피크 산정 근거(예: 전사 공지 동시 발송 200건, 이벤트 팬아웃 최대 n배) 명시. 불필요하게 과도한 수치 또는 근거 부재 중 하나를 선택 |
| 3 | 🟡 | **다른 PRD 성능 기준(P99)과 단위 불일치** | 연계 PRD(관리자 콘솔·전자결재 등)는 P99 기준 사용. 알림 PRD만 P95 기준 명시 | P99 기준으로 통일하거나, P95 사용 근거를 명시 |

---

### 1.2 가용성 및 전달 보장 상충

| # | 등급 | 항목 | 현황 | 권고 |
|---|------|------|------|------|
| 4 | 🟡 | **at-least-once 정책과 중복 알림 사용자 경험 충돌** | at-least-once 보장 시 동일 알림이 2회 이상 발송될 수 있음. 사용자에게 중복 알림이 노출되는 경우의 UX 처리(중복 표시 방지, 알림 합산 등) 미정의 | 수신자 측 `(event_id, user_id)` 기반 멱등성 체크를 DB UNIQUE 제약 또는 Redis SETNX로 구현하는 방식 명시 |
| 5 | 🟢 | **Queue 장애 시 DB fallback과 SLA 99.9% 연계 설계 미흡** | 예외 케이스 2번에서 "Queue 장애 → DB fallback 후 batch 재처리"를 명시하나, fallback 발동 조건·배치 실행 주기·SLA 영향 범위 미정의 | fallback 발동 조건(Queue 연결 실패 N초), 배치 주기(예: 5분), SLA 산정 시 제외 여부 명시 |

---

## 2. 상태 머신 완결성 검증

### 2.1 deliver_status 전이 규칙 누락

현재 PRD에 명시된 상태: `CREATED → QUEUED → SENT → FAIL → RETRY → DEAD`

| # | 등급 | 항목 | 현황 | 권고 |
|---|------|------|------|------|
| 6 | 🔴 | **HOLD 상태 전이 규칙 미정의** | `HOLD` 상태가 테이블에 정의되어 있으나 상태 흐름에 미포함. `HOLD → QUEUED` 전환 조건, `HOLD → DEAD` 가능 여부, `HOLD` 상태에서 삭제 가능 여부 모두 불명확 | 상태 흐름에 HOLD 추가: `CREATED → HOLD`(DND 발동 시), `HOLD → QUEUED`(DND 해제 시), `HOLD` 상태 최대 보존 기간 명시 |
| 7 | 🔴 | **RETRY 상태가 중간 상태인지 최종 상태인지 불명확** | `FAIL → RETRY` 이후 다시 `QUEUED`로 가는지, 바로 발송 시도인지, `RETRY → SENT` 또는 `RETRY → DEAD` 전이가 명시되지 않음 | `RETRY`를 별도 상태로 두지 않고 `FAIL`에서 retry_count 증가 후 재`QUEUED` 처리로 단순화하거나, 전이 다이어그램 추가 |
| 8 | 🟡 | **SENT 이후 상태 전이 없음** | `SENT` 이후 사용자 읽음 상태(`READ`)로의 연결이 `deliver_status`와 `read_status`(또는 `status`) 테이블 간 관계로만 처리되는지 명시 없음 | `deliver_status=SENT`가 확정되면 `read_status`는 별도 컬럼으로 독립 관리됨을 명시 (1차 검증 권고와 동일하나 상태 머신 관점에서 명시 필요) |
| 9 | 🟢 | **CANCELLED 상태 부재** | 사용자가 알림 설정을 OFF로 변경한 뒤 이미 QUEUED된 알림의 처리 방법 미정의 | `CANCELLED` 상태 추가 또는 "설정 OFF 이후에도 QUEUED 알림은 발송 완료 후 사용자에게 미표시" 정책 명시 |

---

## 3. 보안 정책 검증

### 3.1 알림 내용 정보 노출 위험

| # | 등급 | 항목 | 현황 | 권고 |
|---|------|------|------|------|
| 10 | 🔴 | **알림 payload에 민감 정보 포함 가능성** | `payload`에 `documentId`, `status` 등이 포함되나, CONFIDENTIAL 등급 전자결재 문서의 제목·내용이 알림 `title`·`content`에 노출될 수 있음. 알림 목록 API 응답에서 권한 없는 사용자도 제목을 볼 수 있는 구조 | 알림 생성 시 CONFIDENTIAL 문서는 title을 "결재 문서가 있습니다" 수준으로 마스킹 처리하거나, 알림 조회 시 실시간 권한 검증 후 내용 노출 여부 결정하는 정책 명시 |
| 11 | 🔴 | **Internal API(`POST /internal/notifications`) 보안 설계 미완성** | 1차 검증에서 `X-Internal-Key` 방식을 권고했으나, 알림 생성 Internal API는 모든 서비스가 호출 가능한 구조. 악의적 내부 호출로 임의 알림 생성 가능 | 호출 가능한 서비스 목록(Allowlist) 또는 서비스별 서명(HMAC) 방식 명시. 최소한 source_service 필드 검증 + IP 기반 허용 정책 |
| 12 | 🟡 | **알림 딥링크 URL 검증 부재** | UI/UX에서 "클릭 시 딥링크 이동" 명시. 딥링크 URL이 payload에 포함될 경우 Open Redirect 공격 가능성 | 딥링크 URL을 화이트리스트 도메인으로 제한하거나, 내부 라우팅 코드(예: `docId`, `roomId`)로만 구성하고 URL 조립은 클라이언트에서 수행하도록 설계 |
| 13 | 🟡 | **알림 조회 API 타 사용자 알림 열람 가능 여부** | `GET /api/notifications`에 user_id 필터가 암묵적으로 적용된다고 가정하나, 명시 없음. 1차 검증에서 RBAC 지적이 있었으나 구체적 격리 방식(JWT sub 기반 자동 필터링) 미정의 | API 명세에 "JWT의 sub(user_id) 기준으로 본인 알림만 조회, 서버에서 강제 필터링 적용" 명시 |

---

## 4. WebSocket 실시간 알림 연동 검증

### 4.1 WebSocket 설계 공백

| # | 등급 | 항목 | 현황 | 권고 |
|---|------|------|------|------|
| 14 | 🔴 | **WebSocket 엔드포인트 및 토픽 미정의** | UI/UX에서 "실시간 Toast 알림 (WebSocket)" 명시하나, WebSocket 엔드포인트, 구독 토픽, 페이로드 구조가 전혀 정의되지 않음. 메신저 PRD는 `ws://groupware.zin.com/ws` STOMP 방식을 상세 정의한 것과 대조됨 | 알림 전용 토픽 정의 필요. 예: `/user/queue/notifications` (개인 알림), `/topic/tenant.{tenantId}.notice` (공지). 또는 메신저 PRD의 STOMP 서버 통합 여부 결정 후 토픽 통일 |
| 15 | 🔴 | **WebSocket 인증 방식 미정의** | 메신저 PRD는 STOMP CONNECT 프레임에 `Authorization: Bearer {accessToken}` 헤더를 명시. 알림 WebSocket도 동일 방식인지, Access Token 만료 시 재연결 처리를 어떻게 하는지 미정의 | 메신저 PRD WebSocket 인증 방식(`Authorization: Bearer` + 만료 시 `/user/queue/errors` 수신 후 REST `/auth/refresh` 재연결) 동일 적용 명시 |
| 16 | 🟡 | **알림 서버와 메신저 WebSocket 서버 통합/분리 기준 없음** | 메신저 PRD의 STOMP 서버와 알림 시스템의 WebSocket 서버가 동일 서버인지 별도 서버인지 미정의. 통합 시 메신저 부하가 알림에 영향, 분리 시 클라이언트 이중 연결 부담 | 통합 또는 분리 결정 후 아키텍처 반영. 단기적으로는 메신저 STOMP 서버에 알림 토픽 추가 방식(통합) 권고 |
| 17 | 🟢 | **오프라인 사용자 알림 처리 미정의** | WebSocket 연결이 없는(오프라인) 사용자에게 실시간 토스트 알림 전달 불가. 재접속 시 미수신 알림 동기화 방법 미정의 | 재접속 시 `GET /api/notifications?cursor=lastSeen` 방식으로 미수신 알림 조회, 또는 unread_count 기반 Badge 업데이트 명시 |

---

## 5. Internal API 설계 완결성 검증

### 5.1 Internal API 호출 규약

| # | 등급 | 항목 | 현황 | 권고 |
|---|------|------|------|------|
| 18 | 🔴 | **Internal API receivers 배열 크기 제한 없음** | `POST /internal/notifications`의 `receivers` 배열에 제한이 없음. 전사 공지(200명) 발송 시 단일 API 호출로 200개 receiver가 전달될 수 있으며, 이를 200개 알림 레코드로 분기·저장하는 처리 방식 미정의 | 단일 API 호출 최대 수신자 수 제한(예: 100명) 명시, 초과 시 호출 측에서 분할 요청하도록 계약 정의. 또는 서버 내부 배치 처리 명시 |
| 19 | 🟡 | **Internal API 동기/비동기 응답 계약 불명확** | API가 알림 생성(DB 저장)까지만 응답인지, Queue 적재까지 완료 후 응답인지 불명확. 호출 서비스(전자결재, 메신저 등)가 응답을 신뢰하는 기준이 다름 | "알림 DB 저장 완료 후 202 응답, Queue 적재는 비동기"로 응답 계약 명시. 호출 측은 202 이후 알림 발송 결과 조회 불필요 |
| 20 | 🟡 | **Internal API 요청 필드 중 필수/선택 구분 없음** | `eventId`, `type`, `receivers`, `payload` 필드가 정의되어 있으나 각 필드의 필수 여부, payload 내부 구조, type의 유효값 목록 미정의 | type 유효값 enum 목록, payload 스키마(type별 최소 필드 정의), 필수 필드 표기 추가 |
| 21 | 🟢 | **Internal API 버전 관리 정책 없음** | `/internal/notifications`에 버전 prefix 없음. 연계 서비스가 많아질수록 하위 호환성 관리 필요 | `/v1/internal/notifications` 형태로 버전 prefix 추가 권고 |

---

## 6. 에러 코드 및 예외 처리 검증

### 6.1 에러 코드 체계 부재

| # | 등급 | 항목 | 현황 | 권고 |
|---|------|------|------|------|
| 22 | 🔴 | **API 에러 코드 전체 미정의** | 연계 PRD 모두 에러 코드 테이블(예: `ROOM_NOT_FOUND`, `NOT_APPROVER` 등)을 정의하고 있으나, 알림 PRD는 어떠한 에러 코드도 정의하지 않음 | 최소 아래 에러 코드 정의 필요: `NOTIFICATION_NOT_FOUND`, `ALREADY_READ`, `SUBSCRIPTION_NOT_FOUND`, `ALREADY_SUBSCRIBED`, `INVALID_EVENT_TYPE`, `RECEIVER_REQUIRED`, `RATE_LIMIT_EXCEEDED`, `INVALID_DND_TIME` |
| 23 | 🟡 | **예외 케이스 6번 "유저 삭제 → soft delete 유지" 처리 불완전** | 사용자 삭제 시 해당 user_id로 HOLD 상태인 알림의 처리, 진행 중 RETRY 알림의 취소 여부 미정의 | 사용자 비활성화(INACTIVE) 시 해당 user_id의 QUEUED/HOLD/RETRY 상태 알림 CANCELLED 처리 정책 명시 |
| 24 | 🟡 | **Rate Limit 초과 시 응답 스펙 없음** | 요구사항 27번에서 "초과 시 큐 지연 처리"라고 하나, Internal API 호출자에게 어떤 응답(429, 202 등)을 내려주는지 미정의. 또한 "큐 지연"이 호출자 입장에서 투명하게 처리되는지도 불명확 | Rate Limit 초과 시 429 반환(Internal API) 또는 큐 지연 후 202 반환 중 하나를 명시. 호출자 재시도 정책도 함께 정의 |
| 25 | 🟢 | **DEAD 상태 알림 모니터링 및 수동 재처리 방법 미정의** | DEAD 상태 도달 시 발신자 알림만 언급(전자결재 PRD 기준). 알림 시스템 자체에서 DEAD 건을 운영자가 확인하고 수동 재처리할 수 있는 방법 미정의 | DEAD 알림 조회 관리자 API 또는 모니터링 대시보드 연계 방안 명시 |

---

## 7. 데이터 정합성 추가 검증

### 7.1 1차에서 미발견된 데이터 모델 결함

| # | 등급 | 항목 | 현황 | 권고 |
|---|------|------|------|------|
| 26 | 🔴 | **Notification_Log와 Notification 간 삭제 전파 정책 없음** | 알림 보관 기간 만료 시 `Notification` 레코드를 삭제하면 FK로 연결된 `Notification_Log` 레코드가 고아 레코드가 됨. ON DELETE CASCADE 또는 별도 보관 기간 정책 미정의 | `Notification_Log` 보관 기간을 `Notification`과 동일하게 설정하고 CASCADE 삭제 또는 독립 보관 정책 명시 |
| 27 | 🔴 | **Subscription 테이블에 target_id 데이터 타입 불명확** | `target_id` 컬럼이 `VARCHAR`로 정의. 게시판 ID가 UUID인지, 정수형인지 불명확하며 외래 키 제약 없음 | target_id 타입을 UUID로 통일하거나, target_type별 조회 서비스 API 호출로 유효성 검증하는 정책 명시 |
| 28 | 🟡 | **Notification 테이블 인덱스 정의 없음** | `user_id`, `deliver_status`, `created_at`, `event_id` 등을 기준으로 빈번하게 조회되나 인덱스 전략 미정의. cursor 기반 페이지네이션 성능에 직접 영향 | 최소 인덱스 정의: `INDEX(user_id, created_at DESC)`, `UNIQUE INDEX(event_id, user_id)`, `INDEX(deliver_status, retry_count)` |
| 29 | 🟡 | **알림 생성 원자성 보장 미정의** | 대상이 200명인 공지 알림의 경우 200개 `Notification` 레코드를 생성해야 함. 일부 실패 시 부분 생성 여부, 트랜잭션 범위, 롤백 정책 미정의 | 배치 INSERT 방식으로 처리하되, 부분 실패 시 실패한 user_id만 재처리 큐에 적재하는 부분 커밋 정책 명시 (메일 PRD HR 연동 방식 참조) |
| 30 | 🟢 | **`dnd_start`/`dnd_end` 시간대(timezone) 처리 미정의** | `TIME` 타입으로 저장 시 서버 기준인지 사용자 기준인지 불명확. 해외 근무자 또는 서머타임 적용 지역 미고려 | 서버 UTC 기준 저장 후 사용자 timezone 적용 변환, 또는 KST 고정 명시 (ZIN Corporation 200인 국내 조직 기준이면 KST 고정도 허용) |

---

## 8. 운영·모니터링 관점 검증

### 8.1 모니터링 및 알람 체계

| # | 등급 | 항목 | 현황 | 권고 |
|---|------|------|------|------|
| 31 | 🟡 | **모니터링 지표 정의만 있고 수집 방법 없음** | 비기능 요구사항에 "알림 성공률, 실패율 추적" 명시하나 수집 방법(APM, 커스텀 메트릭, 로그 기반 등) 미정의 | 채널별 success_rate, dead_count, avg_latency를 `Notification_Log` 집계로 제공하는 관리자 API 또는 외부 모니터링 연동 방식 명시 |
| 32 | 🟡 | **DEAD 알림 발생 시 운영자 알림 체계 없음** | DEAD 상태는 사용자 알림 전달 실패를 의미. 운영자에게 DEAD 증가 알람이 전달되는 경로 미정의 | DEAD 알림 임계값(예: 분당 10건 초과 시) 도달 시 운영자 채널(이메일 또는 Slack 등)로 알람 발송 정책 명시 |
| 33 | 🟢 | **배치 스케줄러 실행 주기 및 중복 실행 방지 정책 없음** | 캘린더 리마인드, DND 해제 배치, 알림 보관 기간 만료 배치 등의 스케줄러가 명시되나 실행 주기, 분산 환경에서의 중복 실행 방지(분산 락, Shedlock 등) 미정의 | 스케줄러별 실행 주기 및 분산 환경 중복 방지 방식 명시 |

---

## 9. 1차 검증 권고안 자체 검토

1차 검증 보고서에서 제안한 내용 중 추가로 검토가 필요한 항목입니다.

| # | 등급 | 항목 | 1차 권고 | 2차 추가 검토 |
|---|------|------|----------|--------------|
| 34 | 🟡 | **`source_service` 필드 추가 권고의 중복성** | Notification 테이블에 `source_service` 필드 추가 권고 | `type` 필드(예: APPROVAL_SUBMITTED)에 서비스 식별이 이미 내포되어 있어 중복 가능. `source_service`를 별도 필드로 추가하려면 type과의 관계 정의 필요. 또는 type prefix로 대체(예: APPROVAL_, MAIL_, CHAT_) |
| 35 | 🟡 | **`notification:admin` permission_key 신규 정의 권고** | 1차에서 `notification:admin` RBAC 권한 추가 권고 | 관리자 콘솔 PRD의 `permissions` 테이블에 해당 permission_key를 마이그레이션으로 추가하는 작업이 필요함을 명시. 단순 권고로 끝나지 않도록 Admin PRD 오픈 이슈에도 연계 등록 권고 |
| 36 | 🟡 | **cursor 타입을 notification_id(UUID)로 권고한 것의 성능 검토** | 1차에서 UUID 기반 keyset pagination 권고 | UUID는 정렬 불가(랜덤). created_at + notification_id 복합 커서 방식이 정확하며, 동일 created_at 중복 처리를 위해 복합 커서 사용 필요. 1차 권고를 `(created_at, notification_id)` 복합 커서로 수정 |
| 37 | 🟢 | **"DND 초과 시 오래된 알림부터 DROP" 정책의 사용자 경험 검토** | 1차에서 100건 초과 시 오래된 HOLD 알림 DROP 권고 | 오래된 결재 요청 알림이 DROP되면 사용자가 영구 누락. 메신저 메시지 알림과 전자결재 알림에 동일 DROP 정책 적용 부적절. 타입별 차등 정책 필요: 전자결재는 DROP 없이 무제한 HOLD, 채팅 메시지는 최신 N건만 유지 |

---

## 10. 최종 추가 누락 항목 정리

### 10.1 게시판 구독 알림 설계 불완전 (1차 미발굴)

| # | 등급 | 항목 | 현황 | 권고 |
|---|------|------|------|------|
| 38 | 🟡 | **구독자 수 급증 시 팬아웃 처리 전략 없음** | 인기 게시판 구독자가 수백 명일 경우 게시글 1건에 수백 개 알림 생성. 팬아웃 방식(write-time fan-out vs read-time fan-out) 미정의 | 구독자 수 임계값(예: 100명 미만은 write-time, 이상은 read-time)에 따른 팬아웃 전략 또는 일괄 배치 생성 방식 명시 |
| 39 | 🟡 | **구독 중복 등록 방지 정책 없음** | 동일 사용자가 동일 target에 중복 구독 시 처리 방법 미정의. Subscription 테이블에 UNIQUE 제약 없음 | `UNIQUE (user_id, target_type, target_id)` 제약 추가, 중복 시 409 ALREADY_SUBSCRIBED 반환 |

---

### 10.2 알림 읽음 처리 설계 불완전 (1차 미발굴)

| # | 등급 | 항목 | 현황 | 권고 |
|---|------|------|------|------|
| 40 | 🟡 | **읽음 처리 동시성 문제 미정의** | 멀티 디바이스 환경에서 동일 알림을 두 디바이스에서 동시에 읽음 처리할 경우 중복 UPDATE 발생 가능. 메신저 PRD는 lastReadMessageId 일괄 처리로 해결하나 알림은 개별 읽음 처리 구조 | `PUT /api/notifications/{id}/read` 는 idempotent 처리(이미 READ이면 200 그대로 반환) 명시. DB UPDATE 시 `WHERE read_status = 'UNREAD'` 조건 추가 권고 |
| 41 | 🟢 | **읽음 처리 시 WebSocket broadcast 여부 미정의** | 한 디바이스에서 읽음 처리 시 다른 디바이스의 Bell 아이콘 unread_count 갱신 방법 미정의. 메신저 PRD는 `/user/queue/sync`로 처리함 | 알림 읽음 처리 시 동일 user_id의 다른 연결에 읽음 이벤트 broadcast 여부 및 토픽 명시 |

---

## 11. 2차 검증 결함 종합

### 신규 발견 결함 수

| 등급 | 1차 발견 | 2차 신규 발견 | 누계 |
|------|---------|-------------|------|
| 🔴 Critical | 10건 | 9건 | 19건 |
| 🟡 Major | 18건 | 16건 | 34건 |
| 🟢 Minor | 12건 | 6건 | 18건 |
| **합계** | **40건** | **31건** | **71건** |

---

## 12. 2차 검증 추가 수정 우선순위

### 즉시 수정 (Critical — 구현 전 반드시 해소)

1. **HOLD 상태 전이 규칙 및 상태 머신 다이어그램 완성** (항목 6~9)
2. **WebSocket 토픽·인증·페이로드 스펙 정의** (항목 14~15)
3. **알림 payload 보안 처리 정책 (CONFIDENTIAL 마스킹)** (항목 10)
4. **Internal API 수신자 배열 크기 제한 및 처리 방식** (항목 18)
5. **에러 코드 테이블 추가** (항목 22)
6. **Notification_Log 삭제 전파 정책** (항목 26)
7. **Internal API 보안 설계 완성 (서비스 Allowlist 또는 HMAC)** (항목 11)
8. **성능 지표 측정 주체 및 범위 명시** (항목 1)
9. **Subscription UNIQUE 제약 및 중복 등록 방지** (항목 39)

### 단기 수정 (Major — Sprint 내 해소)

10. DND 타입별 차등 DROP 정책 (항목 37)
11. Notification 테이블 인덱스 전략 정의 (항목 28)
12. 공지 알림 팬아웃 처리 전략 (항목 38)
13. 알림 생성 원자성 보장 정책 (항목 29)
14. 멀티 디바이스 읽음 동시성 처리 명시 (항목 40)
15. Internal API 동기/비동기 응답 계약 (항목 19)
16. Internal API 필드별 필수/선택 및 type 유효값 목록 (항목 20)
17. Rate Limit 초과 응답 스펙 (항목 24)
18. DEAD 알림 운영자 알람 체계 (항목 32)

### 개선 권고 (Minor)

19. cursor를 `(created_at, notification_id)` 복합 커서로 수정 (항목 36)
20. `dnd_start`/`dnd_end` timezone 처리 정책 (항목 30)
21. 배치 스케줄러 실행 주기·중복 실행 방지 (항목 33)
22. Internal API 버전 prefix 추가 (항목 21)

---

## 13. 변경 이력

| 버전 | 변경 내용 | 일자 |
|------|----------|------|
| v1.0 | 1차 검증 완료 (연계 PRD 불일치, 누락 필드·API·정책) | 2025-03-27 |
| v2.0 | 2차 검증 완료 (비기능 수치·상태 머신·보안·WebSocket·에러코드·운영 관점 추가 정밀 검토, 신규 결함 31건 추가) | 2025-03-27 |
