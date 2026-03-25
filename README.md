# 그룹웨어 프로젝트

React + Vite 프론트엔드와 Spring Boot 백엔드를 함께 운영하는 프로젝트입니다.

## 기술 스택

- 프론트엔드: React 19.2, TypeScript 5.9, Vite 7.3, Ant Design 6.3
- 백엔드: Spring Boot 3.4.3, Spring Security, Spring Data JPA
- 빌드: Gradle 8.12.1, Java 17
- 데이터베이스
  - 기본: H2 (in-memory)
  - 개발/운영 권장: PostgreSQL 16+
- 배포: Docker, Render

## 프로젝트 구조

```text
.
├─ src/                              # React 소스
├─ backend/                          # Spring Boot 백엔드
│  ├─ src/main/java/...
│  ├─ src/main/resources/static/     # 프론트 빌드 결과물
│  ├─ Dockerfile
│  └─ docker-compose.dev.yml
├─ package.json
└─ README.md
```

## 사전 요구사항

- Node.js 20+
- Java 17+
- Docker Desktop (로컬 Docker 실행 시)

## 로컬 실행

### 1) 프론트 개발 서버

```bash
npm install
npm run dev
```

- 기본 주소: `http://localhost:5173`
- `/api` 요청은 Vite 프록시를 통해 `http://localhost:8080`으로 전달됩니다.

### 2) 백엔드 로컬 실행 (H2)

Windows:

```bash
cd backend
.\gradlew.bat bootRun
```

macOS/Linux:

```bash
cd backend
./gradlew bootRun
```

- 기본 주소: `http://localhost:8080`

## 빌드

### 프론트만 빌드

```bash
npm run build
```

프론트 빌드 결과물은 `backend/src/main/resources/static`에 생성됩니다.

### 통합 JAR 빌드

Windows:

```bash
npm run build:webapp
```

또는:

```bash
cd backend
.\gradlew.bat bootJar
```

## Docker

현재 Docker 빌드는 백엔드 디렉터리(`backend`)를 기준으로 동작합니다.

- Root Directory: `backend`
- Dockerfile Path: `Dockerfile`

### 백엔드 이미지 빌드

```bash
cd backend
docker build -t groupware-backend:dev .
```

- `backend/Dockerfile`은 내부적으로 `gradle clean bootJar -PskipFrontendBuild=true`를 사용합니다.
- 따라서 Docker 빌드 시에는 프론트 빌드를 건너뜁니다.
- 프론트 변경사항을 반영하려면 로컬에서 `npm run build` 후 정적 파일(`backend/src/main/resources/static/**`)을 함께 반영해야 합니다.

### 백엔드 컨테이너 실행

```bash
docker run -p 8080:8080 -e PORT=8080 groupware-backend:dev
```

## Docker Compose 개발 환경 (PostgreSQL)

`backend/docker-compose.dev.yml`은 PostgreSQL 16(alpine) 개발용 구성을 제공합니다.

프로젝트 루트에서 실행:

```bash
# DB 실행
docker compose -f backend/docker-compose.dev.yml up -d postgres

# 상태 확인
docker compose -f backend/docker-compose.dev.yml ps
```

### 백엔드 + DB 함께 실행 (권장 순서)

```bash
# 1) DB 실행
docker compose -f backend/docker-compose.dev.yml up -d postgres

# 2) 백엔드 이미지 빌드
docker build -t groupware-backend:dev ./backend

# 3) 백엔드 실행 (Compose 네트워크 사용)
docker run -d --name groupware-backend-dev --network backend_default -p 8080:8080 -e SPRING_PROFILES_ACTIVE=dev -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/groupware_dev -e SPRING_DATASOURCE_USERNAME=groupware -e SPRING_DATASOURCE_PASSWORD=groupware1234 groupware-backend:dev

# 4) 프론트 실행
npm run dev
```

접속 주소:

- 프론트엔드: `http://localhost:5173`
- 백엔드: `http://localhost:8080`

### 로그/상태 확인

```bash
docker compose -f backend/docker-compose.dev.yml ps
docker ps
docker logs groupware-backend-dev --tail 100
docker logs groupware-postgres-dev --tail 100
```

### 종료/재시작

```bash
# 프론트 터미널: Ctrl + C

# 백엔드/DB 중지
docker rm -f groupware-backend-dev
docker compose -f backend/docker-compose.dev.yml down

# 다시 시작
docker compose -f backend/docker-compose.dev.yml up -d postgres
docker run -d --name groupware-backend-dev --network backend_default -p 8080:8080 -e SPRING_PROFILES_ACTIVE=dev -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/groupware_dev -e SPRING_DATASOURCE_USERNAME=groupware -e SPRING_DATASOURCE_PASSWORD=groupware1234 groupware-backend:dev
npm run dev
```

## Render 배포 가이드

### Web Service 설정

- Environment: Docker
- Root Directory: `backend`
- Dockerfile Path: `Dockerfile`

### 필수 환경변수

- `JWT_SECRET=<실제 시크릿>`
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

`PORT`는 Render가 자동 주입하므로 일반적으로 별도 설정이 필요 없습니다.

## 데이터베이스 안내

- 기본 설정(`backend/src/main/resources/application.yml`): H2 + `ddl-auto: create-drop`
- 개발 프로필(`backend/src/main/resources/application-dev.yml`): PostgreSQL + `ddl-auto: update`

운영 환경에서는 아래를 권장합니다.

1. PostgreSQL 사용
2. `ddl-auto`를 `validate` 또는 `none`으로 조정
3. Flyway/Liquibase 도입

## 자주 발생하는 오류

### 1) Render에서 `npm` 관련 빌드 에러

예시 로그:

`Execution failed for task ':frontendBuild'. A problem occurred starting process 'command 'npm''`

확인 항목:

1. Docker 빌드가 `-PskipFrontendBuild=true`로 실행되는지
2. 정적 파일(`backend/src/main/resources/static/**`)이 최신인지
3. Render Root Directory가 `backend`인지

### 2) `port 5432 is already allocated`

- 의미: 다른 프로세스/컨테이너가 5432 포트를 사용 중
- 조치:

```bash
docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Ports}}"
netstat -ano | findstr :5432
```

### 3) `password authentication failed for user "groupware"`

- 의미: DB 초기 비밀번호와 백엔드 환경변수 불일치
- 조치(개발환경):

```bash
docker compose -f backend/docker-compose.dev.yml down -v
docker compose -f backend/docker-compose.dev.yml up -d postgres
```

### 4) `Connection refused` (예: `postgres:5432`)

- 의미: DB 컨테이너가 아직 기동 중이 아니거나 healthy 상태 아님
- 조치:

```bash
docker compose -f backend/docker-compose.dev.yml ps
```

`Up (healthy)` 상태 확인 후 백엔드를 실행하세요.

## 참고 문서

- `AI_에이전트_협업_가이드.md`
- `브랜치_전략_가이드.md`
