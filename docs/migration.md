# Migration to the Git-native decision workflow

## Canonical source and local cache

`.decision/exports/markdown/{tasks,decisions,implementations}/` is the Git-tracked source of truth. `db.sqlite`, sidecars, `state.json`, locks, staging directories, and Graphify exports are local/generated and are added to `.gitignore` by `sduck init`.

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

- Draft decisions with no explicit status are promoted to `CONFIRMED` only when `sduck confirm` succeeds.
- A task reaches `BRIEF_READY` only when it has an active decision and no open question, `OPEN` decision, or `CONFLICT` decision.
- `confirm`, `trace`, `close`, and `abandon` reject invalid or terminal transitions without changing source.
- `close` and `abandon` clear the local current-task pointer. Use `sduck resume <taskId>` for a previous non-terminal task.
- `sduck trace` uses the Git baseline captured by new confirmation snapshots. Older snapshots without a baseline fall back to the previous working-tree behavior.

## Agent instructions and hooks

Codex and OpenCode now share the official `AGENTS.md` file. Managed blocks are replaced in place while content outside `<!-- sduck:begin -->` / `<!-- sduck:end -->` is preserved. Existing manually maintained `AGENT.md` files are not deleted by init; migrate any user-authored content to `AGENTS.md` and remove the obsolete file deliberately.

Generated rules are v2-first. Legacy SDD approval rules apply only when `.sduck/sduck-state.yml` has a non-null `current_work_id`. The Claude hook reads that exact task and allows completion-evidence edits; it is advisory because shell commands cannot be completely mediated. CLI and CI gates remain authoritative.

## Legacy SDD compatibility

- Plan approval rejects missing or duplicate step numbers such as Step 1/3.
- `done` requires a real change summary, test evidence, a completed review checklist, and scored task-evaluation evidence.
- Generated spec author names come from the target repository's Git `user.name`, with environment identity as fallback.

## Package metadata

Repository, issue tracker, and homepage metadata are present. The package intentionally has no `license` field until the team selects the license; do not infer one from dependencies or repository conventions.
