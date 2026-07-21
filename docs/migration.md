# Migration to the Git-native decision workflow

## Canonical source and local cache

`.decision/exports/markdown/{tasks,decisions,implementations}/` is the Git-tracked decision source of truth. New v2 installs also track `.decision/policy.json`, which records project policy such as the required guided-grill completion gate and whether new `sduck work` creation is enabled. `db.sqlite`, sidecars, `state.json`, locks, staging directories, and graph exports are local/generated and are added to `.gitignore` by `sduck init`.

Every mutation now runs under one writer lock, validates the complete bundle in staging, builds a temporary cache, and commits changed source files with rollback. Unchanged Markdown files are not replaced.

## DB-only workspaces

Older workspaces may contain rows in `.decision/db.sqlite` with no canonical Markdown.

```bash
sduck doctor
sduck doctor --repair
# `sduck remember` also performs the one-time DB-to-Markdown migration.
```

Commit the recovered `.decision/exports/markdown/**` files. Do not commit the DB. `sduck rebuild` intentionally refuses a DB-only rebuild until the source has been recovered.

## Lifecycle changes

- The canonical v2 flow is `sduck work` → `sduck context` → `sduck grill complete --reason "..."` → `sduck submit --stdin` → `sduck ask`/`sduck answer` → `sduck brief`/`sduck confirm` → implementation activity → `sduck trace` → `sduck evaluate` → `sduck remember`/`sduck recall` → `sduck close`.
- Newly initialized v2 workspaces require `sduck grill complete --reason "..."` before `submit` or `confirm`, even for small work. `sduck grill-me` remains only as a compatibility prompt/start command. Small work should keep the grill completion reason and draft concise; it should not skip the gate.
- Existing workspaces or tasks created before `.decision/policy.json` remain permissive/legacy-compatible and are not silently tightened.
- `workflowEnabled` defaults to true, including older valid policy files where the field is absent. `sduck workflow disable` blocks only new `sduck work`; existing records and read-only commands remain available. Toggle mode only when no non-terminal decision task is active.
- Draft decisions with no explicit status are promoted to `CONFIRMED` only when `sduck confirm` succeeds.
- A task reaches `BRIEF_READY` only when it has an active decision and no open question, `OPEN` decision, or `CONFLICT` decision.
- `confirm`, `trace`, `close`, and `abandon` reject invalid or terminal transitions without changing source.
- `close` and `abandon` clear the local current-task pointer. Use `sduck resume <taskId>` for a previous non-terminal task.
- `sduck trace` uses the Git baseline captured by new confirmation snapshots. Older snapshots without a baseline fall back to the previous working-tree behavior.

## Agent instructions and hooks

Codex and OpenCode now share the official `AGENTS.md` file. Managed blocks are replaced in place while content outside `<!-- sduck:begin -->` / `<!-- sduck:end -->` is preserved. Existing manually maintained `AGENT.md` files are not deleted by init; migrate any user-authored content to `AGENTS.md` and remove the obsolete file deliberately.

Generated rules are canonical English and v2-first regardless of the user's CLI locale. Legacy SDD approval rules apply only when `.sduck/sduck-state.yml` has a non-null `current_work_id`. The Claude hook reads that exact task and allows completion-evidence edits; it is advisory because shell commands cannot be completely mediated. The CLI records workflow evidence but has no built-in CI trace verifier; run project checks separately and record outcomes with `sduck evaluate`.

For disabled-workflow retrospective capture, the managed Git post-commit hook is installed only when the hook path is absent. Existing hooks are preserved, including forced init/update. In enabled workflow mode the installed hook no-ops. To decide whether to no-op, it reads only `.decision/policy.json`; it never inspects source content and never runs `sduck`, an LLM, or the network. `sduck workflow enable` rejects a pending retrospective marker until it is handled or cleared. If hook automation is unavailable because an existing hook was preserved, disabled mode remains advisory and retrospective capture requires an explicit Git range.

## Locale migration notes

`sduck config locale en|ko` writes a user-global display preference outside the repository. It does not modify `.decision/policy.json`, canonical Markdown source, JSON output, or installed agent-rule templates. Korean CLI output applies only to v2/root/config surfaces; legacy SDD compatibility commands remain English.

## Legacy SDD compatibility

- Plan approval rejects missing or duplicate step numbers such as Step 1/3.
- `done` requires a real change summary, test evidence, a completed review checklist, and scored task-evaluation evidence.
- Generated spec author names come from the target repository's Git `user.name`, with environment identity as fallback.

## Package metadata

Repository, issue tracker, homepage metadata, and the MIT license are present. See `LICENSE` and the package `license` field.
