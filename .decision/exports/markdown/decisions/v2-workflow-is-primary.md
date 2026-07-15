---
id: v2-workflow-is-primary
type: decision
task_id: TASK-20260714-organize-the-complete-workflow-and-update-the-re
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs:
  - 'user: 2026-07-14 request to organize the complete workflow and update the README'
  - README.md:35-299
  - docs/use-cases.md:17-37
  - .sduck/sduck-assets/agent-rules/core.md:7-17
  - src/commands/v2/index.ts:48-200
applies_to:
  - README.md and README.ko.md
  - v2 workflow docs, migration notes, installed agent-rule templates, v2 CLI help and next-step output
avoids:
  - Reworking the legacy v1 lifecycle
  - Claiming arbitrary editor or shell writes are blocked
created_at: '2026-07-14T05:14:52.654Z'
updated_at: '2026-07-14T05:14:53.216Z'
---
# v2-workflow-is-primary: Make v2 the single primary documented workflow

## Decision
Reorganize public documentation, installed agent rules, and v2 next-step guidance around one canonical flow: init → work → context → grill-me → submit → ask/answer → brief/confirm → implement → trace → remember/recall → close.

## Rationale
- The user requested a complete workflow cleanup.
- All current workflow surfaces must describe the same gates and next actions.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "v2-workflow-is-primary",
    "taskId": "TASK-20260714-organize-the-complete-workflow-and-update-the-re",
    "title": "Make v2 the single primary documented workflow",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "Reorganize public documentation, installed agent rules, and v2 next-step guidance around one canonical flow: init → work → context → grill-me → submit → ask/answer → brief/confirm → implement → trace → remember/recall → close.",
    "rationale": [
      "The user requested a complete workflow cleanup.",
      "All current workflow surfaces must describe the same gates and next actions."
    ],
    "appliesTo": [
      "README.md and README.ko.md",
      "v2 workflow docs, migration notes, installed agent-rule templates, v2 CLI help and next-step output"
    ],
    "avoids": [
      "Reworking the legacy v1 lifecycle",
      "Claiming arbitrary editor or shell writes are blocked"
    ],
    "sourceRefs": [
      "user: 2026-07-14 request to organize the complete workflow and update the README",
      "README.md:35-299",
      "docs/use-cases.md:17-37",
      ".sduck/sduck-assets/agent-rules/core.md:7-17",
      "src/commands/v2/index.ts:48-200"
    ],
    "createdAt": "2026-07-14T05:14:52.654Z",
    "updatedAt": "2026-07-14T05:14:53.216Z"
  }
}
```
