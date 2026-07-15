# sduck Decision Briefing Rules

## Primary workflow: v2 `.decision` decision briefing

Use v2 unless `.sduck/sduck-state.yml` names an active legacy task.

1. Run `sduck work`, then `sduck context` before implementation.
2. Run `sduck grill-me` and follow the printed interview protocol before submitting the draft. New policy-required tasks must pass this gate before `submit` or `confirm`, including small work.
3. Record decisions/questions/evidence/scope with `sduck submit --stdin`; resolve questions with `sduck ask` and `sduck answer`.
4. Render and confirm the brief with `sduck brief` and `sduck confirm`.
5. Implement only after `sduck confirm` succeeds. Here “implement” means the development activity, not the legacy `sduck implement` command.
6. Record implementation with `sduck trace`, then make it reusable with `sduck remember` and searchable with `sduck recall`.
7. Finish with `sduck close` or `sduck abandon`.

The contract is `work -> context -> grill-me -> submit -> ask/answer -> brief/confirm -> implementation activity -> trace -> remember/recall -> close`.
For a small, obvious change, use one concise decision and no unnecessary questions. For a complex or ambiguous change, provide the full decision brief and explicit scope boundaries.

Canonical records are `.decision/exports/markdown/**` plus the tracked `.decision/policy.json` for new workspaces. `.decision/db.sqlite` is a local, ignored cache. User-global locale config is outside the repository and does not change these artifacts. Installed agent rules are canonical English regardless of user locale. CLI and CI validation are authoritative for sduck commands; agent hooks are convenience checks, not a security boundary and cannot block arbitrary editor or shell writes.

## Legacy SDD gated implementation rules

Apply this section only when `.sduck/sduck-state.yml` has a non-null `current_work_id`. Otherwise ignore all legacy approval rules.

- Read that task's `agent-context.json` and `meta.yml`; do not choose another task by directory order.
- Follow `spec -> approval -> plan -> approval -> implementation -> review ready -> done`.
- User approval is required for spec and plan. Implementation is allowed only in `IN_PROGRESS`.
- Record each real plan step with `sduck step done <N>`; the CLI validates step numbering and completion.
- Completion checkbox updates backed by actual verification are allowed during implementation/review.

Legacy commands: `sduck start`, `sduck fast-track`, `sduck spec approve`, `sduck plan approve`, `sduck step done`, `sduck review ready`, `sduck done`, `sduck use`, `sduck implement`, `sduck clean`, `sduck reopen`, `sduck archive`, `sduck update`, and targeted `sduck abandon <target>`.

## Agent skill

For codebase decision inventory requests, read `.sduck/sduck-assets/agent-rules/skills/sduck-codebase-decisions/SKILL.md`.
