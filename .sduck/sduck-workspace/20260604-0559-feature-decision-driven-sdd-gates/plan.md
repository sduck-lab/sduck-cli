# Implementation Plan: decision driven sdd gates

> 작업 ID: `20260604-0559-feature-decision-driven-sdd-gates`
> 상태: `SPEC_APPROVED`
> Code 작업 경로: `/Users/taehee/Workspace/03_Temp/sdcuk-cli/.sduck-worktrees/20260604-0559-feature-decision-driven-sdd-gates`
> Source of truth: 제품 기능은 `.decision` v2, 이번 작업 진행은 `.sduck` SDD 규칙

## 계획 원칙

- plan 승인 전에는 구현 코드를 작성하지 않는다.
- plan 승인 후 모든 코드 변경은 `agent-context.json`의 `worktreeAbsolutePath`에서 수행한다.
- 각 Step 완료 직후 `sduck step done <N>` 또는 현재 저장소 CLI 제약상 동일 internal command를 실행해 진행 상태를 기록한다.
- 기존 v2 명령어의 기본 의미를 제거하지 않고, 필요한 새 명령만 추가한다.
- CLI는 LLM을 내장하지 않는다. agent가 생성한 draft를 CLI가 저장/검증/검색/gate/전이한다.
- SQLite migration은 기존 `.decision/decision.sqlite`가 있어도 idempotent하게 동작해야 한다.
- TypeScript strict 옵션(`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)을 기준으로 타입을 설계한다.

## 구현 중 확정할 정책

Spec의 미결 사항을 plan에서 다음처럼 확정한다.

1. **trivial/non-trivial 판정**
   - `createTask()` 시 description 기반 보수적 heuristic을 적용한다.
   - 기본값은 `decision_gate_required = true`다.
   - trivial keyword(`typo`, `오타`, `readme`, `docs`, `문서`, `version bump`, `버전 bump`)만 있고 feature/workflow/schema/search/state/approval 관련 keyword가 없으면 skip 가능으로 판정한다.
   - agent draft의 optional `gate` metadata로 `required`와 `reason`을 보정할 수 있게 한다. 단, conflict/open blocking question이 생기면 required로 재상승한다.
2. **plan confirm과 trace gate**
   - decision brief confirm 전에는 plan confirm, trace, close가 모두 불가능하다.
   - non-trivial 작업은 trace 시 `CONFIRMED` status와 brief snapshot을 필수로 한다.
   - confirmed implementation plan은 이 작업에서 저장/승인/remember 대상이지만, 초기 구현에서는 trace의 절대 필수 조건으로 두지 않는다. draft plan이 있으면 trace에 plan step mapping을 포함하고, plan confirm은 `CONFIRMED` 이후에만 허용한다.
   - close는 non-trivial 작업에서 `CONFIRMED`와 최소 1개 trace를 요구한다.

## Step 1. v2 타입과 SQLite schema 확장

### 목표

`.decision` v2가 gate, question DAG metadata, structured implementation plan, enhanced trace, FTS search index를 저장할 수 있게 타입과 schema를 확장한다.

### 대상 파일

- `src/types/index.ts`
  - 현재 위치: `TaskStatus`, `DecisionKind`, `Question`, `ImplementationTrace`, `SduckDraft`, `RecallResult` 등 v2 타입 정의.
  - 추가/수정:
    - `QuestionStatus = 'open' | 'answered' | 'skipped' | 'superseded'`
    - `QuestionGrade = 'blocking' | 'recommended' | 'assumed' | 'resolved_by_memory' | 'resolved_by_code'`
    - `ImplementationPlanStatus = 'draft' | 'confirmed' | 'executed' | 'superseded'`
    - `DecisionGateMetadata`, `GateView`, `GateCheck`, `ImplementationPlan`, `DraftImplementationPlan`, `SearchResult`, `SearchResultItem` 타입 추가.
    - `Task`에 `decisionGateRequired`, `gateSkipReason`, `priorSearchPerformedAt`, `retrievalSummary`, `conflictState` 필드 추가.
    - `Question`에 `parentQuestionId`, `dependsOn`, `branchKey`, `category`, `blocking`, `status`, `grade` 추가.
    - `ImplementationTrace`에 `completedPlanSteps`, `verificationCommandsRun`, `testResultsSummary`, `unresolvedFollowUps`, `planId` 추가.
    - `SduckDraft`에 `gate`, `retrievedPriorDecisions`, `implementationDirection`, `risks`, `verificationCommands`, `implementationPlan` optional 필드 추가.
    - `EventType`에 `PLAN_SUBMITTED`, `PLAN_CONFIRMED`, `SEARCH_PERFORMED`, `GATE_EVALUATED` 추가.
- `src/core/v2/store.ts`
  - 현재 위치: `ensureSchema(db)`가 `CREATE TABLE IF NOT EXISTS`만 수행.
  - 추가/수정:
    - `tasks`에 gate metadata columns 추가: `decision_gate_required INTEGER NOT NULL DEFAULT 1`, `gate_skip_reason TEXT`, `prior_search_performed_at TEXT`, `retrieval_summary_json TEXT NOT NULL DEFAULT '{}'`, `conflict_state TEXT NOT NULL DEFAULT 'none'`.
    - `questions`에 DAG/grade/status columns 추가: `parent_question_id TEXT`, `depends_on_json TEXT NOT NULL DEFAULT '[]'`, `branch_key TEXT`, `category TEXT NOT NULL DEFAULT 'general'`, `blocking INTEGER NOT NULL DEFAULT 1`, `status TEXT NOT NULL DEFAULT 'open'`, `grade TEXT NOT NULL DEFAULT 'blocking'`.
    - `implementation_plans` 테이블 추가.
    - `implementation_traces`에 enhanced columns 추가: `plan_id TEXT`, `completed_plan_steps_json TEXT NOT NULL DEFAULT '[]'`, `verification_commands_run_json TEXT NOT NULL DEFAULT '[]'`, `test_results_summary TEXT NOT NULL DEFAULT ''`, `unresolved_follow_ups_json TEXT NOT NULL DEFAULT '[]'`.
    - FTS5 virtual table `decision_search_index` 추가. Column 예: `entity_type`, `entity_id`, `task_id`, `title`, `body`, `metadata_json`, `created_at`.
    - existing DB를 위해 `ensureColumn()` helper를 만들고 `PRAGMA table_info` 기반 `ALTER TABLE`을 idempotent하게 실행.
    - `refreshSearchIndex(db)` 또는 `rebuildSearchIndex(db)` helper를 export한다.

### 구현 세부

- `node:sqlite`의 `DatabaseSync` API를 유지한다.
- JSON column은 기존 `encodeJson`/`decodeJson`를 재사용한다.
- FTS5 사용 가능 여부는 Node 22.13+ package engine 전제에 맞춘다. 실패 시 명확한 error를 던지되 tests는 기존 `supportsNodeSqlite` guard를 유지한다.
- legacy rows의 default 값이 strict type mapper에서 undefined가 되지 않게 migration default를 둔다.

### 검증

- `npm run typecheck`
- unit test fixture에서 기존 minimal draft가 새 schema에서도 통과하는지 확인.

## Step 2. task/gate core와 status 전이 기반 구축

### 목표

non-trivial decision gate required 여부와 현재 gate 상태를 계산하는 core를 추가하고, `maybeMarkBriefReady()`를 실제 draft/answer 흐름에 연결한다.

### 대상 파일

- 신규 `src/core/v2/gate.ts`
  - 함수 추가:
    - `classifyDecisionGate(description: string): DecisionGateMetadata`
    - `buildGateView(projectRoot: string): GateView`
    - `buildGateViewForTask(db, taskId): GateView`
    - `assertCanConfirmBrief(viewOrProjectRoot)`
    - `assertCanConfirmPlan(projectRoot)`
    - `assertCanTrace(projectRoot)`
    - `assertCanClose(projectRoot)`
    - `hasConfirmedOrCarryableDecision(decisions)`
    - `hasUnresolvedConflict(decisions, questions)`
  - Gate check 항목:
    - decision gate required/skip reason
    - open blocking questions count
    - confirmed/carryable decisions count
    - scope/avoid scope present
    - prior search performed
    - unresolved conflict count
    - implementation direction present
    - verification command present
    - brief snapshot count
    - trace count
- `src/core/v2/task.ts`
  - `TaskRow`, `mapTask()`, `createTask()` 수정.
  - `createTask()`에서 `classifyDecisionGate(description)` 결과를 tasks row에 저장.
  - `setTerminalStatus()`에서 `status === 'CLOSED'`일 때 `assertCanClose()`를 호출하고, `ABANDONED`는 기존처럼 terminal 처리 허용.
  - helper 추가: `updateTaskGateMetadata(db, taskId, metadata)` 또는 `patchTaskGateMetadata()`.
- `src/core/v2/status.ts`
  - `buildStatusView()`가 `GateView` 요약을 포함하도록 `StatusView` 확장.
  - `maybeMarkBriefReady()` 조건을 `GateView.canConfirm` 또는 최소 gate 조건과 일치시킨다.
  - `maybeMarkBriefReady()`는 OPEN task에서만 `BRIEF_READY`로 전이한다.
- `src/core/v2/draft.ts`
  - draft 제출 후 `maybeMarkBriefReady(projectRoot)` 호출.
  - draft `gate` metadata가 있으면 task gate metadata를 갱신.
  - conflict decision 또는 blocking question이 제출되면 gate required로 재상승.
- `src/core/v2/question.ts`
  - `answerQuestion()` 후 `maybeMarkBriefReady(projectRoot)` 호출.
  - answered question의 `status`도 `answered`로 갱신.

### 구현 세부

- gate check 실패 메시지는 CLI stderr로 그대로 노출되므로 짧고 구체적으로 작성한다.
- 기존 `BRIEF_READY` status 의미는 유지하되, status 전이는 gate helper가 판단하게 한다.
- trivial/gate skip task에서도 conflict/open blocking question이 있으면 confirm/close를 무조건 허용하지 않는다.

### 검증

- Unit:
  - non-trivial description → `decisionGateRequired: true`
  - trivial description → `decisionGateRequired: false` 및 skip reason 존재
  - draft submit 후 open blocking question 있으면 `BRIEF_READY`로 전이하지 않음
  - answer 후 gate 만족 시 `BRIEF_READY`로 전이
- `npm run typecheck`

## Step 3. question metadata, draft parsing, brief quality gate 강화

### 목표

agent가 제출하는 grilling/decision DAG draft와 brief contract 정보를 저장하고, `confirmBrief()`가 spec의 quality gate를 강제하게 한다.

### 대상 파일

- `src/core/v2/question.ts`
  - `QuestionRow`, `mapQuestion()`, `insertQuestion()` 수정.
  - `DraftQuestion` optional fields 반영:
    - `parentQuestionId`
    - `dependsOn`
    - `branchKey`
    - `category`
    - `blocking`
    - `status`
    - `grade`
  - `getNextOpenQuestion()`은 `status = 'open'` 및 `blocking/recommended` 우선 정렬을 적용한다.
- `src/core/v2/draft.ts`
  - `validateDraft()`에 새 optional fields 검증 추가.
  - `implementationDirection`, `risks`, `verificationCommands`, `retrievedPriorDecisions` 저장 방식 확정:
    - implementation direction/risks/verification commands는 evidence 또는 task retrieval metadata로 저장한다.
    - prior decision 검색 수행 여부는 `prior_search_performed_at`과 `retrieval_summary_json`에 기록한다.
  - `CONFLICT` decision 또는 `grade: blocking` question 제출 시 gate required로 상승.
- `src/core/v2/brief.ts`
  - `buildBriefView()`가 implementation direction, risks, verification commands, retrieved prior decisions, gate summary를 포함하도록 `BriefView` 확장.
  - `renderBriefMarkdown()` 필수 섹션을 렌더링:
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
  - `confirmBrief()`에서 `assertCanConfirmBrief()` 호출.
  - confirm 성공 시 기존처럼 `brief_snapshots` insert 후 `CONFIRMED`로 전이.
- `src/core/v2/decision.ts`
  - 필요 시 `listDecisionsByTask()` 결과를 gate가 쉽게 사용할 수 있도록 helper 추가.
  - conflict/carryable decision counting에 필요한 status/kind filtering helper 추가 가능.

### 구현 세부

- confirmed/carryable decision 조건은 `status === 'CONFIRMED'` 또는 `kind === 'CARRIED' && status !== 'REJECTED'`로 정의한다.
- `OPEN`/`CONFLICT` decision이 있으면 conflict 해결 여부를 확인한다. resolved conflict는 status `SUPERSEDED` 또는 related blocking question answered로 표현할 수 있게 한다.
- brief snapshot은 quality gate 통과 후의 rendered markdown을 저장해야 한다.

### 검증

- Unit:
  - open blocking question 있으면 `confirmBrief()` 실패.
  - decision 0개이면 `confirmBrief()` 실패.
  - scope/avoid scope/implementation direction/verification command 누락이면 실패.
  - conflict unresolved면 실패.
  - 모든 gate 만족 시 snapshot 생성 및 `CONFIRMED` 전이.
- E2E:
  - `submit` → `confirm` failure 메시지 확인.

## Step 4. FTS5 기반 search/recall과 context retrieval 개선

### 목표

SQLite `LIKE` 기반 recall을 FTS5 기반 memory search로 바꾸고, context retrieval에 memory search 단계를 추가한다.

### 대상 파일

- 신규 `src/core/v2/search.ts`
  - 함수 추가:
    - `searchMemory(projectRoot: string, query: string, options?)`
    - `searchMemoryWithDb(db, query, options?)`
    - `indexSearchDocument(db, doc)` 또는 `rebuildSearchIndex(db)` 호출 wrapper
    - `recordSearchPerformed(db, taskId, query, results)`
  - FTS 대상:
    - `tasks.description`
    - `decisions.title`, `summary`, `rationale_json`
    - `questions.text`
    - `evidence.summary`
    - `implementation_traces.summary`, `files_changed_json`
    - `brief_snapshots.rendered_markdown`
    - `implementation_plans.summary`, `steps_json`, `target_files_json`, `verification_commands_json`
- `src/core/v2/store.ts`
  - `rebuildSearchIndex(db)` 구현.
  - mutation 이후 최소한 command-level에서 search index rebuild 가능하도록 export.
- `src/core/v2/recall.ts`
  - 기존 LIKE query 제거 또는 fallback으로 제한.
  - `recall()`은 `searchMemory()`를 사용해 `RecallResult`에 ranked `items`를 포함한다.
  - backward compatibility를 위해 `decisions`와 `traces` 배열도 유지한다.
- `src/core/v2/context.ts`
  - 현재 path/content 중심 indexing 흐름에 memory search 추가.
  - `getContextPack()`의 `priorDecisions`, `priorTraces`는 FTS 결과를 우선 사용하고 없을 때 기존 recent/list 방식 사용.
  - memory search 수행 시 task metadata `prior_search_performed_at`을 기록한다.
- `src/commands/v2/index.ts`
  - `runSearchCommand(projectRoot, query, asJson)` 추가.
  - `runRecallCommand()`는 새 recall result를 렌더링.
- `src/cli.ts`
  - `search <query...>` 및 `--json` option 추가.
- `src/ui/v2/render.ts`
  - `renderSearchResults()` 추가.
  - `renderRecall()`은 ranked item/source/snippet을 표시하되 기존 “검색어” 문구를 유지한다.

### 구현 세부

- FTS query는 사용자 입력을 그대로 SQL string interpolation하지 않는다. prepared statement parameter를 사용한다.
- FTS MATCH query escaping helper를 둔다. 특수문자는 token 단위로 quote하거나 단순 whitespace token AND 검색으로 정규화한다.
- index rebuild는 초기 구현에서 단순 전체 rebuild로 구현해 correctness를 우선한다. 이후 trigger 최적화 가능.

### 검증

- Unit:
  - prior decision title/summary/rationale로 검색됨.
  - trace `files_changed_json`으로 검색됨.
  - brief snapshot markdown으로 검색됨.
  - plan summary/verification command로 검색됨.
- E2E:
  - `search retry`와 `recall retry`가 결과를 출력.

## Step 5. structured implementation plan core와 CLI 추가

### 목표

v2에 implementation plan draft/confirm/조회 기능을 추가한다.

### 대상 파일

- 신규 `src/core/v2/plan.ts`
  - 함수 추가:
    - `insertImplementationPlan(db, taskId, draftPlan)`
    - `submitImplementationPlan(projectRoot, draftPlan)` 또는 draft submit에서 호출 가능한 lower-level 함수
    - `getLatestImplementationPlan(projectRoot)`
    - `listImplementationPlansByTask(projectRoot, taskId)`
    - `confirmImplementationPlan(projectRoot)`
    - `mapImplementationPlanRow(row)`
  - `confirmImplementationPlan()`은 `assertCanConfirmPlan()`을 호출해 task status `CONFIRMED`를 필수로 한다.
  - 새 plan confirm 시 기존 `draft|confirmed` plan은 필요하면 `superseded` 처리한다.
- `src/core/v2/draft.ts`
  - `SduckDraft.implementationPlan`이 있으면 `insertImplementationPlan()` 호출.
  - `SubmitDraftResult`에 `plans` count 추가.
- `src/core/v2/brief.ts`
  - `BriefView`에 latest implementation plan 요약을 포함할지 검토하고, 최소한 rendered brief의 Implementation Direction/Verification Commands와 충돌하지 않게 유지.
- `src/commands/v2/index.ts`
  - `runPlanCommand(projectRoot, asJson)` 추가.
  - `runPlanConfirmCommand(projectRoot)` 추가.
  - `runSubmitCommand()` 출력에 plan draft count 포함.
- `src/cli.ts`
  - `plan` command 추가.
  - `plan --json` 출력.
  - `plan confirm` subcommand 추가.
- `src/ui/v2/render.ts`
  - `renderImplementationPlan()` 추가.

### 구현 세부

- `DraftImplementationPlan` shape:
  - `id?`
  - `summary`
  - `steps: string[] | { id?: string; title: string; description?: string; targetFiles?: string[]; verificationCommands?: string[] }[]`
  - `targetFiles`
  - `verificationCommands`
  - `decisionIds`
- `ImplementationPlan` 저장 columns는 spec의 권장 fields와 일치시킨다.
- plan confirm은 decision brief confirm 후 가능하지만, decision gate 자체를 변경하지 않는다.

### 검증

- Unit:
  - draft submit에 implementationPlan이 있으면 `implementation_plans` draft 저장.
  - `plan` 조회가 latest draft를 반환.
  - `plan confirm`이 `CONFIRMED` 전 실패.
  - `CONFIRMED` 후 plan confirm 성공 및 status `confirmed`.
- E2E:
  - `sduck plan` 출력.
  - `sduck plan confirm` 출력.

## Step 6. trace, close, remember를 gate/plan/graph와 연결

### 목표

구현 결과 저장과 완료 전이를 decision/brief/plan gate에 맞게 강화하고, remember artifact에 plan + enhanced trace + graph 정보를 포함한다.

### 대상 파일

- `src/core/v2/trace.ts`
  - `createImplementationTrace()` 시작 시 `assertCanTrace(projectRoot)` 호출.
  - task status `CONFIRMED`, brief snapshot 존재 여부 검증.
  - latest confirmed/draft plan이 있으면 `planId`, completed plan steps, verification commands 후보를 trace에 포함.
  - `TraceView`에 `gate` 또는 `plan` summary 포함 가능.
  - `mapTraceRow()`가 enhanced columns를 decode.
- `src/core/v2/task.ts`
  - `setTerminalStatus(projectRoot, 'CLOSED')`에서 `assertCanClose(projectRoot)` 호출.
  - non-trivial task는 `CONFIRMED`와 최소 1개 trace 필요.
  - `ABANDONED`는 confirm 없이 허용.
- `src/core/v2/remember.ts`
  - `ImplementationPlan` import/list 추가.
  - `renderTaskMarkdown()`에 plan summary, gate summary, traces summary 포함.
  - `renderTraceMarkdown()`에 plan id, completed plan steps, verification commands run, test results, unresolved follow-ups 포함.
  - 신규 `renderPlanMarkdown()`으로 `.decision/memory/implementations` 또는 별도 plan markdown 파일 생성.
  - `renderDecisionReport()`에 Plans 섹션 추가.
  - `buildDecisionGraph()`에 plan nodes 및 links 추가:
    - task `HAS_PLAN` plan
    - plan `IMPLEMENTS_DECISION` decision
    - trace `EXECUTES_PLAN` plan
    - trace `CHANGED_FILE` file
- `src/core/v2/paths.ts`
  - 필요 시 plan markdown directory helper 추가.
- `src/ui/v2/render.ts`
  - `renderTrace()`에 enhanced fields 표시.
  - `nextAction()`이 gate/plan/trace 상태를 더 정확히 안내.

### 구현 세부

- `trace`가 changed files 0개인 경우: spec에는 명시 없지만 trace 품질을 위해 경고/summary를 남기고 생성 허용 여부를 gate에서 결정한다. 초기 구현은 기존 동작과 호환되게 허용하되 summary에 0 files를 명시한다.
- `close`는 trace가 없으면 실패해 작업 결과 저장을 강제한다.
- remember는 export 실패 시 event를 남기기 전에 실패해야 한다.

### 검증

- Unit:
  - unconfirmed non-trivial task trace 실패.
  - confirmed brief snapshot 이후 trace 성공.
  - close가 confirmed 전 실패.
  - close가 trace 전 실패.
  - remember artifact에 plan id, trace enhanced fields, graph plan node 포함.
- E2E:
  - confirm 전 `trace`와 `close` 실패.
  - full flow에서 trace/remember/close 성공.

## Step 7. CLI command wiring과 rendering 정리

### 목표

새 core 기능을 기존 command/result 패턴에 맞게 CLI에 노출하고 human/JSON 출력 품질을 맞춘다.

### 대상 파일

- `src/cli.ts`
  - import 추가:
    - `runGateCommand`
    - `runSearchCommand`
    - `runPlanCommand`
    - `runPlanConfirmCommand`
  - command 추가:
    - `gate [--json]`
    - `search <query...> [--json]`
    - `plan [--json]`
    - `plan confirm`
- `src/commands/v2/index.ts`
  - `runGateCommand(projectRoot, asJson)`
  - `runSearchCommand(projectRoot, query, asJson)`
  - `runPlanCommand(projectRoot, asJson)`
  - `runPlanConfirmCommand(projectRoot)`
  - 기존 `runStatusCommand()` JSON에 gate 포함.
  - 기존 `runSubmitCommand()` 출력에 `Plans: N` 추가하되 기존 substring test를 깨지 않게 `Draft submitted.` 유지.
- `src/ui/v2/render.ts`
  - `renderGate(view)` 추가.
  - `renderSearchResults(result)` 추가.
  - `renderImplementationPlan(planView)` 추가.
  - `renderStatus()`에 gate 요약 표시.
  - `renderRecall()` backward-compatible 문구 유지.
- `src/core/v2/result.ts`
  - 필요 시 변경 없음. 기존 `ok/fail` result pattern 유지.

### 구현 세부

- 새 정보성 command는 `--json`을 지원한다.
- gate command는 gate 상태를 보여주는 정보 명령이다. 단, `canConfirm/canTrace/canClose`가 false여도 command 자체는 정보를 반환하므로 exitCode 0으로 둔다. 실제 `confirm/trace/close`가 실패 exitCode 1을 반환한다.
- `search` 결과가 없으면 “none”을 출력한다.

### 검증

- E2E:
  - `sduck --help`에 `gate`, `search`, `plan` 포함.
  - `sduck gate --json` parse 가능.
  - `sduck search retry --json` parse 가능.
  - 기존 `init/work/status/context/submit/ask/answer/brief/confirm/trace/remember/recall/close/abandon` 명령 route 유지.

## Step 8. unit/e2e 테스트 보강 및 기존 회귀 수정

### 목표

Spec AC1-AC16을 테스트로 고정한다.

### 대상 파일

- `tests/unit/v2-core.test.ts`
  - 기존 happy-path test를 새 quality gate에 맞게 갱신:
    - draft에 `expectedScope`, `avoidScope`, `implementationDirection`, `verificationCommands`, `retrievedPriorDecisions` 또는 prior search metadata 포함.
    - open question answer 후 confirm.
    - plan draft submit/confirm 추가.
  - 신규 test cases:
    - non-trivial work creates required decision gate.
    - trivial work can skip gate.
    - open blocking questions prevent confirm.
    - no decisions prevent confirm.
    - missing scope/avoid scope prevents confirm.
    - unresolved conflict prevents confirm.
    - confirmed brief allows trace.
    - unconfirmed task blocks trace/close.
    - FTS recall/search finds prior decisions.
    - conflict prior decision creates blocking question or conflict decision.
    - remember exports plan + trace + graph.
- `tests/e2e/v2-cli.test.ts`
  - 기존 full flow 갱신:
    - `gate` 확인.
    - quality gate를 만족하는 draft 제출.
    - `plan`과 `plan confirm` 수행.
    - confirm 전 `trace/close` failure case 추가.
    - `search` command 확인.
- 필요 시 `tests/helpers/run-cli.ts`
  - Node 22.13+ guard 유지. helper 변경은 최소화.

### 구현 세부

- 테스트는 `supportsNodeSqlite` guard를 유지한다.
- e2e에서 git commit author env는 기존 방식 유지.
- failure assertion은 stdout/stderr 합쳐서 message substring 검사.
- FTS result ordering은 exact rank보다 포함 여부 중심으로 검사한다.

### 검증

- `npm run test:unit`
- `npm run test:e2e`

## Step 9. 전체 검증, task 평가, review ready 전환

### 목표

모든 변경을 검증하고 SDD 완료 절차를 수행한다.

### 대상 파일

- `.sduck/sduck-workspace/20260604-0559-feature-decision-driven-sdd-gates/spec.md`
  - AC 체크리스트를 실제 결과 기준으로 검토한다. 필요 시 구현 완료 후 체크 표기를 업데이트한다.
- `.sduck/sduck-workspace/20260604-0559-feature-decision-driven-sdd-gates/review.md`
  - `sduck review ready` 과정에서 생성되는 review artifact 확인.
- `.sduck/sduck-assets/eval/task.yml`
  - 구현 완료 후 task 평가 기준으로 자체 평가 수행.

### 검증 명령

Node 22.13+에서 실행한다. 현재 기본 shell이 Node 20이면 다음처럼 임시 Node 22를 사용한다.

```text
npx -p node@22 -p tsx node -v
npm run typecheck
npm run test:unit
npm run test:e2e
npm run lint
```

필요 시 Node 20 기본 shell에서 `node:sqlite` 때문에 CLI 직접 실행이 실패할 수 있으므로, 테스트/수동 CLI 실행은 Node 22.13+ 환경에서 수행한다.

### SDD 진행 명령

각 구현 step 완료 후:

```text
sduck step done <N>
```

현재 저장소의 public CLI가 legacy SDD command를 노출하지 않는 경우, 기존에 사용한 것처럼 internal command runner를 Node 22+로 호출해 동일한 상태 전이를 수행한다.

모든 step 완료 및 task 평가 후:

```text
sduck review ready 20260604-0559-feature-decision-driven-sdd-gates
```

### 완료 기준

- Spec AC1-AC16 충족.
- `npm run typecheck`, `npm run test:unit`, `npm run test:e2e`, `npm run lint` 통과.
- `.sduck step done` 기록 완료.
- task evaluation 결과를 사용자에게 보고.
- `review ready` 상태로 전환.

## Plan 자체 평가

평가 기준: `.sduck/sduck-assets/eval/plan.yml`

| 기준             | 점수(1-5) | 근거                                                                                                        |
| ---------------- | --------- | ----------------------------------------------------------------------------------------------------------- |
| semantic_clarity | 5         | 각 step의 목표, 대상 파일, 함수/섹션, 정책 결정이 명확하다.                                                 |
| abstraction      | 4         | gate/search/plan/trace를 모듈 단위로 분리했으며, 일부 schema migration 세부는 구현 시 확정 가능성을 남겼다. |
| typing           | 5         | 새 domain type, draft type, strict TS 고려사항을 step 1에 명시했다.                                         |
| security         | 4         | FTS query escaping, local-only memory, input validation을 포함했다.                                         |
| maintainability  | 5         | core/command/render/test 분리와 기존 result pattern 유지가 명시되어 있다.                                   |
| testability      | 5         | unit/e2e test case와 검증 명령이 AC별로 연결되어 있다.                                                      |

총평: 이 plan은 구현 승인 후 바로 실행 가능한 상세 단위로 구성되어 있으며, `.decision` v2 source of truth 원칙과 legacy `.sduck` SDD 진행 규칙을 모두 반영한다.
