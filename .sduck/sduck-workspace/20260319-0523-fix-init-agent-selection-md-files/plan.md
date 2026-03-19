# Plan

## Step 1. Document the detailed planning rule in project instruction docs

- Update `CLAUDE.md:306` section `plan.md 작성 규칙` to require each step to list exact target files, expected line or section ranges, and the intended code/document changes.
- Update `AGENT.md` in the matching plan-writing section with the same requirement so both root instruction documents stay aligned.
- Keep the rule explicit that plans should mention concrete commands or verification scope when relevant, instead of broad implementation-only bullets.

## Step 2. Trace the interactive init selection path and pinpoint the break

- Inspect `src/commands/init.ts:58` `resolveSelectedAgents` to verify how the checkbox result is returned in TTY mode and whether normalization is missing before `runInitCommand` builds `resolvedOptions` at `src/commands/init.ts:79`.
- Inspect `src/core/init.ts:208` `resolveInitOptions` and `src/core/init.ts:327` agent target resolution to confirm whether selected agent ids are deduplicated correctly but later narrowed, dropped, or reordered in a way that affects root markdown outputs.
- If needed, inspect the agent target mapping source used by `listAgentRuleTargets` and `planAgentRuleActions` to identify whether `.md` root targets for `claude-code`, `codex`/`opencode`, and `gemini-cli` are missing from the generated action set.

## Step 3. Fix selected-agent propagation and root markdown generation

- Modify `src/commands/init.ts:58-72` so interactive multi-select output is normalized in the same shape as `--agents`, with no accidental empty result or single-value collapse.
- Modify `src/core/init.ts:327-346` and, if required, the underlying agent rule target mapping file, so selected markdown-backed agents always produce actions for `CLAUDE.md`, `AGENT.md`, and `GEMINI.md` when those agents are selected.
- Verify `src/core/init.ts:357-404` still applies `create`, `prepend`, `replace-block`, and `keep` modes correctly for the root markdown files after the selection fix.

## Step 4. Align bundled agent-rules content with current docs and shipped CLI commands

- Update `.sduck/sduck-assets/agent-rules/core.md` so the shared workflow text mentions the currently implemented CLI flow using `sduck init`, `sduck start <type> <slug>`, `sduck spec approve [target]`, and `sduck plan approve [target]`.
- Update `.sduck/sduck-assets/agent-rules/claude-code.md` so generated `CLAUDE.md` content reflects the stricter planning requirement and references `CLAUDE.md` as the project-level instruction source.
- Update `.sduck/sduck-assets/agent-rules/codex.md`, `.sduck/sduck-assets/agent-rules/opencode.md`, and `.sduck/sduck-assets/agent-rules/gemini-cli.md` so generated content aligns with `AGENT.md` conventions, uses the actual shipped command names from `src/cli.ts:20-123`, and avoids referencing commands not yet implemented.

## Step 5. Add regression coverage for interactive selection and generated content

- Extend `tests/e2e/init-agent-rules.test.ts:18-43` or add a nearby case that drives the interactive selection path and asserts that multiple markdown-backed agents produce all expected root files.
- Add assertions in `tests/e2e/init-agent-rules.test.ts` for generated content snippets that mention the real commands `init`, `start`, `spec approve`, and `plan approve`, plus the detailed planning expectation.
- Update `tests/e2e/init.test.ts` only if needed to keep baseline init expectations correct after the rule-content changes.

## Step 6. Run focused verification and record regression status

- Run the init-related test suite covering `tests/e2e/init.test.ts`, `tests/e2e/init-agent-rules.test.ts`, and any impacted unit tests around init planning.
- Confirm non-interactive `--agents` behavior still passes, and verify safe/force behavior for managed markdown rule files remains unchanged except for the intended content updates.
