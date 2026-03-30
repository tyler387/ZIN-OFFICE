# 관리자 콘솔(Admin Console) PRD — 2차 심층 검증 보고서

> **검증 회차:** 2차 (1차 보고서 기반 재검증 + 신규 발굴)
> **검증 대상:** 관리자_콘솔prd.md (v3.0) + 최종검증_PRD (v3 Production Ready)
> **교차 검증 대상:** 로그인_인증prd.md / 조직도prd.md / 메신저prd.md / 메일prd.md / 전자결재prd.md
> **검증 원칙:** 1차 보고서에서 발견된 항목은 상태를 재확인하고, 이번 회차에서 새롭게 발굴된 항목에 집중
> **작성일:** 2026-03-30

---

## 목차

1. [1차 검증 이후 상태 총괄](#1-1차-검증-이후-상태-총괄)
2. [신규 발굴 결함 — Critical](#2-신규-발굴-결함--critical)
3. [신규 발굴 결함 — High](#3-신규-발굴-결함--high)
4. [신규 발굴 결함 — Medium](#4-신규-발굴-결함--medium)
5. [신규 발굴 결함 — Low](#5-신규-발굴-결함--low)
6. [스키마 충돌 정밀 분석](#6-스키마-충돌-정밀-분석)
7. [API 시나리오별 흐름 검증](#7-api-시나리오별-흐름-검증)
8. [보안 심층 검증](#8-보안-심층-검증)
9. [전체 결함 목록 통합표](#9-전체-결함-목록-통합표)
10. [최종 권고 로드맵](#10-최종-권고-로드맵)

---

## 1. 1차 검증 이후 상태 총괄

1차 보고서에서 제기된 항목들을 PRD 원문과 재대조하여 상태를 확인했다.

| 1차 결함 ID | 항목 | PRD 반영 여부 | 2차 판단 |
|:-----------:|------|:------------:|---------|
| C-1 | 관리자 MFA 정책 미확정 | ❌ 미반영 | 여전히 개발 차단 수준 위험 |
| C-2 | Rate Limiting 누락 | ❌ 미반영 | 신규 세부 분석 추가 (§8) |
| C-3 | CSV 롤백 기능 미정의 | ❌ 미반영 | Auth HR Batch와 정책 충돌 재확인 |
| C-4 | 도메인 분리 미결 | ❌ 미반영 | 추가 영향 범위 분석 (§7) |
| H-1 | 알림 연동 스펙 부재 | ❌ 미반영 | 전자결재 패턴 참조 권고 |
| H-2 | 메뉴 순환 참조 방어 | ❌ 미반영 | 조직도 PRD 대비 명백한 누락 |
| H-3 | Feature Flag rollout 미지원 | ❌ 미반영 | 이번 회차에서 추가 설계안 제시 |
| H-4 | Audit Log 배치 삭제 로직 | ❌ 미반영 | **Immutability 원칙과 구조적 충돌** 재정의 |
| H-5 | 테넌트 온보딩 플로우 누락 | ❌ 미반영 | 심각도 상향 조정 (Critical) |
| M-1 ~ M-6 | 중간 결함들 | ❌ 전부 미반영 | 유지 |

> **결론:** 1차 보고서 제기 항목 중 PRD에 반영된 것은 없음. 이번 2차 검증에서는 1차 미발굴 신규 항목 **16개**를 추가로 발굴함.

---

## 2. 신규 발굴 결함 — Critical

### NC-1. `audit_logs` 테이블이 Auth PRD와 완전히 다른 스키마로 이중 정의됨

**심각도:** 🔴 Critical — DB 설계 충돌, 마이그레이션 불가

**발견 위치:**
- Admin PRD §5.7 `audit_logs` 테이블
- Auth PRD §5.6 `audit_logs` 테이블

**충돌 내용:**

| 필드 | Admin PRD `audit_logs` | Auth PRD `audit_logs` |
|------|------------------------|----------------------|
| PK | `log_id` (bigint, auto) | `id` (bigint, auto) |
| 이벤트 구분 | `action` varchar(100) | `event_type` enum |
| 대상 리소스 | `target` varchar(255) | 없음 |
| 변경 전후 | `before_data` JSON / `after_data` JSON | 없음 |
| 결과 | `result` enum(SUCCESS/FAIL) | 없음 |
| 트레이스 | `request_id` varchar(100) | 없음 |
| 이벤트 종류 | ROLE_CREATED, MENU_DELETED 등 | LOGIN_SUCCESS, ACCOUNT_LOCKED 등 |
| `tenant_id` | ✅ 있음 | ❌ 없음 |

**문제의 본질:**
두 PRD가 같은 이름(`audit_logs`)을 쓰면서 완전히 다른 목적·구조의 테이블을 정의하고 있다. 단일 DB 환경에서 동시 마이그레이션 시 충돌이 발생하며, 통합 감사 조회가 구조적으로 불가능해진다.

**권고:**
아래 세 가지 중 하나를 프로젝트 레벨에서 결정하고 모든 PRD에 반영할 것.

| 전략 | 설명 | 권고 여부 |
|------|------|:--------:|
| 통합 단일 테이블 | 모든 이벤트를 `audit_logs` 하나에 저장, `event_category` 컬럼으로 구분 | ⭐ 권고 |
| 기능별 분리 테이블 | `auth_audit_logs` + `admin_audit_logs`로 명칭 분리 | 차선책 |
| 현 구조 유지 + View | 두 테이블 유지, 통합 조회용 DB View 생성 | 비권고 |

**통합 단일 테이블 권고 스키마:**
```sql
CREATE TABLE audit_logs (
  log_id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id      UUID NOT NULL,
  event_category ENUM('AUTH', 'ADMIN', 'APPROVAL') NOT NULL,  -- 이벤트 출처
  event_type     VARCHAR(100) NOT NULL,  -- LOGIN_SUCCESS, ROLE_CREATED 등
  user_id        UUID NULL,
  target         VARCHAR(255) NULL,
  ip_address     VARCHAR(45),
  user_agent     VARCHAR(500),
  request_id     VARCHAR(100),
  before_data    JSON NULL,
  after_data     JSON NULL,
  result         ENUM('SUCCESS', 'FAIL') NOT NULL,
  created_at     DATETIME NOT NULL
);
```

---

### NC-2. `users` 테이블이 두 PRD에서 중복 정의되며 필드 집합이 불일치

**심각도:** 🔴 Critical — 단일 테이블이어야 하는데 정의가 분리됨

**발견 위치:**
- Auth PRD §5.1 `users` 테이블 (11개 필드)
- Admin PRD §5.1 `users` 테이블 (6개 필드, "Auth PRD 참조 후 추가 필드만 명시" 기술)

**충돌 내용:**

Admin PRD는 "추가 필드만 명시한다"고 명시하나, 실제로 `name`, `email` 같은 Auth PRD에도 존재하는 필드를 다시 나열하고 있다. 더 심각한 것은 **두 PRD의 필드 정의가 서로 보완 관계가 아닌 부분 중복 관계**라는 점이다.

| 필드 | Auth PRD | Admin PRD | 불일치 여부 |
|------|:--------:|:---------:|:-----------:|
| `user_id` | ✅ PK UUID | ✅ PK UUID | 일치 |
| `email` | ✅ varchar(255) Unique | ✅ varchar(255) | Auth PRD의 `UNIQUE` 제약 누락 |
| `name` | ❌ 없음 | ✅ varchar(100) | Auth PRD에 `name` 컬럼 없음 |
| `department` | ❌ 없음 | ✅ varchar(100) | 조직도 PRD와도 충돌 (조직도는 별도 `departments` 테이블 참조) |
| `employee_id` | ❌ 없음 | ✅ varchar(50) | Auth PRD 누락 |
| `tenant_id` | ❌ 없음 | ✅ FK | Auth PRD에 `tenant_id` 없음 — 멀티 테넌트 식별 불가 |
| `status` | ✅ enum(ACTIVE/LOCKED/INACTIVE/PENDING) | ❌ 없음 | Admin PRD에서 status 조회 불가 |
| `must_change_password` | ✅ boolean | ❌ 없음 | Admin PRD의 계정 관리에서 참조 불가 |

**핵심 문제:**
Auth PRD의 `users`에는 `tenant_id`가 없다. 멀티 테넌트 전략이 Row-level인 Admin PRD에서 사용자를 테넌트별로 격리하려면 `tenant_id`가 `users` 테이블에 반드시 있어야 한다. Auth PRD는 이를 정의하지 않아, 인증 시스템에서 테넌트 분리가 근본적으로 불가능하다.

**권고:** `users` 테이블에 대한 **마스터 스키마 문서**를 별도로 작성하고, Auth PRD와 Admin PRD 양쪽에서 참조하도록 구조를 변경할 것. 최소한 Auth PRD에 `tenant_id`, `name`, `employee_id` 컬럼을 추가하고 단일 정의로 통합해야 한다.

---

### NC-3. `POST /api/admin/users/{userId}/roles` — 존재하지 않는 `userId`에 대한 처리 미정의

**심각도:** 🔴 Critical — API 명세 결함

**발견 위치:** §6.2 `POST /api/admin/users/{userId}/roles`

**문제:**
Role 할당 API의 응답 명세에 **200 성공과 400(마지막 Role 해제) 케이스만 있고**, `userId`가 존재하지 않는 경우(`404 USER_NOT_FOUND`), Role ID가 존재하지 않는 경우(`404 ROLE_NOT_FOUND`), 다른 테넌트 사용자에게 할당하려는 경우(`403`) 에러 응답이 전혀 없다.

`DELETE /api/admin/users/{userId}/roles/{roleId}` 도 동일하게 `userId`, `roleId` 미존재 케이스의 응답이 없다.

**권고:**
```
POST /api/admin/users/{userId}/roles
  → 200 성공
  → 404 USER_NOT_FOUND
  → 404 ROLE_NOT_FOUND (roleIds 배열 중 하나라도 미존재 시)
  → 403 CROSS_TENANT_FORBIDDEN (다른 테넌트 사용자/Role 접근 시)

DELETE /api/admin/users/{userId}/roles/{roleId}
  → 200 성공
  → 400 LAST_ROLE_CANNOT_BE_REMOVED
  → 404 USER_NOT_FOUND
  → 404 ROLE_NOT_FOUND
```

---

### NC-4. 멀티 테넌트 환경에서 Permission 테이블에 `tenant_id`가 없음

**심각도:** 🔴 Critical — 테넌트 간 Permission 공유 구조 설계 오류

**발견 위치:** §5.3 `permissions` 테이블

**문제:**
`permissions` 테이블에 `tenant_id` 컬럼이 없다. 현재 설계는 **모든 테넌트가 동일한 Permission 세트를 공유**하는 구조다. 그러나 §3.1 #6에서 "시스템 초기화 시 SUPER_ADMIN Role과 전체 Permission 세트를 DB 마이그레이션으로 자동 생성"한다고 했는데, 이것이 **전체 시스템 공통 Permission**인지 **테넌트별 Permission**인지 불명확하다.

**영향:**
- 테넌트 A가 커스텀 Permission을 추가하면 테넌트 B에도 노출됨
- Permission 목록 API(`GET /api/admin/permissions`)가 `tenant_id` 필터 없이 전체를 반환하면 타 테넌트 Permission이 노출됨

**권고:**
Permission의 성격을 명확히 구분할 것.

| 구분 | 정의 | tenant_id |
|------|------|-----------|
| 시스템 공통 Permission | 모든 테넌트에 동일하게 적용 (예: `menu:dashboard:read`) | NULL |
| 테넌트 커스텀 Permission | 특정 테넌트만 사용 | NOT NULL |

`permissions` 테이블에 `tenant_id UUID nullable` 추가하고, `GET /api/admin/permissions`에서 `WHERE tenant_id = ? OR tenant_id IS NULL` 조건을 적용하도록 명세에 추가할 것.

---

## 3. 신규 발굴 결함 — High

### NH-1. `GET /api/admin/menus` — 테넌트 격리 적용 여부 불명확

**발견 위치:** §6.1 `GET /api/admin/menus`

**문제:**
메뉴 조회 API Response에 `tenant_id` 필드가 없고, 기본 메뉴(`is_default=true`, `tenant_id=NULL`)와 테넌트 커스텀 메뉴(`tenant_id=요청 테넌트`)를 어떻게 혼합하여 반환하는지 명세가 없다. 현재 Request에 테넌트를 구분하는 파라미터도 없고, JWT에서 `tenant_id`를 추출하여 필터링하는지도 불명확하다.

**예상 쿼리 (현재 명세로 추정):**
```sql
SELECT * FROM menus
WHERE tenant_id = ? OR is_default = true
ORDER BY order_no
```

이 쿼리가 의도인지 명시해야 하며, Response에 `isDefault`와 `tenantId` 필드를 포함해야 관리자가 어떤 메뉴가 공통/커스텀인지 구분할 수 있다.

**권고:** Response 항목에 `tenantId (nullable)` 필드 추가 및 필터링 로직 명시.

---

### NH-2. Role 할당 시 타 테넌트 Role을 다른 테넌트 사용자에게 부여 가능한 구조적 취약점

**발견 위치:** §6.2 `POST /api/admin/users/{userId}/roles`

**문제:**
`POST /api/admin/users/{userId}/roles` Request의 `roleIds` 배열에 **다른 테넌트의 Role UUID**를 넣어도 이를 차단하는 검증 로직이 명세에 없다. DB 레벨에서도 `user_roles`와 `roles` 간의 테넌트 일치 제약이 없다.

**공격 시나리오:**
```
1. 공격자가 테넌트 A의 관리자 권한 획득
2. 테넌트 B의 SUPER_ADMIN role_id를 사전에 알고 있음 (UUID 예측 어렵지만 내부자 가능)
3. POST /api/admin/users/{테넌트A_유저}/roles
   Body: { "roleIds": ["테넌트B_SUPER_ADMIN_role_id"] }
4. 검증 없으면 크로스 테넌트 권한 부여 성공
```

**권고:**
```
Role 할당 전 서버 검증 추가:
  IF roles.tenant_id != NULL AND roles.tenant_id != request_tenant_id THEN
    → 403 CROSS_TENANT_FORBIDDEN 반환
  IF users.tenant_id != request_tenant_id THEN
    → 403 CROSS_TENANT_FORBIDDEN 반환
```

---

### NH-3. `bulk_jobs.file_path` — 원본 CSV 보관 기간 및 접근 제어 미정의

**발견 위치:** §5.9 `bulk_jobs` 테이블, §6.5

**문제:**
업로드된 원본 CSV는 `file_path`에 저장되나, 이 파일의 보관 기간과 접근 제어가 전혀 정의되지 않았다. 실패 파일(`fail_file_path`)은 24시간 만료가 정의되어 있으나, **원본 파일은 만료 정책 없이 영구 보관**되는 구조다.

**위험:**
원본 CSV에는 `email`, `name`, `department`, `employee_id` 등 개인정보가 포함된다. 이 파일이 인증 없이 직접 경로로 접근 가능하다면 개인정보보호법 위반 소지가 있다.

**권고:**
- 원본 CSV: Job 완료 후 **7일** 보관 후 삭제 (또는 즉시 삭제 정책 명시)
- 모든 파일 접근은 Presigned URL 또는 인증 기반 API를 통해서만 허용
- `bulk_jobs.file_expires_at` 필드 추가

---

### NH-4. Feature Flag 초기 데이터 세팅 방식 미정의

**발견 위치:** §5.8 `feature_flags`, §6.4

**문제:**
`PUT /api/admin/features/{featureKey}`로 Feature Flag를 변경할 수 있지만, **Feature Key를 최초로 생성하는 방법이 없다.** DB에 존재하지 않는 Key로 PUT 요청 시 `404 FEATURE_NOT_FOUND`를 반환하도록 명세되어 있으나, 그렇다면 최초 Key 등록은 어떻게 하는가?

현재 추론 가능한 방식:
1. DB 마이그레이션으로 사전 삽입 (하지만 명세에 없음)
2. `POST /api/admin/features` API로 생성 (API가 없음)
3. `PUT`으로 upsert 처리 (명세와 다름, 404를 반환한다고 명시)

**권고:**
아래 중 하나를 명세에 추가할 것.
- `POST /api/admin/features` — Feature Flag 신규 등록 API 추가
- 또는 DB 마이그레이션으로 전체 Feature Key 목록을 사전 정의하고, 런타임에 신규 추가는 불가로 명시

---

### NH-5. `POST /api/admin/roles/{roleId}/permissions` — 부분 성공 처리 로직 불일치

**발견 위치:** §6.2, §8 예외 케이스

**문제:**
Permission 매핑 API는 `permissionIds` 배열을 받아 일괄 등록하는 구조다. §8 예외 케이스에 "Permission 중복 매핑 → 409 반환, **중복 항목은 무시하고 나머지 처리**"라고 명시되어 있다.

그러나 API Response는 `200 OK` 또는 `409`로만 정의되어 있어, "일부 성공·일부 중복" 상황을 클라이언트에 정확히 알릴 수 없다.

**예시:**
```json
// 요청: permissionIds: ["A", "B", "C"] 중 B가 이미 매핑됨
// 현재 명세로는 409도 되고 200도 될 수 있어 모호

// 권고 응답 예시:
{
  "added": ["A", "C"],
  "skipped": ["B"],
  "message": "일부 Permission이 추가되었습니다. 중복 항목은 무시되었습니다."
}
```

**권고:** 부분 성공 케이스를 `207 Multi-Status` 또는 `200 OK + 상세 응답`으로 처리하도록 명세에 추가할 것.

---

### NH-6. 테넌트 브랜딩 변경의 캐시 정책 미정의

**발견 위치:** §3.7, §6.6

**문제:**
Feature Flag 변경 시에는 Redis 캐시 즉시 invalidate + Pub/Sub 브로드캐스트가 명세되어 있으나, 테넌트 브랜딩(로고, 색상, 회사명) 변경 시 캐시 정책이 전혀 없다. "저장 즉시 전체 UI에 반영"이라고 명시했지만, 브랜딩 정보가 캐싱되고 있다면 즉시 반영이 보장되지 않는다.

**권고:**
- 브랜딩 정보 캐싱 전략을 명시할 것 (캐싱 안 함 / TTL 기반 / 변경 시 invalidate)
- 캐싱한다면 `tenant_id` 단위 캐시 키와 TTL을 정의할 것

---

### NH-7. `DELETE /api/admin/roles/{roleId}` — Role 수정(PUT) API 누락

**발견 위치:** §6.2

**문제:**
Role에 대해 `POST`(생성), `DELETE`(삭제), 그리고 Permission 매핑/해제가 있으나, **Role 자체의 `name`, `description`을 수정하는 `PUT /api/admin/roles/{roleId}` API가 없다.** UI/UX 고려사항(§7)에 "시스템 기본 Role 수정 버튼 비활성화"가 언급되어 있어 수정 기능이 있음을 암시하지만 API가 정의되지 않았다.

**권고:**
```
PUT /api/admin/roles/{roleId}
  Request: { "name": "HR_MANAGER", "description": "수정된 설명" }
  Response 200: { "message": "Role이 수정되었습니다." }
  Response 403: SYSTEM_ROLE_PROTECTED (is_system=true Role 수정 시도)
  Response 409: ROLE_NAME_DUPLICATED
```

---

## 4. 신규 발굴 결함 — Medium

### NM-1. `GET /api/admin/audit-logs` — `action` 필터가 자유 입력 문자열

**발견 위치:** §6.3 감사 로그 목록 조회 Query Parameters

**문제:**
`action` 파라미터가 `string` 타입으로 자유 입력이다. 그러나 `audit_logs.action`은 `ROLE_CREATED`, `MENU_DELETED` 등 정해진 값만 존재한다. 자유 문자열을 그대로 SQL `LIKE` 또는 `=` 조건으로 사용하면 **SQL Injection 취약점** 또는 **빈 결과 반환** 오류가 발생할 수 있다.

**권고:**
- `action`을 enum 목록(`GET /api/admin/audit-logs/actions`)으로 제공하거나
- 파라미터 타입을 `enum`으로 변경하고 허용 값 목록을 명세에 명시할 것

---

### NM-2. CSV 업로드 동시 실행 충돌 처리 미정의

**발견 위치:** §3.6, §5.9

**문제:**
동일 테넌트의 두 관리자가 동시에 CSV를 업로드하면 두 개의 Job이 동시에 `PROCESSING` 상태가 된다. 동일 이메일에 대해 두 Job이 동시에 UPDATE를 시도하면 **Last-Write-Wins** 상태가 되어 어떤 데이터가 최종 반영될지 보장할 수 없다.

**권고:**
- 테넌트당 동시 처리 가능한 Job 수를 1개로 제한하거나
- 동일 Job이 이미 `PROCESSING` 중이면 새 업로드를 `409 JOB_ALREADY_PROCESSING`으로 차단하는 정책을 명세에 추가할 것

---

### NM-3. `employee_id`가 `users` 테이블과 `bulk_jobs` CSV 둘 다 등장하나 UNIQUE 제약 미정의

**발견 위치:** Admin PRD §5.1 `users.employee_id`, §3.6 CSV 필수 컬럼

**문제:**
`employee_id`(사원번호)는 조직 내에서 고유해야 하는 식별자이나, `users` 테이블에 `UNIQUE(tenant_id, employee_id)` 제약이 없다. CSV 업로드 시 중복 `employee_id`가 있을 경우의 처리 방식도 정의되지 않았다.

**권고:**
- `users` 테이블에 `UNIQUE(tenant_id, employee_id)` 제약 추가
- CSV 업로드 시 `employee_id` 중복 케이스를 예외 케이스 표에 추가 (`EMPLOYEE_ID_DUPLICATED`)

---

### NM-4. Permission `key` 필드의 네이밍 컨벤션 미표준화

**발견 위치:** §5.3 `permissions.key`, §3.4 메뉴 접근 제어

**문제:**
PRD 전반에서 Permission key 예시가 혼재되어 있다.

| 출처 | Permission key 예시 |
|------|---------------------|
| Admin PRD §5.3 | `menu:dashboard:read` |
| 메신저 PRD | `chat:read`, `chat:write`, `chat:notice:write` |
| 조직도 PRD | `org:read`, `org:write` |
| 전자결재 PRD | `approval:read`, `approval:write`, `approval:admin` |

`menu:dashboard:read`는 3-depth 구조이나, 나머지는 2-depth 구조다. `resource:sub-resource:action` vs `resource:action` 방식이 혼용되어 있어 Permission 관리 및 미들웨어 파싱 로직 구현에 일관성이 없다.

**권고:**
전체 프로젝트에서 Permission key 컨벤션을 통일할 것.

```
표준안 1 (2-depth): {module}:{action}
  예: chat:read, org:write, approval:admin

표준안 2 (3-depth): {module}:{resource}:{action}
  예: chat:message:read, org:dept:write, approval:doc:approve

→ 표준안 2를 채택하면 세분화된 접근 제어 가능, 초기 복잡도 증가
→ 표준안 1을 채택하면 단순하나, 향후 세분화 시 키 구조 변경 필요
```

---

### NM-5. `PUT /api/admin/menus/{menuId}` — `permission_key` 변경 시 기존 Role 매핑 영향 미정의

**발견 위치:** §6.1 메뉴 수정 API

**문제:**
메뉴의 `permission_key`를 변경하면 해당 메뉴에 접근 가능했던 사용자들의 권한이 변경된다. 그러나 이에 따른 영향(기존 Role에 매핑된 Permission과의 연관 관계, 캐시 무효화 등)이 명세에 없다.

특히 `permissions.key`와 `menus.permission_key`는 논리적으로 연결되어 있으나, 물리적 FK가 없어 `menus.permission_key` 변경 시 `permissions` 테이블과의 정합성이 깨질 수 있다.

**권고:**
- `menus.permission_key`를 `permissions.key`에 FK로 연결하거나
- 변경 시 연관 Permission 존재 여부를 서버에서 검증하고, 없으면 `400 PERMISSION_NOT_FOUND` 반환하도록 명세에 추가

---

### NM-6. `GET /api/admin/users/bulk-jobs/{jobId}` — 다른 테넌트의 Job ID 접근 가능 여부 미정의

**발견 위치:** §6.5

**문제:**
Job ID가 UUID이므로 예측 불가능하지만, 동일 테넌트 내의 권한 없는 관리자가 다른 관리자의 Job 상태를 조회하거나, 크로스 테넌트 Job ID 접근 시도에 대한 처리가 없다. Response에 `createdBy` 필드가 없어 해당 Job의 소유자를 응답에서 확인할 수도 없다.

**권고:**
- `bulk_jobs` 조회 시 `tenant_id` 검증 필수 명시
- Job 소유자(`created_by`)가 아닌 관리자의 접근을 허용할지 여부 정책 결정 (같은 테넌트 내 SUPER_ADMIN은 모든 Job 조회 가능 등)
- Response에 `createdBy` 필드 추가

---

## 5. 신규 발굴 결함 — Low

### NL-1. `PUT /api/admin/tenant/branding` — `name` 빈 문자열 허용 여부 미정의

**발견 위치:** §6.6

**문제:** `name`에 빈 문자열(`""`) 또는 공백만 있는 경우의 검증 처리가 없다. 회사명이 빈 값으로 저장되면 UI 전체에 빈 타이틀이 노출된다.

**권고:** `name` 필드에 최소 1자 이상 검증 추가, `400 INVALID_NAME` 에러 코드 추가.

---

### NL-2. `GET /api/admin/roles` — Permission 상세 목록 포함 여부 미정의

**발견 위치:** §6.2

**문제:** Role 목록 Response에 `permissionCount`(숫자)는 있으나 실제 Permission 목록은 없다. 관리자가 각 Role에 어떤 Permission이 매핑되어 있는지 확인하려면 별도 API가 필요한데, `GET /api/admin/roles/{roleId}/permissions` 같은 API가 없다.

**권고:** `GET /api/admin/roles/{roleId}/permissions` API 추가 또는 Role 상세 조회 API 추가.

---

### NL-3. `DELETE /api/admin/tenant/branding/logo` — 삭제 전 로고가 없을 때 처리 미정의

**발견 위치:** §6.6

**문제:** 현재 로고가 없는 상태(`logo_url = NULL`)에서 삭제 API를 호출하면 어떻게 동작하는지 정의가 없다. `200 OK`로 멱등하게 처리할지, `404`를 반환할지 명시 필요.

**권고:** 로고 없는 상태에서 삭제 시 `200 OK` + "이미 기본 로고입니다." 메시지로 멱등하게 처리하도록 명세에 추가.

---

### NL-4. 감사 로그 `action` 값 표준 목록 미정의

**발견 위치:** §5.7, §3.2 #12

**문제:** §5.7에서 `action`의 예시로 `ROLE_CREATED`, `MENU_DELETED`를 들었으나, 전체 action 값 목록이 어디에도 정의되어 있지 않다. 이는 감사 로그 필터 UI 구현과 CSV Export 컬럼 표준화를 어렵게 한다.

**권고:** 부록으로 전체 `audit_logs.action` 허용값 목록을 명세에 추가할 것.

| 카테고리 | action 예시 |
|----------|------------|
| Role 관리 | ROLE_CREATED, ROLE_UPDATED, ROLE_DELETED |
| Permission | PERMISSION_ASSIGNED, PERMISSION_REMOVED |
| 메뉴 | MENU_CREATED, MENU_UPDATED, MENU_DELETED |
| Feature | FEATURE_FLAG_CHANGED |
| 사용자 | USER_ROLE_ASSIGNED, USER_ROLE_REMOVED, BULK_JOB_CREATED |
| 브랜딩 | LOGO_UPLOADED, LOGO_DELETED, BRANDING_UPDATED |

---

### NL-5. UI/UX와 API 명세의 드래그 앤 드롭 정렬 구현 방법 미정의

**발견 위치:** §7 UI/UX "메뉴 Tree 구조 UI 제공 (드래그 앤 드롭 정렬)"

**문제:** 드래그 앤 드롭으로 메뉴 순서를 바꾸면 `order_no`를 일괄 업데이트해야 한다. 그러나 현재 `PUT /api/admin/menus/{menuId}`는 단건 수정만 지원한다. 5개 메뉴 순서를 바꾸면 5번의 API 호출이 필요하여 성능과 원자성 문제가 발생한다.

**권고:**
```
PATCH /api/admin/menus/order — 메뉴 순서 일괄 변경 API 추가
Request:
{
  "orders": [
    { "menuId": "uuid-1", "orderNo": 1 },
    { "menuId": "uuid-2", "orderNo": 2 }
  ]
}
Response 200: { "message": "메뉴 순서가 변경되었습니다." }
```

---

## 6. 스키마 충돌 정밀 분석

### 6.1 전체 PRD 간 테이블 중복 정의 현황

| 테이블명 | 정의 위치 | 충돌 수준 |
|---------|---------|:--------:|
| `audit_logs` | Admin PRD §5.7 + Auth PRD §5.6 | 🔴 구조 충돌 (NC-1) |
| `users` | Admin PRD §5.1 + Auth PRD §5.1 + 조직도 PRD | 🔴 필드 불일치 (NC-2) |
| `departments` | Admin PRD §5.1(users.department 문자열) + 조직도 PRD(별도 테이블) | 🟠 설계 충돌 |

### 6.2 `users.department` vs `조직도 PRD` 충돌

Admin PRD §5.1에서 `users.department varchar(100)`으로 부서명을 문자열로 저장한다. 그러나 조직도 PRD는 `departments` 테이블과 `user_departments` 테이블로 부서-사용자 관계를 정규화하여 관리한다.

**영향:**
- Admin CSV 업로드에서 `department` 컬럼으로 부서명 문자열을 받아 `users.department`에 저장하면, 조직도의 `departments` 테이블과 동기화되지 않음
- 조직도에서 부서명을 변경해도 `users.department` 문자열은 구버전 부서명을 유지
- 결국 두 개의 "부서 정보 진실의 원천"이 존재하게 됨

**권고:**
`users.department` 컬럼을 제거하고, Admin CSV 업로드 시 `department` 이름으로 `departments.dept_id`를 조회하여 `user_departments`에 삽입하는 방식으로 통일할 것.

### 6.3 `permissions` vs 타 PRD의 권한 정의 현황

| PRD | 권한 정의 방식 |
|-----|---------------|
| Admin PRD | `permissions` 테이블 (permission_id, resource, action, key) |
| 메신저 PRD | `permission_key: chat:read` (문자열 직접 참조) |
| 조직도 PRD | `org:read`, `org:write` (문자열 직접 참조) |
| 전자결재 PRD | `approval:read`, `approval:write` (문자열 직접 참조) |

타 PRD들은 Permission을 `permissions` 테이블의 `key` 컬럼 값으로 참조하는 것으로 보이나, 명시적 FK가 없다. 타 PRD에서 정의한 `chat:read` 등의 Permission key가 `permissions` 테이블에 DB 마이그레이션으로 사전 삽입되어야 하는데, 이 초기 데이터 목록이 어디에도 없다.

---

## 7. API 시나리오별 흐름 검증

### 7.1 신규 관리자 온보딩 흐름 전체 검증

현재 PRD로 신규 관리자가 온보딩되는 흐름을 추적한 결과:

```
1. 테넌트 생성
   → API 없음 ❌ (NC-4에서 지적)

2. SUPER_ADMIN 계정 생성
   → DB 마이그레이션으로만 가능, API 없음 ❌

3. 초대 이메일 발송
   → POST /api/admin/invitations (Auth PRD) ✅

4. 신규 관리자 계정 생성 후 Role 할당
   → POST /api/admin/users/{userId}/roles ✅

5. 관리자 로그인
   → POST /api/auth/login ✅

6. 최초 비밀번호 변경
   → POST /api/auth/password/change ✅

7. Permission 기반 메뉴 조회
   → GET /api/admin/menus ✅
```

**결론:** 1번(테넌트 생성)과 2번(SUPER_ADMIN 계정 생성)이 API로 정의되지 않아 완전한 셀프서비스 온보딩이 불가능하다. 현재는 DB를 직접 조작해야만 최초 세팅이 가능하다.

### 7.2 Feature Flag 변경 → 서비스 접근 차단 흐름 검증

```
1. PUT /api/admin/features/feature:chat → enabled: false
   → Redis DEL feature:chat:{tenant_id} ✅
   → Redis Pub/Sub broadcast ✅

2. 사용자가 채팅방 접근 시도
   → API 레벨에서 Feature Flag 조회
   → Redis 미스 시 DB 조회 → 30초 TTL 캐시 ✅
   → 403 반환 ✅

3. Feature Flag 변경 감사 로그 기록
   → audit_logs 저장 ✅

4. 변경 알림
   → 알림 정책 없음 ❌ (H-1에서 지적)

5. Redis Pub/Sub 실패 시
   → Fallback 없음 ❌ (M-1에서 지적)
```

### 7.3 CSV 일괄 등록 흐름 전체 검증

```
1. GET /api/admin/users/bulk-template — 템플릿 다운로드 ✅
2. POST /api/admin/users/bulk-upload — 파일 업로드
   a. 5MB 초과 → 400 ✅
   b. 헤더 누락 → 400 ✅
   c. 1,000행 초과 → 400 ✅
   d. 동시 Job 처리 중 → 정책 없음 ❌ (NM-2)
   e. 원본 파일 접근 제어 → 정책 없음 ❌ (NH-3)
3. GET /api/admin/users/bulk-jobs/{jobId} — Job 상태 조회 ✅
4. Job 완료 알림 → 없음 ❌
5. 실패 파일 다운로드 (24시간 내) ✅
6. 24시간 경과 후 파일 URL → 404 ✅
   → 원본 파일 만료 정책 → 없음 ❌ (NH-3)
```

---

## 8. 보안 심층 검증

### 8.1 IDOR(Insecure Direct Object Reference) 취약점 분석

| API | IDOR 위험 | 현재 방어 |
|-----|:---------:|---------|
| `GET /api/admin/audit-logs/{logId}` | 🟠 Medium | `tenant_id` 검증 명시 없음 |
| `GET /api/admin/users/bulk-jobs/{jobId}` | 🟠 Medium | `tenant_id` 검증 명시 없음 (NM-6) |
| `PUT /api/admin/menus/{menuId}` | 🟢 Low | `is_default` 체크로 일부 방어 |
| `DELETE /api/admin/roles/{roleId}` | 🟠 Medium | 크로스 테넌트 `roleId` 접근 시 검증 미명시 |

**공통 권고:** 모든 리소스 접근 API에서 "JWT의 `tenant_id` = 리소스의 `tenant_id`" 검증을 명세에 명시적으로 추가할 것.

### 8.2 Audit Log 저장 실패 시 보안 공백

**발견 위치:** §8 예외 케이스 "Audit Log 저장 실패 → Queue 기반 재처리 (최대 3회 재시도)"

**문제:**
감사 로그 저장이 실패한 상태에서도 실제 작업(Role 변경, Feature Flag 변경 등)은 **이미 완료**된 상태다. 즉, 감사 로그 없이 권한이 변경될 수 있다.

3회 재시도 후에도 감사 로그 저장이 최종 실패하면 어떻게 되는가?

현재 명세로는:
- 작업은 성공 처리됨
- 감사 로그는 누락됨
- 관리자 알림 없음

**권고:**
감사 로그 최종 실패 시 처리 방식을 명세에 추가할 것.
- 옵션 A: 감사 로그 실패 = 작업 실패로 처리 (원자성 보장, 사용성 저하)
- 옵션 B: Dead Letter Queue 저장 + SUPER_ADMIN 긴급 알림 + 수동 복구

### 8.3 `is_system = true` Role의 Permission 제거 가능 여부

**발견 위치:** §5.2 `roles.is_system`, §6.2

**문제:**
`DELETE /api/admin/roles/{roleId}` — `is_system = true`인 Role의 **삭제는 차단**된다. 그러나 `DELETE /api/admin/roles/{roleId}/permissions/{permissionId}` — `is_system = true`인 Role에서 **Permission 제거는 차단되지 않는다.**

즉, SUPER_ADMIN Role 자체는 삭제할 수 없어도, 모든 Permission을 하나씩 제거하면 사실상 권한이 없는 빈 Role이 된다. 마지막 SUPER_ADMIN 사용자라면 시스템에서 아무도 관리자 기능을 수행할 수 없는 **관리자 락아웃(Admin Lockout)** 상태가 발생한다.

**권고:**
`DELETE /api/admin/roles/{roleId}/permissions/{permissionId}` 처리 시:
- `roles.is_system = true`이면 → `403 SYSTEM_ROLE_PROTECTED` 반환
- 또는 최소 1개의 Permission은 보존되도록 검증 추가

---

## 9. 전체 결함 목록 통합표

1차 + 2차 검증에서 발굴된 전체 결함을 우선순위 순으로 정리한다.

| ID | 구분 | 항목 | 심각도 | 개발 차단 |
|----|------|------|:------:|:---------:|
| NC-1 | 신규(2차) | `audit_logs` 테이블 이중 정의·스키마 충돌 | 🔴 Critical | ✅ |
| NC-2 | 신규(2차) | `users` 테이블 이중 정의·필드 불일치 (`tenant_id` 누락) | 🔴 Critical | ✅ |
| NC-3 | 신규(2차) | Role 할당/해제 API 오류 응답 누락 | 🔴 Critical | ✅ |
| NC-4 | 신규(2차) | `permissions` 테이블 `tenant_id` 누락 | 🔴 Critical | ✅ |
| C-1 | 1차 | 관리자 MFA 정책 미확정 | 🔴 Critical | ✅ |
| C-2 | 1차 | Rate Limiting 정책 완전 누락 | 🔴 Critical | ✅ |
| C-3 | 1차 | CSV 롤백 정책 미정의 | 🔴 Critical | ✅ |
| C-4 | 1차 | 관리자 도메인 분리 미결 | 🔴 Critical | ✅ |
| NH-1 | 신규(2차) | 메뉴 조회 테넌트 격리 불명확 | 🟠 High | - |
| NH-2 | 신규(2차) | 크로스 테넌트 Role 할당 취약점 | 🟠 High | - |
| NH-3 | 신규(2차) | 원본 CSV 파일 보관/접근 제어 미정의 | 🟠 High | - |
| NH-4 | 신규(2차) | Feature Flag 초기 데이터 등록 방법 없음 | 🟠 High | - |
| NH-5 | 신규(2차) | Permission 일괄 매핑 부분 성공 처리 불일치 | 🟠 High | - |
| NH-6 | 신규(2차) | 테넌트 브랜딩 캐시 정책 미정의 | 🟠 High | - |
| NH-7 | 신규(2차) | Role 수정 API(`PUT /roles/{roleId}`) 누락 | 🟠 High | - |
| H-1 | 1차 | 알림 시스템 연동 스펙 부재 | 🟠 High | - |
| H-2 | 1차 | 메뉴 순환 참조 방어 미정의 | 🟠 High | - |
| H-3 | 1차 | Feature Flag rollout 미지원 | 🟠 High | - |
| H-4 | 1차 | Audit Log 배치 삭제와 Immutability 충돌 | 🟠 High | - |
| H-5 | 1차 | 테넌트 온보딩 플로우 전체 누락 | 🟠 High | ✅ |
| NM-1 | 신규(2차) | Audit Log `action` 자유 입력 문자열 취약점 | 🟡 Medium | - |
| NM-2 | 신규(2차) | CSV 동시 업로드 충돌 처리 미정의 | 🟡 Medium | - |
| NM-3 | 신규(2차) | `employee_id` UNIQUE 제약 미정의 | 🟡 Medium | - |
| NM-4 | 신규(2차) | Permission key 네이밍 컨벤션 미표준화 | 🟡 Medium | - |
| NM-5 | 신규(2차) | `menus.permission_key` 변경 시 정합성 미보장 | 🟡 Medium | - |
| NM-6 | 신규(2차) | Bulk Job 크로스 테넌트 접근 검증 미명시 | 🟡 Medium | - |
| M-1 | 1차 | 권한 캐시 Pub/Sub 실패 시 경쟁 조건 | 🟡 Medium | - |
| M-2 | 1차 | `user_roles` Soft/Hard Delete 정책 불일치 | 🟡 Medium | - |
| M-3 | 1차 | CSV `role_name` 미존재 처리 미정의 | 🟡 Medium | - |
| M-4 | 1차 | `bulk_jobs` 재처리 정책 미정의 | 🟡 Medium | - |
| M-5 | 1차 | 로고 스토리지 정책 미정의 | 🟡 Medium | - |
| M-6 | 1차 | `audit_logs` 인덱스 미정의 | 🟡 Medium | - |
| NL-1 | 신규(2차) | 브랜딩 `name` 빈 문자열 검증 없음 | 🟢 Low | - |
| NL-2 | 신규(2차) | Role별 Permission 상세 조회 API 누락 | 🟢 Low | - |
| NL-3 | 신규(2차) | 로고 없는 상태에서 삭제 처리 미정의 | 🟢 Low | - |
| NL-4 | 신규(2차) | `audit_logs.action` 전체 허용값 목록 미정의 | 🟢 Low | - |
| NL-5 | 신규(2차) | 드래그 앤 드롭 정렬 일괄 API 미정의 | 🟢 Low | - |
| L-1 | 1차 | `permissions` 목록 페이징 미지원 | 🟢 Low | - |
| L-2 | 1차 | 메뉴 `order_no` 동시 수정 충돌 처리 | 🟢 Low | - |
| L-3 | 1차 | `is_system` Role Permission 제거 차단 필요 (§8.3로 High 격상) | 🟠 High | - |
| L-4 | 1차 | 실패 파일 URL 서빙 방식 미정의 | 🟢 Low | - |
| L-5 | 1차 | 감사 로그 Export 비동기 처리 권고 | 🟢 Low | - |

**총계: Critical 8개 / High 12개 / Medium 12개 / Low 10개 = 총 42개**

---

## 10. 최종 권고 로드맵

### Phase 0 — 개발 착수 전 필수 결정 (아키텍처 레벨)

> 이 항목들이 결정되지 않으면 개발 착수 자체가 위험하다.

- [ ] **`audit_logs` 단일 통합 스키마 확정** (NC-1) — Auth PRD 공동 수정
- [ ] **`users` 마스터 스키마 확정** (NC-2) — Auth PRD, 조직도 PRD 공동 수정. `tenant_id` 포함 여부 최우선 결정
- [ ] **`permissions` 테넌트 분리 전략 결정** (NC-4) — 공통 vs 테넌트별 구분
- [ ] **Permission key 네이밍 컨벤션 통일** (NM-4) — 전체 PRD 일괄 반영
- [ ] **관리자 MFA 강제 적용 여부** (C-1) — Auth PRD 공동 플로우 정의
- [ ] **도메인 분리 여부 결정** (C-4) — CORS, JWT `aud` 정책 포함
- [ ] **테넌트 온보딩 API 추가** (H-5) — `POST /api/super/tenants` 포함 플로우 정의

### Phase 1 — v3.1 (1차 스프린트 시작 전)

- [ ] Role 할당/해제 API 오류 응답 전체 정의 (NC-3)
- [ ] 크로스 테넌트 Role 할당 취약점 방어 로직 명세 (NH-2)
- [ ] `is_system` Role Permission 제거 차단 명세 (§8.3)
- [ ] Admin Lockout 방지 정책 추가
- [ ] Feature Flag 초기 데이터 등록 방법 결정 (NH-4)
- [ ] Role 수정 API 추가 (`PUT /api/admin/roles/{roleId}`) (NH-7)
- [ ] Rate Limiting 정책 명세에 추가 (C-2)
- [ ] 메뉴 순환 참조 방어 명세 (H-2)
- [ ] 누락 API 추가: `GET /api/admin/users`, `PATCH /api/admin/users/{userId}/unlock`, `GET /api/admin/roles/{roleId}/permissions`
- [ ] IDOR 방어 — 모든 리소스 API에 tenant_id 검증 명시 (§8.1)

### Phase 2 — v3.2 (1차 스프린트 완료 후)

- [ ] 원본 CSV 파일 보관/만료/접근 제어 정책 (NH-3)
- [ ] CSV 동시 업로드 충돌 처리 (NM-2)
- [ ] `employee_id` UNIQUE 제약 추가 (NM-3)
- [ ] `menus.permission_key` 정합성 검증 (NM-5)
- [ ] 브랜딩 캐시 전략 명세 (NH-6)
- [ ] 알림 연동 이벤트 정의 (H-1)
- [ ] Permission 일괄 매핑 부분 성공 응답 개선 (NH-5)
- [ ] Audit Log 배치 삭제 vs Immutability 정책 재정의 (H-4)
- [ ] Bulk Job 접근 제어 정책 (NM-6)
- [ ] `audit_logs.action` 전체 허용값 목록 명세 (NL-4)
- [ ] 메뉴 순서 일괄 변경 API (`PATCH /api/admin/menus/order`) 추가 (NL-5)
- [ ] 감사 로그 Export 비동기 처리 전환 검토 (L-5)

### Phase 3 — v4.0 (2차 릴리스)

- [ ] Feature Flag `rollout_percentage` 구현 (H-3)
- [ ] 장애 대응 운영 API (`GET /api/admin/system/health`)
- [ ] Audit Log SIEM 외부 연동
- [ ] `users.department` 제거 → 조직도 PRD `user_departments` 통합 (§6.2)

---

*2차 검증 완료일: 2026-03-30*
*신규 발굴 결함: 16개 (Critical 4, High 7, Medium 6, Low 5)*
*1차 포함 전체 결함: 42개*
*다음 검증: Phase 0 결정사항 반영 후 3차 검증 권고*
