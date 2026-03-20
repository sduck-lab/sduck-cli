# Plan

## Step 1. Reproduce the type mismatch across typecheck and build outputs

- Run `npm run typecheck` and `npm run build` against the current tree to confirm whether the `TS2339` error appears in one environment only.
- Inspect `src/commands/init.ts:39-46` where `formatResult` reads `result.agents` and compare that usage to `src/core/init.ts:87-92` where `InitExecutionResult` is declared.
- If the error appears only in editor/build cache scenarios, inspect generated declarations under `dist/` to see whether an older `InitExecutionResult` shape is leaking into module resolution.

## Step 2. Align the exported init result type with its consumer

- Update `src/core/init.ts:87-92` if needed so `InitExecutionResult` exposes `agents` with the most precise stable type for the returned `resolvedOptions.agents` data.
- Update `src/commands/init.ts:39-46` and the import block at `src/commands/init.ts:3-9` if the consumer should depend on a narrower or locally derived result type instead of a stale named export path.
- Keep the runtime return object in `src/core/init.ts:348-354` structurally identical to the exported type so the compile-time and runtime shapes stay synchronized.

## Step 3. Add a regression test that exercises the typed agents output path

- Extend `tests/unit/init.test.ts` or add a nearby unit test to cover the init execution result shape if there is a direct helper-level seam.
- If the most reliable protection is end-to-end, extend `tests/e2e/init-agent-rules.test.ts` to assert the selected agents output path that depends on `result.agents` remains present.
- Ensure the regression coverage would fail if the `agents` field disappears from the exported result type or runtime object.

## Step 4. Verify typecheck, build, and init behavior together

- Run `npm run typecheck` after the fix to verify the TS2339 path is resolved.
- Run `npm run build` to verify emitted declarations and bundled output stay consistent.
- Run the focused init-related unit/e2e tests to confirm selected agent output and init summaries still work as before.
