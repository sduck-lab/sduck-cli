---
id: DEC-CONTEXT-CURRENT-CANDIDATE-SNAPSHOT
type: decision
task_id: TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs: []
applies_to:
  - src/core/v2/context.ts
avoids:
  - Evicting explicit FILE context
created_at: '2026-08-12T05:10:34.572Z'
updated_at: '2026-08-12T05:10:34.572Z'
---
# DEC-CONTEXT-CURRENT-CANDIDATE-SNAPSHOT: Reconcile automatic context from the current candidate snapshot

## Decision
Each context refresh reuses stable IDs for still-matching candidates, applies current scores and summaries, and removes automatic entries absent from the current candidate set before enforcing the 40-item bound; explicit FILE context remains preserved.

## Rationale
- Forty obsolete high-score entries currently prevent a newly relevant file from entering context.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-CONTEXT-CURRENT-CANDIDATE-SNAPSHOT",
    "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
    "title": "Reconcile automatic context from the current candidate snapshot",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "Each context refresh reuses stable IDs for still-matching candidates, applies current scores and summaries, and removes automatic entries absent from the current candidate set before enforcing the 40-item bound; explicit FILE context remains preserved.",
    "rationale": [
      "Forty obsolete high-score entries currently prevent a newly relevant file from entering context."
    ],
    "appliesTo": [
      "src/core/v2/context.ts"
    ],
    "avoids": [
      "Evicting explicit FILE context"
    ],
    "sourceRefs": [],
    "createdAt": "2026-08-12T05:10:34.572Z",
    "updatedAt": "2026-08-12T05:10:34.572Z"
  }
}
```
