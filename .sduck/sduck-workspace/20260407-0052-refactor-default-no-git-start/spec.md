# [refactor] default no git start

> **작업 타입:** `refactor` (Refactor)
> **작성자:** taehee
> **작성일:** 2026-04-07
> **연관 티켓:** -

---

## ⚠️ 리팩토링 불변 조건

> **이 작업은 사용자 기능의 결과를 깨지 않도록 워크플로우 운영 방식을 경량화한다.**
> SDD 상태 전이(`spec -> plan -> implementation -> review ready -> done`) 자체는 유지한다.

---

## 1. 배경 및 목적

### 리팩토링이 필요한 이유

- 현재 `sduck start` 기본 동작이 git worktree 생성이라 작업 시작 비용이 크고, task가 쌓일수록 `.sduck-worktrees`가 빠르게 비대해진다.
- 실제 저장소에서 `.sduck-worktrees` 용량이 `.sduck/sduck-workspace` 대비 과도하게 크며(문서/메타보다 worktree가 병목), 느린 체감과 정리 부담을 만든다.
- worktree 누적은 상태 꼬임(작업 완료 후 잔여 브랜치/잔여 worktree, 테스트 잔재) 리스크를 높인다.

### 기대 효과

- [x] 개발 시작 속도 개선 (task 생성 즉시 문서 작업 가능, git 생성 비용 제거)
- [x] 디스크 사용량 증가율 완화
- [x] 워크플로우 운영 단순화 (기본 경량, 필요 시 opt-in)
- [x] clean/정리 누락에 의한 운영 리스크 감소

---

## 2. 현재 상태 (As-Is)

### 문제 구조

```
기본: sduck start -> worktree 생성(기본값)
결과: 문서 작성 단계(PENDING_SPEC_APPROVAL)에서도 git 리소스 선점
```

### 측정 지표 (개선 전)

| 지표                                | 현재 값   | 목표 값              |
| ----------------------------------- | --------- | -------------------- |
| task 시작 시 git worktree 생성 여부 | 기본 생성 | 기본 미생성          |
| `.sduck-worktrees` 누적 용량(샘플)  | 약 121M   | 유의미한 증가율 감소 |
| `.sduck/sduck-workspace` 용량(샘플) | 약 220K   | 유사 수준 유지       |
| 문서 단계에서 git 의존성            | 높음      | 낮음                 |

---

## 3. 목표 상태 (To-Be)

### 개선된 플로우

```
기본: sduck start -> --no-git 동작(경량)
선택: sduck start ... --with-git (기존 방식 opt-in)
```

### 원칙

- 기본값은 경량 경로를 제공하고, 무거운 동작은 명시적 옵션으로만 수행한다.
- 기존 사용자 습관을 깨는 변경이므로 CLI 도움말/메시지/테스트를 함께 갱신한다.
- SDD 승인 규칙과 상태 전이는 기존 규약 그대로 유지한다.

---

## 4. 리팩토링 범위

### 변경 대상 파일

```
target_paths:
  - src/commands/start.ts
  - src/core/start.ts
  - src/core/agent-context.ts
  - src/core/clean.ts
  - src/core/implement.ts
  - tests/unit/start*.test.ts
  - tests/unit/agent-context.test.ts
  - tests/e2e/start.test.ts
  - tests/e2e/* (worktree 기본 동작 의존 케이스)
  - README.md
  - CLAUDE.md (필요 시 규칙 문구 정합화)
```

### 변경하지 않는 범위

```
blocked_paths:
  - src/core/spec-approve.ts
  - src/core/plan-approve.ts
  - src/core/review-ready.ts
  - src/core/done.ts
```

### 인터페이스 불변 확인

- [x] 핵심 상태 전이 순서 유지
- [x] 승인 게이트(spec 승인/plan 승인) 정책 유지
- [ ] `start` 옵션 호환성 유지 및 마이그레이션 메시지 제공

---

## 5. 테스트 전략

### 기존 테스트 현황

- 작업 전 기준: unit 통과, e2e 일부 실패(최근 reopen/review-ready/done 변경 영향)
- 본 작업 검증에서는 `start` 기본 동작 변경에 직접 연관된 테스트를 우선 복구/보강한다.

### 리팩토링 중 테스트 전략

- [x] 단위 테스트로 옵션 해석(`--no-git` 기본, `--with-git` opt-in)을 검증
- [x] e2e 테스트로 실제 파일 생성/메타(`branch`, `worktree_path`) 결과를 검증
- [x] clean/implement와의 연동(기본 no-git task의 정상 동작) 회귀 확인

### 보완 테스트

- [ ] `start --with-git`에서만 worktree 생성되는 케이스 추가
- [ ] 기본 start 후 clean 실행 시 "no git resources" 경로 검증

---

## 6. 단계별 분리 계획

| 단계 | 작업 내용                                            | 검증 방법                           |
| ---- | ---------------------------------------------------- | ----------------------------------- |
| 1    | CLI 옵션/기본값 전환(`--with-git` 도입, 기본 no-git) | unit: start command parser          |
| 2    | core start/agent-context 정합화 및 메시지 정리       | unit: start, agent-context          |
| 3    | e2e/문서 업데이트 및 회귀 점검                       | test:e2e (관련 케이스), README 확인 |

---

## 7. 영향 범위 분석

| 모듈                | 영향 내용                             | 대응 방안                      |
| ------------------- | ------------------------------------- | ------------------------------ |
| `start` command     | 기본 동작 변경으로 사용자 기대치 변화 | 도움말/출력에 기본값 변화 명시 |
| `clean` workflow    | no-git task 비율 증가                 | 기존 no-git 분기 재검증        |
| `implement` context | worktree 경로 null 빈도 증가          | null 처리 경로 검증            |
| e2e fixtures        | 기존 기본 worktree 가정 테스트 영향   | 테스트 기대치 업데이트         |

### 회귀 테스트 필요 영역

- [ ] `start`, `implement`, `clean`, `agent-context` 연계 검증
- [ ] `--no-git` 명시 사용 테스트와 기본 동작 충돌 여부 검증

---

## 8. 롤백 계획

- 롤백 방법: `start` 기본값/옵션 파서 변경 커밋만 되돌려 즉시 복구
- 롤백 기준: 기존 자동 worktree 의존 사용자 흐름이 치명적으로 깨질 경우

---

## 9. 완료 정의 (Definition of Done)

- [ ] `sduck start` 기본 실행에서 worktree가 생성되지 않는다
- [ ] `sduck start ... --with-git`에서만 worktree가 생성된다
- [ ] 관련 unit/e2e 테스트가 갱신되어 통과한다
- [ ] README/도움말에 새 기본 동작이 반영된다
- [ ] clean/implement no-git 경로가 정상 동작한다

---

## 10. Spec 자체 평가 (spec.yml 기준)

| 항목                | 점수(1-5) | 근거                                                                               |
| ------------------- | --------- | ---------------------------------------------------------------------------------- |
| problem clarity     | 5         | 속도 저하 원인을 worktree 기본 생성 비용으로 명확히 정의                           |
| scope definition    | 4         | target/blocked 경계를 명시했으나 세부 파일은 구현 중 미세 조정 가능                |
| completion criteria | 5         | CLI 동작/옵션/테스트/문서 기준으로 검증 가능                                       |
| feasibility         | 5         | 기존 `--no-git` 경로가 이미 존재해 기본값 전환 중심으로 실현 가능                  |
| risk coverage       | 4         | clean/implement/e2e 영향 범위를 반영, 사용자 마이그레이션 리스크는 plan에서 상세화 |
| testability         | 5         | unit/e2e 구체 검증 포인트 제시                                                     |

총평: 4.7/5, 구현 가능성과 검증 가능성이 높은 리팩토링 스펙.
