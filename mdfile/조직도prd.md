# PRD — 조직도 (Organization Management) v3.0 [AI 컨텍스트용]

> 스택: Spring Boot 3.x / Java 17 / JWT / Redis / PostgreSQL
> 대상: ZIN Corporation 200인 | 멀티 테넌트: Row-level (tenant_id)

---

## 1. 핵심 정책

| 항목 | 값 |
|------|----|
| 조직 트리 구조 | Closure Table (org_closure) |
| 트리 캐시 | Redis, TTL 10분, 조직 변경 시 즉시 invalidate (tenant_id 단위) |
| 부서 삭제 | Soft Delete (status=INACTIVE), 하위 부서 / 소속 사용자 존재 시 차단 |
| INACTIVE 부서 처리 | 트리 조회에서 기본 제외, includeInactive=true 파라미터로 포함 가능 |
| 겸직 | user_departments 테이블, primary 부서 필수 1개, 겸직 최대 5개 |
| 조직 변경 이력 | org_history 기록 (changed_by, reason 포함) |
| 프로필 이미지 | multipart, PNG/JPG, 최대 2MB, 삭제 시 기본 이미지 복원 |
| 검색 | DB 인덱스 기반 (name LIKE, deptId, positionId), 조건 1개 이상 필수 |
| 권한 | org:read (일반 조회), org:write (관리자 CRUD) — Admin PRD RBAC 연계 |
| positions 삭제 | Soft Delete (status=INACTIVE), 사용 중인 직책 즉시 삭제 차단 |

---

## 2. 기능 요구사항

### 조직 트리
1. Closure Table 기반 계층 구조 — depth 제한 없음
2. 전체 트리 / 특정 부서 하위 트리 조회 O(1) 수준 성능
3. Redis 캐싱 (TTL 10분, tenant_id 단위 키), 조직 변경 시 해당 테넌트 캐시 즉시 invalidate
4. order_no 기반 정렬, ACTIVE 부서만 기본 노출 (includeInactive 파라미터로 제어)
5. 트리 응답에 부서별 memberCount 포함

### 부서 관리
6. 부서 생성: parent_id 지정, org_closure 자동 갱신
7. 부서 수정: 이름 변경, 상위 부서 변경 (org_closure 재계산), 순환 참조 차단
8. 부서 삭제: Soft Delete (status=INACTIVE)
   - 하위 ACTIVE 부서 존재 시 차단 (400 DEPT_HAS_CHILDREN)
   - 소속 사용자 존재 시 차단 (400 DEPT_HAS_MEMBERS)
9. INACTIVE 부서의 소속 사용자는 상태 유지 — 관리자가 수동으로 부서 재배정
10. 동일 부모 하위 동명 부서 생성 차단 (409 DEPT_NAME_DUPLICATED)

### 사용자 조직 정보
11. users 테이블과 통합 관리 (Auth PRD users 확장)
12. 조직 변경 시 org_history 기록 (old/new dept, old/new position, changed_by, reason)
13. 겸직: 복수 부서 소속 가능 (최대 5개), primary 부서 반드시 1개
14. primary 부서 변경 시 기존 primary 자동 해제
15. INACTIVE 부서로의 배정 차단 (400 DEPT_INACTIVE)

### 검색
16. 검색 조건: 이름 (LIKE %keyword%), 부서 ID, 직책 ID — 1개 이상 필수
17. 복합 조건 AND 검색
18. 결과 페이징 (default 20건, max 100건)
19. 테넌트 격리 필수 (타 테넌트 데이터 노출 금지)
20. ACTIVE 사용자만 검색 결과에 포함 (기본값), includeInactive 파라미터로 제어

### 프로필
21. 상세 조회: 이름, 부서(겸직 포함), 직책, 전화, 이메일, 프로필 이미지
22. 프로필 이미지 업로드: PNG/JPG, 최대 2MB, multipart
23. 프로필 이미지 삭제: 기본 이미지 URL로 복원
24. 본인 또는 관리자만 프로필 수정 가능

### 직책 관리
25. 직책 CRUD
26. 직책 삭제: Soft Delete (status=INACTIVE), 사용 중인 직책 즉시 삭제 차단
27. level 값: 숫자가 낮을수록 상위 직책 (예: 대표=1, 부장=2, ...)
28. 동일 테넌트 내 직책명 중복 차단

### 권한
29. 일반 사용자: 조직 트리 / 사용자 검색 / 프로필 조회 (GET)
30. 관리자: 부서 CRUD, 직책 CRUD, 사용자 조직 정보 수정
31. 본인 프로필 이미지: 본인 수정 가능
32. Admin PRD RBAC 연계 (`org:read`, `org:write` permission_key)

---

## 3. 데이터 테이블

### users (Auth PRD + Admin PRD 확장)
```
user_id           PK UUID       -- Auth PRD 참조
tenant_id         FK → tenants
email             varchar(255)  -- Auth PRD 참조
name              varchar(100)
phone             varchar(20) nullable
profile_image_url varchar(500) nullable  -- NULL이면 기본 이미지 사용
position_id       FK → positions nullable
status            enum ACTIVE/INACTIVE
```

### departments
```
dept_id    PK UUID
tenant_id  FK → tenants
parent_id  FK self nullable  -- NULL이면 최상위 (테넌트 루트)
name       varchar(100)
order_no   int default 0
status     enum ACTIVE/INACTIVE
created_at / updated_at datetime
```

> UNIQUE: (tenant_id, parent_id, name) — 동일 부모 하위 동명 부서 방지

### org_closure (Closure Table)
```
ancestor_id   FK → departments  -- PK(ancestor_id, descendant_id)
descendant_id FK → departments
depth         int  -- 0이면 자기 자신
```

> 부서 생성 시: 자기 자신(depth=0) + 모든 상위 조상과의 관계 삽입
> 부서 이동 시: 해당 부서와 하위 전체의 기존 관계 삭제 후 재삽입
> tenant_id는 departments 테이블에서 관리 (org_closure는 dept_id로만 참조)

### user_departments (겸직)
```
user_id    FK → users  -- PK(user_id, dept_id)
dept_id    FK → departments
is_primary boolean default false
joined_at  datetime
```

> UNIQUE: (user_id, is_primary) WHERE is_primary=true — primary 부서 1개 강제
> 겸직 최대 5개 제한 (애플리케이션 레벨 검증)

### positions
```
position_id PK UUID
tenant_id   FK → tenants
name        varchar(100)
level       int  -- 낮을수록 상위 직책 (예: 1=대표, 2=부장)
status      enum ACTIVE/INACTIVE  -- [추가] Soft Delete
created_at / updated_at datetime
```

> UNIQUE: (tenant_id, name) — 동일 테넌트 내 직책명 중복 방지

### org_history
```
history_id      PK bigint auto
tenant_id       FK → tenants
user_id         FK → users
old_dept_id     FK → departments nullable  -- 최초 배정 시 null
new_dept_id     FK → departments nullable  -- 부서 해제 시 null
old_position_id FK → positions nullable
new_position_id FK → positions nullable
changed_by      FK → users  -- 변경한 관리자
changed_at      datetime
reason          varchar(500) nullable
```

---

## 4. API

> 조회 API: `Authorization: Bearer {accessToken}` (org:read)
> 관리 API: ADMIN 권한 필요 (org:write)

### 4.1 조직 트리

#### GET /api/org/tree — 전체 조직 트리 조회
```json
// Query: includeInactive(boolean, default:false)
// 200
{
  "departments": [
    {
      "deptId": "uuid",
      "name": "ZIN Corporation",
      "orderNo": 1,
      "status": "ACTIVE",
      "memberCount": 42,
      "children": [
        {
          "deptId": "uuid",
          "name": "개발팀",
          "orderNo": 1,
          "status": "ACTIVE",
          "memberCount": 12,
          "children": []
        }
      ]
    }
  ]
}
```

#### GET /api/org/departments/{deptId}/tree — 특정 부서 하위 트리 조회
```json
// Query: includeInactive(boolean, default:false)
// 200 — 해당 부서 기준 하위 트리 반환 (구조 동일)
// 404 DEPT_NOT_FOUND
```

#### GET /api/org/departments/{deptId}/members — 부서 소속 사용자 목록
```json
// Query: page(default:0), size(default:20, max:100), includeSubDepts(boolean, default:false)
// 200
{
  "members": [
    {
      "userId": "uuid",
      "name": "홍길동",
      "email": "hong@zin.com",
      "position": "선임",
      "isPrimary": true,
      "profileImageUrl": "https://..."
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 12,
  "totalPages": 1
}
// 404 DEPT_NOT_FOUND
```

---

### 4.2 부서 관리 (ADMIN)

#### POST /api/admin/departments — 부서 생성
```json
// Request
{ "parentId": "uuid", "name": "백엔드팀", "orderNo": 1 }

// 201
{ "deptId": "uuid", "message": "부서가 생성되었습니다." }

// 404 DEPT_NOT_FOUND (parentId 미존재)
// 409 DEPT_NAME_DUPLICATED (동일 부모 하위 동명 부서)
```

#### PUT /api/admin/departments/{deptId} — 부서 수정
```json
// Request (변경할 필드만)
{ "name": "백엔드개발팀", "parentId": "uuid", "orderNo": 2 }

// 200
{ "message": "부서가 수정되었습니다." }

// 400 CIRCULAR_REFERENCE (자기 자신 또는 하위 부서를 상위로 지정)
// 409 DEPT_NAME_DUPLICATED
// 404 DEPT_NOT_FOUND
```

#### DELETE /api/admin/departments/{deptId} — 부서 삭제 (Soft Delete)
```json
// 200
{ "message": "부서가 비활성화되었습니다." }

// 400 DEPT_HAS_CHILDREN (하위 ACTIVE 부서 존재)
// 400 DEPT_HAS_MEMBERS (소속 사용자 존재)
// 404 DEPT_NOT_FOUND
```

---

### 4.3 사용자 조직 정보 관리 (ADMIN)

#### PUT /api/admin/users/{userId}/org — 사용자 조직 정보 수정
```json
// Request
{
  "depts": [
    { "deptId": "uuid", "isPrimary": true },
    { "deptId": "uuid", "isPrimary": false }
  ],
  "positionId": "uuid",
  "reason": "팀 이동"
}

// 200
{ "message": "조직 정보가 수정되었습니다." }

// 400 PRIMARY_REQUIRED (isPrimary=true 항목 없음)
// 400 DUPLICATE_PRIMARY (isPrimary=true 2개 이상)
// 400 DEPT_LIMIT_EXCEEDED (겸직 5개 초과)
// 400 DEPT_INACTIVE (INACTIVE 부서로 배정 시도)
// 404 USER_NOT_FOUND / DEPT_NOT_FOUND / POSITION_NOT_FOUND
```

#### GET /api/admin/users/{userId}/org-history — 조직 변경 이력 조회
```json
// Query: page(default:0), size(default:20)
// 200
{
  "history": [
    {
      "historyId": 1,
      "oldDept": "개발팀",
      "newDept": "백엔드팀",
      "oldPosition": "주임",
      "newPosition": "선임",
      "changedBy": "홍길동",
      "changedAt": "2025-01-01T12:00:00Z",
      "reason": "팀 이동"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 5,
  "totalPages": 1
}
// 404 USER_NOT_FOUND
```

---

### 4.4 사용자 검색 / 프로필

#### GET /api/org/users/search — 사용자 검색
```json
// Query: name, deptId, positionId, includeInactive(default:false),
//        page(default:0), size(default:20, max:100)
// 조건(name / deptId / positionId) 1개 이상 필수

// 200
{
  "users": [
    {
      "userId": "uuid",
      "name": "홍길동",
      "email": "hong@zin.com",
      "primaryDept": "백엔드팀",
      "position": "선임",
      "profileImageUrl": "https://..."
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 3,
  "totalPages": 1
}

// 400 SEARCH_CONDITION_REQUIRED (조건 없이 검색)
```

#### GET /api/org/users/{userId} — 사용자 프로필 상세 조회
```json
// 200
{
  "userId": "uuid",
  "name": "홍길동",
  "email": "hong@zin.com",
  "phone": "010-1234-5678",
  "profileImageUrl": "https://...",
  "position": { "positionId": "uuid", "name": "선임", "level": 3 },
  "departments": [
    { "deptId": "uuid", "name": "백엔드팀", "isPrimary": true },
    { "deptId": "uuid", "name": "아키텍처팀", "isPrimary": false }
  ]
}

// 404 USER_NOT_FOUND
```

#### POST /api/org/users/{userId}/profile-image — 프로필 이미지 업로드
```json
// Request: multipart/form-data, file (PNG/JPG, 최대 2MB)
// 권한: 본인 또는 관리자

// 200
{ "profileImageUrl": "https://...", "message": "프로필 이미지가 업로드되었습니다." }

// 400 INVALID_FILE (형식/크기 오류)
// 403 FORBIDDEN (타인 이미지 수정 시도)
```

#### DELETE /api/org/users/{userId}/profile-image — 프로필 이미지 삭제 `[추가]`
```json
// 권한: 본인 또는 관리자

// 200
{ "message": "프로필 이미지가 삭제되었습니다. 기본 이미지로 복원됩니다." }

// 403 FORBIDDEN
// 404 USER_NOT_FOUND
```

---

### 4.5 직책 관리 (ADMIN)

#### GET /api/admin/positions — 직책 목록 조회
```json
// Query: includeInactive(boolean, default:false)
// 200
{ "positions": [{ "positionId": "uuid", "name": "선임", "level": 3, "status": "ACTIVE" }] }
```

#### POST /api/admin/positions — 직책 생성
```json
// Request
{ "name": "선임", "level": 3 }

// 201
{ "positionId": "uuid", "message": "직책이 생성되었습니다." }

// 409 POSITION_NAME_DUPLICATED
```

#### PUT /api/admin/positions/{positionId} — 직책 수정
```json
// Request
{ "name": "수석", "level": 2 }

// 200
{ "message": "직책이 수정되었습니다." }

// 404 POSITION_NOT_FOUND
// 409 POSITION_NAME_DUPLICATED
```

#### DELETE /api/admin/positions/{positionId} — 직책 삭제 (Soft Delete)
```json
// 200
{ "message": "직책이 비활성화되었습니다." }

// 400 POSITION_IN_USE (소속 사용자 존재)
// 404 POSITION_NOT_FOUND
```

---

## 5. 주요 에러 코드

| 코드 | HTTP | 설명 |
|------|------|------|
| DEPT_NOT_FOUND | 404 | 부서 미존재 |
| DEPT_HAS_CHILDREN | 400 | 하위 ACTIVE 부서 존재 시 삭제 |
| DEPT_HAS_MEMBERS | 400 | 소속 사용자 존재 시 삭제 |
| DEPT_NAME_DUPLICATED | 409 | 동일 부모 하위 동명 부서 |
| DEPT_INACTIVE | 400 | INACTIVE 부서로 사용자 배정 시도 |
| CIRCULAR_REFERENCE | 400 | 자기 자신/하위를 상위로 지정 |
| PRIMARY_REQUIRED | 400 | isPrimary=true 항목 없음 |
| DUPLICATE_PRIMARY | 400 | isPrimary=true 2개 이상 |
| DEPT_LIMIT_EXCEEDED | 400 | 겸직 5개 초과 |
| POSITION_NOT_FOUND | 404 | 직책 미존재 |
| POSITION_NAME_DUPLICATED | 409 | 동일 테넌트 내 직책명 중복 |
| POSITION_IN_USE | 400 | 사용 중인 직책 삭제 |
| USER_NOT_FOUND | 404 | 사용자 미존재 |
| SEARCH_CONDITION_REQUIRED | 400 | 검색 조건 없음 |
| INVALID_FILE | 400 | 파일 형식/크기 오류 |
| FORBIDDEN | 403 | 타인 프로필 수정 권한 없음 |

---

## 6. 오픈 이슈

| # | 이슈 | 영향도 | 현재 상태 |
|---|------|--------|----------|
| 1 | HR 시스템 연동 방식 (Batch vs 실시간) | High | 미결 — Auth PRD HR Batch 방식과 통일 권고 |
| 2 | 조직 변경 승인 프로세스 필요 여부 | Medium | 미결 — 필요 시 approval_requests 테이블 별도 설계 |
| 3 | 직책 level 값 범위 및 의미 표준화 | Medium | 미결 — 조직과 합의 필요 (예: 1=대표 ~ 10=사원) |
| 4 | Elasticsearch 도입 여부 | Medium | 현재 DB 인덱스 기반. 200인 규모 불필요, 확장 시 검토 |
| 5 | 겸직 최대 개수 (현재 5개) | Low | 조직 정책에 따라 조정 필요 |
| 6 | 부서 비활성화 시 사용자 일괄 이동 자동화 | Medium | 현재 수동 재배정. 자동화 도입 여부 결정 필요 |

---

## 7. 변경 이력

| 버전 | 변경 내용 | 일자 |
|------|----------|------|
| v1.0 | 최초 작성 | - |
| v2.0 | 1차 검증 반영: API Request/Response 완성, DEPT_HAS_MEMBERS 추가, CIRCULAR_REFERENCE 추가, 직책 CRUD API 추가, org_history changed_by/reason 추가, primary 중복 방지 정책, 프로필 이미지 업로드 API 추가, SEARCH_CONDITION_REQUIRED 추가, org_closure tenant_id 처리 명시, 부서 비활성화 사용자 처리 정책 명시 | - |
| v3.0 | 2차 검증 반영: 프로필 이미지 삭제 API 추가, positions Soft Delete 전환(INACTIVE) 및 positions 테이블 status 필드 추가, 겸직 최대 5개 제한 및 DEPT_LIMIT_EXCEEDED 에러 추가, INACTIVE 부서 배정 차단(DEPT_INACTIVE) 추가, 트리/검색/직책 목록에 includeInactive 파라미터 추가, DEPT_HAS_CHILDREN 조건 ACTIVE 부서로 한정 명시, departments UNIQUE 제약 명시, positions UNIQUE 제약 명시, user_departments partial unique index 명시, org_history 이력 조회 Response에 totalPages 추가, 본인/관리자 프로필 수정 권한 정책 명시, FORBIDDEN 에러 코드 추가, PUT positions 직책명 중복 에러 추가 | - |
