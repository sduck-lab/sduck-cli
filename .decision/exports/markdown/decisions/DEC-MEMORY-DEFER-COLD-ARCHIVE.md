---
id: DEC-MEMORY-DEFER-COLD-ARCHIVE
type: decision
task_id: TASK-20260811-add-source-backed-memory-capsules-and-persistent
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs:
  - src/core/v2/decision-workspace.ts
applies_to:
  - src/core/v2/decision-workspace.ts
avoids:
  - Raw record deletion
  - Cold archive migration
  - Incremental cache rebuild
created_at: '2026-08-11T14:37:48.747Z'
updated_at: '2026-08-11T14:37:48.747Z'
---
# DEC-MEMORY-DEFER-COLD-ARCHIVE: Defer destructive compaction and storage-engine optimization

## Decision
This slice does not delete or cold-archive canonical history and does not change full-bundle workspace rewrites into incremental commits. Those require a separately reviewed migration and recovery contract.

## Rationale
- The first usable slice can stop duplicate growth and improve retrieval without risking source loss.
- Incremental persistence changes the atomicity boundary and deserves independent failure-mode testing.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-MEMORY-DEFER-COLD-ARCHIVE",
    "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
    "title": "Defer destructive compaction and storage-engine optimization",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "This slice does not delete or cold-archive canonical history and does not change full-bundle workspace rewrites into incremental commits. Those require a separately reviewed migration and recovery contract.",
    "rationale": [
      "The first usable slice can stop duplicate growth and improve retrieval without risking source loss.",
      "Incremental persistence changes the atomicity boundary and deserves independent failure-mode testing."
    ],
    "appliesTo": [
      "src/core/v2/decision-workspace.ts"
    ],
    "avoids": [
      "Raw record deletion",
      "Cold archive migration",
      "Incremental cache rebuild"
    ],
    "sourceRefs": [
      "src/core/v2/decision-workspace.ts"
    ],
    "createdAt": "2026-08-11T14:37:48.747Z",
    "updatedAt": "2026-08-11T14:37:48.747Z"
  }
}
```
