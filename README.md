# 그룹웨어 프로젝트

React + Vite 프론트엔드와 Spring Boot 백엔드로 구성된 프로젝트입니다.

## 기술 스택

- Frontend: React 19, TypeScript, Vite, Ant Design
- Backend: Spring Boot, Spring Security, Spring Data JPA
- Build: Gradle, Java 17
- Database: Supabase(PostgreSQL)

## 프로젝트 구조

```text
.
├─ src/                      # React 소스
├─ backend/
│  ├─ src/main/java/...
│  ├─ src/main/resources/
│  ├─ Dockerfile
│  └─ docker-compose.yml
├─ package.json
└─ README.md
```

## 로컬 실행

### 1) 프론트 실행

```bash
npm install
npm run dev
```

- 기본 주소: `http://localhost:5173`

### 2) 백엔드 실행(로컬 Gradle)

PowerShell:

```powershell
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://<SUPABASE_HOST>:5432/postgres?sslmode=require"
$env:SPRING_DATASOURCE_USERNAME="postgres"
$env:SPRING_DATASOURCE_PASSWORD="<YOUR-PASSWORD>"

cd backend
.\gradlew.bat bootRun
```

## Docker 실행(백엔드만)

`backend/docker-compose.yml`은 백엔드 컨테이너만 실행합니다.

```powershell
Copy-Item backend/.env.example backend/.env
# backend/.env에서 SPRING_DATASOURCE_PASSWORD 값을 실제 비밀번호로 수정

docker compose -f backend/docker-compose.yml up -d --build backend
docker compose -f backend/docker-compose.yml ps
docker logs groupware-backend --tail 100
```

중지:

```powershell
docker rm -f groupware-backend
docker compose -f backend/docker-compose.yml down
```

## 환경변수

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `PORT` (기본값 8080)

## 데이터베이스 설정

- 단일 설정 파일: `backend/src/main/resources/application.yml`
- Supabase URL 예시:
  - `jdbc:postgresql://<SUPABASE_HOST>:5432/postgres?sslmode=require`

운영 환경 권장:

1. `ddl-auto`를 `validate` 또는 `none`으로 조정
2. Flyway/Liquibase 도입

## 트러블슈팅

### `password authentication failed for user "postgres"`

- 원인: Supabase 비밀번호 불일치
- 조치: `SPRING_DATASOURCE_PASSWORD` 재설정

### `Connection refused` / `timeout`

- 원인: 호스트 오타, SSL 옵션 누락, 네트워크 문제
- 조치: `SPRING_DATASOURCE_URL` 확인 후 백엔드 로그 점검
