---
name: sd-sync-wiki
description: Synchronize an existing evidence-backed sduck Markdown Wiki. Use after decisions, traces, evaluations, or relevant commits make Wiki pages dirty or stale, after task close reports a Wiki advisory, or when the user asks to refresh docs/wiki without losing human notes.
---

# Sync an existing Wiki

Update only deterministically dirty or stale generated sections. Preserve the Wiki as a materialized explanatory view over canonical `.decision` records.

## Inspect before writing

1. Run `sduck wiki status --json`.
2. Inspect every reported reason: changed source digest, missing or `SUPERSEDED` source, new Decision or Trace, unmapped Decision, edited generated section, or a relevance-scored file in `lastSyncedCommit..HEAD`.
3. Read the cited Decision, Evidence, Trace, and Evaluation records. Inspect relevant changed files before proposing prose. Relevance is a deterministic path signal, not proof of code meaning.
4. Select only related dirty pages. Leave clean and unrelated pages out of the payload.

## Preserve evidence language

- Describe intent as decided intent backed by a Decision.
- Describe implementation only as a recorded implementation claim.
- Describe changed files as Trace/Git change tracking.
- Describe checks as validation outcomes reported to sduck unless independent execution evidence exists.
- Label code/decision meaning conflicts as agent-proposed semantic conflicts, not CLI validation.

Use the same stable page sections and typed block schema documented by `sd-build-wiki`. Keep source IDs at block level and use only existing IDs.

## Sync safely

1. Pipe a partial payload containing only selected pages to `sduck wiki sync --stdin`.
2. Never edit the manifest or ownership markers by hand.
3. Never change content outside `<!-- sduck:generated:start ... -->` and `<!-- sduck:generated:end -->`; that content is human-owned.
4. If a generated section was edited, do not use `--force` automatically. Explain the conflict and use `sduck wiki sync --stdin --force` only after explicit authorization to replace that generated content.
5. Run `sduck wiki status` and `sduck wiki lint` after sync.

If sync or lint fails, leave the Wiki stale and report the failure accurately. Wiki maintenance is advisory: do not block or undo an otherwise valid `sduck close`. Do not commit, tag, push, or publish automatically.
