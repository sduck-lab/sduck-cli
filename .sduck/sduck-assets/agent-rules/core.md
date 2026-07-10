# sduck Decision Briefing Rules

## Primary workflow: v2 `.decision` decision briefing

Use v2 unless `.sduck/sduck-state.yml` names an active legacy task.

1. Run `sduck status` and `sduck context` before implementation.
2. Record decisions/questions with `sduck submit --stdin`; resolve questions with `sduck answer`.
3. Implement only after `sduck confirm` succeeds.
4. Record implementation with `sduck trace`, then make it reusable with `sduck remember`.
5. Finish with `sduck close` or `sduck abandon`.

The contract is `context -> decision/question -> confirmed brief -> implementation trace -> recall`.
For a small, obvious change, use one concise decision and no unnecessary questions. For a complex or ambiguous change, provide the full decision brief and explicit scope boundaries.

Canonical records are `.decision/exports/markdown/**`. `.decision/db.sqlite` is a local, ignored cache. CLI and CI validation are authoritative; agent hooks are convenience checks, not a security boundary.

## Legacy SDD gated implementation rules

Apply this section only when `.sduck/sduck-state.yml` has a non-null `current_work_id`. Otherwise ignore all legacy approval rules.

- Read that task's `agent-context.json` and `meta.yml`; do not choose another task by directory order.
- Follow `spec -> approval -> plan -> approval -> implementation -> review ready -> done`.
- User approval is required for spec and plan. Implementation is allowed only in `IN_PROGRESS`.
- Record each real plan step with `sduck step done <N>`; the CLI validates step numbering and completion.
- Completion checkbox updates backed by actual verification are allowed during implementation/review.

Legacy commands: `sduck start`, `sduck fast-track`, `sduck spec approve`, `sduck plan approve`, `sduck step done`, `sduck review ready`, `sduck done`, `sduck reopen`, `sduck use`, `sduck abandon`, `sduck clean`, `sduck archive`.

## Agent skill

For codebase decision inventory requests, read `.sduck/sduck-assets/agent-rules/skills/sduck-codebase-decisions/SKILL.md`.
