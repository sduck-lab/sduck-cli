# [chore] refine agent rule wording

> **작업 타입:** `chore` (Chore)
> **세부 분류:** `documentation`
> **작성자:** Claude
> **작성일:** 2026-03-20
> **연관 티켓:** -

---

## 1. 작업 개요

### 작업 목적

agent rule 문구가 이제 `sduck` CLI 사용 기준으로 바뀌었지만,
현재 표현은 `task 파일과 상태를 관리한다` 수준이라 에이전트와 CLI의 역할 분담이 아직 완전히 선명하지 않다.

이번 작업의 목적은 agent rule 문구를 더 정확하게 다듬어,
`task 생성/상태 전이`는 CLI가 맡고 `spec.md`/`plan.md` 본문 작성과 구현은 에이전트가 맡는다는 역할 분담을 명확히 하는 것이다.

### 작업 범위

- [x] 문서 작성 / 수정
- [x] generated rule source wording 정리

---

## 2. 변경 상세

### 현재 상태 (As-Is)

- 현재 문구는 `sduck` CLI 사용을 반영하지만 역할 구분이 다소 뭉뚱그려져 있다
- 문서를 읽는 사용자는 에이전트가 `spec.md`/`plan.md` 본문도 CLI로만 다루는지, 또는 직접 작성하는지 헷갈릴 수 있다
- root rule 파일과 asset source가 같은 의미를 유지해야 한다

### 변경 후 상태 (To-Be)

- 문구가 아래 역할 분담을 명시한다
  - task 생성과 상태 전이는 `sduck` CLI가 담당
  - 에이전트는 `spec.md`, `plan.md` 본문 작성/수정과 구현을 담당
- `CLAUDE.md`, `AGENT.md`, agent rule asset source가 같은 의미를 유지한다
- 재생성 후에도 같은 문구가 유지된다

### 변경 파일 목록

```text
target_paths:
  - CLAUDE.md
  - AGENT.md
  - .sduck/sduck-assets/agent-rules/claude-code.md
  - .sduck/sduck-assets/agent-rules/codex.md
  - .sduck/sduck-assets/agent-rules/opencode.md
  - .sduck/sduck-assets/agent-rules/gemini-cli.md
  - tests/unit/agent-rules.test.ts
  - tests/e2e/init-agent-rules.test.ts
```

---

## 3. 문서 변경

| 문서                     | 변경 내용 요약                         | 변경 이유                  |
| ------------------------ | -------------------------------------- | -------------------------- |
| `CLAUDE.md` / `AGENT.md` | CLI와 에이전트의 책임을 더 정확히 설명 | 역할 분담 명확화           |
| agent rule source files  | 재생성 시 같은 문구 유지               | 원본/생성 결과 정합성 유지 |

---

## 4. 검증 계획

### 검증 체크리스트

- [x] 역할 분담 문구가 명확하다
- [x] root rule과 source rule의 의미가 일치한다
- [x] agent rule 관련 테스트가 통과한다
- [x] 승인/구현 규칙과 충돌하지 않는다

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

- wording 변경과 테스트 기대값만 되돌리면 된다

---

## 7. 참고 자료

- `CLAUDE.md`
- `AGENT.md`
- `.sduck/sduck-assets/agent-rules/*.md`
- `tests/unit/agent-rules.test.ts`
- `tests/e2e/init-agent-rules.test.ts`
