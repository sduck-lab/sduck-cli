# [chore] update claude md cli note

> **작업 타입:** `chore` (Chore)
> **세부 분류:** `documentation`
> **작성자:** Claude
> **작성일:** 2026-03-20
> **연관 티켓:** -

---

## 1. 작업 개요

### 작업 목적

현재 `CLAUDE.md`의 managed block에 `sduck CLI가 없으므로 Claude가 직접 파일을 생성하고 상태를 관리한다`는 문구가 남아 있어,
실제 프로젝트 상태와 맞지 않는다.

이 문구는 단순 문서 한 줄 수정으로 끝나지 않고, `sduck init`이 생성하는 agent rule 원본과 managed block 생성 경로도 함께 맞춰야 재생성 시 다시 틀어지지 않는다.

### 작업 범위

- [x] 문서 작성 / 수정
- [x] build-config / generated rule source 정리

---

## 2. 변경 상세

### 현재 상태 (As-Is)

- 루트 `CLAUDE.md` managed block에 CLI 부재를 전제로 한 문구가 남아 있다
- `.sduck/sduck-assets/agent-rules/core.md`와 init 기반 rule 생성 경로도 같은 설명을 재사용할 가능성이 있다
- 따라서 수동 수정만 하면 이후 `sduck init` 또는 규칙 재생성 시 다시 잘못된 문구가 생길 수 있다

### 변경 후 상태 (To-Be)

- `CLAUDE.md`는 이제 `sduck CLI`가 존재한다는 현재 상태를 반영한다
- rule source / core asset / init 재생성 경로가 같은 문구로 일관되게 맞춰진다
- 생성 문서는 `CLI를 사용한다`는 표현과 `직접 파일을 생성하고 상태를 관리한다`는 옛 설명이 충돌하지 않게 정리된다

### 변경 파일 목록

```text
target_paths:
  - CLAUDE.md
  - .sduck/sduck-assets/agent-rules/core.md
  - src/core/init.ts
  - src/core/agent-rules.ts
  - tests/unit/agent-rules.test.ts
  - tests/e2e/init-agent-rules.test.ts
```

---

## 3. 문서 변경

| 문서                                      | 변경 내용 요약             | 변경 이유               |
| ----------------------------------------- | -------------------------- | ----------------------- |
| `CLAUDE.md`                               | CLI 부재 가정 제거         | 현재 프로젝트 상태 반영 |
| `.sduck/sduck-assets/agent-rules/core.md` | 공통 rule source 문구 정리 | 재생성 시 일관성 유지   |

---

## 4. 검증 계획

### 검증 체크리스트

- [x] `CLAUDE.md` 문구가 현재 구현과 일치한다
- [x] rule source를 재생성해도 같은 문구가 유지된다
- [x] 관련 agent rule 테스트가 통과한다
- [x] 문서 표현이 승인/워크플로우 규칙과 충돌하지 않는다

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

- 문구 변경과 관련 테스트 조정만 되돌리면 된다

---

## 7. 참고 자료

- `CLAUDE.md`
- `.sduck/sduck-assets/agent-rules/core.md`
- `src/core/init.ts`
- `src/core/agent-rules.ts`
