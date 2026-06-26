# Plan: decision trace relevance

> Task: `20260626-0313-feature-decision-trace-relevance`
> Status before implementation: spec approved, plan awaiting user approval
> Worktree for code changes after plan approval: `.sduck-worktrees/20260626-0313-feature-decision-trace-relevance`

## Overview

`trace`와 `context`에서 weak provenance를 linked decision처럼 붙이는 현재 동작을 score/reason 기반 relevance로 바꾼다. 핵심은 `decision.appliesTo`를 정규화하고, exact/glob/directory/symbol/Graphify/substring 근거를 명시적인 score로 계산한 뒤, attach threshold 미만은 changed file에 붙이지 않고 `Unmapped decisions requiring review`로 분리하는 것이다.

현재 확인된 주요 코드 위치:

- `src/core/v2/trace.ts:20-76` — `createImplementationTrace()`, 현재 `file.includes(target)`와 매칭 실패 시 all changed files fallback 사용
- `src/core/v2/context.ts:101-160` — `buildContextIndex()`, keyword discovery + Graphify artifact availability + memory insert
- `src/core/v2/context.ts:187-227` — `findMemoryItems()`, SQL `LIKE` 기반 prior decision/trace lookup
- `src/core/v2/context.ts:303-344` — `findRelevantFiles()`, `walk()`, `expandPathOrGlob()` fallback matching
- `src/core/v2/remember.ts:115-163` — `buildDecisionGraph()`, `APPLIES_TO`, `CHANGED_FILE`, `TRACE_FOR` graph-like export 생성
- `src/core/v2/paths.ts:29-39` — graphify export/read path helpers
- `src/types/index.ts:97-110`, `153-163`, `211-215` — trace/context/recall public types
- `src/ui/v2/render.ts:38-80` — context/trace text renderer
- `src/commands/v2/index.ts:175-183` — trace command JSON/text output path
- `tests/unit/v2-core.test.ts` and `tests/e2e/v2-cli.test.ts` — primary regression coverage

## Step 1. Relevance scoring utility and type model

### Target files

- Add `src/core/v2/relevance.ts`
- Update `src/types/index.ts:97-110` if persisted trace map needs score/reason/unmapped fields
- Possibly update `src/core/v2/paths.ts:29-39` only if graph export lookup helper needs canonical `.decision/exports/graphify/decision-graph.json` path
- Update `tests/unit/v2-core.test.ts` or add focused `tests/unit/v2-relevance.test.ts`

### Implementation intent

1. Create a small, testable relevance module that owns provenance rules instead of spreading score logic across trace/context.
2. Define types similar to:
   - `RelevanceReason = 'matched by appliesTo exact path' | 'matched by appliesTo glob' | 'matched by appliesTo directory prefix' | 'matched by appliesTo symbol hint' | 'matched by graph edge' | 'matched by recall result' | 'weak substring fallback'`
   - `RelevanceMatch = { decisionId: string; files: string[]; score: number; reason: string; attached: boolean }`
   - `UnmappedDecisionReview = { decisionId: string; reason: string; score: number; summary: string }`
3. Implement `normalizeAppliesToEntry(projectRoot, entry)` or equivalent:
   - trim whitespace
   - remove leading `./`
   - convert path separators to `/`
   - handle repo-root relative/absolute path where safe
   - classify as exact path, glob, directory prefix/direct child, or symbol hint
4. Implement matcher/scorer functions:
   - exact path: `1.0`, reason `matched by appliesTo exact path`
   - glob: `0.85`, reason `matched by appliesTo glob`
   - directory prefix/direct child: `0.85`, reason `matched by appliesTo directory prefix`
   - symbol hint: map only when a credible file/symbol relation exists; otherwise do not attach
   - substring fallback: `0.3`, reason `weak substring fallback`
5. Define a shared default attach threshold constant: `0.7`.
6. Add merge helper that keeps the highest-score match for a decision/file pair and preserves deterministic ordering.
7. Keep the utility free of DB access so unit tests can run without complex fixtures.

### Verification for this step

- Add unit tests for exact path, `./` normalization, path separator normalization, glob, directory prefix, weak substring fallback, threshold classification, and strongest-reason merge.
- Run:
  - `npx vitest run tests/unit/v2-relevance.test.ts` if a new file is created, or `npx vitest run tests/unit/v2-core.test.ts` if tests are colocated.

## Step 2. Trace mapping without false provenance

### Target files

- `src/core/v2/trace.ts:20-76`
- `src/types/index.ts:97-110`, `206-209`
- `src/ui/v2/render.ts:73-80`
- `src/commands/v2/index.ts:175-183` only if JSON/text output adaptation is needed
- `tests/unit/v2-core.test.ts`
- `tests/e2e/v2-cli.test.ts`

### Implementation intent

1. Replace `createImplementationTrace()` lines 32-44 substring/all-files fallback with the shared relevance scorer.
2. For each confirmed decision:
   - compute changed-file matches from normalized `decision.appliesTo`
   - attach only matches with score `>= 0.7`
   - do not map the decision to all changed files when `appliesTo` misses
   - emit an unmapped/review item for threshold-miss or no-match decisions
3. Extend trace data shape in a backward-compatible way where possible:
   - existing `DecisionToCodeMap` may gain optional `score?: number`, `reason?: string`
   - `ImplementationTrace` may gain optional `unmappedDecisions?: [...]`
   - `mapTraceRow()` must default missing optional arrays/fields for old stored traces
4. Update `renderTrace()` to show:
   - changed files
   - `Decision → code map` with reason/score
   - `Unmapped decisions requiring review` with weak/no-match reasons
5. Ensure `trace --json` includes reason/score/unmapped fields so tests and downstream agents can inspect provenance.

### Verification for this step

- Unit regression: decision with wrong `appliesTo` is not attached to all changed files and appears in unmapped review.
- Unit regression: exact path and glob `appliesTo` are attached with expected score/reason.
- E2E regression: `trace --json` after confirmed decision and file change exposes `decisionToCodeMap[].reason` and/or `unmappedDecisions`.
- Run:
  - `npx vitest run tests/unit/v2-core.test.ts`
  - `npx vitest run tests/e2e/v2-cli.test.ts`

## Step 3. Graphify-aware context relevance and weak fallback demotion

### Target files

- `src/core/v2/context.ts:101-160`, `187-227`, `303-344`
- `src/core/v2/recall.ts:16-33` if recall result metadata/adapter is required
- `src/core/v2/remember.ts:115-163` only if graph export shape needs small compatibility adjustment
- `src/core/v2/paths.ts:29-39` if adding helper for `.decision/exports/graphify/decision-graph.json`
- `src/types/index.ts:153-163`, `211-215` if context/recall result types gain relevance metadata
- `tests/unit/v2-core.test.ts` or new focused context relevance tests

### Implementation intent

1. Add graph-reader helper that safely reads Graphify-like JSON from available locations:
   - current external graph path: `graphify-out/graph.json`
   - generated decision graph: `.decision/exports/graphify/decision-graph.json`
   - if absent or malformed, return no graph candidates without throwing the `context` command.
2. Interpret graph links conservatively:
   - `decision -> file` `APPLIES_TO` can produce a graph candidate for a changed/relevant file
   - trace `CHANGED_FILE` links and task/trace `TRACE_FOR` can support related file/module context
   - only explicit graph edges should receive `0.7`, reason `matched by graph edge`
3. Change `buildContextIndex()` candidate ordering:
   - Graphify graph candidates first when present
   - recent recall/prior memory candidates next, annotated as `matched by recall result`
   - appliesTo exact/glob/directory/symbol matches next
   - `findRelevantFiles()` keyword/tree walk remains fallback with weak metadata such as `{ reason: 'weak substring fallback', score: 0.3 }`
4. Keep current `GRAPHIFY_REPORT`/`GRAPHIFY_GRAPH` context items as evidence availability, but do not confuse artifact presence with a decision-file match.
5. Deduplicate context items by `sourceType + sourceRef`, preferring higher score/reason metadata.

### Verification for this step

- Unit fixture: graph JSON with a decision-file edge and no substring overlap still yields relevant context with reason `matched by graph edge`.
- Unit fixture: no graph JSON or invalid graph JSON does not make `buildContextIndex()` fail.
- Unit fixture: keyword/path fallback is marked weak and does not override stronger graph/appliesTo evidence.
- Run:
  - `npx vitest run tests/unit/v2-core.test.ts`

## Step 4. CLI rendering, exports, and backward compatibility polish

### Target files

- `src/ui/v2/render.ts:38-80`
- `src/core/v2/remember.ts:103-112`
- `src/core/v2/trace.ts:93-105`
- `tests/e2e/v2-cli.test.ts`

### Implementation intent

1. Make text output concise and stable:
   - use fixed reason strings from the relevance utility
   - include score only where helpful, e.g. `(score 0.85)`
   - ensure weak fallback is visibly separated from attached linked decisions
2. Update `renderContextPack()` to include item metadata reason/score when present without changing existing context sections radically.
3. Update `renderTraceMarkdown()` in `remember.ts` so exported implementation traces preserve reason/score and unmapped review decisions.
4. Ensure old traces decoded by `mapTraceRow()` still render without optional metadata.
5. Keep CLI command wrappers thin; business logic remains in core modules.

### Verification for this step

- E2E text or JSON assertion verifies reason strings appear.
- Export assertion verifies remembered trace markdown includes decision-to-code map reason or unmapped section if applicable.
- Run:
  - `npx vitest run tests/e2e/v2-cli.test.ts`

## Step 5. Full validation, sduck step completion, and review readiness

### Target files

- `.sduck/sduck-workspace/20260626-0313-feature-decision-trace-relevance/spec.md`
- `.sduck/sduck-workspace/20260626-0313-feature-decision-trace-relevance/review.md`

### Implementation intent

1. Run focused tests after each implementation step, then full relevant validation:
   - `npx vitest run tests/unit/v2-core.test.ts`
   - `npx vitest run tests/e2e/v2-cli.test.ts`
   - `npm run typecheck`
   - optionally `npm run test:unit` if changes are broader than v2 tests
2. After each implemented plan step, record progress with:
   - `npx sduck step done 1 20260626-0313-feature-decision-trace-relevance`
   - `npx sduck step done 2 20260626-0313-feature-decision-trace-relevance`
   - etc., using the actual step number immediately after completion.
3. Verify spec completion checklist:
   - `appliesTo` normalize and match score/reason implemented
   - exact/glob/direct child/Graphify/substr fallback score policy tested
   - threshold-miss decisions separated as unmapped/review
   - trace/context reason output verified
   - graph edge without substring verified
4. Read `.sduck/sduck-assets/eval/task.yml`, perform task self-evaluation, and write `review.md` with:
   - change summary
   - test results
   - task evaluation scores
   - any known follow-up limitations
5. Move to review-ready only after all plan steps and validation pass:
   - `npx sduck review ready 20260626-0313-feature-decision-trace-relevance`

### Verification for this step

- All focused tests pass.
- `npm run typecheck` passes.
- sduck task reaches `REVIEW_READY` only after review document and task eval are complete.

## Plan 자체 평가

`.sduck/sduck-assets/eval/plan.yml` 기준 자체 평가:

| 기준             | 점수(1-5) | 근거                                                                                                                                                        |
| ---------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| semantic_clarity | 5         | false provenance 제거, score/reason, unmapped 분리, Graphify relevance의 의미를 단계별로 분명히 정의했다.                                                   |
| abstraction      | 5         | relevance scoring을 공용 utility로 분리하고 trace/context/render/export는 각 역할에 맞게 제한했다.                                                          |
| typing           | 5         | `DecisionToCodeMap`, `ImplementationTrace`, `ContextPack`, `RecallResult`의 optional 확장과 old trace decode 기본값을 명시했다.                             |
| security         | 4         | path normalization과 project-root 내부 해석을 고려했고 파일 시스템 쓰기 대상이 아님을 전제로 했다. glob/path parsing edge case는 구현 중 테스트로 보강한다. |
| maintainability  | 5         | score 상수/reason 문자열/merge 규칙을 한 모듈에 모아 향후 threshold 조정과 테스트가 쉽도록 계획했다.                                                        |
| testability      | 5         | exact/glob/wrong appliesTo/graph edge/fallback/merge/e2e JSON 출력까지 검증 지점을 구체화했다.                                                              |

평균: 4.8 / 5
