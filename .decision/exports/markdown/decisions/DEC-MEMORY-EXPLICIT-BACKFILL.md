---
id: DEC-MEMORY-EXPLICIT-BACKFILL
type: decision
task_id: TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs: []
applies_to:
  - src/core/v2/memory.ts
  - src/cli.ts
  - src/commands/v2/index.ts
avoids:
  - Implicit historical task mutation
created_at: '2026-08-12T05:10:34.572Z'
updated_at: '2026-08-12T05:10:34.572Z'
---
# DEC-MEMORY-EXPLICIT-BACKFILL: Target the current task by default and make backfill explicit

## Decision
memory distill rejects a payload for a non-current task unless the caller explicitly supplies --task with the same ID; --task permits intentional confirmed/closed-task backfill.

## Rationale
- A payload typo currently overwrites an unrelated historical capsule while another task is active.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-MEMORY-EXPLICIT-BACKFILL",
    "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
    "title": "Target the current task by default and make backfill explicit",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "memory distill rejects a payload for a non-current task unless the caller explicitly supplies --task with the same ID; --task permits intentional confirmed/closed-task backfill.",
    "rationale": [
      "A payload typo currently overwrites an unrelated historical capsule while another task is active."
    ],
    "appliesTo": [
      "src/core/v2/memory.ts",
      "src/cli.ts",
      "src/commands/v2/index.ts"
    ],
    "avoids": [
      "Implicit historical task mutation"
    ],
    "sourceRefs": [],
    "createdAt": "2026-08-12T05:10:34.572Z",
    "updatedAt": "2026-08-12T05:10:34.572Z"
  }
}
```
