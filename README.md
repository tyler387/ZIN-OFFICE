# Groupware Web App

이 프로젝트는 `React + Vite` 프런트엔드와 `Spring Boot` 백엔드를 하나의 웹앱으로 배포하도록 구성되어 있습니다.

## 구조

- `src/`: React SPA
- `backend/`: Spring Boot API 및 정적 파일 서빙
- `backend/src/main/resources/static/`: 프런트엔드 빌드 결과물

`npm run build`를 실행하면 프런트엔드가 바로 `backend/src/main/resources/static`으로 빌드됩니다.  
`backend/gradlew.bat bootJar` 또는 Gradle의 `processResources` 단계에서도 프런트 빌드가 자동 실행됩니다.

## 개발 실행

프런트엔드 개발 서버:

```bash
npm run dev
```

백엔드 서버:

```bash
cd backend
gradlew.bat bootRun
```

Vite 개발 서버는 `/api` 요청을 `http://localhost:8080`으로 프록시합니다.

## 웹앱 빌드

프런트엔드만 빌드:

```bash
npm run build
```

프런트엔드 포함 전체 웹앱 JAR 빌드:

```bash
npm run build:webapp
```

또는

```bash
cd backend
gradlew.bat bootJar
```

빌드가 끝나면 Spring Boot JAR 안에 SPA 정적 리소스가 포함되어 단일 웹앱으로 배포할 수 있습니다.
