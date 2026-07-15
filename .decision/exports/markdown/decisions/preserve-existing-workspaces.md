---
id: preserve-existing-workspaces
type: decision
task_id: TASK-20260714-require-a-grill-me-gate-before-new-work-for-all-
kind: INFERRED
status: DRAFT
confidence: 0.95
source_refs:
  - 'user: 2026-07-14 specifies future sduck installations'
  - src/core/v2/workspace.ts
  - src/core/v2/source-store.ts
applies_to:
  - Initialization policy and task creation snapshots
  - Parsing and confirming historical task records
avoids:
  - Retroactively marking historic tasks as grilled
  - Breaking current workspaces on package upgrade
created_at: '2026-07-14T03:39:55.380Z'
updated_at: '2026-07-14T03:39:55.380Z'
---
# preserve-existing-workspaces: Grandfather existing workspaces and tasks

## Decision
The required grill policy is written into newly initialized workspaces; workspaces and task documents created before adoption remain compatible and are not silently tightened.

## Rationale
- The request targets future installations.
- A release upgrade must not unexpectedly block existing automation or currently resumable work.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "preserve-existing-workspaces",
    "taskId": "TASK-20260714-require-a-grill-me-gate-before-new-work-for-all-",
    "title": "Grandfather existing workspaces and tasks",
    "kind": "INFERRED",
    "status": "DRAFT",
    "confidence": 0.95,
    "summary": "The required grill policy is written into newly initialized workspaces; workspaces and task documents created before adoption remain compatible and are not silently tightened.",
    "rationale": [
      "The request targets future installations.",
      "A release upgrade must not unexpectedly block existing automation or currently resumable work."
    ],
    "appliesTo": [
      "Initialization policy and task creation snapshots",
      "Parsing and confirming historical task records"
    ],
    "avoids": [
      "Retroactively marking historic tasks as grilled",
      "Breaking current workspaces on package upgrade"
    ],
    "sourceRefs": [
      "user: 2026-07-14 specifies future sduck installations",
      "src/core/v2/workspace.ts",
      "src/core/v2/source-store.ts"
    ],
    "createdAt": "2026-07-14T03:39:55.380Z",
    "updatedAt": "2026-07-14T03:39:55.380Z"
  }
}
```
