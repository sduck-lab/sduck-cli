---
id: DEC-MEMORY-DEGRADED-READ-RECOVERY
type: decision
task_id: TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs: []
applies_to:
  - src/core/v2/source-store.ts
  - src/core/v2/memory-source.ts
  - src/core/v2/memory.ts
  - src/core/v2/rebuild.ts
  - src/core/v2/doctor.ts
avoids:
  - Deleting raw Task, Decision, Evidence, Trace, or Evaluation records
  - Silently retrieving stale capsules
created_at: '2026-08-12T05:10:34.572Z'
updated_at: '2026-08-18T06:10:30.112Z'
---
# DEC-MEMORY-DEGRADED-READ-RECOVERY: Keep canonical history usable when a capsule reference breaks

## Decision
Memory cross-reference failures become stale retrieval state instead of bundle-load failures; stale capsules are excluded from cache retrieval, and doctor reports and quarantines invalid capsule files on explicit repair.

## Rationale
- Deleting one cited Decision currently blocks status, work, memory status, and leaves doctor unable to repair.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-MEMORY-DEGRADED-READ-RECOVERY",
    "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
    "title": "Keep canonical history usable when a capsule reference breaks",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "Memory cross-reference failures become stale retrieval state instead of bundle-load failures; stale capsules are excluded from cache retrieval, and doctor reports and quarantines invalid capsule files on explicit repair.",
    "rationale": [
      "Deleting one cited Decision currently blocks status, work, memory status, and leaves doctor unable to repair."
    ],
    "appliesTo": [
      "src/core/v2/source-store.ts",
      "src/core/v2/memory-source.ts",
      "src/core/v2/memory.ts",
      "src/core/v2/rebuild.ts",
      "src/core/v2/doctor.ts"
    ],
    "avoids": [
      "Deleting raw Task, Decision, Evidence, Trace, or Evaluation records",
      "Silently retrieving stale capsules"
    ],
    "sourceRefs": [],
    "createdAt": "2026-08-12T05:10:34.572Z",
    "updatedAt": "2026-08-18T06:10:30.112Z",
    "category": "메모리 캡슐"
  }
}
```
