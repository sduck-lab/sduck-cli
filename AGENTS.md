<!-- sduck:begin -->

# sduck managed rules

Selected agents: Codex

Use v2 `.decision` briefing as the default workflow. Legacy SDD gates apply only when `current_work_id` is non-null.

Canonical v2 sequence: `sduck work` → `sduck context` → `sduck grill complete --reason "..."` → `sduck submit --stdin` → `sduck ask`/`sduck answer` → `sduck brief`/`sduck confirm` → implementation activity → `sduck trace` → `sduck evaluate` → `sduck remember`/`sduck recall` → `sduck close`.

New policy-required tasks must record `sduck grill complete --reason "..."` before `submit` or `confirm`, including small work. `sduck grill-me` is only a compatibility prompt/start command. Keep small-work drafts concise; do not skip the gate. Installed rules are canonical English and do not depend on user locale. There is no built-in CI trace verifier; run project checks separately and record outcomes with `sduck evaluate`.

## Codex Instructions

- Read `AGENTS.md` as the project instruction file.
- Use the CLI for lifecycle changes; do not hand-edit state or cache files.
- Keep evidence and source references concrete and concise.

# sduck Decision Briefing Rules

## Primary workflow: v2 `.decision` decision briefing

Use v2 unless `.sduck/sduck-state.yml` names an active legacy task.

1. Run `sduck work`, then `sduck context` before implementation.
2. Follow the printed interview protocol and record completion with `sduck grill complete --reason "..."` before submitting the draft. New policy-required tasks must pass this gate before `submit` or `confirm`, including small work. `sduck grill-me` is only a compatibility prompt/start command.
3. Record decisions/questions/evidence/scope with `sduck submit --stdin`; resolve questions with `sduck ask` and `sduck answer`.
4. Render and confirm the brief with `sduck brief` and `sduck confirm`.
5. Implement only after `sduck confirm` succeeds. Here “implement” means the development activity, not the legacy `sduck implement` command.
6. Record implementation with `sduck trace`, record validation or limitations with `sduck evaluate`, then make it reusable with `sduck remember` and searchable with `sduck recall`.
7. Finish with `sduck close` or `sduck abandon`.

The contract is `work -> context -> grill complete -> submit -> ask/answer -> brief/confirm -> implementation activity -> trace -> evaluate -> remember/recall -> close`.
For a small, obvious change, use one concise decision and no unnecessary questions. For a complex or ambiguous change, provide the full decision brief and explicit scope boundaries.

Canonical records are `.decision/exports/markdown/**` plus the tracked `.decision/policy.json` for new workspaces. `.decision/db.sqlite` is a local, ignored cache. User-global locale config is outside the repository and does not change these artifacts. Installed agent rules are canonical English regardless of user locale. The CLI records workflow evidence but does not include a built-in CI trace verifier; run project checks separately and record outcomes with `sduck evaluate`. Agent hooks are convenience checks, not a security boundary and cannot block arbitrary editor or shell writes.

## Best-effort retrospective marker

At the beginning of each response, and immediately after any commit you perform, check Git's local `sduck-retrospective-pending.json` path with `git rev-parse --git-path sduck-retrospective-pending.json`. If the marker exists, read `.sduck/sduck-assets/agent-rules/skills/sduck-retrospective-capture/SKILL.md` before continuing.

The installed Git post-commit hook reads only `.decision/policy.json` to decide whether to no-op, then writes a compact local marker with `commitSha`, `parentSha`, and `createdAt` only when workflow creation is disabled. It never inspects source content and never runs sduck, an LLM, or a network request. If an external commit creates the marker, the next active agent response handles it on a best-effort basis; do not promise that a Git hook runs an LLM.

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
For retrospective post-hoc decision capture after code changed without sduck beforehand, read `.sduck/sduck-assets/agent-rules/skills/sduck-retrospective-capture/SKILL.md`.
<!-- sduck:end -->
