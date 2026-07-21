<!-- sduck:begin -->

# sduck managed rules

Selected agents: Claude Code

Use v2 `.decision` briefing as the default workflow. Legacy SDD gates apply only when `current_work_id` is non-null.

## Claude Code Instructions

- Read `CLAUDE.md` as the project instruction file.
- Use the CLI for lifecycle changes; do not hand-edit state or cache files.
- The installed hook is advisory; CLI and CI checks are authoritative.

# sduck Decision Briefing Rules

## Primary workflow: v2 `.decision` decision briefing

Use v2 unless `.sduck/sduck-state.yml` names an active legacy task.

1. Run `sduck status` and `sduck context` before implementation.
2. Follow the printed interview protocol and record completion with `sduck grill complete --reason "..."` before submitting the draft.
3. Record decisions/questions with `sduck submit --stdin`; resolve questions with `sduck answer`.
4. Render `sduck brief` and proceed only after `sduck confirm` succeeds.
5. Record implementation with `sduck trace`, record validation or limitations with `sduck evaluate`, then make it reusable with `sduck remember`.
6. Finish with `sduck close` or `sduck abandon`.

The contract is `context -> grill complete -> decision/question -> brief/confirm -> implementation trace -> evaluate -> remember/recall -> close`.
For small changes, use one concise decision and no unnecessary questions. For complex changes, provide the full brief and explicit scope boundaries.

Canonical records are `.decision/exports/markdown/**`. The SQLite DB is an ignored cache. The CLI records workflow evidence but has no built-in CI trace verifier; run checks separately and record outcomes with `sduck evaluate`. Hooks are convenience checks, not a security boundary.

## Legacy SDD gated implementation rules

Apply this section only when `.sduck/sduck-state.yml` has a non-null `current_work_id`.

- Read that task's `agent-context.json` and `meta.yml`; do not select a task by directory order.
- Follow `spec -> approval -> plan -> approval -> implementation -> review ready -> done`.
- User approval is required for spec and plan; implementation is allowed only in `IN_PROGRESS`.
- Completion checkbox updates backed by verification are allowed during implementation/review.

For decision inventory requests, read `.sduck/sduck-assets/agent-rules/skills/sduck-codebase-decisions/SKILL.md`.
For retrospective post-hoc decision capture after code changed without sduck beforehand, read `.sduck/sduck-assets/agent-rules/skills/sduck-retrospective-capture/SKILL.md`.

<!-- sduck:end -->
