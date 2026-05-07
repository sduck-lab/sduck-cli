# Plan: sduck v2 decision briefing harness

> Spec: `.sduck/sduck-workspace/20260430-0905-feature-decision-briefing-v2/spec.md`  
> 상태: spec approved, plan pending approval  
> 원칙: plan 승인 전 구현 코드는 작성하지 않는다.

## Step 1. Package metadata and v1 surface cleanup

### 목표

프로젝트는 기존 npm/TypeScript/Vitest 기반을 유지하되, v2 런타임 요구사항과 packaging surface를 맞춘다.

### 대상 파일

- `package.json`
  - `engines.node`: `>=20` → `>=22.13`
  - `files`: v1 `.sduck/sduck-assets` package inclusion 제거 여부 확인 후 v2에 맞게 `dist` 중심으로 정리
  - `description`: spec-driven bootstrap에서 decision briefing harness 의미로 갱신
  - scripts는 기존 `dev`, `build`, `lint`, `typecheck`, `test:*` 유지
  - dependency 추가는 원칙적으로 하지 않음; `commander`, `@inquirer/prompts` 유지; `js-yaml`은 v2에서 사용하지 않으면 제거 검토
- `package-lock.json`
  - `package.json` 변경에 맞춰 lockfile 갱신
- `README.md`
  - Step 12에서 v2 문서로 갱신할 예정이며, 이 단계에서는 변경 대상만 확정

### 변경 의도

- Node 내장 `node:sqlite` 사용을 위해 Node 최소 버전을 명시한다.
- v1 asset 중심 packaging을 제거해 v2가 `.decision/` runtime workspace를 생성하는 제품임을 명확히 한다.

### 검증

- `npm install --package-lock-only` 또는 dependency 변경이 있을 경우 `npm install`
- `npm run typecheck`

---

## Step 2. Replace v1 CLI routing with v2 command surface

### 목표

기존 `src/cli.ts`의 SDD command routing을 제거하고 v2 command set만 노출한다.

### 대상 파일

- `src/cli.ts`
  - 기존 imports 제거: `archive`, `clean`, `done`, `fast-track`, `implement`, `plan-approve`, `reopen`, `review`, `spec-approve`, `start`, `step`, `update`, `use` 등 v1 wrappers
  - v2 command wrappers import로 교체: `init`, `work`, `status`, `context`, `submit`, `ask`, `answer`, `brief`, `confirm`, `trace`, `remember`, `recall`, `close`, `abandon`
- `src/core/command-metadata.ts`
  - `CLI_NAME = 'sduck'` 유지
  - description/version metadata v2에 맞게 조정
  - v1 `normalizeCommandName`/placeholder가 불필요하면 제거 또는 테스트와 함께 대체

### Command routing 상세

```bash
sduck init
sduck work <description...>
sduck status --json
sduck context --json
sduck context add <pathOrGlob>
sduck submit --stdin
sduck ask
sduck answer <questionId> --option <n>
sduck answer <questionId> --text <answer>
sduck brief --json
sduck confirm
sduck trace --base <ref> --json
sduck remember
sduck recall <query...>
sduck close
sduck abandon
```

### 변경 의도

- v1 `start/spec/plan/done` 중심 UX를 제거한다.
- `sduck` bin 이름은 유지한다.
- 모든 command wrapper는 `{ stdout, stderr, exitCode }` result pattern을 유지해 테스트하기 쉽게 한다.

### 검증

- `npm run dev -- --help`
- `npm run dev -- work --help`
- `npm run typecheck`

---

## Step 3. Define domain types, IDs, paths, and result contracts

### 목표

v2 core가 공유하는 타입과 경로 규칙을 먼저 고정한다.

### 대상 파일

- 새 파일 `src/types/index.ts`
  - `Task`, `TaskStatus`
  - `Decision`, `DecisionKind`, `DecisionStatus`
  - `Evidence`, `EvidenceSourceType`
  - `Question`
  - `ContextItem`
  - `BriefSnapshot`
  - `ImplementationTrace`
  - `EventRecord`, `EventType`
  - draft schema types: `SduckDraft`, `DraftDecision`, `DraftQuestion`, `DraftEvidence`
  - view types: `StatusView`, `ContextPack`, `BriefView`, `TraceView`, `RecallResult`
- 새 파일 `src/core/ids.ts`
  - `createTaskId(date, description)` → `TASK-YYYYMMDD-slug`
  - `createEntityId(prefix, sequence)` → `DEC-0001`, `Q-0001`, `EV-0001`, `CTX-0001`, `IMPL-0001`, `BRF-0001`
  - slug normalization helper
- 새 파일 `src/core/paths.ts`
  - `.decision/` paths:
    - `decisionRoot`
    - `dbPath`
    - `statePath`
    - `exports/markdown/tasks`
    - `exports/markdown/decisions`
    - `exports/markdown/implementations`
    - `exports/graphify`
    - graphify input candidates: `graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.json`
  - project-root-relative path helpers
- 새 파일 `src/core/result.ts`
  - `CommandResult` type와 `ok()`, `fail()` helpers

### 변경 의도

- v2 schema-first runtime을 타입으로 고정한다.
- exact optional property TS 설정을 고려해 optional fields와 nullable fields를 명확히 분리한다.

### 검증

- `npm run typecheck`

---

## Step 4. Implement SQLite store, schema migration, state, and event log

### 목표

`.decision/db.sqlite`와 `.decision/state.json`을 source of truth로 생성/관리한다.

### 대상 파일

- 새 파일 `src/core/store.ts`
  - `openDatabase(projectRoot)` using `node:sqlite` `DatabaseSync`
  - `ensureSchema(db)`
  - JSON encode/decode helpers for array/object columns
  - transaction helper wrapper
  - sequence/id helper queries
- 새 파일 `src/core/state.ts`
  - `readState(projectRoot)`
  - `writeState(projectRoot, state)`
  - `getCurrentTaskId(projectRoot)`
  - `setCurrentTaskId(projectRoot, taskId)`
- 새 파일 `src/core/events.ts`
  - `appendEvent(db, event)`
  - `listEvents(taskId)`
- 새/대체 파일 `src/core/workspace.ts`
  - `initDecisionWorkspace(projectRoot)`
  - directory creation for `.decision/exports/...`
  - idempotent init behavior

### SQLite schema 초안

주요 테이블은 `tasks`, `decisions`, `questions`, `evidence`, `context_items`, `brief_snapshots`, `implementation_traces`, `events`다. 배열/객체 필드는 JSON TEXT column으로 저장한다.

### 변경 의도

- current tables와 append-only event log를 모두 유지한다.
- JSON columns는 portable하게 TEXT로 저장한다.

### 검증

- Unit: fresh temp workspace에서 `initDecisionWorkspace` 호출 후 directory/DB/schema/state 존재 확인
- Unit: event append/list
- `npm run test:unit -- tests/unit/store.test.ts tests/unit/workspace.test.ts`

---

## Step 5. Implement task lifecycle and status projection

### 목표

`work`, `status`, `close`, `abandon`의 core lifecycle을 구현한다.

### 대상 파일

- 새 파일 `src/core/task.ts`
  - `createTask(projectRoot, description)`
  - `getCurrentTask(projectRoot)`
  - `updateTaskStatus(taskId, status)`
  - `closeCurrentTask(projectRoot)`
  - `abandonCurrentTask(projectRoot)`
- 새 파일 `src/core/status.ts`
  - `buildStatusView(projectRoot)`
  - derived indicators 계산:
    - context item count
    - draft submission count from events
    - questions answered/open
    - decisions count by kind
    - latest brief snapshot exists
    - implementation traces count
    - export events count
  - `maybeMarkBriefReady(taskId)` helper: open required questions가 없고 decisions/questions가 있으면 `BRIEF_READY` projection 반영
- 새 command files:
  - `src/commands/work.ts`
  - `src/commands/status.ts`
  - `src/commands/close.ts`
  - `src/commands/abandon.ts`

### 변경 의도

- persisted status는 `OPEN | BRIEF_READY | CONFIRMED | CLOSED | ABANDONED`로 제한한다.
- context/draft/asking/trace/export는 status가 아니라 derived indicators로 보여준다.

### 검증

- Unit: create task stores task/state/event
- Unit: close/abandon status and event
- Unit: status view counts derived indicators
- E2E: `sduck init && sduck work "payment retry" && sduck status --json`

---

## Step 6. Implement lightweight context indexing and context pack rendering

### 목표

`sduck work`에서 concise context summary를 만들고, `sduck context`에서 full context pack을 제공한다. Agent가 추가 파일/경로를 context에 넣을 수 있도록 `context add`를 구현한다.

### 대상 파일

- 새 파일 `src/core/discovery.ts`
  - `buildContextIndex(projectRoot, task)`
  - `.decision/db.sqlite` 기존 tasks/decisions/traces LIKE 검색
  - `.decision/exports/markdown/**/*.md` 파일명/내용 일부 검색
  - `graphify-out/GRAPH_REPORT.md` 존재 시 context/evidence 등록
  - `graphify-out/graph.json` 존재 시 node label/source_file 단순 검색
  - repo 파일명/폴더명 keyword match
  - default excludes: `.git/`, `node_modules/`, `dist/`, `.decision/db.sqlite`, `.sduck-worktrees/`
- 새 파일 `src/core/context.ts`
  - `getContextPack(projectRoot)`
  - `addContextPath(projectRoot, pathOrGlob)`
  - grill-me protocol and draft schema example 제공
- command files:
  - `src/commands/context.ts`
  - nested `context add` handling
- UI files:
  - `src/ui/render.ts`에 context summary/full context renderer 추가

### 변경 의도

- CLI는 질문을 생성하지 않고 agent가 판단할 “지도”를 제공한다.
- full AST/vector/Graphify 실행은 하지 않는다.

### 검증

- Unit: task description keywords로 matching path 후보 생성
- Unit: graphify-out mock files를 context/evidence로 등록
- Unit: `context add` with existing file, missing file, simple glob
- E2E: `sduck work "payment retry"`, `sduck context`, `sduck context --json`, `sduck context add README.md`

---

## Step 7. Implement draft parsing, validation, and submit storage

### 목표

Agent가 생성한 JSON 또는 Markdown fenced JSON draft를 받아 DB에 저장한다.

### 대상 파일

- 새 파일 `src/core/draft.ts`
  - `parseDraftInput(content)`
    - raw JSON parse
    - Markdown fenced block regex for `json sduck-draft ... `
  - `validateDraft(draft)`
    - `schemaVersion === 'v2alpha1'`
    - `taskId` optional/current task fallback 정책 확정: 없으면 current task 사용, 있으면 current task와 일치해야 함
    - decisions/questions/evidence arrays default empty
    - confidence range `0..1`
  - `submitDraft(projectRoot, content)`
    - store decisions/questions/evidence
    - store expectedScope/avoidScope as brief seed metadata or event payload
    - append `DRAFT_SUBMITTED`, `DECISION_CREATED` events
    - update status to `BRIEF_READY` only if no open questions and content enough for brief
- 새 파일 `src/core/decision.ts`
  - `insertDecision`, `listDecisionsByTask`, `countDecisionsByKind`
- 새 파일 `src/core/question.ts`
  - `insertQuestion`, `listQuestionsByTask`, `getNextOpenQuestion`
- 새 파일 `src/core/evidence.ts`
  - `insertEvidence`, `listEvidenceByTask`
- command file:
  - `src/commands/submit.ts`
    - supports `--stdin`; rejects no stdin for MVP

### 변경 의도

- agent-led generation과 CLI state runtime을 분리한다.
- Markdown은 사람이 읽기 좋지만 canonical structured block은 JSON으로 유지한다.

### 검증

- Unit: valid JSON draft
- Unit: valid Markdown fenced draft
- Unit: missing fenced block fails
- Unit: invalid confidence fails
- Unit: taskId mismatch fails
- E2E: `sduck submit --stdin < draft.json`, `sduck submit --stdin < draft.md`

---

## Step 8. Implement ask and answer flows

### 목표

한 번에 하나의 질문만 표시하고, interactive/non-interactive 답변을 모두 저장한다.

### 대상 파일

- `src/core/question.ts`
  - `answerQuestion(projectRoot, questionId, answerInput)`
  - option index는 1-based user input으로 받고 내부에서 bounds check
  - question answered update
  - evidence source `USER_ANSWER` 생성
  - EXPLICIT decision 생성 또는 linked OPEN decision 갱신
- `src/commands/ask.ts`
  - `getNextOpenQuestion`
  - `@inquirer/prompts` select/input 사용
  - “근거 더 보기” 옵션 처리: rationale 전체 출력 후 다시 선택하게 함
- `src/commands/answer.ts`
  - validates exactly one of `--option` or `--text`
- `src/ui/prompts.ts`
  - interactive ask helpers
- `src/ui/render.ts`
  - question render formatting

### 변경 의도

- terminal-first grill-me UX를 구현한다.
- agent/script가 `sduck answer`로 비대화형 저장도 가능하게 한다.

### 검증

- Unit: answer by option creates evidence + explicit decision
- Unit: answer by text creates evidence + explicit decision
- Unit: invalid option returns error
- E2E: non-interactive answer path

---

## Step 9. Implement brief projection, rendering, and confirm snapshot

### 목표

질문받은 결정과 추론/상속/충돌/open 결정을 구분해 implementation brief를 렌더링하고, confirm 시 snapshot을 freeze한다.

### 대상 파일

- 새 파일 `src/core/brief.ts`
  - `buildBriefView(projectRoot)`
    - task
    - decisions grouped by kind
    - questions open/answered
    - evidence grouped by source type
    - expectedScope/avoidScope from latest draft/event/context
    - unresolved open question count
  - `renderBriefMarkdown(view)`
  - `confirmBrief(projectRoot)`
    - require current task not `ABANDONED/CLOSED`
    - save `brief_snapshots`
    - update task status `CONFIRMED`
    - append `BRIEF_CONFIRMED`
- command files:
  - `src/commands/brief.ts`
  - `src/commands/confirm.ts`
- UI:
  - `src/ui/render.ts` brief/status sections
  - `src/ui/prompts.ts` confirm prompt

### 변경 의도

- 구현자가 어떤 brief를 기준으로 작업했는지 재현 가능한 snapshot을 남긴다.
- `brief --json`은 agent가 읽을 stable structure를 제공한다.

### 검증

- Unit: decisions grouped by EXPLICIT/INFERRED/CARRIED/CONFLICT/OPEN
- Unit: confirm saves snapshot and status CONFIRMED
- Unit: confirm includes rendered markdown
- E2E: submit draft → answer → brief → confirm

---

## Step 10. Implement trace detection and decision-to-code mapping draft

### 목표

구현 후 changed files를 감지하고 confirmed decisions와 연결되는 trace record를 생성한다.

### 대상 파일

- 새 파일 `src/core/git-diff.ts`
  - `listChangedFiles(projectRoot, base?)`
  - tracked changes:
    - no base: `git diff --name-only`
    - with base: `git diff --name-only <base>` 또는 구현 시 merge-base 기준 확정
  - untracked files:
    - `git status --short`에서 `??` parse
  - de-duplicate/sort paths
- 새 파일 `src/core/trace.ts`
  - `createImplementationTrace(projectRoot, options)`
  - confirmed/latest decisions fetch
  - draft mapping:
    - each decision maps to files whose path appears in `appliesTo`
    - if no match, map all changed files with needs-review summary
  - save `implementation_traces`
  - append `TRACE_CREATED`
- command file:
  - `src/commands/trace.ts`
- UI:
  - trace render and `--json`

### 변경 의도

- MVP는 AST 분석을 하지 않고 git metadata 기반으로 filesChanged를 잡는다.
- untracked 신규 파일을 놓치지 않는다.

### 검증

- Unit: parse `git status --short` untracked
- Unit: merge tracked/untracked paths
- Unit: trace stores files changed and mapping
- E2E: temp git repo에서 tracked edit + untracked file 생성 후 `sduck trace --json`

---

## Step 11. Implement remember/export and recall search

### 목표

decision/trace를 markdown과 Graphify-style graph artifact로 export하고, SQLite LIKE 기반 recall을 제공한다.

### 대상 파일

- 새 파일 `src/core/export.ts`
  - `remember(projectRoot)`
  - task markdown: `.decision/exports/markdown/tasks/<TASK-ID>.md`
  - decision markdown per decision: `.decision/exports/markdown/decisions/<DEC-ID>.md`
  - implementation trace markdown: `.decision/exports/markdown/implementations/<IMPL-ID>.md`
  - append `EXPORT_WRITTEN`
- 새 파일 `src/core/graph.ts`
  - `buildDecisionGraph(projectRoot)`
  - export `.decision/exports/graphify/decision-graph.json`
    - nodes: task, decisions, evidence, files, implementation traces
    - links: HAS_DECISION, HAS_EVIDENCE, APPLIES_TO, AVOIDS, IMPLEMENTS_IN, TRACE_FOR
  - export `.decision/exports/graphify/DECISION_REPORT.md`
- 새 파일 `src/core/recall.ts`
  - LIKE search over tasks/decisions/evidence/implementation_traces summaries and markdown export contents if present
- command files:
  - `src/commands/remember.ts`
  - `src/commands/recall.ts`

### 변경 의도

- Graphify 자체는 실행하지 않고, Graphify-style human/machine artifact를 생성한다.
- 다음 작업에서 prior decisions를 recall할 수 있게 한다.

### 검증

- Unit: markdown frontmatter content
- Unit: graph JSON nodes/links shape
- Unit: recall returns matching decisions/traces
- E2E: confirm/trace/remember/recall flow

---

## Step 12. Replace tests and documentation for v2

### 목표

v1 SDD tests를 v2 end-to-end loop 중심으로 대체하고 README를 v2 CLI 사용법으로 갱신한다.

### 대상 파일

- Replace/remove v1 unit tests under `tests/unit/`
  - add v2 unit tests:
    - `store.test.ts`
    - `workspace.test.ts`
    - `task.test.ts`
    - `context.test.ts`
    - `draft.test.ts`
    - `question.test.ts`
    - `brief.test.ts`
    - `trace.test.ts`
    - `export.test.ts`
    - `recall.test.ts`
- Replace/remove v1 e2e tests under `tests/e2e/`
  - add v2 e2e tests:
    - `init.test.ts`
    - `work-context.test.ts`
    - `submit-brief-confirm.test.ts`
    - `trace-remember-recall.test.ts`
    - `lifecycle.test.ts`
- Keep/update helpers:
  - `tests/helpers/run-cli.ts`: still runs `tsx src/cli.ts`
  - `tests/helpers/temp-workspace.ts`: adapt to `.decision/`
  - `tests/helpers/fixture.ts`: keep if useful
- `README.md`
  - rewrite command examples for v2
  - explain agent-led grill-me flow
  - explain `.decision/` source of truth and Graphify-style exports

### 변경 의도

- tests should validate the new product, not preserve v1 behavior.
- docs should not instruct users to open/edit spec/plan files for v2.

### 검증

- `npm run test:unit`
- `npm run test:e2e`

---

## Step 13. Full validation, review readiness, and SDD step tracking

### 목표

구현 후 전체 검증을 수행하고 SDD workflow step 상태를 정확히 기록한다.

### 대상 파일

- `.sduck/sduck-workspace/20260430-0905-feature-decision-briefing-v2/review.md` 생성은 `sduck review ready`가 담당
- 구현 중 각 Step 완료 후 `sduck step done <N>` 실행

### 검증 명령

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run test:e2e
npm run build
npm run test
```

### 완료 기준 매핑

- Spec AC1-AC17 각각에 대응하는 unit/e2e test가 존재하거나 수동 검증 로그가 남아야 한다.
- 모든 plan Step 1-13 구현 완료 후 `.sduck/sduck-assets/eval/task.yml` 기준 task 평가를 수행한다.
- 평가와 검증 결과를 사용자에게 보여준 뒤 `sduck review ready`로 전환한다.

---

## Plan 자체 평가

`.sduck/sduck-assets/eval/plan.yml` 기준 자체 평가:

| 기준             | 점수(1-5) | 근거                                                                                                 |
| ---------------- | --------- | ---------------------------------------------------------------------------------------------------- |
| semantic_clarity | 5         | 각 Step의 목표, 파일, 변경 의도, 검증이 명확함                                                       |
| abstraction      | 5         | CLI/command/core/ui/types/store/export 계층이 분리되어 있음                                          |
| typing           | 5         | domain/draft/view 타입을 선행 정의하고 node:sqlite JSON column 경계도 명시함                         |
| security         | 4         | path excludes, schema validation, project-root 경계 고려가 포함됨. 세부 sanitize는 구현 시 보강 필요 |
| maintainability  | 5         | v1 제거와 v2 모듈 경계를 명확히 나눠 유지보수 가능함                                                 |
| testability      | 5         | 각 Step마다 unit/e2e 검증 포인트와 최종 검증 명령을 제시함                                           |
