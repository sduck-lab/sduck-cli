# sduck 0.7.0 — Evidence-backed Auto Wiki

Version 0.7.0 adds an agent-authored, CLI-verified Wiki materialized from the existing v2 decision records. It gives teammates a stable human reading surface without moving authority away from `.decision`.

## User experience

- Ask the coding agent to use `sd-build-wiki` once. The agent reads code and confirmed records, resolves blocking gaps, and creates five fixed pages under `docs/wiki/`.
- Use `sduck wiki status` to see exactly which pages are dirty, stale, or conflicted and why.
- Ask the agent to use `sd-sync-wiki` after related decisions, traces, evaluations, or code changes. Only supplied owned sections are refreshed; Team Notes and all marker-external bytes remain unchanged.
- Run `sduck wiki lint` to validate schema, ownership, evidence links, generated digests, and Markdown links.
- Continue closing decision tasks normally. A dirty Wiki produces a post-close advisory, not a new lifecycle gate.

## Evidence model

Generated content separates explanation, decision intent, implementation claim, change tracking, validation report, and semantic conflict blocks. Each block links to canonical task, decision, evidence, trace, or evaluation IDs. Typed blocks require the matching evidence class, and unknown or superseded sources fail before any Wiki file is committed.

The CLI validates structure, provenance, ownership, and deterministic freshness signals. It does not decide whether prose is semantically true, infer undocumented intent, or claim that code behavior was verified without an evaluation source.

## Safety and compatibility

- Build and sync use the existing workspace writer lock, staging validation, atomic replacement, and rollback path.
- Initial build refuses fixed-path collisions instead of replacing a pre-existing team Wiki file.
- Sync is selective and idempotent. Generated-region edits are conflicts; clean rewrites and conflict overwrites require explicit `--force` authorization.
- New workspaces enable Wiki policy by default. Existing workspaces remain disabled until `sduck update`; updating policy does not build pages.
- English and Korean CLI surfaces cover help, status, sync/build results, and lint summaries. Canonical artifacts remain locale-neutral.
- The package includes both Wiki skills and managed agent-rule references.
- Support is Codex-first through explicit repository skill paths. Claude Code receives copied skills through its existing installer; other agents receive best-effort rule guidance without a claim of identical behavior.

## Intentionally not included

There is no built-in LLM, daemon, background watcher, semantic verifier, code generator, automatic `--force`, or automatic commit/tag/push/publish. Auto Wiki does not replace `.decision`, code review, project tests, or CI.

See [README.md](../README.md), [migration.md](migration.md), [use-cases.md](use-cases.md), and [pilot-evaluation.md](pilot-evaluation.md) for operating details.
