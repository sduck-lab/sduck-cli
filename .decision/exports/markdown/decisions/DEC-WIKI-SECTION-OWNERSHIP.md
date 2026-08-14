---
id: DEC-WIKI-SECTION-OWNERSHIP
type: decision
task_id: TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs: []
applies_to:
  - src/core/v2/decision-workspace.ts
  - src/core/v2/wiki*.ts
  - tests/unit/wiki*.test.ts
avoids:
  - whole-page overwrite during normal sync
  - manual state or cache edits
created_at: '2026-08-11T13:38:09.882Z'
updated_at: '2026-08-11T13:38:20.347Z'
---
# DEC-WIKI-SECTION-OWNERSHIP: Protect human edits with generated-section ownership

## Decision
Build creates digest-marked generated regions and a human-owned Team Notes area; sync replaces only valid generated regions, preserves every byte outside them, rejects edited generated content unless --force is explicit, and applies all page and manifest changes atomically under the shared workspace lock.

## Rationale
- The user requires zero automatic loss of human-authored content.
- DecisionWorkspace already provides shared locking, staging, full validation, rollback, and unchanged-artifact elision.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-WIKI-SECTION-OWNERSHIP",
    "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
    "title": "Protect human edits with generated-section ownership",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "Build creates digest-marked generated regions and a human-owned Team Notes area; sync replaces only valid generated regions, preserves every byte outside them, rejects edited generated content unless --force is explicit, and applies all page and manifest changes atomically under the shared workspace lock.",
    "rationale": [
      "The user requires zero automatic loss of human-authored content.",
      "DecisionWorkspace already provides shared locking, staging, full validation, rollback, and unchanged-artifact elision."
    ],
    "appliesTo": [
      "src/core/v2/decision-workspace.ts",
      "src/core/v2/wiki*.ts",
      "tests/unit/wiki*.test.ts"
    ],
    "avoids": [
      "whole-page overwrite during normal sync",
      "manual state or cache edits"
    ],
    "sourceRefs": [],
    "createdAt": "2026-08-11T13:38:09.882Z",
    "updatedAt": "2026-08-11T13:38:20.347Z"
  }
}
```
