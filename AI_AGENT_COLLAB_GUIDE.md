# AI Agent Collaboration Guide

AI 에이전트 협업 시, 서로 작업 범위를 침범하지 않기 위한 규칙 문서입니다.

이 문서를 지키지 않으면:

- 충돌 증가
- 리뷰 비용 증가
- 배포 실패 가능성 증가

## How To Use

AI 에이전트에게 요청할 때 아래 문구를 항상 포함합니다.

```text
반드시 AI_AGENT_COLLAB_GUIDE.md를 먼저 읽고 그 규칙만 따라 작업해.
지정한 범위 밖 파일은 수정하지 마.
```

## Core Rules

1. 요청받은 범위(파일/폴더) 밖 수정 금지
2. 기존 변경사항(내가 수정 중인 파일) 덮어쓰기 금지
3. 원인 파악 없이 대규모 포맷/리네임 금지
4. 빌드 산출물 수정은 명시적으로 요청된 경우에만 수행
5. 작업 전에 `git status`를 확인하고, 변경 파일 목록을 먼저 선언

## Required Working Process

모든 AI 작업은 아래 순서를 지킵니다.

1. 현재 브랜치와 변경사항 확인
2. 작업 범위 선언
3. 지정 범위 파일만 수정
4. 범위 외 파일 변경 여부 재확인
5. 결과 보고(수정 파일 + 이유 + 검증 결과)

## Scope Declaration Format

AI는 작업 시작 전에 아래 형식으로 범위를 선언해야 합니다.

```text
[작업 범위]
- 수정 허용: <file or directory>
- 수정 금지: 위 범위 외 전체
- 생성 허용: <필요시 파일>
```

## File Ownership (Default)

기본 소유권 규칙입니다. 별도 지시가 있으면 그 지시가 우선합니다.

- Frontend UI: `src/**`
- Backend API: `backend/src/main/java/**`
- Infra/Deploy: `backend/Dockerfile`, `backend/build.gradle`, `.dockerignore`
- Docs: `README.md`, `BRANCH_GUIDE.md`, `AI_AGENT_COLLAB_GUIDE.md`
- Build outputs: `backend/src/main/resources/static/**` (요청 시만 수정)

## Conflict Prevention Rules

1. 같은 파일을 두 AI가 동시에 수정하지 않는다.
2. 하나의 작업은 가능한 한 하나의 기능 단위 PR/commit으로 묶는다.
3. UI 작업 AI는 backend 파일 수정 금지, backend 작업 AI는 UI 파일 수정 금지(명시 요청 제외).
4. 배포 파일(Dockerfile/Gradle)은 전담 작업으로 분리한다.

## Hard Do-Not-Edit List

아래 파일/영역은 사용자 지시 없이는 수정 금지:

- `backend/src/main/resources/static/assets/**` (빌드 산출물)
- 인증/보안 설정 파일 (`SecurityConfig`, `CorsConfig`, JWT 설정)
- 브랜치/배포 정책 문서

## PR/Commit Convention

- Commit message prefix:
  - `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- 하나의 커밋에는 하나의 목적만 담기
- 범위 외 파일이 포함되면 커밋 중단 후 재정리

## Verification Checklist (Before Finish)

1. 범위 외 파일 변경 없음
2. 요청한 기능만 변경됨
3. 빌드/테스트 가능 여부 보고함
4. 남은 리스크를 명시함

## Prompt Template For AI Agent

아래 템플릿을 복붙해서 사용합니다.

```text
반드시 AI_AGENT_COLLAB_GUIDE.md를 먼저 읽고 준수해.

[작업]
<요청 내용>

[수정 허용 범위]
<파일/폴더>

[수정 금지 범위]
<파일/폴더 또는 "허용 범위 외 전체">

[검증]
가능하면 빌드/테스트 실행 후 결과까지 알려줘.
```

## Example

```text
반드시 AI_AGENT_COLLAB_GUIDE.md를 먼저 읽고 준수해.

[작업]
홈 화면 모바일 캘린더 하단 잘림 수정

[수정 허용 범위]
src/pages/HomePage.tsx
src/layouts/AppLayout.tsx

[수정 금지 범위]
backend/**, Dockerfile, README.md

[검증]
npm run build 결과와 수정 파일 목록을 같이 알려줘.
```

