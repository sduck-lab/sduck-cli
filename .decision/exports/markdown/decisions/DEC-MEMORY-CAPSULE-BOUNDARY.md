---
id: DEC-MEMORY-CAPSULE-BOUNDARY
type: decision
task_id: TASK-20260811-add-source-backed-memory-capsules-and-persistent
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs:
  - user:작업 해줘
applies_to:
  - src/types/index.ts
  - src/core/v2/source-types.ts
  - src/core/v2/source-store.ts
  - src/core/v2/paths.ts
  - src/core/v2/decision-workspace.ts
  - src/core/v2/store.ts
  - src/core/v2/rebuild.ts
avoids:
  - Deleting canonical source records
  - Storing capsules inside growing task documents
created_at: '2026-08-11T14:37:48.747Z'
updated_at: '2026-08-18T06:10:30.112Z'
---
# DEC-MEMORY-CAPSULE-BOUNDARY: Store one source-backed Memory Capsule per task

## Decision
Add a separate Git-tracked canonical Memory Capsule document per task. Re-distillation updates that stable capsule instead of appending another record, while raw task, decision, evidence, trace, and evaluation records remain intact.

## Rationale
- The user asked for a structure that keeps accumulated data usable without losing traceability.
- A one-per-task upsert gives memory a bounded lifecycle instead of creating another unbounded event stream.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-MEMORY-CAPSULE-BOUNDARY",
    "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
    "title": "Store one source-backed Memory Capsule per task",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "Add a separate Git-tracked canonical Memory Capsule document per task. Re-distillation updates that stable capsule instead of appending another record, while raw task, decision, evidence, trace, and evaluation records remain intact.",
    "rationale": [
      "The user asked for a structure that keeps accumulated data usable without losing traceability.",
      "A one-per-task upsert gives memory a bounded lifecycle instead of creating another unbounded event stream."
    ],
    "appliesTo": [
      "src/types/index.ts",
      "src/core/v2/source-types.ts",
      "src/core/v2/source-store.ts",
      "src/core/v2/paths.ts",
      "src/core/v2/decision-workspace.ts",
      "src/core/v2/store.ts",
      "src/core/v2/rebuild.ts"
    ],
    "avoids": [
      "Deleting canonical source records",
      "Storing capsules inside growing task documents"
    ],
    "sourceRefs": [
      "user:작업 해줘"
    ],
    "createdAt": "2026-08-11T14:37:48.747Z",
    "updatedAt": "2026-08-18T06:10:30.112Z",
    "category": "메모리 캡슐"
  }
}
```
