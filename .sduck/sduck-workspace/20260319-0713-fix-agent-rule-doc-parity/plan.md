# Plan

## Step 1. Extract the minimum workflow contract from the current root docs

- Review `AGENT.md:1-437` and identify the sections that must be preserved in generated agent docs for workflow correctness, especially: absolute approval rules, directory structure under `.sduck/`, session start checks, memo handling, workflow stage order, spec/plan approval behavior, detailed `plan.md` writing rules, and completion/task-evaluation rules.
- Review `CLAUDE.md:1-460` and capture Claude-specific differences that should remain unique to `CLAUDE.md` generation, while keeping the shared workflow body as close as possible to the root doc.
- Write down the exact headings and key paragraphs to mirror so the generated files become structurally close to the root docs rather than a short checklist.

## Step 2. Expand shared and per-agent rule assets to mirror the root docs closely

- Rewrite `.sduck/sduck-assets/agent-rules/core.md:1-13` from a short bullet summary into a fuller shared workflow body covering `.sduck` paths, approval constraints, workflow ordering, memo rules, evaluation files, and completion conditions.
- Rewrite `.sduck/sduck-assets/agent-rules/codex.md:1-6` and `.sduck/sduck-assets/agent-rules/opencode.md:1-6` so generated `AGENT.md` content is as close as practical to `AGENT.md`, including the project intro, actor wording, and the stronger workflow instructions instead of a minimal stub.
- Rewrite `.sduck/sduck-assets/agent-rules/claude-code.md:1-5` and `.sduck/sduck-assets/agent-rules/gemini-cli.md:1-6` with the same approach so generated `CLAUDE.md` and `GEMINI.md` inherit the fuller workflow guidance, but keep agent-specific identity lines (`Claude`, `Gemini`, etc.) accurate.

## Step 3. Adjust agent rule rendering so the richer templates compose cleanly

- Inspect `src/core/agent-rules.ts:154-235`, especially `buildRootFileLines` and `renderAgentRuleContent`, to confirm the richer per-agent assets and shared workflow block can be combined without duplicating or mangling headings.
- If the current rendering approach prepends labels or wrappers that would make the fuller docs awkward, update that composition logic so the final generated root files read naturally and remain close to the current root `AGENT.md` / `CLAUDE.md` structure.
- Preserve the existing merge behavior for root files and managed files while ensuring the richer content still works with `create`, `prepend`, `replace-block`, and managed-file generation.

## Step 4. Add content-focused regression checks for generated docs

- Extend `tests/unit/agent-rules.test.ts` so rendered agent rule content is asserted against key workflow phrases taken from the root docs, including `.sduck/sduck-workspace/`, explicit spec/plan approval restrictions, and detailed plan-writing guidance.
- Extend `tests/e2e/init-agent-rules.test.ts` so `sduck init --agents ...` verifies generated `AGENT.md`, `CLAUDE.md`, and `GEMINI.md` contain the richer workflow sections instead of only a few short lines.
- Keep assertions specific enough to catch regressions in workflow fidelity, not just command-name presence.

## Step 5. Run full validation and compare generated docs against the root references

- Run the focused agent-rule unit/e2e tests after the rewrite, then run `npm run typecheck` and `npm run build` to ensure rendering changes do not break generation.
- Manually compare one freshly generated `AGENT.md` and `CLAUDE.md` against the root `AGENT.md` / `CLAUDE.md` to confirm the generated docs are now "almost the same" in structure and workflow clarity.
- Verify the generated content still reads naturally for each tool and does not accidentally copy the wrong agent name or project-level instruction reference.
