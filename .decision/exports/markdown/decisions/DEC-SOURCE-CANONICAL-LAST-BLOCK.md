---
id: DEC-SOURCE-CANONICAL-LAST-BLOCK
type: decision
task_id: TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs: []
applies_to:
  - src/core/v2/source-store.ts
  - src/core/v2/decision-workspace.ts
avoids:
  - Restricting ordinary prose from documenting source fences
created_at: '2026-08-12T05:10:34.572Z'
updated_at: '2026-08-18T06:10:30.112Z'
---
# DEC-SOURCE-CANONICAL-LAST-BLOCK: Parse and verify the final canonical sduck-source block

## Decision
Markdown loaders read the final sduck-source fence emitted at the document tail and DecisionWorkspace verifies semantic round-trip equivalence before commit.

## Rationale
- A valid example fence in free text currently replaces the validated record without an error.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-SOURCE-CANONICAL-LAST-BLOCK",
    "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
    "title": "Parse and verify the final canonical sduck-source block",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "Markdown loaders read the final sduck-source fence emitted at the document tail and DecisionWorkspace verifies semantic round-trip equivalence before commit.",
    "rationale": [
      "A valid example fence in free text currently replaces the validated record without an error."
    ],
    "appliesTo": [
      "src/core/v2/source-store.ts",
      "src/core/v2/decision-workspace.ts"
    ],
    "avoids": [
      "Restricting ordinary prose from documenting source fences"
    ],
    "sourceRefs": [],
    "createdAt": "2026-08-12T05:10:34.572Z",
    "updatedAt": "2026-08-18T06:10:30.112Z",
    "category": "워크플로우 라이프사이클"
  }
}
```
