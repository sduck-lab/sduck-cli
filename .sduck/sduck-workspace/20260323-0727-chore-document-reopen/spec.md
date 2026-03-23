# [chore] document reopen

> **작업 타입:** `chore` (Chore)
> **세부 분류:** `documentation`
> **작성자:** Claude
> **작성일:** 2026-03-23
> **연관 티켓:** -

---

## 1. 작업 개요

### 작업 목적

현재 문서에는 `start`, `fast-track`, `spec approve`, `plan approve`, `done` 흐름은 설명되어 있지만,
완료된 작업을 다시 여는 `reopen` 흐름 설명이 부족하다.

이 때문에 사용자는 `DONE` 상태 작업을 수정해야 할 때 `reopen`을 써야 하는지,
새 task를 파야 하는지, reopen 후 어떤 상태로 돌아가는지 이해하기 어렵다.

이번 작업의 목적은 현재 구현 기준에 맞게 `reopen` 명령의 의미, 상태 전이, 사용 시점, 새 task와의 구분을 문서에 명확히 추가하는 것이다.

### 작업 범위

- [x] 문서 작성 / 수정
- [x] workflow 설명 보강

---

## 2. 변경 상세

### 현재 상태 (As-Is)

- README와 agent rule 문서에 `reopen` 설명이 부족하거나 없다
- 사용자는 `DONE` 이후 수정이 필요할 때 reopen과 새 task 생성의 차이를 알기 어렵다
- 상태 전이 문서도 reopen까지 포함해 닫힌 lifecycle로 설명되지 않는다

### 변경 후 상태 (To-Be)

문서가 아래를 명확히 설명한다.

- `sduck reopen [target]`의 역할
- 어떤 상태에서 어떤 상태로 전이되는지
- reopen 후 문서/구현 작업을 어떻게 이어가는지
- 언제 reopen을 쓰고 언제 새 task를 만들어야 하는지

### 변경 파일 목록

```text
target_paths:
  - README.md
  - CLAUDE.md
  - AGENT.md
  - .sduck/sduck-assets/agent-rules/core.md
```

---

## 3. 문서 변경

| 문서            | 변경 내용 요약                       | 변경 이유                   |
| --------------- | ------------------------------------ | --------------------------- |
| `README.md`     | reopen 명령과 사용 기준 설명 추가    | 사용자 워크플로우 이해 보강 |
| agent rule 문서 | reopen 후 상태 해석과 사용 기준 추가 | 에이전트 행동 일관성 유지   |

---

## 4. 검증 계획

### 검증 체크리스트

- [x] reopen 설명이 현재 구현과 일치한다
- [x] 상태 전이 설명이 다른 명령 설명과 충돌하지 않는다
- [x] reopen과 새 task의 구분 기준이 명확하다
- [x] Markdown/문서 포맷이 유지된다

### 검증 방법

```bash
npm run lint
npm test
```

---

## 5. 영향 범위

### 런타임 영향

- [x] 런타임 코드 변경 없음

### 개발자 환경 영향

- [x] 변경 없음

---

## 6. 롤백 계획

- reopen 관련 문서 문구만 되돌리면 된다

---

## 7. 참고 자료

- `README.md`
- `CLAUDE.md`
- `AGENT.md`
- `.sduck/sduck-assets/agent-rules/core.md`
- `src/cli.ts`
