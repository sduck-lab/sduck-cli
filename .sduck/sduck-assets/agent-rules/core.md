# sduck Decision Briefing Rules

## Primary workflow: v2 `.decision` decision briefing

Use v2 unless `.sduck/sduck-state.yml` names an active legacy task.

1. Run `sduck work` (optionally `sduck work --record-depth FULL|LIGHTWEIGHT`), then `sduck context` before implementation.
2. Follow the printed interview protocol and record completion with `sduck grill complete --reason "..."` before submitting the draft. New policy-required tasks must pass this gate before `submit` or `confirm`, including small work. `sduck grill-me` is only a compatibility prompt/start command.
3. Record decisions/questions/evidence/scope with `sduck submit --stdin`; resolve questions with `sduck ask` and `sduck answer`.
4. Render and confirm the brief with `sduck brief` and `sduck confirm`.
5. Implement only after `sduck confirm` succeeds. Here “implement” means the development activity, not the legacy `sduck implement` command.
6. Record implementation with `sduck trace` and validation or limitations with `sduck evaluate`. Inspect `sduck memory status`; when the current task is missing or stale, submit one concise, source-backed capsule with `sduck memory distill --stdin`.
7. Make the result reusable with `sduck remember` and searchable with `sduck recall`.
8. Finish with `sduck close` or `sduck abandon`.

The contract is `work -> context -> grill complete -> submit -> ask/answer -> brief/confirm -> implementation activity -> trace -> evaluate -> memory status/distill -> remember/recall -> close`.
For a small, obvious change, use one concise decision and no unnecessary questions. For a complex or ambiguous change, provide the full decision brief and explicit scope boundaries.

`--record-depth FULL` is the default and preserves the current/legacy behavior: the full decision briefing lifecycle remains required. `--record-depth LIGHTWEIGHT` is documented for Stage 1 compatibility only and is a behavioral no-op in this release; it does not shorten, skip, or otherwise change any lifecycle command or gate.

Canonical records are `.decision/exports/markdown/**` plus the tracked `.decision/policy.json` for new workspaces. Memory Capsules live under `.decision/exports/markdown/memories/`; each task has at most one stable capsule. `.decision/db.sqlite` is a local, ignored cache. User-global locale config is outside the repository and does not change these artifacts. Installed agent rules are canonical English regardless of user locale. The CLI records workflow evidence but does not include a built-in CI trace verifier; run project checks separately and record outcomes with `sduck evaluate`. Agent hooks are convenience checks, not a security boundary and cannot block arbitrary editor or shell writes.

## User-facing interaction model

`sduck` is an internal decision-recording tool for coding agents. Users normally should not be asked to run lifecycle commands themselves. Agents use the commands internally to record decisions, evidence, traces, and reusable memory, then explain outcomes in plain language.

Treat `sduck work`, `sduck context`, `sduck grill complete`, `sduck submit`, `sduck brief`, `sduck confirm`, `sduck trace`, `sduck evaluate`, `sduck memory status`, `sduck memory distill`, and `sduck remember` as internal agent operations unless the user explicitly asks for command details.

Plain-language scenario:

1. Restate the user's request and expected outcome.
2. Internally inspect relevant code, documentation, and prior decisions with the sduck workflow.
3. Ask only blocking questions, one at a time. Each question should include a recommended answer and rationale.
4. Before implementation, list what will change, what will not change, the key decision, and how verification will be performed.
5. Ask for plain-language approval, for example: “Implement this direction?”
6. Implement only after approval.
7. Report what changed and the verification results.

## Bounded memory workflow

Memory Capsules are a compact retrieval layer over canonical history, not a replacement for it. The CLI never calls a model: the active coding agent writes the semantic summary, and sduck validates its structure and provenance.

- Run `sduck memory status` after trace/evaluation work. `MISSING` means an eligible confirmed/closed task has no capsule; `STALE` means a reference is invalid, a cited source changed, a newer source record exists, or a cited decision is no longer reusable. Stale capsules fall back to raw retrieval; use `sduck doctor` for invalid-reference recovery.
- For the current task, submit one `sduck-memory/v1` payload through `sduck memory distill --stdin`. Re-distillation updates the same `MEM-*` record; an identical payload is a no-op. Historical backfill must be explicit with `sduck memory distill --task <TASK-ID> --stdin`, and the option and payload IDs must match.
- Every claim must cite same-task canonical source IDs. `DECISION` and `CONSTRAINT` claims use confirmed Decision/Evidence sources, `IMPLEMENTATION` requires an Implementation Trace, and `VALIDATION` requires an Evaluation.
- Keep capsules concise and durable. Preserve raw Task, Decision, Evidence, Trace, and Evaluation records; cold archive or deletion requires a separate reviewed migration.
- `sduck recall` and future context packs prefer matching current capsules, suppress only raw Decision/Trace IDs actually cited by those capsules, and preserve bounded uncited/raw fallback results.

## Evidence-backed Wiki workflow

The Git-tracked Markdown Wiki under `docs/wiki/` is the default human reading view. Canonical `.decision/exports/markdown/**` Decision, Evidence, Trace, and Evaluation records remain the traceable backend; the Wiki is a materialized explanation, not another source of truth.

- CLI commands are `sduck wiki build|status|sync|lint`. Skill names are `sd-build-wiki` and `sd-sync-wiki`; do not conflate them.
- When an enabled Wiki has not been built, read `.sduck/sduck-assets/agent-rules/skills/sd-build-wiki/SKILL.md` before creating it.
- After trace/evaluation/memory work and whenever close reports dirty or stale pages, read `.sduck/sduck-assets/agent-rules/skills/sd-sync-wiki/SKILL.md` and update only related generated sections.
- Preserve content outside generated ownership markers. Never use Wiki sync `--force` without explicit authorization to replace an edited generated section.
- Keep decision intent, recorded implementation claims, changed-file tracking, reported validation outcomes, and agent-proposed semantic conflicts distinct. Do not claim the CLI verified code meaning or executed CI.
- Wiki status and lint are advisory. A dirty/stale Wiki or sync failure must remain visible but must not block task close. Do not commit Wiki changes automatically.

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
