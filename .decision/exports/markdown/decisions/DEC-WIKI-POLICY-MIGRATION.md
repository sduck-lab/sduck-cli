---
id: DEC-WIKI-POLICY-MIGRATION
type: decision
task_id: TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs: []
applies_to:
  - src/core/v2/policy.ts
  - src/core/v2/workspace.ts
  - src/core/update.ts
  - src/commands/update.ts
  - tests/unit/v2-lifecycle.test.ts
avoids:
  - manual policy editing
  - implicit Wiki file creation in legacy projects
created_at: '2026-08-11T13:38:09.882Z'
updated_at: '2026-08-18T06:10:30.112Z'
---
# DEC-WIKI-POLICY-MIGRATION: Default Wiki on only for new workspaces and migrate durable workspaces explicitly

## Decision
Newly initialized workspaces receive enabled Wiki policy; existing durable workspaces with an old or absent policy remain Wiki-disabled until sduck update migrates them while preserving workflow settings, and unrelated commands never create docs/wiki implicitly.

## Rationale
- The current initializer intentionally does not backfill policy when durable sources or cache rows already exist.
- An explicit update migration preserves backward compatibility and avoids surprise files.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-WIKI-POLICY-MIGRATION",
    "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
    "title": "Default Wiki on only for new workspaces and migrate durable workspaces explicitly",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "Newly initialized workspaces receive enabled Wiki policy; existing durable workspaces with an old or absent policy remain Wiki-disabled until sduck update migrates them while preserving workflow settings, and unrelated commands never create docs/wiki implicitly.",
    "rationale": [
      "The current initializer intentionally does not backfill policy when durable sources or cache rows already exist.",
      "An explicit update migration preserves backward compatibility and avoids surprise files."
    ],
    "appliesTo": [
      "src/core/v2/policy.ts",
      "src/core/v2/workspace.ts",
      "src/core/update.ts",
      "src/commands/update.ts",
      "tests/unit/v2-lifecycle.test.ts"
    ],
    "avoids": [
      "manual policy editing",
      "implicit Wiki file creation in legacy projects"
    ],
    "sourceRefs": [],
    "createdAt": "2026-08-11T13:38:09.882Z",
    "updatedAt": "2026-08-18T06:10:30.112Z",
    "category": "Wiki"
  }
}
```
