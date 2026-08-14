---
name: sduck-retrospective-capture
description: Records post-hoc sduck decisions for code already changed without a prior decision brief. Use when work happened first and the user wants a concise, privacy-preserving retrospective decision record linked to an explicit Git base/range.
---

# Retrospective Decision Capture

Use this skill only for code already changed without sduck beforehand. It records rationale summaries, not full transcripts. Evaluation records checks performed and limitations; it does not run commands.

## Disabled-workflow marker automation

When the normal workflow is disabled and Git's local `sduck-retrospective-pending.json` marker exists, handle it immediately on a best-effort basis. Derive the marker path with `git rev-parse --git-path sduck-retrospective-pending.json`, read its `commitSha` and nullable `parentSha`, and inspect the `parent..commit` diff. Build a concise `SduckDraft` from the current handoff plus that diff, then submit it through the dedicated disabled-workflow path: `sduck retrospective capture --stdin`.

- The hook that creates the marker reads only `.decision/policy.json` to decide whether to no-op. It never inspects source content and never runs `sduck`, an LLM, or a network request.
- Hook installation is absent-path only: existing post-commit hooks are preserved, including with force. If automation is unavailable, disabled mode remains advisory and capture requires an explicit Git range.
- Enabled workflow mode makes the hook no-op. `sduck workflow enable` rejects a pending marker until it is handled or cleared.
- Do not run or mention `sduck work` for this disabled automation path.
- Use `EXPLICIT` only when corroborated by user statements or durable source references; otherwise use `INFERRED` or `OPEN`.
- Never store transcript text. Summarize the current handoff and use file/diff references instead.
- After a successful `sduck retrospective capture --stdin`, confirm the marker has been cleared before moving on. If it remains, report that cleanup is still pending.
- This is best-effort handling by the next active agent response, including after a commit you perform; do not imply that the Git hook runs an LLM.

## Required boundaries

- Ask the active LLM for a concise current-conversation handoff: decisions made, rationale, rejected alternatives, risks, verification, and files touched.
- Do not ask users to paste or upload transcripts. Do not scrape chat logs, call provider APIs, or store full conversation text.
- Require an explicit Git base or range before tracing, for example `main`, `HEAD~1`, or `origin/main...HEAD`.
- Inspect `git status` and the chosen diff/range before drafting. Record changed files and source refs; avoid secrets and large excerpts.
- Explain that `sduck trace --base <ref>` overrides the confirm baseline and records changed files, not proof of rationale.

## Quick start

```bash
sduck work "Retrospective decision capture"
sduck context
sduck grill complete --reason "Retrospective capture based on current conversation handoff and explicit Git range."
git status --short
git diff --stat <base>
sduck submit --stdin < draft.md
sduck brief
sduck confirm
sduck trace --base <base>
sduck evaluate --check "retrospective review=completed" --limitation "No automated checks were run"
sduck remember
sduck close
```

## Workflow

1. Confirm the user wants retrospective capture for already-changed code, not a new implementation task.
2. Ask for an explicit Git base/range if absent; do not guess silently.
3. Request a concise handoff from the active LLM in the current conversation, not external logs.
4. Run `sduck work "Retrospective decision capture"` if no suitable task exists, then `sduck context`.
5. Run `git status --short` and inspect the chosen diff, such as `git diff --stat <base>` and targeted file diffs.
6. Run `sduck grill complete --reason "..."` after the handoff and Git range are understood.
7. Draft decisions with concise rationale, alternatives, affected files, risks, and verification limits.
8. Submit with `sduck submit --stdin`, render `sduck brief`, and confirm with the user using `sduck confirm`.
9. Run `sduck trace --base <ref>` using the explicit base/range; state that it records changed files and overrides the confirm baseline.
10. Run `sduck evaluate --check "retrospective review=completed" --limitation "No automated checks were run"` or equivalent executable checks/limitations syntax, then `sduck remember` and `sduck close`.

## Draft focus

- Use `EXPLICIT` only when the rationale is corroborated by a user statement or durable source; an active LLM handoff alone is not enough.
- Classify handoff-only rationale as `INFERRED` with conservative confidence, or create an `OPEN` question when evidence is insufficient.
- Use `INFERRED` for rationale supported by changed code, tests, docs, or current-conversation handoff without durable corroboration.
- Mark unresolved or conflicting rationale as `OPEN` or `CONFLICT` instead of inventing certainty.
- Keep evidence to summaries and `path:line` refs where possible.
