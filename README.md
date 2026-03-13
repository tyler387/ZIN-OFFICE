# Groupware Web App

React + Vite 프론트엔드와 Spring Boot 백엔드를 하나의 서비스로 배포하는 그룹웨어 프로젝트입니다.

## Tech Stack

- Frontend: React 19, TypeScript, Vite, Ant Design
- Backend: Spring Boot 3.4, Spring Security, Spring Data JPA
- Build: Gradle 8.12, Java 17
- Default DB (local): H2 (in-memory)
- Deployment: Docker (Render 배포 가능)

## Project Structure

```text
.
├─ src/                              # React SPA
├─ backend/                          # Spring Boot API
│  ├─ src/main/java/...
│  └─ src/main/resources/static/     # Vite build output
├─ package.json
└─ README.md
```

## Prerequisites

- Node.js 20+
- Java 17+
- (Windows) PowerShell 또는 CMD

프로젝트는 Gradle Java 경로를 고정해서 사용합니다:

- `backend/gradle.properties`
- `org.gradle.java.home=C:/Program Files/Java/jdk-17`

전역 `JAVA_HOME`이 Java 8이어도 이 프로젝트의 Gradle은 Java 17로 동작합니다.

## Local Development

### 1) Frontend dev server

```bash
npm install
npm run dev
```

- 기본 주소: `http://localhost:5173`
- `/api` 요청은 Vite 프록시를 통해 `http://localhost:8080`으로 전달됩니다.

### 2) Backend server

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

## Build

### Frontend only

```bash
npm run build
```

Vite 결과물이 `backend/src/main/resources/static`에 생성됩니다.

### Full webapp jar

Windows:

```bash
npm run build:webapp
```

또는:

```bash
cd backend
.\gradlew.bat bootJar
```

## Docker Deployment

`backend/Dockerfile`은 멀티 스테이지 빌드입니다.

1. Node 스테이지에서 프론트엔드 빌드
2. Gradle 스테이지에서 Spring Boot jar 빌드
3. JRE 스테이지에서 런타임 실행

로컬 빌드:

```bash
docker build -f backend/Dockerfile .
docker run -p 8080:8080 -e PORT=8080 <IMAGE_ID>
```

## Render Deployment (Recommended)

### Web Service

- Environment: Docker
- Dockerfile Path: `backend/Dockerfile`
- Docker build context: repository root

필수 환경변수 예시:

- `PORT=8080` (Render가 자동 주입하므로 보통 별도 설정 불필요)
- `JWT_SECRET=<your-secret>`
- DB 사용 시 `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`

### Database

운영 환경은 H2 대신 PostgreSQL 사용을 권장합니다.

권장 이유:

- Render Managed Postgres 제공
- 백업/복구/운영 관리가 용이
- Spring Boot/JPA와 호환성 높음

## Database Notes

현재 기본 설정은 `backend/src/main/resources/application.yml`에서 H2를 사용합니다.

운영 전환 시 최소 변경:

1. PostgreSQL 드라이버 추가 (`org.postgresql:postgresql`)
2. datasource URL/계정 환경변수화
3. `ddl-auto: create-drop` 제거 (`validate` 또는 `none`)
4. Flyway/Liquibase 같은 마이그레이션 도구 도입

## Useful Commands

```bash
# Lint
npm run lint

# Frontend preview
npm run preview
```

## Troubleshooting

### Gradle이 Java 8로 실행되는 경우

- `backend/gradle.properties`의 `org.gradle.java.home` 경로가 실제 Java 17 경로인지 확인

### Windows에서 gradlew 실행 오류

- `cd backend` 경로에서 실행했는지 확인
- `.\gradlew.bat -version`으로 실제 Gradle JVM 버전 확인

