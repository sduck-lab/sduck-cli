---
id: DEC-MEMORY-CITED-SOURCE-SUPPRESSION
type: decision
task_id: TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs: []
applies_to:
  - src/core/v2/recall.ts
  - src/core/v2/context.ts
avoids:
  - Task-wide raw-history suppression
created_at: '2026-08-12T05:10:34.572Z'
updated_at: '2026-08-12T05:10:34.572Z'
---
# DEC-MEMORY-CITED-SOURCE-SUPPRESSION: Suppress only raw sources actually cited by a matching capsule

## Decision
Recall and context hide only cited Decision and Implementation Trace IDs, never every raw record from the capsule's task.

## Rationale
- The task-wide filter was independently reproduced hiding an uncited exact-match decision.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-MEMORY-CITED-SOURCE-SUPPRESSION",
    "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
    "title": "Suppress only raw sources actually cited by a matching capsule",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "Recall and context hide only cited Decision and Implementation Trace IDs, never every raw record from the capsule's task.",
    "rationale": [
      "The task-wide filter was independently reproduced hiding an uncited exact-match decision."
    ],
    "appliesTo": [
      "src/core/v2/recall.ts",
      "src/core/v2/context.ts"
    ],
    "avoids": [
      "Task-wide raw-history suppression"
    ],
    "sourceRefs": [],
    "createdAt": "2026-08-12T05:10:34.572Z",
    "updatedAt": "2026-08-12T05:10:34.572Z"
  }
}
```
