# Branch Guide

협업 시 브랜치 구조와 병합 순서를 통일하기 위한 문서입니다.

## Current Branch Structure

Remote (`origin`):

- `main`
- `develop`
- `feature/ui`
- `feature/login`
- `feature/messenger`
- `feature/payment`

Local:

- `main`
- `develop`
- `feature/ui`

## Branch Roles

- `main`: 운영 배포 기준 브랜치
- `develop`: 통합 개발 브랜치
- `feature/*`: 기능 단위 작업 브랜치

## Recommended Flow

1. `develop`에서 `feature/*` 브랜치를 생성해서 작업
2. 기능 완료 후 `feature/* -> develop`로 PR 또는 merge
3. 통합 검증 후 `develop -> main`으로 배포 반영

## Naming Convention

- `feature/<topic>`: 기능 개발
- `fix/<topic>`: 버그 수정
- `hotfix/<topic>`: 운영 긴급 수정
- `chore/<topic>`: 설정/문서/빌드 작업

예시:

- `feature/ui`
- `fix/login-redirect`
- `chore/docker-render`

## Common Commands

### 1) Feature branch 생성

```bash
git fetch origin
git switch develop
git pull origin develop
git switch -c feature/<name>
```

### 2) 작업 반영

```bash
git add .
git commit -m "feat: <summary>"
git push -u origin feature/<name>
```

### 3) feature/ui 내용을 develop에 반영

```bash
git fetch origin
git switch develop
git pull origin develop
git merge origin/feature/ui
git push origin develop
```

## Merge Policy

- `main`에는 직접 커밋하지 않고 PR/merge로만 반영
- `develop` 반영 전 충돌 해결 + 로컬 빌드 확인
- 배포 관련 파일(`backend/Dockerfile`, `backend/src/main/resources/static/**`) 변경 시 리뷰 필수

## Pre-Merge Checklist

- `npm run build` 성공
- 백엔드 빌드 또는 Docker 빌드 확인
- API/CORS/환경변수 변경 사항 문서화
- 불필요한 빌드 산출물/임시 파일 포함 여부 점검

