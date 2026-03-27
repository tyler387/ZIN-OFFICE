# PRD — 인증 / 계정 관리 (Auth & Account Management)

| 항목 | 내용 |
|------|------|
| 문서 버전 | v3.0 (2차 검증 반영) |
| 대상 조직 | ZIN Corporation (200인) |
| 기술 스택 | Spring Boot 3.x / Java 17 / JWT |
| 문서 상태 | 검토 완료 |

---

## 1. 개요 (Overview)

### 1.1 기능 목적
- 사내 그룹웨어 시스템의 안전한 인증 및 계정 관리 체계 구축
- 계정 탈취, 무차별 로그인 시도, 세션 하이재킹 방지

### 1.2 해결하려는 문제
- 취약한 로그인 / 인증 구조
- 비밀번호 정책 부재
- 세션 및 토큰 관리 미흡
- 계정 생성 및 관리 프로세스 비표준화

---

## 2. 사용자 시나리오 (User Scenario)

### 2.1 로그인
1. 사용자가 이메일과 비밀번호 입력
2. 서버는 사용자 존재 여부 확인 (존재 불일치 시 동일 오류 반환 — 타이밍 어택 방어)
3. 비밀번호 해시 검증 (bcrypt)
4. 실패 시 `failed_attempts` +1
5. 5회 초과 시 계정 LOCKED 처리 + `locked_at` 기록
6. 성공 시 Access Token(30분) / Refresh Token(7일) 발급
7. `must_change_password = true` 이거나 비밀번호 만료 시 Response에 `mustChangePassword: true` 포함
8. 클라이언트는 `mustChangePassword` 플래그 확인 후 강제 변경 화면으로 분기
9. 클라이언트는 `Authorization: Bearer` 헤더로 API 호출

### 2.2 로그아웃
1. 사용자가 로그아웃 요청 (refreshToken 포함)
2. 서버는 해당 Refresh Token `revoked = true` 처리
3. 클라이언트는 로컬 토큰 삭제

### 2.3 비밀번호 재설정 (이메일 토큰 방식 — 미로그인 상태)
1. 사용자가 이메일 입력 후 재설정 요청 (계정 존재 여부 노출 금지)
2. 서버는 UUID 토큰 생성 후 재설정 링크 이메일 발송 (만료 30분)
   - 링크 형식: `https://groupware.zin.com/auth/reset-password?token={uuid}`
3. 사용자가 링크 클릭
4. 토큰 유효성 검증 (만료 시간, `used` 여부)
5. 새 비밀번호 입력 — 정책 검증 및 최근 5개 재사용 금지 확인
6. 저장 후 토큰 `used = true` 처리

### 2.4 비밀번호 변경 (로그인 상태 — 만료 / 강제 변경)
1. 로그인 성공 후 서버가 `mustChangePassword: true` 반환
2. 클라이언트가 강제 변경 화면으로 리다이렉트 (우회 불가 — 변경 완료 전 타 API 차단)
3. 현재 비밀번호 + 새 비밀번호 입력
4. 서버는 정책 검증 및 최근 5개 재사용 금지 확인
5. 변경 완료 후 `must_change_password = false`, `password_changed_at` 갱신
6. 정상 세션 유지

### 2.5 비밀번호 만료 처리 흐름
1. 로그인 성공 후 `password_changed_at` 기준 90일 경과 여부 확인
2. 만료 7일 전부터 로그인 시 안내 배너 노출 (세션은 정상 발급)
3. 만료 시 로그인 Response에 `mustChangePassword: true` 포함 → 강제 변경 화면으로 분기

### 2.6 계정 생성

#### 초대 기반
- 관리자가 이메일 초대 발송 (`invitation_tokens` 생성, 만료 48시간)
- 사용자가 링크 접속 후 계정 생성 → ACTIVE 상태 즉시 활성화
- 토큰 만료 시 관리자가 `POST /api/admin/invitations` 재발송

#### HR 연동 (Batch)
- HR 시스템이 야간 배치로 `POST /api/internal/hr/sync` 호출
- 자동 계정 생성 또는 상태 업데이트 (이메일 중복 시 업데이트)
- 개별 레코드 실패 시 해당 항목만 `failed` 처리, 나머지는 계속 진행 (부분 커밋)

#### 자가 등록
- 사용자 직접 가입 요청 → PENDING 상태
- 관리자가 `PATCH /api/admin/users/{userId}/approve` 호출 후 ACTIVE 전환

---

## 3. 기능 요구사항 (Functional Requirements)

### 3.1 로그인 / 로그아웃
1. 이메일 + 비밀번호 로그인 제공
2. 로그인 성공 시 Access Token 발급 (JWT, 만료 30분)
3. Refresh Token 발급 및 DB 저장 (만료 7일 / Remember Me 30일)
4. 로그인 Response에 `mustChangePassword` 플래그 포함
5. 로그아웃 시 해당 Refresh Token `revoked = true` 처리
6. ACTIVE 상태 계정만 로그인 허용
7. 동시 세션 최대 5개 허용, 초과 시 가장 오래된 세션 자동 만료

### 3.2 계정 잠금 정책
8. 로그인 실패 횟수 `failed_attempts` 저장
9. **5회** 실패 시 계정 LOCKED 처리 + `locked_at` 기록
10. 로그인 성공 시 `failed_attempts` 초기화
11. `locked_at` 기준 **30분** 경과 시 자동 해제 (ACTIVE, `failed_attempts = 0`)
12. 관리자 수동 해제 지원

### 3.3 비밀번호 정책
13. 최소 8자 이상
14. 대문자 / 소문자 / 숫자 / 특수문자 각 1자 이상 포함
15. 비밀번호 만료 기간: **90일**
16. 최초 로그인 시 비밀번호 변경 강제 (`must_change_password = true`)
17. 최근 **5개** 비밀번호 재사용 금지 (`password_history` 테이블 참조)
18. 비밀번호 변경 시 `password_history` 5개 초과분은 오래된 순으로 삭제

### 3.4 비밀번호 저장
19. bcrypt 사용 (work factor 12 이상)
20. 평문 저장 절대 금지
21. Salt 포함 알고리즘 사용 (bcrypt 내장)

### 3.5 비밀번호 재설정 (미로그인 토큰 방식)
22. 이메일 기반 요청
23. 토큰 (UUID v4) 생성
24. 토큰 만료 시간: **30분**
25. 토큰 1회 사용 후 `used = true` 무효화
26. 재설정 링크 형식: `https://groupware.zin.com/auth/reset-password?token={uuid}`

### 3.6 비밀번호 변경 (로그인 상태)
27. 현재 비밀번호 확인 후 새 비밀번호로 변경
28. `must_change_password = true` 상태에서 변경 완료 전 타 API 접근 차단 (403 반환)
29. 변경 완료 후 `must_change_password = false`, `password_changed_at` 갱신

### 3.7 토큰 관리
30. Access Token 만료: **30분**
31. Refresh Token 만료: **7일** (Remember Me: **30일**)
32. Refresh Token DB 저장 (`refresh_tokens` 테이블)
33. Rotation 정책: 재발급 시 기존 토큰 `revoked = true` 처리
34. 토큰 재사용 탐지 시 해당 `user_id` 전체 세션 무효화
35. 동시 세션 5개 초과 시 가장 오래된 `refresh_tokens` 레코드 자동 만료

### 3.8 JWT Claim 명세
Access Token(JWT) 에 포함되는 Claim은 아래와 같습니다.

| Claim | 타입 | 예시값 | 설명 |
|-------|------|--------|------|
| `sub` | string | `"uuid-..."` | user_id |
| `email` | string | `"user@zin.com"` | 사용자 이메일 |
| `roles` | array | `["USER"]` | 권한 목록 |
| `exp` | number | `1700000000` | 만료 타임스탬프 (Unix) |
| `iat` | number | `1699998200` | 발급 타임스탬프 (Unix) |

### 3.9 XSS 방어
36. 입력값 sanitize 처리
37. HTML escape 적용
38. CSP 헤더 적용

> **⚠️ CSRF 보호 미적용 근거**
> 본 시스템은 JWT를 `Authorization` 헤더(Bearer)로 전달합니다. CSRF 공격은 브라우저 쿠키 자동 첨부 시 성립하므로, 현재 아키텍처에서 CSRF 보호는 불필요합니다. 향후 Cookie 방식으로 변경 시 별도 CSRF 정책을 추가해야 합니다.

### 3.10 계정 생성
39. 초대 토큰 생성 및 검증 (`invitation_tokens` 테이블)
40. HR 연동 Batch API 제공 (`POST /api/internal/hr/sync`)
41. 자가 등록 시 관리자 승인 필요 (PENDING → ACTIVE)
42. 이메일 중복 금지

### 3.11 감사 로그
43. 로그인 성공 / 실패 / 잠금 / 비밀번호 변경 이벤트 기록 (`audit_logs` 테이블)
44. 보관 기간: 1년 (개인정보보호법 기준, 법무팀 최종 확인 필요)
45. 보관 기간 초과 레코드 주기적 삭제 (배치)

---

## 4. 비기능 요구사항 (Non-functional Requirements)

| 항목 | 요구사항 | 비고 |
|------|----------|------|
| 성능 | 로그인 API 응답 500ms 이하 | P99 기준 |
| 보안 | OWASP Top 10 대응 | 연 1회 점검 |
| 확장성 | 동시 사용자 200인 기준 | ZIN Corporation 조직 규모 |
| 가용성 | SLA 99.9% | 월 다운타임 약 43분 |
| 감사 로그 | 주요 인증 이벤트 기록 | 보관 1년 |
| 장애 대응 | 인증 실패 시 재시도 정책 | 지수 백오프 권고 |

> **📌 확장성 기준**
> ZIN Corporation 200인 조직 기준으로 설계합니다. 향후 조직 확장 시 별도 확장 계획서를 작성하세요.

---

## 5. 데이터 요구사항 (Data Requirements)

### 5.1 users

| 필드 | 타입 | 설명 |
|------|------|------|
| user_id | PK (UUID) | 사용자 ID |
| email | varchar(255) | 로그인 ID (Unique) |
| password_hash | varchar(255) | bcrypt 해시 |
| status | enum | ACTIVE / LOCKED / INACTIVE / PENDING |
| failed_attempts | int default 0 | 로그인 실패 횟수 |
| locked_at | datetime nullable | 잠금 시각 — 자동 해제 시간 계산용 |
| must_change_password | boolean default false | 최초 로그인 강제 변경 플래그 |
| last_login_at | datetime nullable | 마지막 로그인 |
| password_changed_at | datetime nullable | 비밀번호 변경 시점 (만료 계산용) |
| created_at | datetime | 생성일 |
| updated_at | datetime | 수정일 |

### 5.2 password_history

비밀번호 재사용 금지(최근 5개) 구현을 위한 테이블입니다. 비밀번호 변경 시 5개 초과분은 오래된 순으로 삭제합니다.

| 필드 | 타입 | 설명 |
|------|------|------|
| id | PK (bigint) | 자동 증가 |
| user_id | FK → users.user_id | 사용자 |
| password_hash | varchar(255) | 과거 비밀번호 해시 |
| created_at | datetime | 변경 시점 |

### 5.3 password_reset_tokens

미로그인 상태에서 이메일 토큰 기반 비밀번호 재설정에 사용합니다.

| 필드 | 타입 | 설명 |
|------|------|------|
| token | PK (UUID) | 재설정 토큰 |
| user_id | FK → users.user_id | 사용자 |
| expires_at | datetime | 만료 시간 (발급 후 30분) |
| used | boolean default false | 사용 여부 |
| created_at | datetime | 생성일 |

### 5.4 refresh_tokens

| 필드 | 타입 | 설명 |
|------|------|------|
| token | PK (varchar) | Refresh Token 값 |
| user_id | FK → users.user_id | 사용자 |
| expires_at | datetime | 만료 (7일 / Remember Me 30일) |
| revoked | boolean default false | 무효 여부 |
| created_at | datetime | 생성일 |

> **복수 세션 정책:** 동일 `user_id`로 최대 5개의 활성 `refresh_tokens` 허용. 6번째 로그인 시 `created_at` 기준 가장 오래된 레코드를 `revoked = true` 처리.

### 5.5 invitation_tokens

| 필드 | 타입 | 설명 |
|------|------|------|
| token | PK (UUID) | 초대 토큰 |
| email | varchar(255) | 초대 대상 이메일 |
| invited_by | FK → users.user_id | 초대한 관리자 |
| expires_at | datetime | 만료 시간 (48시간) |
| used | boolean default false | 사용 여부 |
| created_at | datetime | 생성일 |

### 5.6 audit_logs

로그인 성공 / 실패 / 잠금 / 비밀번호 변경 이벤트를 기록합니다. 보관 기간 1년 초과분은 배치로 삭제합니다.

| 필드 | 타입 | 설명 |
|------|------|------|
| id | PK (bigint) | 자동 증가 |
| user_id | FK → users.user_id (nullable) | 사용자 (미존재 계정 시도 시 null) |
| event_type | enum | LOGIN_SUCCESS / LOGIN_FAIL / ACCOUNT_LOCKED / PASSWORD_CHANGED / PASSWORD_RESET / LOGOUT |
| ip_address | varchar(45) | 요청 IP (IPv6 포함) |
| user_agent | varchar(500) | 클라이언트 정보 |
| created_at | datetime | 이벤트 발생 시각 |

---

## 6. API 설계 (API Design)

### 6.1 POST /api/auth/login — 로그인

**Request**
```json
{
  "email": "user@zin.com",
  "password": "Password1!",
  "rememberMe": false
}
```

**Response 200**
```json
{
  "accessToken": "jwt...",
  "refreshToken": "uuid...",
  "expiresIn": 1800,
  "mustChangePassword": false
}
```

> `mustChangePassword: true` 인 경우 클라이언트는 강제 비밀번호 변경 화면으로 분기합니다. Access Token은 발급되지만 변경 완료 전 타 API 호출 시 403이 반환됩니다.

**Response 401**
```json
{
  "code": "AUTH_FAILED",
  "message": "이메일 또는 비밀번호가 올바르지 않습니다."
}
```

**Response 423**
```json
{
  "code": "ACCOUNT_LOCKED",
  "message": "계정이 잠겼습니다. 30분 후 재시도하거나 관리자에게 문의하세요."
}
```

---

### 6.2 POST /api/auth/logout — 로그아웃

**Header**
```
Authorization: Bearer {accessToken}
```

**Request**
```json
{
  "refreshToken": "uuid..."
}
```

**Response 200**
```json
{
  "message": "로그아웃 되었습니다."
}
```

---

### 6.3 POST /api/auth/refresh — 토큰 재발급

**Request**
```json
{
  "refreshToken": "uuid..."
}
```

**Response 200**
```json
{
  "accessToken": "new_jwt...",
  "refreshToken": "new_uuid...",
  "expiresIn": 1800
}
```

**Response 401**
```json
{
  "code": "TOKEN_EXPIRED",
  "message": "세션이 만료되었습니다. 다시 로그인하세요."
}
```

---

### 6.4 POST /api/auth/password/reset-request — 비밀번호 재설정 요청 (미로그인)

**Request**
```json
{
  "email": "user@zin.com"
}
```

**Response 200** _(계정 존재 여부 미노출)_
```json
{
  "message": "이메일을 확인하세요."
}
```

---

### 6.5 POST /api/auth/password/reset — 비밀번호 재설정 (미로그인, 토큰 방식)

**Request**
```json
{
  "token": "uuid...",
  "newPassword": "NewPass1!"
}
```

**Response 200**
```json
{
  "message": "비밀번호가 변경되었습니다."
}
```

**Response 400**
```json
{
  "code": "TOKEN_INVALID",
  "message": "유효하지 않거나 만료된 토큰입니다."
}
```

**Response 422**
```json
{
  "code": "PASSWORD_REUSED",
  "message": "최근 5회 이내 사용한 비밀번호는 재사용할 수 없습니다."
}
```

---

### 6.6 POST /api/auth/password/change — 비밀번호 변경 (로그인 상태) `[추가]`

최초 로그인 강제 변경 및 만료 후 변경에 사용합니다.

**Header**
```
Authorization: Bearer {accessToken}
```

**Request**
```json
{
  "currentPassword": "OldPass1!",
  "newPassword": "NewPass1!"
}
```

**Response 200**
```json
{
  "message": "비밀번호가 변경되었습니다."
}
```

**Response 401**
```json
{
  "code": "CURRENT_PASSWORD_MISMATCH",
  "message": "현재 비밀번호가 올바르지 않습니다."
}
```

**Response 422**
```json
{
  "code": "PASSWORD_REUSED",
  "message": "최근 5회 이내 사용한 비밀번호는 재사용할 수 없습니다."
}
```

---

### 6.7 POST /api/internal/hr/sync — HR 연동 Batch

**Header**
```
X-Internal-Key: {internal_api_key}
```

> 외부 노출 금지. 내부 네트워크 또는 VPN 환경에서만 접근 허용.

**Request**
```json
{
  "users": [
    {
      "email": "hong@zin.com",
      "name": "홍길동",
      "department": "개발팀",
      "employeeId": "EMP001"
    }
  ]
}
```

**Response 200**
```json
{
  "created": 3,
  "updated": 1,
  "skipped": 0,
  "failed": [
    {
      "email": "error@zin.com",
      "reason": "이메일 형식 오류"
    }
  ]
}
```

> 개별 레코드 실패 시 해당 항목만 `failed` 배열에 포함하고 나머지는 계속 처리합니다 (부분 커밋).

---

### 6.8 POST /api/admin/invitations — 초대 발송 / 재발송 `[추가]`

**Header**
```
Authorization: Bearer {accessToken}  ← ADMIN 권한 필요
```

**Request**
```json
{
  "email": "newuser@zin.com"
}
```

**Response 200**
```json
{
  "message": "초대 이메일이 발송되었습니다.",
  "expiresAt": "2025-01-01T12:00:00Z"
}
```

**Response 409**
```json
{
  "code": "EMAIL_ALREADY_EXISTS",
  "message": "이미 가입된 이메일입니다."
}
```

---

### 6.9 PATCH /api/admin/users/{userId}/approve — 자가 등록 승인 `[추가]`

**Header**
```
Authorization: Bearer {accessToken}  ← ADMIN 권한 필요
```

**Response 200**
```json
{
  "message": "계정이 활성화되었습니다.",
  "userId": "uuid...",
  "status": "ACTIVE"
}
```

**Response 404**
```json
{
  "code": "USER_NOT_FOUND",
  "message": "사용자를 찾을 수 없습니다."
}
```

**Response 409**
```json
{
  "code": "INVALID_STATUS",
  "message": "PENDING 상태의 계정만 승인할 수 있습니다."
}
```

---

## 7. UI/UX 고려사항 (UI/UX Considerations)

- 로그인 실패 메시지 통일 — 이메일/비밀번호 구분 없이 동일 메시지 반환
- 비밀번호 정책 실시간 검증 UI (입력 중 체크리스트 표시)
- 계정 잠금 시 안내 메시지 + 잠금 해제 예상 시간 표시 (`locked_at` + 30분)
- 토큰 만료 시 자동 재발급 시도 → 실패 시 로그아웃 처리
- 비밀번호 표시 / 숨김 토글 기능
- 비밀번호 만료 7일 전 로그인 시 배너 알림
- 최초 로그인 / 만료 시 비밀번호 강제 변경 화면 (우회 불가)
- 강제 변경 상태(`mustChangePassword: true`)에서 타 메뉴 비활성화

---

## 8. 예외 케이스 (Edge Cases)

| 상황 | 처리 방식 |
|------|----------|
| 존재하지 않는 이메일 로그인 | 동일 오류 응답 반환 (타이밍 어택 방어) |
| 비밀번호 불일치 | `failed_attempts` +1, 5회 시 LOCKED |
| LOCKED 계정 로그인 | 로그인 차단, 해제 예상 시간 안내 |
| Access Token 만료 | 401 → 클라이언트가 `/auth/refresh` 호출 |
| Refresh Token 만료 | 401 → 재로그인 요구 |
| Refresh Token 재사용 감지 | 해당 `user_id` 전체 세션 무효화 |
| 동시 세션 5개 초과 | 가장 오래된 세션 자동 만료 |
| 비밀번호 재설정 토큰 재사용 | 400 TOKEN_INVALID 반환 |
| 비밀번호 재사용 (최근 5개) | 422 PASSWORD_REUSED 반환 |
| XSS 입력 | sanitize 처리 후 저장 |
| 비밀번호 만료 후 로그인 | `mustChangePassword: true` 반환 → 강제 변경 화면 |
| `must_change_password = true` 상태에서 타 API 호출 | 403 반환 |
| HR 연동 중 중복 이메일 | 기존 계정 업데이트, 신규 생성 없음 |
| HR 연동 중 개별 레코드 오류 | `failed` 배열에 포함, 나머지 처리 계속 |
| 초대 토큰 만료 (48시간) | 400 반환, `POST /api/admin/invitations` 재발송 안내 |
| PENDING 계정 로그인 시도 | 401 반환, 관리자 승인 대기 안내 |

---

## 9. 오픈 이슈 (Open Questions)

| # | 이슈 | 영향도 | 현재 상태 |
|---|------|--------|----------|
| 1 | MFA(2차 인증) 도입 여부 | High | 미결 — 미도입 시에도 `users` 테이블에 `mfa_enabled` / `mfa_secret` 예약 컬럼 추가 권고 |
| 2 | SSO 연동 (Google, Azure AD) | High | 미결 — 도입 시 OAuth2 Provider 추가 설계 필요 |
| 3 | HR 연동 실시간 API 전환 여부 | Medium | 현재 Batch 기본. 실시간 필요 시 별도 설계 |
| 4 | 로그인 이력 UI 제공 여부 | Low | 미결 — `audit_logs` 테이블 활용 가능 |
| 5 | 감사 로그 보관 기간 법무 확인 | Medium | 1년 잠정 설정. 법무팀 최종 확인 필요 |

---

## 10. 변경 이력 (Change Log)

| 버전 | 변경 내용 | 일자 |
|------|----------|------|
| v1.0 | 최초 작성 | - |
| v2.0 | 1차 검증 반영: 수치 전 항목 확정(5회/5개/30분/7일), `locked_at` · `must_change_password` · `password_history` · `invitation_tokens` 추가, CSRF 섹션 제거, API Response 전 항목 완성, 비밀번호 만료 플로우 추가, 비기능 요구사항 200인 기준 수정, HR 연동 API 스펙 추가 | - |
| v3.0 | 2차 검증 반영: `POST /api/auth/password/change` 추가, 로그인 Response에 `mustChangePassword` 플래그 추가, `password_history` 초과분 정리 정책 명시, Refresh Token 복수 세션 정책(최대 5개) 추가, HR Batch 부분 실패 처리(`failed` 배열) 추가, 초대 재발송 API(`POST /api/admin/invitations`) 추가, 자가 등록 승인 API(`PATCH /api/admin/users/{userId}/approve`) 추가, JWT Claim 명세 추가, 비밀번호 재설정 링크 URL 형식 명시, `audit_logs` 테이블 정의 추가 | - |
