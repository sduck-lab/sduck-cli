# Plan

## Step 1. Standardize all E2E workspace setup on the repo-local real workspace helper

- Replace lingering `createTempWorkspace()` / `removeTempWorkspace()` usage in `tests/e2e/init-agent-rules.test.ts:18-113` and `tests/e2e/cli-preview.test.ts:19-45` with fixed repo-local workspace preparation via `prepareProjectWorkspace()` / `removeProjectWorkspace()`.
- Keep `tests/helpers/temp-workspace.ts:19-48` as the single source for safe cleanup, and only retain the temp-style wrapper exports if older tests still need them during migration.
- Assign stable workspace names per command suite, e.g. `init-agent-rules-e2e`, `cli-preview-e2e`, so repeated runs always start from a known cleaned directory.

## Step 2. Expand agent-tool coverage into one real CLI init test that exercises the full supported set

- Update `tests/e2e/init-agent-rules.test.ts:18-52` so the main agent generation case runs in a fixed repo-local workspace and uses one `init --agents ...` command that includes the full supported set: `claude-code,codex,opencode,gemini-cli,cursor,antigravity`.
- In that same test, assert concrete creation of `CLAUDE.md`, `AGENT.md`, `GEMINI.md`, `.cursor/rules/sduck-core.mdc`, and `.agents/rules/sduck-core.md`, plus verify the combined root-file content still represents the shared target behavior for `codex` and `opencode`.
- Keep follow-up safe/force tests for root-file and managed-file merge behavior, but migrate them to the same repo-local workspace strategy so agent flows are fully covered by real command execution.

## Step 3. Convert the remaining major command suites to the same real CLI pattern

- Review every file under `tests/e2e/` and migrate any remaining suite that still uses temp-style workspace setup so all major commands (`preview`, `init`, `start`, `spec approve`, `plan approve`, and agent-rule init) share the repo-local cleaned workspace convention.
- For `tests/e2e/cli-preview.test.ts:19-45`, ensure the command still runs the repo-local CLI while the workspace setup remains explicit and isolated even if the command itself does not create many files.
- Preserve strong filesystem assertions in each suite so the tests continue checking generated directories, task files, and rule files rather than only command output text.

## Step 4. Re-run the full real CLI command matrix and verify repeatability

- Run the relevant unit coverage for workspace helpers plus the full E2E suite after migration, not just a subset, to confirm all major commands still pass with the cleaned repo-local workspace model.
- Run `npm run typecheck` and `npm run build` after the test refactor so helper changes do not introduce type or bundling regressions.
- Manually inspect `test/workspaces/` after the suite to confirm each command group uses only the intended repo-local directories and that rerunning the same tests produces fresh outputs without leftovers.
