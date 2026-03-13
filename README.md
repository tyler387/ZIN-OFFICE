# 그룹웨어 웹앱

React + Vite 프론트엔드와 Spring Boot 백엔드를 단일 서비스로 운영하는 프로젝트입니다.

## 기술 스택

- 프론트엔드: React 19, TypeScript, Vite, Ant Design
- 백엔드: Spring Boot 3.4, Spring Security, Spring Data JPA
- 빌드: Gradle 8.12, Java 17
- 기본 DB(로컬): H2 (in-memory)
- 배포: Docker, Render

## 프로젝트 구조

```text
.
├─ src/                              # React 앱 소스
├─ backend/                          # Spring Boot 백엔드
│  ├─ src/main/java/...
│  └─ src/main/resources/static/     # 프론트 빌드 산출물
├─ package.json
└─ README.md
```

## 사전 요구사항

- Node.js 20 이상
- Java 17 이상
- (Windows) PowerShell 또는 CMD

## 로컬 실행

### 1) 프론트 개발 서버

```bash
npm install
npm run dev
```

- 기본 주소: `http://localhost:5173`
- `/api` 요청은 Vite 프록시를 통해 `http://localhost:8080`으로 전달됩니다.

### 2) 백엔드 실행

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

프론트 산출물은 `backend/src/main/resources/static`에 생성됩니다.

### 웹앱 JAR 빌드

Windows:

```bash
npm run build:webapp
```

또는:

```bash
cd backend
.\gradlew.bat bootJar
```

## Docker 배포

현재 `backend/Dockerfile`은 백엔드 컨텍스트(`backend`) 기준으로 빌드됩니다.

- Render Root Directory: `backend`
- Dockerfile Path: `Dockerfile`

중요:

- Docker 빌드 시 `-PskipFrontendBuild=true`로 프론트 재빌드를 건너뜁니다.
- 따라서 프론트 수정 후에는 반드시 로컬에서 `npm run build`를 실행하고,
  `backend/src/main/resources/static/**` 변경분을 커밋해야 합니다.

로컬 Docker 빌드 예시(backend 디렉터리에서 실행):

```bash
cd backend
docker build -t groupware-backend .
docker run -p 8080:8080 -e PORT=8080 groupware-backend
```

## Render 배포 가이드

### Web Service 설정

- Environment: Docker
- Repository: 현재 운영 대상 저장소/브랜치 확인
- Root Directory: `backend`
- Dockerfile Path: `Dockerfile`

### 필수 환경변수

- `JWT_SECRET=<실제 시크릿>`
- DB 사용 시:
  - `SPRING_DATASOURCE_URL`
  - `SPRING_DATASOURCE_USERNAME`
  - `SPRING_DATASOURCE_PASSWORD`

`PORT`는 Render가 자동 주입하므로 일반적으로 별도 설정이 필요 없습니다.

## 데이터베이스 안내

현재 기본 설정은 `backend/src/main/resources/application.yml`에서 H2를 사용합니다.

운영 환경은 PostgreSQL 전환을 권장합니다.

권장 변경:

1. PostgreSQL 드라이버 추가 (`org.postgresql:postgresql`)
2. datasource 설정 환경변수화
3. `ddl-auto: create-drop` 제거 (`validate` 또는 `none`)
4. Flyway/Liquibase 같은 마이그레이션 도구 도입

## 자주 쓰는 명령어

```bash
# 린트
npm run lint

# 프론트 프리뷰
npm run preview
```

## 트러블슈팅

### Render에서 `npm` 관련 에러가 날 때

로그 예:

`Execution failed for task ':frontendBuild'. A problem occurred starting process 'command 'npm''`

확인 항목:

1. Docker 빌드 명령에 `-PskipFrontendBuild=true`가 포함되어 있는지
2. 프론트 빌드 산출물(`backend/src/main/resources/static/**`)이 최신 커밋인지
3. Render Root Directory가 `backend`로 맞는지

### 로컬 Gradle/JDK 버전 문제

- `java -version` 확인
- `.\gradlew.bat -version`으로 Gradle이 실제 어떤 JVM을 쓰는지 확인
