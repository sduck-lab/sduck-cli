# [feature] decision briefing v2

> **작업 타입:** `feature` (Standard Feature)  
> **작성자:** taehee  
> **작성일:** 2026-04-30  
> **연관 티켓:** -

---

## 1. 배경 및 목적

### 문제 / 요구사항

현재 sduck CLI는 spec/plan 문서와 승인 상태를 중심으로 한 SDD 워크플로우 도구다. v2에서는 기존 SDD 제품 코드를 버리고, coding agent가 구현 전에 사용자의 의사결정 방식과 프로젝트 맥락을 터미널에서 정렬할 수 있게 하는 **terminal-first decision briefing harness**로 새로 만든다.

사용자는 긴 spec/plan 문서를 직접 열어 수정하고 승인하는 UX보다, 터미널에서 agent와 대화하며 필요한 질문에 답하고 implementation brief를 확정하는 흐름을 원한다. 또한 구현 이후에는 어떤 결정이 어떤 코드 변경으로 반영되었는지 trace가 남아야 하며, 다음 작업에서 그 기록을 recall해 질문 수를 줄일 수 있어야 한다.

핵심 문제는 다음과 같다.

- 사용자가 직접 `spec.md`, `plan.md`, `decision.md`를 읽고 편집하는 문서 중심 UX를 피하고 싶다.
- agent가 어떤 가정을 하고 있는지, 무엇을 알고 무엇을 모르는지 터미널에서 드러나야 한다.
- 질문받은 결정(EXPLICIT)과 코드/문서/과거 기록에서 추론한 결정(INFERRED/CARRIED/CONFLICT/OPEN)을 구분해서 저장하고 보여줘야 한다.
- Graphify 같은 외부 구조화 도구가 없어도 동작해야 하지만, Graphify-style markdown/report/graph JSON artifact는 생성해야 한다.
- 기존 v1 SDD command와 `.sduck` 기반 workflow는 v2 제품 방향과 충돌하므로 제품 코드는 새로 만든다.

### 기대 효과

- 사용자는 파일을 직접 열지 않고 `sduck work`, `sduck context`, `sduck ask`, `sduck brief`, `sduck confirm` 흐름으로 implementation brief를 확정할 수 있다.
- agent는 `sduck context`가 제공하는 context pack과 grill-me protocol을 기반으로 질문/decision draft를 만들 수 있다.
- CLI는 agent가 만든 draft를 schema로 검증하고 SQLite source of truth에 저장한다.
- 구현 후 `sduck trace`와 `sduck remember`를 통해 decision-to-code mapping과 markdown/Graphify-style export가 남는다.
- 이후 작업에서 `sduck recall`로 과거 decision/trace를 검색할 수 있다.

---

## 2. 기능 명세

### 사용자 스토리

```text
As a developer using an AI coding agent,
I want to start work, inspect relevant context, answer one decision question at a time, confirm an implementation brief, and record implementation traces from the terminal,
So that the agent implements from an explicit shared understanding and future work can recall prior decisions.
```

### 수용 기준 (Acceptance Criteria)

> 모든 항목이 충족되어야 이 작업이 완료(Done)로 간주된다.

- [x] AC1: `sduck init`은 `.decision/` workspace, `db.sqlite`, `state.json`, export directories를 생성한다.
- [x] AC2: `sduck work "<작업 설명>"`은 task를 생성하고 current task로 설정하며 lightweight context index를 생성하고 concise context summary를 출력한다.
- [x] AC3: `sduck status`는 current task, persisted status, context/draft/question/trace/export derived indicators를 보여주며 `--json`을 지원한다.
- [x] AC4: `sduck context`는 agent가 사용할 full context pack을 출력하고 `--json`을 지원한다.
- [x] AC5: `sduck context add <path-or-glob>`은 지정한 파일/경로 후보를 context item/evidence로 추가한다.
- [x] AC6: `sduck submit --stdin`은 JSON draft와 Markdown fenced `json sduck-draft` block을 모두 파싱하고 schema validation 후 decisions/questions/evidence/scope를 저장한다.
- [x] AC7: `sduck ask`는 open question 하나만 interactive하게 표시하고 추천 답변, 근거, 선택지, 직접 입력을 제공하며 답변을 저장한다.
- [x] AC8: `sduck answer <question-id> --option <n>` 및 `--text "<답변>"`는 non-interactive로 답변을 저장한다.
- [x] AC9: 답변 저장 후 관련 EXPLICIT decision이 생성되거나 OPEN decision/question이 갱신된다.
- [x] AC10: `sduck brief`는 EXPLICIT, INFERRED, CARRIED, CONFLICT, OPEN 결정을 구분하고 evidence/source refs, expected scope, avoid scope를 렌더링하며 `--json`을 지원한다.
- [x] AC11: `sduck confirm`은 현재 implementation brief snapshot을 저장하고 task status를 `CONFIRMED`로 바꾼다.
- [x] AC12: `sduck trace [--base <ref>]`는 tracked changes와 untracked files를 함께 감지하고 confirmed decisions와 files changed의 mapping 초안을 저장하며 `--json`을 지원한다.
- [x] AC13: `sduck remember`는 task summary, decision markdown, implementation trace markdown, `DECISION_REPORT.md`, `decision-graph.json`을 생성한다.
- [x] AC14: `sduck recall "<검색어>"`는 SQLite LIKE 기반으로 과거 decision/implementation trace를 검색한다.
- [x] AC15: `sduck close`와 `sduck abandon`은 task status를 각각 `CLOSED`, `ABANDONED`로 전환하고 event log를 남긴다.
- [x] AC16: v1 SDD command/product code는 v2 command set으로 대체되고, 기존 `spec`, `plan`, `start`, `done` 중심 UX는 v2 CLI surface에서 제거된다.
- [x] AC17: unit/e2e test로 init/work/context/submit/ask/answer/brief/confirm/trace/remember/recall/close/abandon 핵심 흐름을 검증한다.

### 기능 상세 설명

#### 2.1 제품 프레이밍

v2는 guard/block/approval-first 도구가 아니다. 제품 전면에서는 다음 표현을 선호한다.

- implementation brief
- decision briefing
- context pack
- confirm / 이 브리프로 진행
- trace / remember / recall

피해야 할 중심 UX:

- spec.md를 직접 수정하세요
- plan.md를 읽고 승인하세요
- 승인 전 구현이 차단되었습니다
- Graphify HTML을 열어 확인하세요

#### 2.2 Agent-led grill-me 흐름

질문/decision draft 생성은 CLI가 단독으로 수행하지 않는다. v2의 기본 흐름은 다음과 같다.

```text
User → sduck work "작업 설명"
sduck → task 생성 + context index + context summary
Agent → sduck context 읽기 + 필요한 파일 추가 확인
Agent → grill-me 방식으로 질문/decision/evidence draft 생성
Agent → sduck submit --stdin 으로 draft 제출
sduck → validate/store/render/ask/brief/confirm/trace/export
```

CLI는 grill-me를 다음 방식으로 내재화한다.

- `sduck context` 출력에 grill-me protocol을 포함한다.
- draft schema에 question/recommendedAnswer/rationale/options/sourceRefs를 포함한다.
- `sduck ask`는 한 번에 하나의 질문만 표시한다.
- 답변받은 결정과 추론/상속/충돌/open 결정을 분리해서 보여준다.

#### 2.3 Command set

MVP command set은 다음이다.

```bash
sduck init

sduck work "<작업 설명>"
sduck status [--json]
sduck context [--json]
sduck context add <path-or-glob>

sduck submit --stdin

sduck ask
sduck answer <question-id> --option <n>
sduck answer <question-id> --text "<답변>"

sduck brief [--json]
sduck confirm

sduck trace [--base <ref>] [--json]

sduck remember
sduck recall "<검색어>"

sduck close
sduck abandon
```

#### 2.4 Draft input

`sduck submit --stdin`은 JSON과 Markdown을 모두 지원한다.

JSON draft shape:

```json
{
  "schemaVersion": "v2alpha1",
  "taskId": "TASK-20260430-decision-briefing-v2",
  "decisions": [],
  "questions": [],
  "evidence": [],
  "expectedScope": [],
  "avoidScope": []
}
```

Markdown draft는 fenced JSON block을 포함해야 한다.

````markdown
# Sduck Draft

```json sduck-draft
{
  "schemaVersion": "v2alpha1",
  "taskId": "TASK-20260430-decision-briefing-v2",
  "decisions": [],
  "questions": [],
  "evidence": [],
  "expectedScope": [],
  "avoidScope": []
}
```
````

#### 2.5 Persisted status and derived indicators

Persisted task status는 작게 유지한다.

```ts
type TaskStatus = 'OPEN' | 'BRIEF_READY' | 'CONFIRMED' | 'CLOSED' | 'ABANDONED';
```

다음 값은 status로 저장하지 않고 DB row/event log에서 파생한다.

- context indexed 여부
- draft submissions 수
- open/answered questions 수
- trace 존재 여부
- export/remember 완료 여부

#### 2.6 Graphify-style artifact

Graphify는 런타임 의존성으로 사용하지 않는다. Python/NetworkX/Graphify 설치 없이 sduck 자체가 다음 파일을 생성한다.

```text
.decision/exports/graphify/DECISION_REPORT.md
.decision/exports/graphify/decision-graph.json
```

기존에 다음 파일이 있으면 context/evidence input으로 읽을 수 있다.

```text
graphify-out/GRAPH_REPORT.md
graphify-out/graph.json
```

---

## 3. 기술 설계

### 변경 대상 컴포넌트

| 레이어           | 파일 / 모듈                                                                                | 변경 내용 요약                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| package metadata | `package.json`                                                                             | Node engine을 `>=22.13`으로 올리고 v1 asset packaging 의존성을 제거/조정한다. CLI bin `sduck`은 유지한다.         |
| CLI entrypoint   | `src/cli.ts`                                                                               | 기존 v1 command routing을 제거하고 v2 command set으로 교체한다.                                                   |
| command wrappers | `src/commands/*`                                                                           | init/work/status/context/submit/ask/answer/brief/confirm/trace/remember/recall/close/abandon wrappers를 구현한다. |
| core store       | `src/core/store.ts`                                                                        | `node:sqlite` 기반 DB open/schema/migration/query helpers를 구현한다.                                             |
| core workspace   | `src/core/workspace.ts`, `src/core/state.ts`                                               | `.decision/` path, `state.json`, current task 관리.                                                               |
| core domain      | `src/core/task.ts`, `src/core/decision.ts`, `src/core/question.ts`, `src/core/evidence.ts` | task/decision/question/evidence lifecycle 구현.                                                                   |
| core context     | `src/core/context.ts`, `src/core/discovery.ts`                                             | lightweight deterministic context index와 context add 구현.                                                       |
| core draft       | `src/core/draft.ts`                                                                        | JSON/Markdown draft parse/validate/store 구현.                                                                    |
| core brief       | `src/core/brief.ts`                                                                        | brief projection/render data/snapshot confirm 구현.                                                               |
| core trace       | `src/core/trace.ts`                                                                        | git diff/status 기반 filesChanged 감지 및 mapping 저장.                                                           |
| core export      | `src/core/export.ts`, `src/core/graph.ts`                                                  | markdown exports, `DECISION_REPORT.md`, `decision-graph.json` 생성.                                               |
| core recall      | `src/core/recall.ts`                                                                       | SQLite LIKE 기반 search 구현.                                                                                     |
| UI               | `src/ui/render.ts`, `src/ui/prompts.ts`                                                    | terminal rendering과 `@inquirer/prompts` interactive ask/confirm 구현.                                            |
| types            | `src/types/index.ts`                                                                       | domain types와 draft schema types 정의.                                                                           |
| tests            | `tests/unit/*`, `tests/e2e/*`                                                              | v1 tests 제거/대체, v2 tests 작성.                                                                                |

### API 명세 (해당 시)

외부 HTTP API는 없다. CLI와 import 가능한 core API가 public interface다.

예상 core API shape:

```ts
export type InitResult = { created: string[]; alreadyExisted: string[] };
export type WorkResult = { task: Task; contextSummary: ContextSummary };
export type SubmitResult = { decisions: number; questions: number; evidence: number };

export function initWorkspace(projectRoot: string): InitResult;
export function startWork(input: { projectRoot: string; description: string }): WorkResult;
export function getStatus(projectRoot: string): StatusView;
export function getContextPack(projectRoot: string): ContextPack;
export function submitDraft(input: { projectRoot: string; content: string }): SubmitResult;
export function buildBrief(projectRoot: string): BriefView;
export function confirmBrief(projectRoot: string): BriefSnapshot;
export function createTrace(input: { projectRoot: string; base?: string }): ImplementationTrace;
export function remember(projectRoot: string): ExportResult;
export function recall(input: { projectRoot: string; query: string }): RecallResult;
```

### 데이터 모델 변경

SQLite source of truth를 `.decision/db.sqlite`에 생성한다.

주요 테이블:

```text
tasks
decisions
questions
evidence
context_items
brief_snapshots
implementation_traces
events
```

주요 domain model:

```ts
type Task = {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'BRIEF_READY' | 'CONFIRMED' | 'CLOSED' | 'ABANDONED';
  createdAt: string;
  updatedAt: string;
};

type Decision = {
  id: string;
  taskId: string;
  title: string;
  kind: 'EXPLICIT' | 'INFERRED' | 'CARRIED' | 'CONFLICT' | 'OPEN';
  status: 'DRAFT' | 'CONFIRMED' | 'REJECTED' | 'SUPERSEDED';
  confidence: number;
  summary: string;
  rationale: string[];
  appliesTo: string[];
  avoids: string[];
  sourceRefs: string[];
  createdAt: string;
  updatedAt: string;
};

type Question = {
  id: string;
  taskId: string;
  decisionId?: string;
  text: string;
  recommendedAnswer: string;
  rationale: string[];
  options: string[];
  answered: boolean;
  answer?: string;
  createdAt: string;
};
```

Event examples:

```text
TASK_CREATED
CONTEXT_INDEXED
CONTEXT_ITEM_ADDED
DRAFT_SUBMITTED
QUESTION_ANSWERED
DECISION_CREATED
BRIEF_CONFIRMED
TRACE_CREATED
EXPORT_WRITTEN
TASK_CLOSED
TASK_ABANDONED
```

### 시퀀스 다이어그램

```text
User → sduck work "..."
     → create task
     → index context
     → print summary

Agent → sduck context
      → read context pack + grill-me protocol + schema
      → optionally sduck context add <path>
      → create draft

Agent → sduck submit --stdin
      → parse/validate draft
      → store decisions/questions/evidence

User → sduck ask / sduck answer
     → answer one question
     → store explicit decision/update question

User → sduck brief
     → render implementation brief

User → sduck confirm
     → freeze brief snapshot

Implementation happens outside sduck

User/Agent → sduck trace
           → detect files changed
           → save decision-to-code map

User/Agent → sduck remember
           → export markdown + decision graph
```

---

## 4. UI/UX 명세

### 화면 목록

CLI 도구이므로 별도 GUI 화면은 없다. 주요 terminal views는 다음이다.

| 화면명          | 명령               | 설명                                                                 |
| --------------- | ------------------ | -------------------------------------------------------------------- |
| Init result     | `sduck init`       | `.decision/` workspace 생성 결과와 next step 안내                    |
| Work summary    | `sduck work "..."` | task ID, context summary, next action 안내                           |
| Status          | `sduck status`     | current task와 derived indicators 표시                               |
| Context pack    | `sduck context`    | agent용 full context, evidence, grill-me protocol, draft schema 표시 |
| Question prompt | `sduck ask`        | 질문 1개, 추천 답변, 근거, 선택지, 직접 입력                         |
| Brief           | `sduck brief`      | decisions by kind, evidence, scope, avoid scope, unresolved items    |
| Confirm         | `sduck confirm`    | “이 브리프로 진행” 확정 prompt                                       |
| Trace           | `sduck trace`      | changed files와 decision-to-code mapping summary                     |
| Remember        | `sduck remember`   | 생성된 export 파일 목록                                              |
| Recall          | `sduck recall`     | 검색 결과                                                            |

### 디자인 레퍼런스

터미널-first UX이며, 복잡한 TUI는 MVP에서 제외한다.

### 인터랙션 정의

- 질문은 한 번에 하나만 표시한다.
- 질문마다 추천 답변과 근거를 표시한다.
- 선택지에는 추천안, 다른 옵션, 직접 입력이 포함될 수 있다.
- 제품 문구는 “승인”보다 “확정”, “이 브리프로 진행”을 선호한다.
- `--json` 출력은 agent/script가 안정적으로 파싱할 수 있어야 한다.

---

## 5. 테스트 계획

### 단위 테스트 (Unit Test)

| 대상 함수 / 모듈 | 테스트 케이스           | 예상 결과                                       |
| ---------------- | ----------------------- | ----------------------------------------------- |
| workspace init   | `.decision` 미존재      | DB/state/export directories 생성                |
| workspace init   | 이미 초기화됨           | idempotent하게 성공                             |
| store/schema     | fresh DB open           | 모든 테이블 생성                                |
| task             | work 생성               | task와 state current task 저장                  |
| context          | keyword/file discovery  | context_items/evidence 생성                     |
| context add      | 파일/글롭 입력          | context item 추가                               |
| draft parser     | JSON draft              | decisions/questions/evidence 파싱               |
| draft parser     | Markdown fenced block   | embedded JSON 추출                              |
| draft validation | invalid schema          | 명확한 error 반환                               |
| question         | answer by option        | question answered + explicit decision 생성/갱신 |
| brief            | mixed decision kinds    | kind별로 분리된 view 생성                       |
| confirm          | brief ready             | snapshot 저장 + status CONFIRMED                |
| trace            | git diff/status fixture | tracked/untracked files 감지                    |
| export           | remember                | markdown/report/graph JSON 생성                 |
| recall           | LIKE query              | 관련 decision/trace 반환                        |
| lifecycle        | close/abandon           | status/event 갱신                               |

### 통합 / E2E 테스트

| 시나리오            | 단계                                                              | 예상 결과                           |
| ------------------- | ----------------------------------------------------------------- | ----------------------------------- |
| basic briefing loop | init → work → submit JSON → ask/answer → brief → confirm          | brief snapshot CONFIRMED            |
| markdown draft loop | init → work → submit Markdown fenced draft → brief                | draft content 저장/렌더링           |
| context loop        | init → work → context → context add → context --json              | context pack에 추가 item 포함       |
| trace/export loop   | init → work/submit/confirm → 파일 변경 fixture → trace → remember | implementation trace와 exports 생성 |
| recall loop         | remember 이후 recall query                                        | matching decision/trace 출력        |
| lifecycle loop      | work → abandon / work → close                                     | status와 event 기록                 |

---

## 6. 영향 범위 분석

### 변경 파일 목록 (예상)

```yaml
target_paths:
  - package.json
  - src/cli.ts
  - src/commands/*.ts
  - src/core/*.ts
  - src/ui/*.ts
  - src/types/*.ts
  - tests/unit/*.test.ts
  - tests/e2e/*.test.ts
  - tests/helpers/*.ts
```

### 사이드 이펙트 검토

- 기존 v1 SDD CLI behavior는 제거/대체된다.
- `.sduck/` 기반 기존 workspace/assets는 v2 runtime source of truth가 아니다.
- `package.json`의 packaged files에서 v1 `.sduck/sduck-assets` 의존성이 제거/조정될 수 있다.
- Node engine이 `>=22.13`으로 올라가 Node 20 사용자는 v2를 실행할 수 없다.
- E2E 테스트 helper는 새 command set 기준으로 변경되어야 한다.

### 롤백 계획

- 변경은 feature branch에서 수행한다.
- 문제가 생기면 v2 branch 변경분을 revert하거나 이전 v1 branch로 되돌린다.
- `.decision/`은 새 runtime directory이므로 기존 `.sduck/` 사용자 데이터와 직접 충돌하지 않는다.

---

## 7. 보안 / 성능 고려사항

- **인증·인가:** 로컬 CLI 도구이므로 별도 인증/인가 없음.
- **입력값 검증:** `submit --stdin` draft schema를 엄격히 검증한다. Markdown fenced block이 없거나 JSON parse가 실패하면 저장하지 않는다.
- **경로 처리:** `context add`와 trace/export에서 project root 밖 경로 접근을 제한하거나 명확히 표시한다.
- **성능:** MVP discovery는 lightweight 파일명/폴더명/markdown/SQLite LIKE 검색으로 제한한다. full AST/vector/Graphify 실행은 제외한다.
- **민감 데이터 처리:** context index/export는 로컬 파일 내용을 summary/evidence로 저장할 수 있으므로 기본적으로 `.git`, `node_modules`, `dist`, `.decision/db.sqlite` 등은 제외한다.

---

## 8. 비기능 요구사항

| 항목   | 요구사항                                                                |
| ------ | ----------------------------------------------------------------------- |
| 설치   | Python/Graphify/NetworkX 없이 Node.js만으로 동작                        |
| 런타임 | Node.js `>=22.13`                                                       |
| 저장소 | `.decision/db.sqlite`와 `.decision/state.json`을 source of truth로 사용 |
| 출력   | human-readable terminal output과 agent-readable `--json` output 구분    |
| 테스트 | `npm run typecheck`, `npm run lint`, `npm run test` 통과                |
| 호환성 | CLI bin 이름 `sduck` 유지                                               |

---

## 9. 의존성 및 선행 조건

- 기존 TypeScript/Node/Commander/Vitest 설정은 재사용한다.
- SQLite driver는 외부 package를 추가하지 않고 `node:sqlite`를 사용한다.
- `@inquirer/prompts`는 기존 dependency를 재사용한다.
- Graphify는 설치/실행하지 않는다.

---

## 10. 미결 사항 (Open Questions)

- [x] v2 package version bump 정책은 별도 release 작업으로 분리하고, 이번 구현에서는 version 값을 유지한다.
- [x] 기존 README는 v2 usage 중심으로 갱신한다.

---

## 11. 참고 자료

- 사용자와 확정한 implementation brief 대화
- Graphify 참고 방향: runtime dependency가 아니라 Graphify-style report/graph artifact 생성
- repo SDD workflow rule: implementation 전 spec/plan 사용자 승인 필요

---

## 12. Spec 자체 평가

`.sduck/sduck-assets/eval/spec.yml` 기준 자체 평가:

| 기준                | 점수(1-5) | 근거                                                                   |
| ------------------- | --------- | ---------------------------------------------------------------------- |
| problem_clarity     | 5         | v1 문제와 v2 목표, 사용자/agent 역할이 명확함                          |
| scope_definition    | 5         | 1차 포함/제외 범위와 command set이 명확함                              |
| completion_criteria | 5         | 17개 AC와 테스트 계획으로 검증 가능함                                  |
| feasibility         | 4         | 현재 TS/Commander/Vitest 기반에서 가능하나 v1 전면 교체라 작업량이 큼  |
| risk_coverage       | 4         | Node engine, path/security, Graphify non-dependency, v1 제거 영향 명시 |
| testability         | 5         | unit/e2e 대상과 검증 command가 명확함                                  |
