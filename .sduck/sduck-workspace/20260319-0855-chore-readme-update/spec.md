# [chore] readme update

> **작업 타입:** `chore` (Chore)
> **세부 분류:** `documentation`
> **작성자:** Claude
> **작성일:** 2026-03-19
> **연관 티켓:** -

---

## 1. 작업 개요

### 작업 목적

현재 구현 기준으로 README를 보강해, 사용자가 `init`, `start`, `fast-track`, `spec approve`, `plan approve`, `done` 흐름을 지금 동작 그대로 이해할 수 있게 정리한다.

### 작업 범위

- [x] 문서 작성 / 수정

---

## 2. 변경 상세

### 현재 상태 (As-Is)

README에는 주요 명령은 정리돼 있지만, 최근 추가된 fast-track 흐름, exact target 정책, interactive/비대화형 차이, `.sduck` 기반 구조 설명은 더 보강할 여지가 있다.

### 변경 후 상태 (To-Be)

README가 현재 CLI 동작 기준으로 아래를 더 명확히 설명한다.

- fast-track의 목적과 제약
- exact `slug` / exact `id` target 정책
- `.sduck` 아래 자산과 workspace 구조
- 일반 흐름과 fast-track 흐름의 차이
- 실제 사용 예시

### 변경 파일 목록

```text
target_paths:
  - README.md
```

---

## 3. 문서 변경

| 문서      | 변경 내용 요약                       | 변경 이유                             |
| --------- | ------------------------------------ | ------------------------------------- |
| README.md | 최신 명령 흐름, 제한 사항, 예시 보강 | 현재 구현과 사용자 이해를 맞추기 위해 |

---

## 4. 검증 계획

### 검증 체크리스트

- [x] README 내용이 현재 구현 명령과 일치한다
- [x] fast-track 설명이 승인 규칙과 충돌하지 않는다
- [x] exact target 정책 설명이 반영된다
- [x] Markdown 포맷이 깨지지 않는다

### 검증 방법

```bash
npm run lint
npm run test
```

---

## 5. 영향 범위

### 런타임 영향

- [x] 런타임 코드 변경 없음

### 개발자 환경 영향

- [x] 변경 없음

---

## 6. 롤백 계획

- README 문서 변경만 되돌리면 된다

---

## 7. 참고 자료

- `README.md`
- `src/cli.ts`
- `src/commands/fast-track.ts`
