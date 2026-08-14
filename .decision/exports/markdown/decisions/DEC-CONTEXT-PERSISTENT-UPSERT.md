---
id: DEC-CONTEXT-PERSISTENT-UPSERT
type: decision
task_id: TASK-20260811-add-source-backed-memory-capsules-and-persistent
kind: INFERRED
status: CONFIRMED
confidence: 1
source_refs:
  - src/core/v2/context.ts:92
  - src/core/v2/context.ts:447
applies_to:
  - src/core/v2/context.ts
  - tests/unit/v2-lifecycle.test.ts
avoids:
  - Dropping explicitly requested file context
  - Reassigning existing context IDs
created_at: '2026-08-11T14:37:48.747Z'
updated_at: '2026-08-11T14:37:48.747Z'
---
# DEC-CONTEXT-PERSISTENT-UPSERT: Make persisted context indexing idempotent

## Decision
Deduplicate persisted context by task, source type, and source reference; preserve the strongest candidate and existing stable ID; cap automatically discovered context at 40 per task; and make repeated explicit file additions idempotent.

## Rationale
- Current buildContextIndex deduplicates only candidates from one invocation before appending them.
- Repeated context runs therefore grow canonical task documents even when no new source exists.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-CONTEXT-PERSISTENT-UPSERT",
    "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
    "title": "Make persisted context indexing idempotent",
    "kind": "INFERRED",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "Deduplicate persisted context by task, source type, and source reference; preserve the strongest candidate and existing stable ID; cap automatically discovered context at 40 per task; and make repeated explicit file additions idempotent.",
    "rationale": [
      "Current buildContextIndex deduplicates only candidates from one invocation before appending them.",
      "Repeated context runs therefore grow canonical task documents even when no new source exists."
    ],
    "appliesTo": [
      "src/core/v2/context.ts",
      "tests/unit/v2-lifecycle.test.ts"
    ],
    "avoids": [
      "Dropping explicitly requested file context",
      "Reassigning existing context IDs"
    ],
    "sourceRefs": [
      "src/core/v2/context.ts:92",
      "src/core/v2/context.ts:447"
    ],
    "createdAt": "2026-08-11T14:37:48.747Z",
    "updatedAt": "2026-08-11T14:37:48.747Z"
  }
}
```
