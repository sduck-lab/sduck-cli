# Plan

## Step 1. Introduce shared `.sduck` path helpers and move init asset targets under the hidden home

- Add or extract a shared path helper module in `src/core/` that computes `.sduck/`, `.sduck/sduck-assets/`, and `.sduck/sduck-workspace/` from `projectRoot`, instead of hardcoding root-level folder names in multiple files.
- Update `src/core/init.ts:94-124` so `ASSET_TEMPLATE_DEFINITIONS` target `.sduck/sduck-assets/...` rather than `.sduck/sduck-assets/...`, and update `src/core/init.ts:269-289` so root directory creation tracks `.sduck/`, `.sduck/sduck-assets/`, and `.sduck/sduck-workspace/` correctly.
- Adjust `src/core/init.ts:315-324` and related asset copy logic so bundled assets still read from the existing package asset source but write into the hidden destination structure.

## Step 2. Update workflow commands to read and write `.sduck/sduck-workspace`

- Inspect `src/core/start.ts` and `src/commands/start.ts:15-24` so newly created task directories now live under `.sduck/sduck-workspace/...` and the printed path reflects that exact location.
- Inspect the task discovery and meta update flows used by `src/commands/spec-approve.ts:51-84` and `src/commands/plan-approve.ts:80-121`, plus their core modules, so they search under `.sduck/sduck-workspace/` instead of the old root path.
- Keep agent rule root files (`CLAUDE.md`, `AGENT.md`, `GEMINI.md`, `.cursor/...`, `.agents/...`) at their existing repository locations unless a specific command currently derives them from the old workspace path by mistake.

## Step 3. Update docs, messages, and test expectations to the hidden home structure

- Update CLI-facing messages in `src/commands/init.ts`, `src/commands/start.ts`, and any approval output paths so users consistently see `.sduck/...` in summaries and generated-path messages.
- Update `CLAUDE.md`, `AGENT.md`, and bundled agent rule content under `.sduck/sduck-assets/agent-rules/` so all workflow instructions reference `.sduck/sduck-workspace/` and `.sduck/sduck-assets/` instead of the old root-level folders.
- Update unit/e2e expectations in files like `tests/e2e/init.test.ts:18-111`, `tests/e2e/start.test.ts:25-107`, and the approval tests so all filesystem assertions point to `.sduck/...` and no stale root-level path strings remain.

## Step 4. Re-run the full workflow test matrix against the new hidden-home layout

- Run unit tests covering path-sensitive logic and the full E2E command matrix (`init`, `init --agents`, `start`, `spec approve`, `plan approve`, `preview`) after the migration.
- Run `npm run typecheck` and `npm run build` to confirm the path refactor does not break typing or bundling.
- Manually verify a real command run in a clean workspace creates `.sduck/sduck-assets/` and `.sduck/sduck-workspace/` and no new root-level `.sduck/sduck-assets/` or `.sduck/sduck-workspace/` directories are produced.
