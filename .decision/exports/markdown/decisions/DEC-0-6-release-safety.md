---
id: DEC-0-6-release-safety
type: decision
task_id: TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc
kind: INFERRED
status: CONFIRMED
confidence: 0.7
source_refs: []
applies_to:
  - .sduck/sduck-assets/agent-rules
  - src/core/init.ts
  - src/commands/v2/index.ts
  - src/core/v2/retrospective.ts
  - tests
avoids: []
created_at: '2026-07-21T08:39:55.739Z'
updated_at: '2026-07-21T08:39:55.739Z'
---
# DEC-0-6-release-safety: Make packaged workflow guidance and retrospective hooks release-safe

## Decision
Bundled rules must match the guided CLI lifecycle, and retrospective integration must not overwrite user hooks or create unusable enabled-mode markers.

## Rationale
- none

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-0-6-release-safety",
    "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
    "title": "Make packaged workflow guidance and retrospective hooks release-safe",
    "kind": "INFERRED",
    "status": "CONFIRMED",
    "confidence": 0.7,
    "summary": "Bundled rules must match the guided CLI lifecycle, and retrospective integration must not overwrite user hooks or create unusable enabled-mode markers.",
    "rationale": [],
    "appliesTo": [
      ".sduck/sduck-assets/agent-rules",
      "src/core/init.ts",
      "src/commands/v2/index.ts",
      "src/core/v2/retrospective.ts",
      "tests"
    ],
    "avoids": [],
    "sourceRefs": [],
    "createdAt": "2026-07-21T08:39:55.739Z",
    "updatedAt": "2026-07-21T08:39:55.739Z"
  }
}
```
