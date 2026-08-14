---
id: DEC-WIKI-MATERIALIZED-VIEW
type: decision
task_id: TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs: []
applies_to:
  - src/core/v2/wiki*.ts
  - docs/wiki/**
  - src/types/index.ts
avoids:
  - canonicalizing docs/wiki as a second source of truth
  - web wiki server
created_at: '2026-08-11T13:38:09.882Z'
updated_at: '2026-08-11T13:38:20.347Z'
---
# DEC-WIKI-MATERIALIZED-VIEW: Make a fixed Markdown Wiki the human-facing materialized view

## Decision
Store a Git-tracked Wiki under docs/wiki with deterministic Overview, Glossary, Capabilities, Architecture & Flows, and Decisions & Recent Changes pages; keep .decision exports canonical and record page source IDs, source digests, sync commits, and observation cursors in a manifest.

## Rationale
- The user explicitly separates the human reading surface from the canonical decision backend.
- Fixed slugs and section order make output stable and lintable while a manifest carries mutable sync metadata without rewriting human-owned page text.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-WIKI-MATERIALIZED-VIEW",
    "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
    "title": "Make a fixed Markdown Wiki the human-facing materialized view",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "Store a Git-tracked Wiki under docs/wiki with deterministic Overview, Glossary, Capabilities, Architecture & Flows, and Decisions & Recent Changes pages; keep .decision exports canonical and record page source IDs, source digests, sync commits, and observation cursors in a manifest.",
    "rationale": [
      "The user explicitly separates the human reading surface from the canonical decision backend.",
      "Fixed slugs and section order make output stable and lintable while a manifest carries mutable sync metadata without rewriting human-owned page text."
    ],
    "appliesTo": [
      "src/core/v2/wiki*.ts",
      "docs/wiki/**",
      "src/types/index.ts"
    ],
    "avoids": [
      "canonicalizing docs/wiki as a second source of truth",
      "web wiki server"
    ],
    "sourceRefs": [],
    "createdAt": "2026-08-11T13:38:09.882Z",
    "updatedAt": "2026-08-11T13:38:20.347Z"
  }
}
```
