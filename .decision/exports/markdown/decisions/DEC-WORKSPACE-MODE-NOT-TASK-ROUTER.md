---
id: DEC-WORKSPACE-MODE-NOT-TASK-ROUTER
type: decision
task_id: TASK-20260722-configure-risk-based-sduck-workflow-activation
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs:
  - conversation:2026-07-22
  - src/core/v2/policy.ts
  - src/core/v2/retrospective.ts
  - src/core/v2/task-lifecycle.ts
applies_to:
  - src/core/v2/policy.ts
  - src/core/v2/task-lifecycle.ts
  - .sduck/sduck-assets/agent-rules/**
avoids:
  - automatic sduck workflow enable or disable invocation
  - unrecorded enabled-workspace implementation
created_at: '2026-07-22T05:41:57.908Z'
updated_at: '2026-07-22T06:48:11.316Z'
---
# DEC-WORKSPACE-MODE-NOT-TASK-ROUTER: Keep workspace mode separate from task record depth

## Decision
Do not automatically toggle the workspace-wide workflow mode for individual tasks. If lower ceremony is supported, it must be a durable per-task record-depth model rather than an unrecorded agent bypass.

## Rationale
- The user selected task-scoped behavior over persistent workspace toggling.
- Workspace mode is tracked and gates task creation, while instruction-only skips create invisible audit exceptions.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-WORKSPACE-MODE-NOT-TASK-ROUTER",
    "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
    "title": "Keep workspace mode separate from task record depth",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "Do not automatically toggle the workspace-wide workflow mode for individual tasks. If lower ceremony is supported, it must be a durable per-task record-depth model rather than an unrecorded agent bypass.",
    "rationale": [
      "The user selected task-scoped behavior over persistent workspace toggling.",
      "Workspace mode is tracked and gates task creation, while instruction-only skips create invisible audit exceptions."
    ],
    "appliesTo": [
      "src/core/v2/policy.ts",
      "src/core/v2/task-lifecycle.ts",
      ".sduck/sduck-assets/agent-rules/**"
    ],
    "avoids": [
      "automatic sduck workflow enable or disable invocation",
      "unrecorded enabled-workspace implementation"
    ],
    "sourceRefs": [
      "conversation:2026-07-22",
      "src/core/v2/policy.ts",
      "src/core/v2/retrospective.ts",
      "src/core/v2/task-lifecycle.ts"
    ],
    "createdAt": "2026-07-22T05:41:57.908Z",
    "updatedAt": "2026-07-22T06:48:11.316Z"
  }
}
```
