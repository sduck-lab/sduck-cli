# [fix] npm package files path

> **작업 타입:** `fix` (Quick Fix)
> **심각도:** `critical`
> **작성자:** taehee
> **작성일:** 2026-03-19
> **연관 티켓:** -

---

## 1. 버그 개요

### 문제 요약

`package.json`의 `files` 필드에 `"sduck-assets"`로 선언되어 있어 npm publish/install 시 `.sduck/sduck-assets` 디렉토리가 패키지에 포함되지 않는다. 글로벌 설치 후 `sduck init --agents ...` 실행 시 `Unable to locate bundled .sduck/sduck-assets directory.` 에러 발생.

### 발견 경위

- [x] QA 테스트

### 발생 빈도

- [x] 항상 재현됨 (100%)

---

## 2. 재현 방법 (Steps to Reproduce)

**환경 정보**
| 항목 | 내용 |
|------|------|
| 환경 | local (글로벌 설치) |
| OS | macOS (Darwin 25.3.0) |
| Node | >= 20 |

**재현 단계**

1. `npm install -g @sduck/sduck-cli`
2. 임의의 프로젝트 디렉토리에서 `sduck init --agents claude-code,codex,opencode` 실행
3. 에이전트 선택 후 에러 발생

**실제 결과 (Actual)**

`Unable to locate bundled .sduck/sduck-assets directory.` 에러로 실패

**기대 결과 (Expected)**

에이전트 룰 파일(CLAUDE.md, AGENT.md 등)이 정상 생성됨

---

## 3. 원인 분석 (Root Cause)

### 원인 파악 현황

- [x] 원인 특정 완료

### 원인 요약

`package.json`의 `files` 배열에 `"sduck-assets"`로 되어 있지만 실제 디렉토리 경로는 `.sduck/sduck-assets`이다. npm은 `files` 필드에 명시된 경로만 패키지에 포함하므로, 존재하지 않는 `sduck-assets/`를 찾다가 아무것도 포함하지 않는다.

### 원인 코드 위치

```
파일: package.json
라인: "files" 배열 내 "sduck-assets" 항목
```

### 발생 조건

npm pack/publish/install 시 `.sduck/` 디렉토리가 패키지에 누락됨

---

## 4. 수정 방안

### 선택한 방안 및 이유

> `package.json`의 `files` 배열에서 `"sduck-assets"`를 `".sduck/sduck-assets"`로 변경

### 변경 파일 목록 (예상)

```
target_paths:
  - package.json
```

---

## 5. 테스트 계획

### 수정 검증 테스트 (수정 후 통과 확인)

| 테스트 케이스         | 조건                              | 예상 결과                     |
| --------------------- | --------------------------------- | ----------------------------- |
| npm pack 후 내용 확인 | `npm pack --dry-run`              | `.sduck/sduck-assets/` 포함됨 |
| 글로벌 설치 후 init   | `sduck init --agents claude-code` | 정상 동작                     |

---

## 6. 영향 범위

### 사이드 이펙트 검토

없음. 패키지 포함 경로만 수정.

### 데이터 정합성

- [x] DB 데이터 정정 작업 필요 없음

---

## 7. 완료 조건

- [x] `npm pack --dry-run` 시 `.sduck/sduck-assets/` 디렉토리가 포함됨
- [x] 기존 테스트 통과
