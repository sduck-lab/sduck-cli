---
id: DEC-MIGRATE-061
type: decision
task_id: TASK-20260722-migrate-repository-workflow-to-sduck-cli-0-6-1
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs:
  - User request, 2026-07-22
applies_to:
  - .decision
  - .sduck
avoids:
  - .ignore
  - source code
  - Git staging and commits
created_at: '2026-07-22T01:55:29.443Z'
updated_at: '2026-07-22T01:55:29.685Z'
---
# DEC-MIGRATE-061: Use the CLI-only 0.6.1 migration path

## Decision
Install exactly @sduck/sduck-cli@0.6.1 globally, then run the requested doctor, update, rebuild, and post-migration inspection commands without directly editing decision state.

## Rationale
- The user supplied the required command sequence and forbade direct .decision state or cache edits.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-MIGRATE-061",
    "taskId": "TASK-20260722-migrate-repository-workflow-to-sduck-cli-0-6-1",
    "title": "Use the CLI-only 0.6.1 migration path",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "Install exactly @sduck/sduck-cli@0.6.1 globally, then run the requested doctor, update, rebuild, and post-migration inspection commands without directly editing decision state.",
    "rationale": [
      "The user supplied the required command sequence and forbade direct .decision state or cache edits."
    ],
    "appliesTo": [
      ".decision",
      ".sduck"
    ],
    "avoids": [
      ".ignore",
      "source code",
      "Git staging and commits"
    ],
    "sourceRefs": [
      "User request, 2026-07-22"
    ],
    "createdAt": "2026-07-22T01:55:29.443Z",
    "updatedAt": "2026-07-22T01:55:29.685Z"
  }
}
```
