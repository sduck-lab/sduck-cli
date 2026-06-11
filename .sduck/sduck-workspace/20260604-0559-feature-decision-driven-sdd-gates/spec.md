# [feature] decision driven sdd gates

> **작업 타입:** `feature` (Standard Feature)
> **작성자:** taehee
> **작성일:** 2026-06-04
> **연관 티켓:** -

---

## 1. 배경 및 목적

### 문제 / 요구사항

현재 저장소는 v2 `.decision` 워크플로우 중심으로 이동했지만, 구현 전 의사결정 게이트와 기억/검색/계획 저장 흐름이 충분히 강제되지 않는다.

현재 한계:

- `maybeMarkBriefReady()`가 실제 flow에 충분히 연결되어 있지 않다.
- `confirmBrief()`가 open question, decision 존재 여부, brief 품질, conflict 해결 여부를 강하게 검증하지 않는다.
- `trace`와 `close`가 `CONFIRMED` 상태 및 brief snapshot을 충분히 gate하지 않는다.
- `recall()`은 SQLite `LIKE` 검색 중심이다.
- context retrieval은 파일명/경로 keyword match 중심이다.
- implementation plan을 구조화해 저장하는 v2 테이블/모델이 없다.

목표는 legacy `.sduck` SDD 상태 머신에 새 단계를 억지로 붙이지 않고, `.decision` v2를 의사결정/그릴링/기억/검색의 source of truth로 삼는 것이다.

```text
작업 지시
→ 자동 context/retrieval
→ 자동 grilling / decision tree 생성
→ 사용자 답변
→ decision brief 생성
→ 사용자 confirm
→ implementation plan 생성/승인
→ 작업
→ trace/remember
→ 다음 작업에서 recall로 유사 의사결정 재사용
```

### 기대 효과

- non-trivial 작업은 decision brief confirm 전 구현/trace/close가 불가능해진다.
- trivial 작업은 fast path로 불필요한 grilling을 피할 수 있다.
- prior decision은 FTS 기반 recall/search로 검색되고, 자동 확정이 아닌 carried draft로 제안된다.
- conflict 가능성이 있는 prior decision은 blocking question 또는 conflict decision으로 승격된다.
- implementation plan과 trace가 `.decision` v2에 구조화되어 remember/recall의 근거가 된다.
- CLI는 LLM을 내장하지 않고 저장/검증/검색/게이트/상태 전이만 담당한다.

---

## 2. 기능 명세

### 사용자 스토리

```text
As a coding agent and CLI user,
I want .decision v2 to enforce decision gates, searchable prior decisions, and structured implementation plans,
So that non-trivial work is grounded in confirmed decisions and reusable memory without embedding LLM behavior in the CLI.
```

### 수용 기준 (Acceptance Criteria)

> 모든 항목이 충족되어야 이 작업이 완료(Done)로 간주된다.

- [x] AC1: `work` 생성 또는 draft 제출 흐름에서 non-trivial 작업의 decision gate required metadata가 저장된다.
- [x] AC2: 새 기능, 워크플로우 변경, 상태 머신 변경, 데이터 저장 구조 변경, 검색/인덱스/기억 시스템 변경, 테스트 전략 불명확, 기존 decision 충돌 가능성, 사용자 승인 흐름 변경은 gate required로 처리된다.
- [x] AC3: 오타 수정, 작은 문서 수정, 단순 버전 bump, 기존 패턴 그대로 따르는 1~2파일 수정은 gate skip/fast path가 가능하다.
- [x] AC4: open blocking question이 있으면 brief confirm이 실패한다.
- [x] AC5: confirmed/carryable decision이 1개도 없으면 brief confirm이 실패한다.
- [x] AC6: brief confirm은 scope, avoid scope, prior decision search 수행 여부, conflict 해결 여부, implementation direction, verification command 존재 여부를 검증한다.
- [x] AC7: non-trivial 작업은 `CONFIRMED` 전 `trace`와 `close`가 실패한다.
- [x] AC8: `trace`는 brief snapshot이 없으면 실패하고, confirmed brief snapshot이 있으면 implementation trace 생성이 가능하다.
- [x] AC9: SQLite FTS5 기반 search/recall 인덱스가 도입되어 tasks, decisions, questions, evidence, traces, brief snapshots, plans를 검색할 수 있다.
- [x] AC10: prior decision은 자동 확정되지 않고 carried decision draft 또는 retrieved prior decision 근거로 제안된다.
- [x] AC11: prior decision과 현재 작업이 충돌하면 conflict decision 또는 blocking question으로 승격된다.
- [x] AC12: v2에 structured implementation plan을 저장하는 `implementation_plans` 모델/테이블과 CLI UX가 추가된다.
- [x] AC13: draft plan은 decision confirm 전에도 생성 가능하지만, plan confirm과 구현/trace/close는 decision confirm 이후에만 가능하다.
- [x] AC14: `remember`는 plan, trace, decision graph 정보를 포함해 export한다.
- [x] AC15: 기존 v2 명령어는 유지하고 `gate`, `search <query...>`, `plan`, `plan confirm` 명령을 추가한다.
- [x] AC16: `tests/unit/v2-core.test.ts`, `tests/e2e/v2-cli.test.ts`에 gate/search/plan/trace/remember 회귀 테스트가 추가 또는 갱신된다.

### 기능 상세 설명

#### Source of truth

- `.decision` v2가 source of truth다.
- legacy `.sduck/spec.md`, `.sduck/plan.md`는 제품 기능의 source of truth가 아니며, 필요할 경우 `.decision`에서 export하는 compatibility artifact로만 취급한다.
- 이 구현 작업 자체는 저장소의 CLAUDE.md에 정의된 `.sduck` SDD 규칙을 따른다.

#### CLI와 에이전트 책임 분리

- CLI는 LLM을 내장하지 않는다.
- CLI 책임: 저장, 검증, 검색, gate, 상태 전이, remember/export.
- 에이전트 책임: code exploration, grilling question 생성, decision tree/DAG draft 생성, brief draft 생성, plan draft 생성.

#### v2 status 모델

기존 status를 최대한 유지한다.

```text
OPEN
  - 작업 생성됨
  - context 수집 중
  - grilling 진행 중
  - open question 있을 수 있음

BRIEF_READY
  - blocking question 없음
  - 최소 1개 이상의 decision 존재
  - confirm 가능

CONFIRMED
  - 사용자가 decision brief 승인
  - plan confirm / implementation / trace 가능

CLOSED
  - 작업 완료

ABANDONED
  - 중단
```

상태를 많이 늘리지 않고 task metadata/gate 정보로 세부 상태를 표현한다.

#### Decision gate policy

Gate required 조건:

- 새 기능
- 워크플로우 변경
- 상태 머신 변경
- 데이터 저장 구조 변경
- 검색/인덱스/기억 시스템 변경
- 테스트 전략이 불명확한 작업
- 기존 decision과 충돌 가능성이 있는 작업
- 사용자 경험/승인 흐름이 바뀌는 작업

Gate skip 가능 조건:

- 오타 수정
- 작은 문서 수정
- 단순 버전 bump
- 기존 패턴 그대로 따르는 1~2파일 수정

Gate required 정책:

```text
if decision_gate_required:
  - open blocking questions 있으면 confirm 불가
  - confirmed/carryable decision 없으면 confirm 불가
  - brief snapshot 없으면 trace 불가
  - CONFIRMED 전 close 불가
```

#### Decision tree / question model

UI와 문서는 tree처럼 보여주되 내부 모델은 DAG로 본다. 질문은 다음 개념을 지원해야 한다.

- `parent_question_id`
- `depends_on_json`
- `branch_key`
- `category`
- `blocking`
- `status`: `open | answered | skipped | superseded`
- `grade`: `blocking | recommended | assumed | resolved_by_memory | resolved_by_code`

사용자에게 묻기 전에 다음 순서로 해소를 시도하는 workflow를 지원한다.

1. 코드베이스에서 답 찾기
2. prior decision에서 답 찾기
3. 그래도 불명확한 blocking question만 질문

#### 사용자 승인 단위

- 개별 질문은 기존 `ask`/`answer` 흐름으로 수집한다.
- 최종 승인은 `brief confirm` 전체 단위로 한다.
- 과거 decision은 자동 확정하지 않고 carried decision draft로 제안하며, 최종 confirm에서 사용자가 승인한다.

#### Brief contract

brief는 구현 전 계약서 역할을 한다. 필수 포함:

- Task
- Confirmed Decisions
- Open Questions
- Assumptions
- Retrieved Prior Decisions
- Scope
- Avoid Scope
- Implementation Direction
- Risks
- Verification Commands

Confirm quality gate:

- blocking question 0개
- confirmed/carryable decision 1개 이상
- scope 명시
- avoid scope 명시
- prior decision 검색 수행됨
- conflict 없음 또는 해결됨
- implementation direction 있음
- verification command 있음

#### Search / recall / retrieval

1차 구현은 SQLite FTS5를 사용한다. embedding/vector search는 제외한다.

검색 대상:

- `tasks.description`
- `decisions.title`, `decisions.summary`, `decisions.rationale`
- `questions.text`
- `evidence.summary`
- `implementation_traces.summary`, `implementation_traces.files_changed_json`
- `brief_snapshots.rendered_markdown`
- `implementation_plans.summary`, `implementation_plans.steps_json`, `implementation_plans.target_files_json`, `implementation_plans.verification_commands_json`

자동 context retrieval은 3단계로 개선한다.

1. Path match
2. Content search
3. Memory search via FTS

#### Implementation plan

v2에 implementation plan을 구조화해 저장한다.

권장 테이블: `implementation_plans`

필드 예시:

```text
id
task_id
status: draft | confirmed | executed | superseded
summary
steps_json
target_files_json
verification_commands_json
decision_ids_json
created_at
updated_at
```

정책:

- decision confirm 전 draft plan 생성은 가능하다.
- decision confirm 전 plan confirm은 불가능하다.
- non-trivial 작업은 최소한 decision brief confirm 전 trace/close가 불가능하다.

#### Implementation trace

`implementation_traces`를 강화한다.

trace에 저장할 내용:

- changed files
- decision_to_code_map
- completed plan steps
- verification commands run
- test results summary
- unresolved follow-ups

---

## 3. 기술 설계

### 변경 대상 컴포넌트

| 레이어            | 파일 / 모듈                                                | 변경 내용 요약                                                                 |
| ----------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| CLI entry         | `src/cli.ts`                                               | `gate`, `search`, `plan`, `plan confirm` 명령 추가                             |
| Command wrapper   | `src/commands/v2/index.ts`                                 | 새 command runner export 및 result 패턴 유지                                   |
| Store/schema      | `src/core/v2/store.ts`                                     | `implementation_plans`, FTS5 테이블/trigger/index, gate/question metadata 추가 |
| Task/gate         | `src/core/v2/task.ts`, 신규 가능 `src/core/v2/gate.ts`     | gate required/skip 판정, gate state 계산, transition 조건 연결                 |
| Context retrieval | `src/core/v2/context.ts`                                   | path match + content search + memory search 단계화                             |
| Draft submit      | `src/core/v2/draft.ts`                                     | decisions/questions/brief/plan/retrieved prior/conflict draft 저장             |
| Question          | `src/core/v2/question.ts`                                  | question category/grade/status/parent/dependency 개념 지원                     |
| Brief             | `src/core/v2/brief.ts`                                     | 필수 섹션 및 quality gate 검증 강화                                            |
| Status            | `src/core/v2/status.ts`                                    | gate metadata 포함 출력/JSON 확장                                              |
| Trace             | `src/core/v2/trace.ts`                                     | CONFIRMED/brief snapshot gate 및 plan/verification mapping 강화                |
| Remember          | `src/core/v2/remember.ts`                                  | plan + trace + graph export 강화                                               |
| Recall/Search     | `src/core/v2/recall.ts`, 신규 가능 `src/core/v2/search.ts` | SQLite FTS5 기반 recall/search 구현                                            |
| Plan              | 신규 가능 `src/core/v2/plan.ts`                            | implementation plan 저장/조회/confirm                                          |
| Render            | `src/ui/v2/render.ts`                                      | gate, plan, enhanced brief/search/recall 출력 렌더링                           |
| Types             | `src/types/index.ts`                                       | gate, question grade/status, plan, enhanced trace 타입 추가                    |
| Unit tests        | `tests/unit/v2-core.test.ts`                               | core gate/search/plan/trace/remember 테스트 추가                               |
| E2E tests         | `tests/e2e/v2-cli.test.ts`                                 | CLI workflow 회귀 테스트 추가                                                  |

### CLI 명령 계약

```text
sduck gate [--json]
  현재 task의 gate_required, blocking_questions, decisions_count,
  prior_search_performed, conflicts, brief_snapshot, can_confirm,
  can_trace, can_close 상태를 표시한다.

sduck search <query...> [--json]
  FTS5 기반으로 .decision memory 전체를 검색한다.

sduck plan [--json]
  현재 task의 최신 implementation plan을 표시한다.
  draft가 없으면 plan draft가 없다는 상태를 출력한다.

sduck plan confirm
  현재 task의 draft implementation plan을 confirm한다.
  decision brief가 CONFIRMED가 아니면 실패한다.
```

### 데이터 모델 변경

구체 SQL은 plan 단계에서 현재 `src/core/v2/store.ts` 구조에 맞춰 확정한다. 개념적으로 다음 변경이 필요하다.

```sql
CREATE TABLE implementation_plans (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  status TEXT NOT NULL,
  summary TEXT NOT NULL,
  steps_json TEXT NOT NULL,
  target_files_json TEXT NOT NULL,
  verification_commands_json TEXT NOT NULL,
  decision_ids_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

질문 모델은 기존 `questions` 테이블 확장 또는 JSON metadata로 표현할 수 있다.

필요 개념:

- `parent_question_id`
- `depends_on_json`
- `branch_key`
- `category`
- `grade`
- `blocking`
- `status`

Task gate metadata는 기존 `tasks` 테이블 확장 또는 metadata JSON으로 표현할 수 있다.

필요 개념:

- `decision_gate_required`
- `gate_skip_reason`
- `prior_search_performed_at`
- `retrieval_summary_json`
- `conflict_state`

### 시퀀스 다이어그램

```text
User/Agent → sduck work → .decision task OPEN + gate metadata
Agent → context/retrieval → path/content/memory evidence 저장
Agent → submit draft → questions/decisions/retrieved prior/conflicts/brief/plan draft 저장
User → ask/answer → blocking questions 해결
User → brief/confirm → quality gate 통과 시 CONFIRMED + brief snapshot
Agent → submit plan draft → implementation_plans(draft) 저장
User → plan confirm → implementation_plans(confirmed)
Agent → implementation → code changes
Agent/User → trace → implementation trace 저장
User → close → CLOSED
Next task → recall/search → prior decision 재사용 후보 표시
```

---

## 4. UI/UX 명세

CLI 전용 UX다.

| 명령                | 설명                                                           |
| ------------------- | -------------------------------------------------------------- |
| `status`            | 기존 status에 gate 요약을 추가할 수 있다.                      |
| `gate`              | confirm/trace/close 가능 여부와 실패 사유를 명시한다.          |
| `brief`             | 필수 brief 섹션을 안정적으로 렌더링한다.                       |
| `plan`              | structured implementation plan을 사람이 읽을 수 있게 출력한다. |
| `search` / `recall` | FTS 검색 결과와 출처를 표시한다.                               |

인터랙션:

- 실패하는 gate/confirm/trace/close 명령은 exitCode `1`을 반환하고 stderr에 구체 실패 사유를 출력한다.
- 정보 표시 명령은 가능한 경우 `--json`을 지원한다.
- 기존 명령어의 기본 의미를 깨지 않는다.
- non-trivial 작업에서 confirm 없이 trace/close를 시도하면 명확한 실패 메시지를 출력한다.

---

## 5. 테스트 계획

### 단위 테스트 (Unit Test)

| 대상 함수 / 모듈  | 테스트 케이스                       | 예상 결과                                     |
| ----------------- | ----------------------------------- | --------------------------------------------- |
| gate 판정         | non-trivial `work` 생성             | decision gate required 저장                   |
| gate 판정         | trivial 작업 생성/metadata          | gate skip 가능                                |
| brief confirm     | open blocking question 존재         | confirm 실패                                  |
| brief confirm     | decision 0개                        | confirm 실패                                  |
| brief confirm     | scope/avoid scope/verification 누락 | confirm 실패                                  |
| brief confirm     | conflict unresolved                 | confirm 실패                                  |
| trace gate        | unconfirmed non-trivial task        | trace 실패                                    |
| trace gate        | confirmed brief snapshot 존재       | trace 성공                                    |
| close gate        | CONFIRMED 전 close                  | close 실패                                    |
| FTS recall/search | prior decision 문구 검색            | FTS 결과 반환                                 |
| conflict 처리     | prior decision과 충돌 draft 제출    | blocking question 또는 conflict decision 생성 |
| plan 저장         | plan draft submit                   | `implementation_plans` draft 저장             |
| plan confirm      | decision CONFIRMED 전               | plan confirm 실패                             |
| remember          | plan + trace + graph export         | artifact에 관련 데이터 포함                   |

### 통합 / E2E 테스트

| 시나리오                 | 단계                                            | 예상 결과                 |
| ------------------------ | ----------------------------------------------- | ------------------------- |
| non-trivial gate         | `init` → `work` → `gate`                        | required gate 상태 표시   |
| blocking confirm failure | draft 제출 → open blocking question → `confirm` | 실패 및 사유 출력         |
| full confirm/trace flow  | draft+answer → `brief` → `confirm` → `trace`    | CONFIRMED 이후 trace 성공 |
| unconfirmed close block  | `work` → `close`                                | non-trivial이면 실패      |
| FTS recall               | 이전 task remember → 새 task recall/search      | prior decision 검색됨     |
| plan command             | plan draft submit → `plan` → `plan confirm`     | confirmed plan 상태 표시  |

### 검증 명령

```text
npm run typecheck
npm run test:unit
npm run test:e2e
npm run lint
```

Node 런타임은 `package.json`의 `node >=22.13` 요구사항을 충족해야 한다. 현재 기본 shell Node가 20이면 `node:sqlite` 때문에 CLI 실행이 실패하므로, 검증 시 Node 22.13+ 환경을 사용한다.

---

## 6. 영향 범위 분석

### 변경 파일 목록 (예상)

```text
target_paths:
  - src/cli.ts
  - src/commands/v2/index.ts
  - src/core/v2/store.ts
  - src/core/v2/task.ts
  - src/core/v2/context.ts
  - src/core/v2/draft.ts
  - src/core/v2/question.ts
  - src/core/v2/brief.ts
  - src/core/v2/status.ts
  - src/core/v2/trace.ts
  - src/core/v2/remember.ts
  - src/core/v2/recall.ts
  - src/core/v2/search.ts
  - src/core/v2/gate.ts
  - src/core/v2/plan.ts
  - src/ui/v2/render.ts
  - src/types/index.ts
  - tests/unit/v2-core.test.ts
  - tests/e2e/v2-cli.test.ts
```

### 사이드 이펙트 검토

- 영향 가능성 있는 모듈: v2 schema/init, draft submit parsing, brief rendering/confirm, trace/remember/recall output, status JSON.
- 회귀 테스트 필요 영역: 기존 v2 command compatibility, 기존 recall output, 기존 submit draft format, status JSON compatibility, SQLite schema migration/idempotency.

### 롤백 계획

- 새 테이블/FTS 인덱스 추가는 backward-compatible하게 설계한다.
- 기존 명령어 제거 없이 새 명령어를 추가한다.
- gate 강화가 기존 테스트를 깨면 테스트 fixture에서 trivial/gate skip metadata를 명시하거나 기존 흐름을 새 정책에 맞게 조정한다.
- FTS가 사용할 수 없는 SQLite 환경에서는 명확히 실패하거나 package engine 요구사항(Node 22.13+)에 맞춰 테스트를 guard한다.

---

## 7. 보안 / 성능 고려사항

- **인증·인가:** 로컬 CLI workspace 작업이므로 별도 인증·인가는 없다.
- **입력값 검증:** agent draft JSON/Markdown, plan steps JSON, verification commands JSON, target files JSON은 schema-level 검증이 필요하다.
- **성능:** FTS5 인덱스는 SQLite `LIKE`보다 검색 품질/성능을 개선해야 하며, trigger 또는 rebuild 전략은 idempotent해야 한다.
- **민감 데이터 처리:** remember/search 결과는 로컬 `.decision` artifact에 한정한다. CLI는 LLM 호출을 수행하지 않는다.
- **데이터 무결성:** confirm/trace/close gate는 status와 snapshot/plan/trace 데이터가 모순되지 않게 해야 한다.

---

## 8. 비기능 요구사항

| 항목          | 요구사항                                                             |
| ------------- | -------------------------------------------------------------------- |
| 호환성        | 기존 v2 명령어 의미와 기본 출력은 가능한 한 유지한다.                |
| 런타임        | Node `>=22.13`에서 동작한다.                                         |
| 테스트 가능성 | core 함수는 CLI wrapper와 분리되어 unit test 가능해야 한다.          |
| 결정 추적성   | decision → plan → code/trace 연결 정보를 remember artifact에 남긴다. |
| 확장성        | decision tree는 초기 최소 구현이어도 DAG 확장을 막지 않는다.         |

---

## 9. 의존성 및 선행 조건

- 이 작업 시작 전 완료되어야 하는 작업: 없음.
- 외부 서비스 / API 연동 필요 여부: 없음.
- 피처 플래그 사용 여부: 기본적으로 불필요.
- 현재 작업 상태는 `PENDING_SPEC_APPROVAL`이다.
- `agent-context.json` 기준 code 작업 경로는 `.sduck-worktrees/20260604-0559-feature-decision-driven-sdd-gates`이다.
- spec 승인 전에는 코드 작성 금지다.

---

## 10. 미결 사항 (Open Questions)

- [x] `work` 명령에서 trivial/non-trivial 판정은 description 기반 보수적 CLI heuristic을 기본으로 하고, agent draft의 optional gate metadata로 보정한다.
- [x] plan confirm은 decision confirm 이후에만 허용한다. trace/close는 non-trivial 작업에서 decision confirm과 brief snapshot을 요구하며, confirmed plan 자체는 trace의 절대 필수 조건으로 두지 않는다.

---

## 11. 참고 자료

- 사용자 제공 기획 결정 D001-D020
- `CLAUDE.md` sduck SDD workflow rules
- 현재 v2 관련 파일:
  - `src/cli.ts`
  - `src/commands/v2/index.ts`
  - `src/core/v2/store.ts`
  - `src/core/v2/task.ts`
  - `src/core/v2/context.ts`
  - `src/core/v2/draft.ts`
  - `src/core/v2/question.ts`
  - `src/core/v2/brief.ts`
  - `src/core/v2/status.ts`
  - `src/core/v2/trace.ts`
  - `src/core/v2/remember.ts`
  - `src/core/v2/recall.ts`
  - `src/ui/v2/render.ts`
  - `src/types/index.ts`
  - `tests/unit/v2-core.test.ts`
  - `tests/e2e/v2-cli.test.ts`

---

## 12. Spec 자체 평가

평가 기준: `.sduck/sduck-assets/eval/spec.yml`

| 기준                | 점수(1-5) | 근거                                                                                             |
| ------------------- | --------- | ------------------------------------------------------------------------------------------------ |
| problem_clarity     | 5         | 현재 한계와 목표 workflow가 명확히 정의됨                                                        |
| scope_definition    | 4         | 포함 범위가 상세하나 trivial 판정/plan confirm gate의 세부 정책은 plan 단계 결정으로 남김        |
| completion_criteria | 5         | AC1-AC16과 테스트 시나리오가 검증 가능하게 정의됨                                                |
| feasibility         | 4         | 현재 v2 파일 구조와 Node 22 요구사항 기준 실행 가능하나 FTS migration 세부는 구현 설계 필요      |
| risk_coverage       | 4         | status/gate/compat/schema/search 위험을 포함했으며 세부 migration 위험은 plan에서 더 구체화 필요 |
| testability         | 5         | unit/e2e 대상과 검증 명령이 명시됨                                                               |

총평: spec은 사용자 결정 D001-D020을 반영했으며, plan 단계에서 현재 코드 구조를 조사해 구체 구현 단위와 migration 전략을 확정할 수 있다.
