# Plan: architecture deepening

## Implementation guardrails

- Current status: `SPEC_APPROVED`; Implementation starts only after explicit plan approval.
- Worktree for code work after plan approval: `.sduck-worktrees/20260507-0436-refactor-architecture-deepening`.
- Each Step completion must be recorded with `sduck step done <N>` or the local shipped command equivalent if global `sduck` remains unavailable.
- Use fixer after plan approval for bounded Implementation work, especially tests.
- Use oracle after large Implementation units to review Depth, Interface size, Seam quality, Locality, Leverage, and unchanged command behavior.
- Architecture vocabulary: Module, Interface, Implementation, Depth, Deep, Shallow, Seam, Adapter, Leverage, Locality.

## Step 1. 현재 SDD Interface와 reachability caveat를 regression tests로 고정

### Intent

Before changing any Implementation, pin current behavior and document the `src/cli.ts` v2-only caveat. This Step reduces risk for all later Deepening work.

### Target files

- Add `tests/unit/sdd-core-regression.test.ts`
- Add `tests/e2e/sdd-cli-reachability.test.ts`
- Inspect/update `tests/helpers/temp-workspace.ts:19-48`
- Inspect/update `tests/helpers/run-cli.ts:29-62`
- Inspect `src/cli.ts:35-153`
- Inspect `src/commands/*.ts`
- Inspect `package.json:15-24`

### Likely functions/sections to cover

- `src/core/start.ts:186-273` — `startTask`
- `src/core/spec-approve.ts:49-100` — `approveSpecs`
- `src/core/plan-approve.ts:77-193` — `approvePlans`
- `src/core/step.ts:80-153` — `markStepCompleted`
- `src/core/review-ready.ts:149-189` — `runReviewReadyWorkflow`
- `src/core/done.ts:206-296` — `runDoneWorkflow`
- `src/commands/start.ts:9-39` — `runStartCommand`
- `src/commands/spec-approve.ts:51-92` — `runSpecApproveCommand`
- `src/commands/plan-approve.ts:80-129` — `runPlanApproveCommand`
- `src/commands/step.ts:9-38` — `runStepCommand`
- `src/commands/review.ts:9-28` — `runReviewReadyCommand`
- `src/commands/done.ts:89-117` — `runDoneCommand`

### Concrete change intent

- Add unit regression for direct SDD core happy path using `startTask(..., { noGit: true })`.
- Assert creation/update of `meta.yml`, `spec.md`, `plan.md`, `.sduck/sduck-state.yml`, and `agent-context.json`.
- Add regression for `start → spec approve → plan approve → step done → review ready → done` using core functions or command wrappers, not the current v2-only CLI entrypoint.
- Add tests for current work state update/clear semantics.
- Add e2e reachability test proving current CLI entrypoint does not expose legacy SDD commands unless this is intentionally changed in a later Step.
- Keep existing v2 tests untouched except for helper reuse.

### Subagent split after approval

- fixer: create SDD core regression tests and helper fixtures.
- fixer: create CLI reachability e2e test and keep v2 behavior covered.

### Verification after Step

- `npm run test:unit`
- `npm run typecheck`
- Record completion: `sduck step done 1`

## Step 2. `meta.yml` ownership Module을 Deep하게 만든다

### Intent

Introduce a real `Task Meta Interface` as the first Seam. Move `meta.yml` parse/read/render/write/update ownership into one Deep Module and delete Shallow regex/string replacement duplication.

### Target files

- Add `src/core/task-meta.ts`
- Modify `src/core/workspace.ts:36-95`, `src/core/workspace.ts:96-224`
- Modify `src/core/start.ts:120-158`, `src/core/start.ts:235-246`
- Modify `src/core/spec-approve.ts:63-87`
- Modify `src/core/plan-approve.ts:113-176`
- Modify `src/core/step.ts:25-78`, `src/core/step.ts:110-136`
- Modify `src/core/review-ready.ts:161-180`
- Modify `src/core/done.ts:85-155`, `src/core/done.ts:227-237`
- Modify `src/core/reopen.ts:19-67`, `src/core/reopen.ts:208-221`
- Modify `src/core/abandon.ts:78-83`
- Modify `src/core/agent-context.ts:32-124`
- Add `tests/unit/task-meta.test.ts`

### Likely Interface shape

- `parseTaskMeta(content: string): TaskMeta`
- `renderTaskMeta(meta: TaskMeta): string`
- `readTaskMeta(taskPath: string): Promise<TaskMeta>`
- `writeTaskMeta(taskPath: string, meta: TaskMeta): Promise<void>`
- `patchTaskMeta(taskPath, mutator): Promise<TaskMeta>`
- `createInitialTaskMeta(input): TaskMeta`
- `approveSpecInMeta(meta, approvedAt): TaskMeta`
- `approvePlanInMeta(meta, approvedAt, totalSteps): TaskMeta`
- `completeStepInMeta(meta, stepNumber, currentDate): TaskMeta`
- `markDoneInMeta(meta, completedAt): TaskMeta`
- `reopenMeta(meta, currentDate): TaskMeta`

### Concrete change intent

- Move `renderInitialMeta` out of `src/core/start.ts` into `task-meta.ts` as typed initial meta creation/rendering.
- Replace `workspace.ts` regex parsing with `parseTaskMeta` and narrow `workspace.ts` to task listing.
- Replace duplicated step parsing in `step.ts`, `done.ts`, `review-ready.ts`, and `agent-context.ts` with typed `TaskMeta` access.
- Replace approval/timestamp/status partial string replacement with typed meta mutation and render.
- Preserve field names and serialized layout as closely as practical to reduce review noise.
- Ensure `null` branch/baseBranch/worktreePath and `completed_at` round-trip correctly.
- Keep lifecycle validity checks in existing files for this Step unless they are purely meta field updates; those rules move in Step 4.

### Tests

- `tests/unit/task-meta.test.ts`
  - parse/render round-trip for existing sample meta.
  - `null` handling for branch, baseBranch, worktreePath, approved_at, completed_at, steps.total.
  - approval block mutation.
  - steps empty/completed/invalid handling.
  - cycle insertion/update for reopen behavior.
  - completed_at set/reset behavior.
- Update Step 1 regression tests if imports moved.

### Deletion test

- No meta regex mutation outside `src/core/task-meta.ts` except tests.
- `src/core/start.ts` no longer owns `meta.yml` rendering.
- `src/core/agent-context.ts` no longer has duplicate approval/steps parsing.

### Subagent split after approval

- fixer: implement `task-meta.ts` and unit tests.
- fixer: migrate command core files to `TaskMeta` Interface in a bounded pass.

### Verification after Step

- `npm run test:unit`
- `npm run typecheck`
- Record completion: `sduck step done 2`

## Step 3. target-resolution Module을 Deep하게 만든다

### Intent

Centralize `[target]` semantics so id/slug/current work fallback/status filtering/ambiguity handling live in one obvious Module.

### Target files

- Add `src/core/task-target.ts`
- Modify `src/core/use.ts:4-37`
- Modify `src/core/spec-approve.ts:28-47`, `src/core/spec-approve.ts:103-122`
- Modify `src/core/plan-approve.ts:40-59`, `src/core/plan-approve.ts:195-214`
- Modify `src/core/review-ready.ts:76-147`
- Modify `src/core/done.ts:51-66`, `src/core/done.ts:298-331`
- Modify `src/core/reopen.ts:69-142`, `src/core/reopen.ts:249-255`
- Modify `src/core/abandon.ts:17-64`
- Modify `src/core/clean.ts:30-161`
- Add `tests/unit/task-target.test.ts`

### Likely Interface shape

- `resolveTaskTarget(projectRoot, options): Promise<WorkspaceTaskSummary>`
- `resolveTaskTargets(projectRoot, options): Promise<WorkspaceTaskSummary[]>`
- Options:
  - `target?: string`
  - `fallback: 'current' | 'all' | 'none'`
  - `allowedStatuses?: readonly TaskStatus[]`
  - `includeArchive?: boolean`
  - `cardinality: 'one' | 'many'`
  - `commandName: string`

### Concrete change intent

- Move exact id match, exact slug match, current work fallback, all-task fallback, status filtering, and ambiguity errors into `task-target.ts`.
- Let command-specific Modules keep only command wording/output formatting.
- `clean` keeps archive action logic, but archive-inclusive lookup moves to `task-target.ts`.
- `use` becomes a thin Adapter around target resolution plus current work state write.
- Preserve existing ambiguity behavior unless Step 1 regression exposes inconsistent behavior that must be documented in tests.

### Tests

- `tests/unit/task-target.test.ts`
  - id wins over slug.
  - duplicate slug ambiguity requires exact id.
  - current work fallback found/missing.
  - all fallback for multi-target commands.
  - status rejection for not-allowed task.
  - include archive for `clean` target lookup.
  - one vs many cardinality behavior.
- Add helper to create multiple task directories with controlled id/slug/status.

### Deletion test

- No id/slug matching Implementation outside `src/core/task-target.ts` except tests.
- No command-local current fallback logic outside `task-target.ts` except state Adapter calls.
- No duplicate ambiguity message construction outside `task-target.ts` unless command-specific wording is required.

### Subagent split after approval

- fixer: implement `task-target.ts` and unit tests.
- fixer: migrate SDD command core files to the new target Interface.

### Verification after Step

- `npm run test:unit`
- `npm run typecheck`
- Record completion: `sduck step done 3`

## Step 4. task lifecycle Module을 Deep하게 만든다

### Intent

Move status transition invariant, approval timestamp policy, step invariant, completed_at/updated_at policy, and transition-side agent-context refresh policy into one Deep lifecycle Module.

### Target files

- Add `src/core/task-lifecycle.ts`
- Modify `src/core/start.ts:186-273`
- Modify `src/core/spec-approve.ts:49-100`
- Modify `src/core/plan-approve.ts:77-193`
- Modify `src/core/step.ts:80-153`
- Modify `src/core/review-ready.ts:11-53`, `src/core/review-ready.ts:149-189`
- Modify `src/core/done.ts:103-168`, `src/core/done.ts:206-296`
- Modify `src/core/reopen.ts:201-247`
- Modify `src/core/abandon.ts:66-93`
- Modify `src/core/agent-context.ts` if refresh policy needs a single lifecycle call path
- Add `tests/unit/task-lifecycle.test.ts`

### Likely Interface shape

- `createTaskWorkspace(input): Promise<CreateTaskResult>`
- `approveSpec(taskRef, approvedAt): Promise<LifecycleResult>`
- `approvePlan(taskRef, approvedAt, totalSteps): Promise<LifecycleResult>`
- `completeStep(taskRef, stepNumber, currentDate): Promise<LifecycleResult>`
- `markReviewReady(taskRef, currentDate): Promise<LifecycleResult>`
- `markDone(taskRef, currentDate): Promise<LifecycleResult>`
- `reopenTask(taskRef, currentDate): Promise<LifecycleResult>`
- `abandonTask(taskRef, currentDate): Promise<LifecycleResult>`
- `assertTransition(currentStatus, event): void`

### Concrete change intent

- Keep Step count extraction from `plan.md` in `plan-approve.ts` unless it becomes clearly part of lifecycle invariant.
- Keep spec/review checklist parsing near current files unless lifecycle needs the resulting boolean facts.
- Move valid transition rules into `task-lifecycle.ts`:
  - `PENDING_SPEC_APPROVAL → SPEC_APPROVED`
  - `SPEC_APPROVED → IN_PROGRESS`
  - `IN_PROGRESS → REVIEW_READY`
  - `REVIEW_READY → DONE`
  - `REVIEW_READY → IN_PROGRESS` for reopen
  - `DONE → PENDING_SPEC_APPROVAL` reset path for reopen
  - active status abandon rules
- Ensure direct `IN_PROGRESS → DONE` remains impossible.
- Ensure step completion cannot exceed `steps.total` and cannot proceed before plan approval.
- Centralize transition-time `agent-context.json` refresh attempts.
- Keep existing command core files as Adapters around the lifecycle Interface.

### Tests

- `tests/unit/task-lifecycle.test.ts`
  - full valid transition table.
  - invalid direct done.
  - review-ready requires all steps complete.
  - done requires review-ready.
  - reopen from `REVIEW_READY` restores `IN_PROGRESS` with approvals preserved.
  - reopen from `DONE` resets cycle/approval/steps as current behavior expects.
  - abandon clears current work for active target.
  - agent-context refresh after lifecycle transition.

### Deletion test

- No command-local transition matrix outside `task-lifecycle.ts`.
- No command-local lifecycle timestamp policy outside `task-lifecycle.ts` or `task-meta.ts`.
- Command files should read as shallow Adapters, while `task-lifecycle.ts` has the Deep Implementation.

### Subagent split after approval

- fixer: implement lifecycle transition Module and tests.
- fixer: migrate lifecycle call sites after `task-meta` and `task-target` are stable.

### Verification after Step

- `npm run test:unit`
- `npm run typecheck`
- Record completion: `sduck step done 4`

## Step 5. CLI command runner Module을 reachability 판단에 따라 적용한다

### Intent

Reduce command wrapper Shallow repetition only where the Seam is real. Because `src/cli.ts` currently exposes v2-only commands, this Step is conditional: either apply the runner to maintained command Adapters or explicitly defer with tests documenting reachability.

### Target files

- Add `src/commands/runner.ts` if Step applies
- Modify any maintained legacy command wrapper among:
  - `src/commands/init.ts:12-16`, `src/commands/init.ts:32-66`, `src/commands/init.ts:100-125`
  - `src/commands/start.ts:3-39`
  - `src/commands/fast-track.ts:12-101`
  - `src/commands/spec-approve.ts:12-92`
  - `src/commands/plan-approve.ts:12-129`
  - `src/commands/done.ts:10-117`
  - `src/commands/archive.ts:10-76`
  - `src/commands/use.ts:3-28`
  - `src/commands/implement.ts:3-28`
  - `src/commands/reopen.ts:8-51`
  - `src/commands/clean.ts:3-43`
  - `src/commands/review.ts:3-28`
- Optionally inspect `src/commands/v2/index.ts:27-231` for a later/no-op decision
- Add `tests/unit/command-runner.test.ts` if runner is introduced

### Decision gate

- If Step 1 confirms legacy SDD command wrappers are intentionally retained as internal command Adapters, introduce `commands/runner.ts` and migrate repeated try/catch/result handling.
- If legacy SDD command wrappers are orphaned and not in scope for current behavior, do not create a hypothetical runner Seam for them. Document deferment in review notes and keep v2 behavior unchanged.
- Do not rewire `src/cli.ts` to expose legacy SDD commands unless plan execution reveals this is required by current repo intent and tests are added first.

### Likely Interface shape if applied

- `runCommand(handler, options): Promise<CommandResult>`
- `ok(stdout: string): CommandResult`
- `fail(stderr: string): CommandResult`
- `formatError(error, fallback): string`
- `renderTable(columns, rows): string`

### Concrete change intent if applied

- Replace repeated `CommandResult` declarations.
- Replace repeated `try/catch` blocks.
- Replace repeated table rendering helpers such as `padCell` and result table builders.
- Keep command-specific wording/output formatting local if it improves Locality.
- Keep v2 command behavior unchanged.

### Tests

- `tests/unit/command-runner.test.ts`
  - success result.
  - thrown `Error`.
  - unknown thrown value.
  - table rendering.
  - stdout/stderr/exitCode routing.
- Existing `tests/e2e/v2-cli.test.ts` must remain green.

### Deletion test

- If runner applies, no repeated command wrapper try/catch in migrated wrappers.
- If runner is deferred, no new Shallow pass-through Module is introduced.

### Subagent split after approval

- fixer: implement runner and migrate wrappers if decision gate passes.
- oracle: review whether runner is real Seam or hypothetical Seam before broad migration.

### Verification after Step

- `npm run test:unit`
- `npm run typecheck`
- Record completion: `sduck step done 5`

## Step 6. git/worktree resource Module을 Deep하게 만든다

### Intent

Create a worktree resource Module, not a broad generic Git Interface. Keep low-level git execution as an Adapter while moving branch naming, base branch detection, worktree path planning, `--no-git` null resource, cleanup policy, and merged/unmerged branch handling into one Deep Module.

### Target files

- Add `src/core/git-resource.ts`
- Modify `src/core/git.ts:3-57`
- Modify `src/core/start.ts:209-224`
- Modify `src/core/clean.ts:173-244`
- Modify `src/core/implement.ts:64-97`
- Modify `src/core/agent-context.ts:101-103`
- Modify `src/core/project-paths.ts:46-52`
- Add `tests/unit/git-resource.test.ts`
- Optionally update e2e tests if real git fixture is stable

### Likely Interface shape

- `allocateGitResource(projectRoot, taskId, type, slug, options): Promise<GitResourceDescriptor>`
- `cleanGitResource(projectRoot, descriptor, options): Promise<GitResourceCleanResult>`
- `describeGitResource(projectRoot, meta): GitResourceView`
- `GitCommandAdapter` injected into Implementation for tests

### Concrete change intent

- Move branch naming from `start.ts` into `git-resource.ts`.
- Move base branch detection and worktree path planning into `git-resource.ts`.
- Return a null/no-git descriptor for `--no-git` instead of spreading null handling.
- Move clean sequencing from `clean.ts` into `cleanGitResource`:
  - remove worktree if path exists.
  - check merged/unmerged branch status.
  - respect force cleanup policy.
  - return warnings/outcomes for command formatting.
- Keep `src/core/git.ts` as thin process Adapter unless merging improves Locality without creating a generic Seam.
- Keep `project-paths.ts` as path Adapter where appropriate; resource policy belongs in `git-resource.ts`.

### Tests

- `tests/unit/git-resource.test.ts`
  - no-git descriptor.
  - branch naming.
  - detached HEAD failure.
  - allocation failure rollback expectation.
  - clean merged branch.
  - clean unmerged branch without force.
  - clean unmerged branch with force.
  - missing worktree path warning behavior.
- Use fake Git Adapter; real git e2e only if stable.

### Deletion test

- No worktree cleanup sequencing outside `src/core/git-resource.ts`.
- No branch naming outside `git-resource.ts`.
- No command-local `--no-git` resource policy outside `git-resource.ts`.

### Subagent split after approval

- fixer: implement `git-resource.ts` and fake Adapter tests.
- fixer: migrate `start`, `clean`, `implement`, and `agent-context` call sites.

### Verification after Step

- `npm run test:unit`
- `npm run typecheck`
- Record completion: `sduck step done 6`

## Step 7. Full validation, oracle review, and review-ready 전환

### Intent

Validate the whole Deepening roadmap, review Module Depth, and only then move the SDD task to review-ready.

### Target files/areas for review

- `src/core/task-meta.ts` — `meta.yml` ownership Depth
- `src/core/task-target.ts` — target-resolution Locality
- `src/core/task-lifecycle.ts` — lifecycle transition Locality
- `src/core/git-resource.ts` — git/worktree resource Locality
- `src/commands/runner.ts` if introduced — command Adapter Leverage
- `src/cli.ts:35-153` — v2 reachability unchanged or explicit decision documented
- `tests/unit/*` and `tests/e2e/*` — regression coverage
- `.sduck/sduck-workspace/20260507-0436-refactor-architecture-deepening/review.md` if generated by review-ready workflow

### Oracle review checklist

- New Module is actually Deep, not just file movement.
- Interface is smaller and more stable than Implementation.
- Seam is real, not hypothetical.
- “One Adapter = hypothetical Seam. Two Adapters = real Seam.” principle is respected.
- Locality improved: each rule has one obvious Module.
- Leverage improved: common rule changes require one primary edit.
- Existing command behavior and v2 behavior remain unchanged.
- No broad generic Git Interface was introduced when a worktree resource Module was sufficient.
- CLI command runner was applied only if the Seam was real.

### Full validation commands

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run test`
- `npm run build`

### Task evaluation and SDD completion processing

- Read `.sduck/sduck-assets/eval/task.yml`.
- Evaluate the completed task against the task evaluation criteria.
- Show task eval results to the user.
- Record completion: `sduck step done 7`.
- Run `sduck review ready` or local shipped command equivalent.
- Do not run `sduck done`; user controls final completion after review-ready.
