# PRD — 운영자 콘솔 (Admin Console)

| 항목 | 내용 |
|------|------|
| 문서 버전 | v3.0 (2차 검증 반영) |
| 대상 조직 | ZIN Corporation (200인) |
| 기술 스택 | Spring Boot 3.x / Java 17 / JWT / Redis |
| 멀티 테넌트 전략 | Row-level (tenant_id 컬럼 방식) |
| 문서 상태 | 검토 완료 |

---

## 1. 개요 (Overview)

### 1.1 기능 목적
- 멀티 테넌트 환경에서 관리자 기능을 통합 제공
- 권한, 메뉴, 기능, 사용자, 브랜딩을 중앙에서 관리

### 1.2 해결하려는 문제
- 관리자 권한 체계 미흡으로 인한 보안 위험
- 운영 변경 이력 추적 불가
- 기능 제어 및 메뉴 관리의 비효율성
- 테넌트별 커스터마이징 부족

---

## 2. 사용자 시나리오 (User Scenario)

### 2.1 관리자 접근
1. 관리자가 계정으로 로그인 (Auth PRD 참조)
2. 시스템이 `user_roles` → `role_permissions` 조회하여 Permission 목록 구성 및 캐싱 (Redis, TTL 5분)
3. Permission 기반으로 접근 가능한 메뉴만 렌더링
4. 권한 없는 메뉴는 UI에서 숨김 처리, API 레벨에서도 이중 검증 수행
5. Role / Permission 변경 시 해당 사용자의 권한 캐시 즉시 invalidate

### 2.2 권한 관리
1. SUPER_ADMIN이 Role 생성 (`POST /api/admin/roles`)
2. Permission (API / 메뉴 / 기능) 단위로 권한 설정
3. Role에 Permission 매핑 (`POST /api/admin/roles/{roleId}/permissions`)
4. Role에서 Permission 제거 (`DELETE /api/admin/roles/{roleId}/permissions/{permissionId}`)
5. 사용자에게 Role 할당 (`POST /api/admin/users/{userId}/roles`)
6. 필요 시 Role 해제 (`DELETE /api/admin/users/{userId}/roles/{roleId}`)

### 2.3 메뉴 관리
1. 관리자가 메뉴 Tree 화면 진입
2. 메뉴 추가 / 수정 / 삭제 / 정렬
3. 메뉴별 Permission 연결
4. 삭제 시 하위 메뉴 존재 여부 서버 검증 — 존재하면 차단
5. 기본 메뉴(`is_default = true`) 수정 / 삭제 차단

### 2.4 기능 제어 (Feature Flag)
1. 관리자가 Feature Flag 설정 화면 진입
2. 특정 기능 ON / OFF 토글
3. 변경 즉시 Redis 캐시 invalidate → Redis Pub/Sub으로 전체 인스턴스 브로드캐스트
4. OFF 상태 기능에 대한 UI 및 API 접근 동시 차단

### 2.5 사용자 일괄 등록
1. 관리자가 CSV 템플릿 다운로드
2. 작성 후 업로드 (최대 1,000행 / 5MB / UTF-8 BOM 없이)
3. 업로드 전 서버에서 CSV 헤더 및 필수 컬럼 유효성 즉시 검증
4. 유효하면 비동기 Job 생성 (PENDING → PROCESSING → COMPLETED / FAILED)
5. Job 처리 결과 및 실패 데이터 다운로드 제공
6. 실패 파일 다운로드 URL 만료: 24시간

### 2.6 감사 로그
1. 관리자 활동 목록 조회 (필터: 기간 / 사용자 / 액션 유형 / 결과)
2. 개별 로그 상세 확인 (`before_data` / `after_data` 포함)
3. 로그는 수정 / 삭제 불가 (Immutable — DB 레벨 DELETE / UPDATE 권한 제거)
4. 감사 로그 CSV 내보내기 제공 (필터 결과 기준)

### 2.7 테넌트 브랜딩
1. 로고 업로드 (multipart/form-data, PNG / JPG / SVG, 최대 2MB)
2. Primary Color 설정 (HEX 코드)
3. 회사명 설정
4. 저장 즉시 전체 UI에 반영
5. 로고 삭제 시 기본 로고로 복원

---

## 3. 기능 요구사항 (Functional Requirements)

### 3.1 RBAC + Permission 모델
1. Role 기반 접근 제어 (RBAC) 적용
2. Permission 단위 정의:
   - `resource`: MENU / API / FEATURE
   - `action`: READ / WRITE / DELETE / APPROVE
3. Role ↔ Permission 매핑 및 **제거** 지원
4. 사용자 ↔ Role 다중 매핑 및 해제 지원
5. 모든 API는 Permission 기반 서버 검증 수행 (UI 숨김만으로 보안 처리 금지)
6. 시스템 초기화 시 SUPER_ADMIN Role과 전체 Permission 세트를 DB 마이그레이션으로 자동 생성
7. 사용자 권한 정보 캐싱 (Redis, TTL 5분) — Role / Permission 변경 시 즉시 invalidate

### 3.2 관리자 활동 감사 로그
8. 모든 관리자 액션 로그 기록
9. 로그는 수정 / 삭제 불가 (Immutable)
   - DB 레벨에서 `audit_logs` 테이블에 대한 UPDATE / DELETE 권한 제거
   - 애플리케이션 레벨 삭제 API 미제공
10. 보관 기간: **1년** (개인정보보호법 기준, 법무팀 최종 확인 필요)
11. 보관 기간 초과 레코드 주기적 삭제 배치 운영
12. 필수 기록 필드: `user_id` / `action` / `target` / `ip_address` / `user_agent` / `request_id` / `before_data` / `after_data` / `result`
13. 감사 로그 CSV 내보내기 지원 (최대 10,000건, 필터 결과 기준)

### 3.3 메뉴 관리
14. 메뉴 CRUD
15. 트리 구조 지원 (`parent_id` 기반)
16. 정렬 (`order_no`) 관리
17. 메뉴 속성: `icon` / `type` (MENU / BUTTON / LINK) / `visible` / `permission_key`
18. 메뉴 삭제 시 하위 메뉴 존재 여부 서버 검증 — 존재하면 400 반환
19. 기본 메뉴(`is_default = true`)는 모든 테넌트 공통 적용, 수정 / 삭제 차단
20. 테넌트 커스텀 메뉴는 `tenant_id` 지정 후 별도 레코드로 관리

### 3.4 메뉴 접근 제어
21. 메뉴는 `permission_key` 기반 접근 제어
22. UI에서 권한 없는 메뉴 숨김 처리
23. 서버 API에서도 Permission 검증 필수 (이중 검증)

### 3.5 기능 모듈 ON/OFF (Feature Flag)
24. Feature 단위 ON / OFF 관리
25. OFF 시 UI 및 API 접근 동시 차단
26. 테넌트 단위 설정 가능
27. Feature Flag 캐싱 적용:
    - 저장소: Redis (분산 환경 동기화)
    - TTL: 30초
    - Feature Flag 변경 시 즉시 캐시 invalidate (Redis `DEL` 호출)
    - 다중 인스턴스 환경에서 Redis Pub/Sub으로 캐시 갱신 이벤트 브로드캐스트

### 3.6 사용자 일괄 등록 / 수정
28. CSV 업로드 지원
    - 파일 형식: `.csv` (UTF-8, BOM 없이)
    - 최대 파일 크기: 5MB
    - 최대 행 수: 1,000행
    - 필수 컬럼: `email`, `name`, `department`, `employee_id`
    - 선택 컬럼: `role_name`
29. 업로드 즉시 헤더 및 필수 컬럼 유효성 동기 검증 — 실패 시 400 즉시 반환 (Job 생성 안 함)
30. 유효성 통과 후 비동기 처리 (Queue 기반)
31. Job 상태 관리: PENDING → PROCESSING → COMPLETED / FAILED
32. 중복 이메일 → 기존 계정 업데이트 처리
33. 실패 데이터 `fail_file_path`에 별도 저장, 다운로드 URL 만료 24시간
34. CSV 템플릿 다운로드 API 제공

### 3.7 테넌트 브랜딩
35. 로고 업로드 (multipart/form-data, PNG / JPG / SVG, 최대 2MB)
36. Primary Color 설정 (HEX 코드, 예: `#2E75B6`)
37. 회사명 설정
38. 저장 즉시 전체 UI에 반영
39. 로고 삭제 시 기본 로고로 복원

---

## 4. 비기능 요구사항 (Non-functional Requirements)

| 항목 | 요구사항 | 비고 |
|------|----------|------|
| 보안 | RBAC + Permission 기반 API 보호 | UI 숨김만으로 보안 처리 금지 |
| 성능 | 메뉴 / 권한 조회 300ms 이하 | P99 기준 |
| 성능 | 감사 로그 목록 조회 500ms 이하 | 페이징 기준 P99 |
| 확장성 | 테넌트 수 목표 10개 이하, 동시 관리자 20인 기준 | ZIN Corporation 운영 규모 |
| 캐싱 | Feature Flag TTL 30초, 권한 캐시 TTL 5분 | 변경 시 즉시 invalidate, Redis Pub/Sub |
| 감사 | 모든 관리자 행위 기록 | 보관 기간 1년 |
| 가용성 | SLA 99.9% | 월 다운타임 약 43분 |
| 안정성 | CSV 비동기 처리, 실패 시 재처리 지원 | Queue 기반, 최대 3회 재시도 |

---

## 5. 데이터 요구사항 (Data Requirements)

> **멀티 테넌트 전략:** Row-level 분리 (단일 DB, 모든 테이블에 `tenant_id` 컬럼으로 데이터 격리)

### 5.1 users

Auth PRD `users` 테이블을 기반으로 하며, Admin Console에서 사용하는 추가 필드만 명시합니다.

| 필드 | 타입 | 설명 |
|------|------|------|
| user_id | PK (UUID) | Auth PRD 참조 |
| tenant_id | FK → tenants.tenant_id | 테넌트 소속 |
| email | varchar(255) | Auth PRD 참조 |
| name | varchar(100) | 사용자 이름 |
| department | varchar(100) | 부서명 |
| employee_id | varchar(50) | 사원번호 |

### 5.2 roles

| 필드 | 타입 | 설명 |
|------|------|------|
| role_id | PK (UUID) | 역할 ID |
| tenant_id | FK → tenants.tenant_id (nullable) | 테넌트 (NULL이면 시스템 공통) |
| name | varchar(100) | 역할명 (예: SUPER_ADMIN, USER) |
| description | varchar(500) | 역할 설명 |
| is_system | boolean default false | 시스템 기본 역할 여부 (삭제 불가) |
| created_at | datetime | 생성일 |
| updated_at | datetime | 수정일 |

### 5.3 permissions

| 필드 | 타입 | 설명 |
|------|------|------|
| permission_id | PK (UUID) | 권한 ID |
| resource | enum | MENU / API / FEATURE |
| action | enum | READ / WRITE / DELETE / APPROVE |
| key | varchar(100) | 권한 식별자 (예: `menu:dashboard:read`) |
| description | varchar(500) | 권한 설명 |

### 5.4 role_permissions

| 필드 | 타입 | 설명 |
|------|------|------|
| role_id | FK → roles.role_id | 역할 |
| permission_id | FK → permissions.permission_id | 권한 |
| created_at | datetime | 매핑 생성일 |

> PK: `(role_id, permission_id)` 복합키 — 중복 매핑 방지

### 5.5 user_roles

| 필드 | 타입 | 설명 |
|------|------|------|
| user_id | FK → users.user_id | 사용자 |
| role_id | FK → roles.role_id | 역할 |
| assigned_by | FK → users.user_id | 할당한 관리자 |
| created_at | datetime | 할당 일시 |

> PK: `(user_id, role_id)` 복합키 — 중복 할당 방지

### 5.6 menus

| 필드 | 타입 | 설명 |
|------|------|------|
| menu_id | PK (UUID) | 메뉴 ID |
| tenant_id | FK → tenants.tenant_id (nullable) | NULL이면 공통 기본 메뉴 |
| parent_id | FK → menus.menu_id (nullable) | 상위 메뉴 (NULL이면 최상위) |
| name | varchar(100) | 메뉴명 |
| path | varchar(255) | URL 경로 |
| icon | varchar(100) | 아이콘 식별자 |
| type | enum | MENU / BUTTON / LINK |
| visible | boolean default true | 노출 여부 |
| order_no | int | 정렬 순서 |
| permission_key | varchar(100) | 접근 권한 키 |
| is_default | boolean default false | 공통 기본 메뉴 여부 (수정 / 삭제 불가) |
| created_at | datetime | 생성일 |
| updated_at | datetime | 수정일 |

> 기본 메뉴(`is_default = true`)는 `tenant_id = NULL`로 저장. 테넌트 커스텀 메뉴는 `tenant_id` 지정 후 별도 레코드 생성.

### 5.7 audit_logs

| 필드 | 타입 | 설명 |
|------|------|------|
| log_id | PK (bigint) | 자동 증가 |
| tenant_id | FK → tenants.tenant_id | 테넌트 |
| user_id | FK → users.user_id (nullable) | 사용자 (미존재 계정 시도 시 null) |
| action | varchar(100) | 액션 유형 (예: ROLE_CREATED, MENU_DELETED) |
| target | varchar(255) | 대상 리소스 (예: `roles/uuid-...`) |
| ip_address | varchar(45) | 요청 IP (IPv6 포함) |
| user_agent | varchar(500) | 클라이언트 정보 |
| request_id | varchar(100) | 트레이스 ID |
| before_data | JSON nullable | 변경 전 데이터 |
| after_data | JSON nullable | 변경 후 데이터 |
| result | enum | SUCCESS / FAIL |
| created_at | datetime | 이벤트 발생 시각 |

> **Immutable 보장:** DB 레벨에서 `audit_logs` 테이블에 대한 UPDATE / DELETE 권한 제거. 애플리케이션 레벨 삭제 API 미제공.

### 5.8 feature_flags

| 필드 | 타입 | 설명 |
|------|------|------|
| feature_key | varchar(100) | 기능 식별자 (PK 일부) |
| tenant_id | FK → tenants.tenant_id | 테넌트 (PK 일부) |
| enabled | boolean default true | 활성화 여부 |
| updated_at | datetime | 최종 변경 시각 |
| updated_by | FK → users.user_id | 변경한 관리자 |

> PK: `(feature_key, tenant_id)` 복합키

### 5.9 bulk_jobs

| 필드 | 타입 | 설명 |
|------|------|------|
| job_id | PK (UUID) | Job ID |
| tenant_id | FK → tenants.tenant_id | 테넌트 |
| status | enum | PENDING / PROCESSING / COMPLETED / FAILED |
| total_count | int | 총 처리 대상 건수 |
| success_count | int default 0 | 성공 건수 |
| fail_count | int default 0 | 실패 건수 |
| file_path | varchar(500) | 업로드된 원본 CSV 경로 |
| fail_file_path | varchar(500) nullable | 실패 데이터 다운로드 경로 |
| fail_file_expires_at | datetime nullable | 실패 파일 다운로드 URL 만료 시각 |
| created_by | FK → users.user_id | 업로드한 관리자 |
| created_at | datetime | Job 생성 시각 |
| updated_at | datetime | 상태 변경 시각 |

### 5.10 tenants

| 필드 | 타입 | 설명 |
|------|------|------|
| tenant_id | PK (UUID) | 테넌트 ID |
| name | varchar(200) | 회사명 |
| logo_url | varchar(500) nullable | 로고 이미지 경로 (NULL이면 기본 로고 사용) |
| primary_color | varchar(7) nullable | HEX 색상 코드 (예: `#2E75B6`) |
| created_at | datetime | 생성일 |
| updated_at | datetime | 수정일 |

---

## 6. API 설계 (API Design)

> 모든 API는 `Authorization: Bearer {accessToken}` 헤더 필수. Permission 검증은 서버에서 수행.

---

### 6.1 메뉴 관리

#### GET /api/admin/menus — 메뉴 목록 조회 (트리 구조)

**Response 200**
```json
{
  "menus": [
    {
      "menuId": "uuid...",
      "name": "대시보드",
      "path": "/dashboard",
      "icon": "dashboard",
      "type": "MENU",
      "visible": true,
      "orderNo": 1,
      "permissionKey": "menu:dashboard:read",
      "isDefault": true,
      "children": []
    }
  ]
}
```

---

#### POST /api/admin/menus — 메뉴 생성

**Request**
```json
{
  "parentId": null,
  "name": "사용자 관리",
  "path": "/admin/users",
  "icon": "users",
  "type": "MENU",
  "visible": true,
  "orderNo": 2,
  "permissionKey": "menu:users:read"
}
```

**Response 201**
```json
{
  "menuId": "uuid...",
  "message": "메뉴가 생성되었습니다."
}
```

---

#### PUT /api/admin/menus/{menuId} — 메뉴 수정

**Request**
```json
{
  "name": "사용자 관리 (수정)",
  "visible": false,
  "orderNo": 3
}
```

**Response 200**
```json
{
  "message": "메뉴가 수정되었습니다."
}
```

**Response 403** _(기본 메뉴 수정 시도)_
```json
{
  "code": "DEFAULT_MENU_PROTECTED",
  "message": "기본 메뉴는 수정할 수 없습니다."
}
```

---

#### DELETE /api/admin/menus/{menuId} — 메뉴 삭제

**Response 200**
```json
{
  "message": "메뉴가 삭제되었습니다."
}
```

**Response 400** _(하위 메뉴 존재 시)_
```json
{
  "code": "HAS_CHILD_MENUS",
  "message": "하위 메뉴가 존재하여 삭제할 수 없습니다. 하위 메뉴를 먼저 삭제하세요."
}
```

**Response 403** _(기본 메뉴 삭제 시도)_
```json
{
  "code": "DEFAULT_MENU_PROTECTED",
  "message": "기본 메뉴는 삭제할 수 없습니다."
}
```

---

### 6.2 권한 관리

#### GET /api/admin/roles — Role 목록 조회

**Response 200**
```json
{
  "roles": [
    {
      "roleId": "uuid...",
      "name": "SUPER_ADMIN",
      "description": "전체 관리자",
      "isSystem": true,
      "permissionCount": 42
    }
  ]
}
```

---

#### POST /api/admin/roles — Role 생성

**Request**
```json
{
  "name": "HR_MANAGER",
  "description": "인사 담당자 역할"
}
```

**Response 201**
```json
{
  "roleId": "uuid...",
  "message": "Role이 생성되었습니다."
}
```

**Response 409** _(동일 테넌트 내 Role명 중복)_
```json
{
  "code": "ROLE_NAME_DUPLICATED",
  "message": "동일한 이름의 Role이 이미 존재합니다."
}
```

---

#### DELETE /api/admin/roles/{roleId} — Role 삭제

**Response 200**
```json
{
  "message": "Role이 삭제되었습니다."
}
```

**Response 400** _(할당된 사용자 존재 시)_
```json
{
  "code": "ROLE_IN_USE",
  "message": "해당 Role에 할당된 사용자가 존재합니다. 사용자 Role을 먼저 해제하세요."
}
```

**Response 403** _(시스템 기본 Role 삭제 시도)_
```json
{
  "code": "SYSTEM_ROLE_PROTECTED",
  "message": "시스템 기본 Role은 삭제할 수 없습니다."
}
```

---

#### GET /api/admin/permissions — Permission 목록 조회

**Query Parameters:** `resource` (선택), `action` (선택)

**Response 200**
```json
{
  "permissions": [
    {
      "permissionId": "uuid...",
      "resource": "MENU",
      "action": "READ",
      "key": "menu:dashboard:read",
      "description": "대시보드 메뉴 접근"
    }
  ]
}
```

---

#### POST /api/admin/roles/{roleId}/permissions — Role에 Permission 매핑

**Request**
```json
{
  "permissionIds": ["uuid-1", "uuid-2"]
}
```

**Response 200**
```json
{
  "message": "Permission이 추가되었습니다."
}
```

**Response 409** _(이미 매핑된 Permission)_
```json
{
  "code": "PERMISSION_ALREADY_ASSIGNED",
  "message": "이미 할당된 Permission입니다. 중복 항목은 무시됩니다."
}
```

---

#### DELETE /api/admin/roles/{roleId}/permissions/{permissionId} — Role에서 Permission 제거 `[추가]`

**Response 200**
```json
{
  "message": "Permission이 제거되었습니다."
}
```

**Response 404**
```json
{
  "code": "PERMISSION_NOT_ASSIGNED",
  "message": "해당 Role에 매핑되지 않은 Permission입니다."
}
```

---

#### POST /api/admin/users/{userId}/roles — 사용자에게 Role 할당

**Request**
```json
{
  "roleIds": ["uuid-1"]
}
```

**Response 200**
```json
{
  "message": "Role이 할당되었습니다."
}
```

---

#### DELETE /api/admin/users/{userId}/roles/{roleId} — 사용자 Role 해제

**Response 200**
```json
{
  "message": "Role이 해제되었습니다."
}
```

**Response 400** _(마지막 Role 해제 시도)_
```json
{
  "code": "LAST_ROLE_CANNOT_BE_REMOVED",
  "message": "사용자의 마지막 Role은 해제할 수 없습니다."
}
```

---

### 6.3 감사 로그

#### GET /api/admin/audit-logs — 감사 로그 목록 조회

**Query Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `from` | datetime | 조회 시작일 (ISO 8601) |
| `to` | datetime | 조회 종료일 (ISO 8601) |
| `userId` | UUID | 특정 사용자 필터 |
| `action` | string | 액션 유형 필터 |
| `result` | enum | SUCCESS / FAIL |
| `page` | int | 페이지 번호 (default: 0) |
| `size` | int | 페이지 크기 (default: 20, max: 100) |

**Response 200**
```json
{
  "logs": [
    {
      "logId": 1,
      "userId": "uuid...",
      "action": "ROLE_CREATED",
      "target": "roles/uuid...",
      "ipAddress": "192.168.0.1",
      "result": "SUCCESS",
      "createdAt": "2025-01-01T12:00:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 342,
  "totalPages": 18
}
```

---

#### GET /api/admin/audit-logs/{logId} — 감사 로그 상세 조회

**Response 200**
```json
{
  "logId": 1,
  "userId": "uuid...",
  "action": "ROLE_CREATED",
  "target": "roles/uuid...",
  "ipAddress": "192.168.0.1",
  "userAgent": "Mozilla/5.0...",
  "requestId": "trace-uuid...",
  "beforeData": null,
  "afterData": { "name": "HR_MANAGER", "description": "인사 담당자" },
  "result": "SUCCESS",
  "createdAt": "2025-01-01T12:00:00Z"
}
```

---

#### GET /api/admin/audit-logs/export — 감사 로그 CSV 내보내기 `[추가]`

**Query Parameters:** 목록 조회와 동일 (페이징 제외, 최대 10,000건)

**Response 200** — `Content-Type: text/csv`
```
logId,userId,action,target,ipAddress,result,createdAt
1,uuid...,ROLE_CREATED,roles/uuid...,192.168.0.1,SUCCESS,2025-01-01T12:00:00Z
```

**Response 400** _(10,000건 초과 시)_
```json
{
  "code": "EXPORT_LIMIT_EXCEEDED",
  "message": "내보내기는 최대 10,000건까지 가능합니다. 기간 필터를 좁혀주세요."
}
```

---

### 6.4 기능 모듈 (Feature Flag)

#### GET /api/admin/features — Feature Flag 목록 조회

**Response 200**
```json
{
  "features": [
    {
      "featureKey": "feature:chat",
      "enabled": true,
      "updatedAt": "2025-01-01T12:00:00Z",
      "updatedBy": "uuid..."
    }
  ]
}
```

---

#### PUT /api/admin/features/{featureKey} — Feature Flag 변경

**Request**
```json
{
  "enabled": false
}
```

**Response 200**
```json
{
  "featureKey": "feature:chat",
  "enabled": false,
  "message": "Feature Flag가 변경되었습니다. 캐시가 즉시 갱신됩니다."
}
```

**Response 404**
```json
{
  "code": "FEATURE_NOT_FOUND",
  "message": "존재하지 않는 Feature Key입니다."
}
```

---

### 6.5 사용자 일괄 등록

#### GET /api/admin/users/bulk-template — CSV 템플릿 다운로드

**Response 200** — `Content-Type: text/csv`
```
email,name,department,employee_id,role_name
hong@zin.com,홍길동,개발팀,EMP001,USER
```

---

#### POST /api/admin/users/bulk-upload — CSV 업로드

**Request** `Content-Type: multipart/form-data`

| 필드 | 설명 |
|------|------|
| `file` | CSV 파일 (최대 5MB, UTF-8 BOM 없이, 최대 1,000행) |

**Response 202** _(유효성 통과, 비동기 처리 시작)_
```json
{
  "jobId": "uuid...",
  "status": "PENDING",
  "message": "업로드가 접수되었습니다. 처리 결과는 Job ID로 조회하세요."
}
```

**Response 400** _(헤더 / 필수 컬럼 누락 등 즉시 검증 실패)_
```json
{
  "code": "INVALID_CSV_FORMAT",
  "message": "CSV 형식이 올바르지 않습니다. 필수 컬럼(email, name, department, employee_id)을 확인하세요."
}
```

**Response 400** _(행 수 초과)_
```json
{
  "code": "CSV_ROW_LIMIT_EXCEEDED",
  "message": "최대 1,000행까지 업로드 가능합니다. 파일을 분할하여 업로드하세요."
}
```

---

#### GET /api/admin/users/bulk-jobs/{jobId} — Job 상태 조회

**Response 200**
```json
{
  "jobId": "uuid...",
  "status": "COMPLETED",
  "totalCount": 100,
  "successCount": 97,
  "failCount": 3,
  "failFileUrl": "https://groupware.zin.com/files/bulk-fail-uuid.csv",
  "failFileExpiresAt": "2025-01-02T12:00:00Z",
  "createdAt": "2025-01-01T12:00:00Z",
  "updatedAt": "2025-01-01T12:01:30Z"
}
```

---

### 6.6 테넌트 브랜딩

#### GET /api/admin/tenant/branding — 브랜딩 정보 조회

**Response 200**
```json
{
  "name": "ZIN Corporation",
  "logoUrl": "https://groupware.zin.com/files/logo.png",
  "primaryColor": "#2E75B6"
}
```

---

#### PUT /api/admin/tenant/branding — 브랜딩 설정 (회사명 / 색상)

**Request** `Content-Type: application/json`
```json
{
  "name": "ZIN Corporation",
  "primaryColor": "#1F4E79"
}
```

**Response 200**
```json
{
  "message": "브랜딩 정보가 업데이트되었습니다."
}
```

**Response 400** _(HEX 코드 형식 오류)_
```json
{
  "code": "INVALID_COLOR_FORMAT",
  "message": "색상 코드는 HEX 형식(#RRGGBB)이어야 합니다."
}
```

---

#### POST /api/admin/tenant/branding/logo — 로고 업로드

**Request** `Content-Type: multipart/form-data`

| 필드 | 설명 |
|------|------|
| `file` | 이미지 파일 (PNG / JPG / SVG, 최대 2MB) |

**Response 200**
```json
{
  "logoUrl": "https://groupware.zin.com/files/logo-uuid.png",
  "message": "로고가 업로드되었습니다."
}
```

**Response 400**
```json
{
  "code": "INVALID_FILE",
  "message": "파일 형식은 PNG / JPG / SVG만 허용되며, 크기는 2MB 이하여야 합니다."
}
```

---

#### DELETE /api/admin/tenant/branding/logo — 로고 삭제 (기본 로고 복원) `[추가]`

**Response 200**
```json
{
  "message": "로고가 삭제되었습니다. 기본 로고로 복원됩니다."
}
```

---

## 7. UI/UX 고려사항 (UI/UX Considerations)

- 메뉴 Tree 구조 UI 제공 (드래그 앤 드롭 정렬)
- 권한 기반 동적 메뉴 렌더링 (서버 응답 기반)
- Feature Toggle 스위치 UI — 변경 즉시 반영 안내 문구 표시
- CSV 업로드 결과 리포트 및 실패 파일 다운로드 버튼 제공 (만료 시각 표시)
- Audit Log 필터 UI (기간 / 사용자 / 액션 / 결과) + CSV 내보내기 버튼
- Role 삭제 전 할당된 사용자 수 경고 모달 표시
- 시스템 기본 Role / Permission / 메뉴는 UI에서 수정 / 삭제 버튼 비활성화
- HEX 색상 입력 시 컬러 피커 및 미리보기 제공
- Role / Permission 변경 후 권한 캐시 갱신 안내 문구 표시 (TTL 5분)

---

## 8. 예외 케이스 (Edge Cases)

| 상황 | 처리 방식 |
|------|----------|
| 권한 없는 API 호출 | 403 반환 (UI 숨김과 무관하게 서버 재검증) |
| CSV 파싱 실패 (형식 오류) | 400 즉시 반환, Job 생성 안 함 |
| CSV 필수 컬럼 누락 | 400 즉시 반환, 누락 컬럼명 안내 |
| CSV 중복 이메일 | 기존 계정 업데이트 처리, 신규 생성 없음 |
| CSV 행 수 초과 (1,000행) | 400 CSV_ROW_LIMIT_EXCEEDED 반환 |
| 메뉴 삭제 시 하위 메뉴 존재 | 400 HAS_CHILD_MENUS 반환 |
| 기본 메뉴 수정 / 삭제 시도 | 403 DEFAULT_MENU_PROTECTED 반환 |
| Role 삭제 시 할당된 사용자 존재 | 400 ROLE_IN_USE 반환 |
| Role명 중복 생성 | 409 ROLE_NAME_DUPLICATED 반환 |
| 시스템 기본 Role 삭제 시도 | 403 SYSTEM_ROLE_PROTECTED 반환 |
| Permission 중복 매핑 | 409 반환, 중복 항목 무시 후 나머지 처리 |
| 미매핑 Permission 제거 시도 | 404 PERMISSION_NOT_ASSIGNED 반환 |
| 사용자 마지막 Role 해제 시도 | 400 LAST_ROLE_CANNOT_BE_REMOVED 반환 |
| Feature OFF 상태 API 호출 | 403 반환 (서버 재검증) |
| 존재하지 않는 Feature Key 변경 | 404 FEATURE_NOT_FOUND 반환 |
| Audit Log 저장 실패 | Queue 기반 재처리 (최대 3회 재시도) |
| 감사 로그 내보내기 10,000건 초과 | 400 EXPORT_LIMIT_EXCEEDED 반환 |
| 로고 파일 형식 / 크기 오류 | 400 INVALID_FILE 반환 |
| HEX 색상 코드 형식 오류 | 400 INVALID_COLOR_FORMAT 반환 |
| 실패 파일 URL 만료 (24시간) | 404 반환, Job 재처리 안내 |
| 테넌트 미존재 상태 API 호출 | 404 TENANT_NOT_FOUND 반환 |
| 감사 로그 삭제 / 수정 시도 | API 미제공 — 404 반환 |
| Role / Permission 변경 후 캐시 즉시 미반영 | TTL 5분 이내 갱신, 변경 시 즉시 invalidate |

---

## 9. 오픈 이슈 (Open Questions)

| # | 이슈 | 영향도 | 현재 상태 |
|---|------|--------|----------|
| 1 | Permission granularity 수준 정의 | High | 미결 — API 단위 vs 화면 단위 세분화 수준 결정 필요 |
| 2 | 감사 로그 보관 기간 법무 확인 | Medium | 1년 잠정 설정. 법무팀 최종 확인 필요 |
| 3 | 관리자 UI 별도 도메인 분리 여부 | Medium | 미결 — 별도 어드민 서브도메인(admin.groupware.zin.com) 분리 여부 결정 필요 |
| 4 | MFA 관리자 계정 강제 적용 여부 | High | 미결 — 관리자 계정은 MFA 강제 적용 권고 (Auth PRD 연계) |
| 5 | Audit Log 외부 연동 여부 | Low | 미결 — SIEM / 외부 로그 시스템 연동 필요 시 별도 설계 |
| 6 | 실패 파일 스토리지 정책 | Medium | 미결 — 로컬 파일 저장 vs S3 호환 오브젝트 스토리지 결정 필요 |

---

## 10. 변경 이력 (Change Log)

| 버전 | 변경 내용 | 일자 |
|------|----------|------|
| v1.0 | 최초 작성 | - |
| v2.0 | 1차 검증 반영: 멀티 테넌트 전략 Row-level 확정, API Request / Response 전 항목 완성, users 테이블 Auth PRD 참조 정리, bulk_jobs 누락 필드 추가, Role 삭제 / Permission 조회 / Role 해제 API 추가, Feature Flag 캐시 전략 명시, 감사 로그 Immutable 보장 및 보관 기간 명시, CSV 파일 스펙 추가, 로고 업로드 API 분리, permissions APPROVE action 추가, is_default 메뉴 정책 추가, SUPER_ADMIN 초기 설정 추가, 비기능 요구사항 수치 보완, 예외 케이스 14개로 확장 | - |
| v3.0 | 2차 검증 반영: Role에서 Permission 제거 API 추가(`DELETE /roles/{id}/permissions/{id}`), 기본 메뉴 수정 / 삭제 차단 정책 및 에러 코드 추가, 권한 캐시 정책 추가(Redis TTL 5분 / 변경 시 즉시 invalidate), CSV 즉시 유효성 검증 단계 추가(Job 생성 전), 실패 파일 URL 만료 정책 추가(24시간 / fail_file_expires_at 필드), 감사 로그 CSV 내보내기 API 추가, Feature Key 미존재 에러 응답 추가, Role명 중복 에러 응답 추가, HEX 색상 코드 유효성 검증 추가, 로고 삭제 API 추가, 실패 파일 스토리지 정책 Open Question 추가, 예외 케이스 22개로 확장 | - |
