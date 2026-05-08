# [refactor] architecture deepening

> **작업 타입:** `refactor` (Refactor)
> **작성자:** taehee
> **작성일:** 2026-05-07
> **연관 티켓:** -

---

## ⚠️ 리팩토링 불변 조건

> **이 작업은 외부 동작을 변경하지 않는다.**
> SDD 명령의 stdout/stderr/exitCode, 파일 산출물, 상태 전이 의미, worktree 결과는 유지한다.
> 코드 작성은 spec 승인과 plan 승인 이후에만 진행한다.

---

## 1. 배경 및 목적

### 리팩토링이 필요한 이유

현재 SDD workflow Implementation은 여러 Shallow Module에 규칙이 흩어져 있다. 같은 규칙을 이해하거나 변경하려면 여러 파일을 함께 열어야 하며, 이는 Locality, Leverage, testability, AI-navigability를 낮춘다.

초기 explorer scan과 oracle review에서 다음 5개 Deepening opportunity가 유효한 것으로 확인되었다.

1. task lifecycle Module deepening
2. `meta.yml` ownership Module deepening
3. target-resolution Module deepening
4. CLI command runner Module deepening
5. git/worktree resource Module deepening

현재 Shallow 증상은 다음과 같다.

- status transition, approval timestamp, step invariant, completed_at/updated_at 처리가 `start`, `spec-approve`, `plan-approve`, `step`, `review-ready`, `done`, `reopen`, `abandon` 등에 분산되어 있다.
- `meta.yml` parse/render/update가 regex partial parsing과 string replacement로 여러 파일에 반복된다.
- `[target]` id/slug/current work 해석, ambiguity handling, status filtering이 명령별로 반복된다.
- CLI command wrapper에서 project root resolution, stdout/stderr 출력, exitCode 설정, try/catch 패턴이 반복된다.
- git/worktree branch naming, base branch detection, worktree path planning, cleanup 판단, merged/unmerged branch 처리, `--no-git` null resource 처리가 여러 파일에 분산되어 있다.

### 기대 효과

- [x] Deep Module을 통해 Locality 향상
- [x] 작은 Interface와 큰 Implementation으로 Depth 향상
- [x] 규칙 변경 지점을 줄여 Leverage 향상
- [x] meta/lifecycle/target/worktree 규칙의 단위 테스트 가능성 향상
- [x] AI가 “이 규칙은 어디에 있는가?”를 한 Module에서 찾을 수 있도록 AI-navigability 향상
- [x] 기존 명령 동작 유지

---

## 2. 현재 상태 (As-Is)

### 문제 코드 / 구조

```text
src/core/start.ts
  - workspace 생성, initial meta render, git worktree 생성, state update가 한 Implementation에 혼재

src/core/workspace.ts
  - meta.yml 일부 field를 regex로 parse

src/core/spec-approve.ts
src/core/plan-approve.ts
src/core/step.ts
src/core/review-ready.ts
src/core/done.ts
src/core/reopen.ts
src/core/abandon.ts
  - status guard, approval/step mutation, timestamp update, meta.yml string replacement 반복

src/core/use.ts
src/core/clean.ts
src/core/implement.ts
  - id/slug/current target 해석, ambiguity handling, archive/workspace lookup 분산

src/core/git.ts
src/core/project-paths.ts
  - git Adapter는 thin하지만 worktree resource 정책은 start/clean/implement/agent-context에 분산

src/commands/*.ts
src/commands/v2/index.ts
src/cli.ts
  - command runner 패턴 반복
  - src/cli.ts는 현재 v2 명령만 노출하므로 legacy SDD command wrapper reachability는 plan에서 먼저 판단 필요

tests/unit/*
tests/e2e/*
tests/helpers/*
  - 현재 coverage는 v2 중심이며 SDD lifecycle/meta/target/worktree regression coverage gap 존재
```

### deletion test 관점의 Shallow Module 확인

Deep Module이 생기면 다음 중복을 제거할 수 있어야 한다.

- `meta.yml` regex parse/update helper와 string replacement
- 명령별 status guard와 transition error branch
- 명령별 approval/step/timestamp mutation
- 명령별 `[target]` id/slug/current fallback/ambiguity code
- worktree branch/path/cleanup policy의 command-local code
- command wrapper별 try/catch/result printing/table rendering 반복

### 측정 지표 (개선 전)

| 지표                           | 현재 값                                    | 목표 값                                            |
| ------------------------------ | ------------------------------------------ | -------------------------------------------------- |
| lifecycle rule Locality        | 여러 core Module에 분산                    | `task-lifecycle` 중심                              |
| `meta.yml` ownership Locality  | parse/render/update가 여러 Module에 분산   | `task-meta` 중심                                   |
| target-resolution Locality     | 명령별 중복                                | `task-target` 중심                                 |
| git/worktree resource Locality | start/clean/implement/agent-context에 분산 | `git-resource` 중심                                |
| command runner Locality        | command wrapper별 반복                     | conditional `commands/runner` 중심                 |
| regression coverage            | v2 중심, SDD coverage gap 존재             | SDD lifecycle/meta/target/worktree regression 보강 |

---

## 3. 목표 상태 (To-Be)

### 개선된 구조

```text
src/core/task-meta.ts
  - meta.yml parse/read/render/write/update ownership Module
  - lifecycle field round-trip 가능한 Interface 제공

src/core/task-lifecycle.ts
  - status transition invariant ownership Module
  - approval timestamp, step invariant, completed_at, updated_at 정책 집중
  - transition 후 agent-context.json refresh 정책 명시

src/core/task-target.ts
  - [target] semantics ownership Module
  - explicit target/current work fallback/status filtering/ambiguity handling 집중

src/core/git-resource.ts
  - git/worktree resource ownership Module
  - branch naming, base branch detection, worktree path planning, --no-git null resource, cleanup policy 집중

src/commands/runner.ts
  - project root resolution, stdout/stderr 출력, exitCode 설정, command wrapper 호출 정책 집중
  - 단, legacy SDD command wrapper reachability 판단 이후 적용 여부 결정
```

### 적용할 Architecture 원칙

- [x] Module: 각 Deepening 대상은 이름만 보고 ownership을 알 수 있어야 한다.
- [x] Interface: 호출자가 알아야 하는 규칙은 작고 안정적인 Interface에 모은다.
- [x] Implementation: 복잡한 parsing, validation, mutation, resource handling은 각 Module 내부 Implementation에 숨긴다.
- [x] Depth: Interface보다 Implementation이 충분히 깊어야 하며, 단순 pass-through Module을 만들지 않는다.
- [x] Deep vs Shallow: 단순 wrapper나 파일 이동이 아니라 규칙과 책임의 Locality를 개선한다.
- [x] Seam: 이미 두 곳 이상에 반복된 규칙이 있는 곳에 우선 Seam을 만든다.
- [x] Adapter: git process execution처럼 외부 효과 호출은 thin Adapter로 유지한다.
- [x] Leverage: 한 규칙 변경이 한 primary Module 수정으로 끝나야 한다.
- [x] Locality: meta/lifecycle/target/worktree/runner 질문의 답이 한 obvious Module에 있어야 한다.

### Seam 원칙

- `Task Meta Interface`는 먼저 도입할 real Seam이다. 이미 여러 Implementation이 regex/string replacement로 분산되어 있다.
- `Task Lifecycle Module`도 real Seam이다. status transition과 timestamp/step invariant가 여러 명령에 반복된다.
- `Target Resolution Module`은 id/slug/current/ambiguity/status filtering 반복을 모으는 real Seam이다.
- `Git/Worktree Resource Module`은 broad generic Git Interface가 아니라 worktree resource 정책을 모으는 Deep Module이어야 한다.
- `Command Runner Module`은 `src/cli.ts` v2-only caveat 때문에 conditional이다. legacy SDD command wrapper가 reachable하거나 유지 대상임이 plan에서 확인될 때만 Deepening한다.
- “One Adapter = hypothetical Seam. Two Adapters = real Seam.” 원칙을 위반하지 않는다.

---

## 4. 리팩토링 범위

### 변경 대상 파일 후보

```yaml
target_paths:
  - src/core/task-meta.ts
  - src/core/task-lifecycle.ts
  - src/core/task-target.ts
  - src/core/git-resource.ts
  - src/core/workspace.ts
  - src/core/start.ts
  - src/core/spec-approve.ts
  - src/core/plan-approve.ts
  - src/core/step.ts
  - src/core/review-ready.ts
  - src/core/done.ts
  - src/core/reopen.ts
  - src/core/abandon.ts
  - src/core/use.ts
  - src/core/clean.ts
  - src/core/implement.ts
  - src/core/agent-context.ts
  - src/core/git.ts
  - src/core/project-paths.ts
  - src/commands/runner.ts
  - src/commands/*.ts
  - src/commands/v2/index.ts
  - src/cli.ts
  - tests/unit/*.test.ts
  - tests/e2e/*.test.ts
  - tests/helpers/run-cli.ts
  - tests/helpers/temp-workspace.ts
```

### 변경하지 않는 범위

```yaml
blocked_scope:
  - 새로운 사용자 기능 추가
  - SDD workflow 상태 순서 변경
  - 기존 명령의 stdout/stderr/exitCode 의미 변경
  - 기존 workspace/archive/worktree 디렉토리 layout 변경
  - 기존 meta.yml field 이름의 임의 변경
  - v2 command behavior 변경
  - legacy SDD command wrapper reachability를 plan 없이 변경
```

### Interface 불변 확인

- [x] 외부 명령 동작 의미 유지
- [x] `sduck start`, `sduck spec approve`, `sduck plan approve`, `sduck step done`, `sduck review ready`, `sduck done`, `sduck reopen`, `sduck use`, `sduck clean`, `sduck implement`의 기존 semantics 유지
- [x] `[target]` id/slug/current work 해석 의미 유지 또는 명시적 regression으로 고정
- [x] `--no-git` flow 유지
- [x] agent-context.json refresh 의미 유지
- [x] v2 command behavior 유지

---

## 5. 테스트 전략

> 리팩토링의 안전성은 regression tests가 보장한다. 기존 behavior가 통과하는 것이 완료 기준이다.

### 기존 테스트 현황

- 현재 tests/unit과 tests/e2e는 v2 중심이다.
- legacy SDD workflow의 lifecycle/meta/target/worktree coverage gap이 있다.
- 작업 시작 전 baseline 검증 명령은 plan에서 확정한다.

### 리팩토링 중 테스트 전략

- [x] 구현 전 regression tests로 현재 Interface를 고정한다.
- [x] `task-meta`는 parse/render round-trip과 mutation invariant를 단위 테스트한다.
- [x] `task-lifecycle`은 transition matrix와 invalid transition을 단위 테스트한다.
- [x] `task-target`은 id/slug/current fallback/status filtering/ambiguity를 단위 테스트한다.
- [x] `git-resource`는 fake Git Adapter로 create/describe/cleanup 정책을 단위 테스트한다.
- [x] command behavior는 e2e regression으로 검증한다.
- [x] 테스트 파일 수정은 가능하면 fixer에게 bounded implementation으로 맡긴다.

### 보완 테스트 대상

- `sduck start`
- `sduck spec approve`
- `sduck plan approve`
- `sduck step done`
- `sduck review ready`
- `sduck done`
- `sduck reopen`
- `sduck use`
- `sduck clean`
- `[target]` id/slug/current work 해석
- `--no-git` flow
- agent-context.json refresh
- meta.yml lifecycle field round-trip
- merged/unmerged branch cleanup policy

---

## 6. 단계별 roadmap

> 이 섹션은 spec-level roadmap이다. plan.md에서는 `## Step N. 제목` 형식으로 상세 구현 단위를 별도 작성한다.

| Phase | 작업 내용                                                     | 검증 방향                                      |
| ----- | ------------------------------------------------------------- | ---------------------------------------------- |
| 0     | legacy SDD command wrapper reachability와 v2-only caveat 확인 | plan에서 in-scope/conditional 결정             |
| 1     | regression tests로 현재 Interface 고정                        | unit/e2e baseline                              |
| 2     | `meta.yml` ownership Module Deepening                         | meta round-trip/mutation tests                 |
| 3     | task lifecycle Module Deepening                               | transition matrix/agent-context refresh tests  |
| 4     | target-resolution Module Deepening                            | target ambiguity/current fallback tests        |
| 5     | git/worktree resource Module Deepening                        | fake Git Adapter/resource cleanup tests        |
| 6     | CLI command runner Module Deepening                           | conditional; runner tests와 unchanged behavior |
| 7     | full validation과 oracle review                               | lint/typecheck/test/build                      |

### 권장 순서

Oracle review 기준으로 `Task Meta Interface`를 첫 Seam으로 만든다. 그 후 lifecycle, target-resolution, git/worktree resource 순서로 진행한다. CLI command runner는 `src/cli.ts` v2-only caveat를 plan에서 판단한 뒤 마지막에 수행하거나 defer한다.

---

## 7. 영향 범위 분석

### 관련 Module 목록

| Module                       | 영향 내용                      | 대응 방안                                                   |
| ---------------------------- | ------------------------------ | ----------------------------------------------------------- |
| `src/core/task-meta.ts`      | 신규 Deep Module               | parse/read/render/write/update ownership 집중               |
| `src/core/task-lifecycle.ts` | 신규 Deep Module               | status transition, approval, step, timestamp invariant 집중 |
| `src/core/task-target.ts`    | 신규 Deep Module               | `[target]` resolution semantics 집중                        |
| `src/core/git-resource.ts`   | 신규 Deep Module               | worktree resource policy 집중                               |
| `src/commands/runner.ts`     | 신규 conditional Module        | command runner 반복 제거 여부를 plan에서 결정               |
| existing core Modules        | Shallow code 제거 및 Adapter화 | 기존 behavior regression으로 고정                           |
| tests                        | coverage gap 보강              | fixer 분할 구현과 full validation                           |

### 회귀 테스트 필요 영역

- [x] full SDD lifecycle: start → spec approve → plan approve → step done → review ready → done
- [x] reopen: REVIEW_READY → IN_PROGRESS, DONE → reset cycle behavior
- [x] no direct IN_PROGRESS → DONE
- [x] current work state update/clear semantics
- [x] target id/slug/current ambiguity semantics
- [x] archive-inclusive clean target lookup
- [x] `--no-git` null resource semantics
- [x] worktree cleanup merged/unmerged/force policy
- [x] agent-context refresh after lifecycle transition
- [x] v2 command behavior unchanged

---

## 8. 롤백 계획

- 롤백 방법: Git 작업 단위 되돌리기 또는 task worktree 폐기
- 롤백 기준: regression failure, typecheck failure, lint failure, build failure, command behavior change 발견
- Phase별 rollback 가능성을 유지하기 위해 plan은 작은 Step으로 작성한다.

---

## 9. 완료 정의 (Definition of Done)

- [x] spec과 plan이 사용자 명시 승인 이후에만 Implementation 진행됨
- [x] 모든 plan Step 완료 후 `sduck step done <N>` 기록 완료
- [x] `Task Meta Interface`가 `meta.yml` shape/read/write/update ownership을 가진다
- [x] `Task Lifecycle Module`이 status transition invariant와 timestamp/step/approval 정책을 가진다
- [x] `Target Resolution Module`이 `[target]` semantics와 ambiguity handling을 가진다
- [x] `Git/Worktree Resource Module`이 worktree create/describe/cleanup 정책을 가진다
- [x] `Command Runner Module`은 reachability 판단에 따라 적용 또는 명시적으로 defer된다
- [x] 새 Module이 단순 pass-through Shallow Module이 아니라 Deep Module임을 oracle review로 확인한다
- [x] Interface가 Implementation보다 복잡해지지 않았음을 확인한다
- [x] hypothetical Seam을 만들지 않았음을 확인한다
- [x] Locality와 Leverage 개선을 deletion test로 확인한다
- [x] 기존 command behavior가 깨지지 않았음을 regression으로 확인한다
- [x] 최종 검증 명령 통과: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`
- [x] task eval 수행 후 `sduck review ready` 전환

---

## 10. 참고 자료

- Explorer architecture scan: five candidates valid; coverage gap and `src/cli.ts` v2-only caveat 확인
- Oracle review: phased roadmap, `Task Meta Interface` first, CLI runner last/conditional 권장
