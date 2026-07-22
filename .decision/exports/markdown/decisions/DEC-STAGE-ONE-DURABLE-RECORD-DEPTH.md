---
id: DEC-STAGE-ONE-DURABLE-RECORD-DEPTH
type: decision
task_id: TASK-20260722-configure-risk-based-sduck-workflow-activation
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs:
  - conversation:2026-07-22
  - DEC-0065
  - src/core/v2/source-store.ts
  - src/core/v2/store.ts
  - src/core/v2/task-lifecycle.ts
applies_to:
  - src/types/index.ts
  - src/core/v2/source-store.ts
  - src/core/v2/store.ts
  - src/core/v2/rebuild.ts
  - src/core/v2/task.ts
  - src/core/v2/cache-bundle.ts
  - src/cli.ts
  - src/commands/v2/index.ts
  - tests/**
  - README.md
  - docs/migration.md
avoids:
  - src/core/v2/task-lifecycle.ts behavioral gate changes
  - src/core/v2/trace.ts behavior changes
  - automatic agent routing
created_at: '2026-07-22T06:25:58.737Z'
updated_at: '2026-07-22T06:48:11.316Z'
---
# DEC-STAGE-ONE-DURABLE-RECORD-DEPTH: Ship durable record-depth storage before changing lifecycle behavior

## Decision
Stage 1 introduces a backward-compatible FULL/LIGHTWEIGHT task field and CLI selection, defaults legacy and omitted data to FULL, and preserves every current lifecycle gate for both depths.

## Rationale
- The user selected the staged durable-foundation rollout.
- Persisting and migrating the classification before gate changes validates data compatibility and prevents a new field from silently weakening historical task semantics.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-STAGE-ONE-DURABLE-RECORD-DEPTH",
    "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
    "title": "Ship durable record-depth storage before changing lifecycle behavior",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "Stage 1 introduces a backward-compatible FULL/LIGHTWEIGHT task field and CLI selection, defaults legacy and omitted data to FULL, and preserves every current lifecycle gate for both depths.",
    "rationale": [
      "The user selected the staged durable-foundation rollout.",
      "Persisting and migrating the classification before gate changes validates data compatibility and prevents a new field from silently weakening historical task semantics."
    ],
    "appliesTo": [
      "src/types/index.ts",
      "src/core/v2/source-store.ts",
      "src/core/v2/store.ts",
      "src/core/v2/rebuild.ts",
      "src/core/v2/task.ts",
      "src/core/v2/cache-bundle.ts",
      "src/cli.ts",
      "src/commands/v2/index.ts",
      "tests/**",
      "README.md",
      "docs/migration.md"
    ],
    "avoids": [
      "src/core/v2/task-lifecycle.ts behavioral gate changes",
      "src/core/v2/trace.ts behavior changes",
      "automatic agent routing"
    ],
    "sourceRefs": [
      "conversation:2026-07-22",
      "DEC-0065",
      "src/core/v2/source-store.ts",
      "src/core/v2/store.ts",
      "src/core/v2/task-lifecycle.ts"
    ],
    "createdAt": "2026-07-22T06:25:58.737Z",
    "updatedAt": "2026-07-22T06:48:11.316Z"
  }
}
```
