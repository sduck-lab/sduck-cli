# Plan

## Step 1. Introduce a safe repo-local test workspace helper under a fixed project directory

- Add a dedicated project-local test workspace path such as `test/workspaces/cli-e2e` or a similarly isolated directory that is clearly outside `src/`, `tests/fixtures`, and production assets.
- Replace or extend `tests/helpers/temp-workspace.ts:1-11` with helper functions that (a) resolve the fixed workspace path inside the repo, (b) delete only that allowed path before each run, and (c) recreate it empty.
- Add explicit path guards in the helper so cleanup cannot accidentally remove arbitrary directories; the helper should reject paths outside the approved project-local test root.

## Step 2. Keep command execution pinned to the repo-local CLI, never the globally installed binary

- Refine `tests/helpers/run-cli.ts:15-48` so the helper name and implementation make it explicit that tests execute the current repository CLI entry (`node_modules/.bin/tsx` + `src/cli.ts`, or a repo-local built entry if we intentionally switch later).
- Add helper-level assertions or structure so tests cannot silently fall back to a globally installed `sduck` on `PATH`.
- Ensure the command helper still accepts the fixed workspace directory as `cwd` while always sourcing the executable from the current repo root.

## Step 3. Migrate representative e2e flows to the fixed cleaned workspace

- Update `tests/e2e/init.test.ts:8-112` to stop using `createTempWorkspace()` and instead prepare the fixed repo-local workspace before each case, then verify real generated files under that directory.
- Apply the same pattern to at least one additional command flow after init, prioritizing the most file-system-heavy workflows such as `tests/e2e/start.test.ts`, `tests/e2e/spec-approve.test.ts`, or `tests/e2e/plan-approve.test.ts`.
- In each migrated test, assert not only stdout/stderr but also concrete file creation, file replacement, and workspace state under the fixed directory after the command runs.

## Step 4. Verify repeatability, isolation, and safety of the new testing approach

- Run the affected e2e suite repeatedly to confirm each test starts from a clean workspace and does not depend on leftovers from prior runs.
- Run `npm run typecheck` and the relevant e2e commands to verify helper refactors do not break typing or command execution.
- Manually inspect the fixed test directory after runs to confirm only the intended project-local workspace is touched and no global `sduck` installation is involved.
