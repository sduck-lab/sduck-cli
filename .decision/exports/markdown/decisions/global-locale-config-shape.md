---
id: global-locale-config-shape
type: decision
task_id: TASK-20260714-organize-the-complete-workflow-and-update-the-re
kind: INFERRED
status: CONFIRMED
confidence: 0.9
source_refs:
  - 'user: 2026-07-14 chooses user-global locale storage'
  - src/core/v2/paths.ts:18-24
  - src/core/v2/policy.ts:6-40
applies_to:
  - locale resolution and v2 CLI configuration command
  - tests for persistence and English fallback
avoids:
  - New per-workspace locale files
  - Home-directory configuration for legacy v1 behavior
created_at: '2026-07-14T05:14:52.654Z'
updated_at: '2026-07-14T05:14:53.216Z'
---
# global-locale-config-shape: Use an XDG-compatible global locale configuration

## Decision
Add `sduck config locale en|ko`, persisting the preference in a user-global XDG-compatible config location with English fallback; preserve it independently of project initialization.

## Rationale
- The requested setting is user-global and must work before or outside a workspace.
- A separate global config avoids conflating personal display choice with tracked workflow policy.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "global-locale-config-shape",
    "taskId": "TASK-20260714-organize-the-complete-workflow-and-update-the-re",
    "title": "Use an XDG-compatible global locale configuration",
    "kind": "INFERRED",
    "status": "CONFIRMED",
    "confidence": 0.9,
    "summary": "Add `sduck config locale en|ko`, persisting the preference in a user-global XDG-compatible config location with English fallback; preserve it independently of project initialization.",
    "rationale": [
      "The requested setting is user-global and must work before or outside a workspace.",
      "A separate global config avoids conflating personal display choice with tracked workflow policy."
    ],
    "appliesTo": [
      "locale resolution and v2 CLI configuration command",
      "tests for persistence and English fallback"
    ],
    "avoids": [
      "New per-workspace locale files",
      "Home-directory configuration for legacy v1 behavior"
    ],
    "sourceRefs": [
      "user: 2026-07-14 chooses user-global locale storage",
      "src/core/v2/paths.ts:18-24",
      "src/core/v2/policy.ts:6-40"
    ],
    "createdAt": "2026-07-14T05:14:52.654Z",
    "updatedAt": "2026-07-14T05:14:53.216Z"
  }
}
```
