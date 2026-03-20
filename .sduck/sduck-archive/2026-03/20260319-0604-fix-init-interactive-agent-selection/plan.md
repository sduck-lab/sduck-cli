# Plan

## Step 1. Make the interactive init prompt explicit and reject empty selection

- Update `src/commands/init.ts:70-85` inside `resolveSelectedAgents` so the interactive prompt message explicitly explains the control model, e.g. `space` to toggle and `enter` to submit.
- Use the built-in checkbox options confirmed in `node_modules/@inquirer/checkbox/dist/esm/index.d.ts:42-53` and `node_modules/@inquirer/checkbox/README.md:76-85`, specifically `required` and/or `validate`, so submitting with zero selected agents is not silently accepted.
- Return a clear retry message like `Select at least one agent. Use space to toggle and enter to submit.` instead of letting init continue with an empty agent list.
- Keep the non-interactive branch at `src/commands/init.ts:71-75` unchanged so `--agents` behavior remains backward compatible.

## Step 2. Verify selected agents still propagate into rule generation correctly

- Review `src/core/init.ts:327-346` to confirm the only reason rule files are skipped is `resolvedOptions.agents.length === 0`, not a second bug in `listAgentRuleTargets` or `applyAgentRuleActions`.
- Review `src/core/agent-rules.ts:45-60` and `src/core/agent-rules.ts:171-199` to ensure mixed selections still map to `CLAUDE.md`, `AGENT.md`, `GEMINI.md`, and managed files once the prompt returns a non-empty agent list.
- If any empty-selection-specific warning should be surfaced in init output, keep it localized to the command layer rather than weakening the core rule generation path.

## Step 3. Add interactive test coverage instead of only `--agents` coverage

- Extend `tests/helpers/run-cli.ts:15-48` or add a sibling helper so tests can execute the CLI in a pseudo-interactive way with controlled stdin/TTY-like input for the checkbox flow; if full TTY emulation is too brittle, isolate prompt config construction into a helper that can be unit tested directly.
- Add an e2e or unit-backed case that covers submitting with no selected agents and asserts the CLI does not proceed silently.
- Add or extend another case for successful multi-select submission and assert that `CLAUDE.md`, `AGENT.md`, `GEMINI.md`, and managed files are all generated from the interactive path or from the exact prompt result consumed by the interactive path, not just the `--agents` path.

## Step 4. Run focused verification for prompt UX, rule generation, and regressions

- Run init-focused unit/e2e tests after the change, especially `tests/e2e/init-agent-rules.test.ts` and any helper-level tests added for interactive execution.
- Run `npm run typecheck` and `npm run build` to ensure prompt validation changes and test harness updates do not break bundling or types.
- Manually verify the resulting CLI text is understandable: users should see how to select items, and they should get a clear message when they try to submit with nothing selected.
