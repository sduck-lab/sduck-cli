# sduck 0.6 MCP control plane contract fixture notes

Status: **DEFERRED / Phase 0 repository fixture only**
Release lane: **0.6.0 CLI foundations**

0.6.0 does **not** ship an MCP runtime, an MCP stdio server, MCP control-plane commands, `sduck mcp`, `sduck verify`, digest-bound confirmation, source-envelope migration, idempotency receipts, or a built-in CI trace verifier. The implemented product surface remains the local CLI v2 decision briefing workflow.

This document records design fixtures for future work only. The fixture files under `tests/fixtures/brief-digest/**` and `tests/fixtures/source-envelope/**` are repository-only Phase 0 examples used by static tests; they are not parser/runtime support and do not imply commands exist.

## Implemented 0.6.0 lane

- CLI workflow: `work -> context -> grill complete -> submit -> ask/answer -> brief/confirm -> implementation activity -> trace -> evaluate -> remember/recall -> close`.
- `sduck evaluate` records validation evidence or limitations supplied by the operator. It does not run project checks.
- The SQLite graph/cache remains local and rebuildable. Markdown exports and tracked policy remain canonical.
- Agent hooks and bundled rules are advisory guidance, not a security boundary and not an MCP control plane.

## Deferred contract ideas

The following ideas remain unimplemented until a separately confirmed task resumes MCP/control-plane work:

1. **Brief digest / approval view**: a future read-only projection could render an approval-bound view and digest.
2. **Source envelope and migration gate**: a future canonical source envelope could be parsed, rendered, and migrated atomically.
3. **Idempotency receipts**: future protocol mutations could use `(clientId, clientRequestId, operation)` identities.
4. **Context reference/hash persistence**: future context refresh could persist tracked-file references and hashes only.
5. **Trace manifest and verifier**: future Git-bound trace manifests and a committed-HEAD verifier could be designed, but no `sduck verify` command exists in 0.6.0.
6. **MCP adapter**: future read/write MCP tools and stdio transport are absent from 0.6.0.

## Fixture interpretation rules

- Fixture schemas are illustrative contracts for future phases, not accepted input to current CLI commands unless a current command explicitly documents support elsewhere.
- Fixture tests should assert static shape and examples only; they must not imply runtime parsing, migration, transport, or verification behavior.
- Documentation and bundled agent rules for 0.6.0 must direct users to the CLI workflow and must not instruct agents to call MCP tools.

## Future phase gates (not 0.6.0)

Future implementation should be authorized by a new confirmed sduck task and may break down into:

1. Canonical foundation: envelope parse/render/migration, typed operations, digest/provenance, local digest confirmation.
2. Idempotency: receipts, replay/conflict handling, restart and concurrency tests.
3. Privacy-safe context: tracked-only discovery and reference/hash persistence.
4. Git-bound trace/verifier: manifest coverage, stable JSON, and documented exit codes.
5. MCP adapter: stdio server, bounded responses, wrong-root handling, and protocol-only stdout.

Until then, 0.6.0 is CLI foundations plus Phase 0 repository fixtures only.
