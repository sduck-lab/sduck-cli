---
id: require-grill-before-brief
type: decision
task_id: TASK-20260714-require-a-grill-me-gate-before-new-work-for-all-
kind: EXPLICIT
status: DRAFT
confidence: 1
source_refs:
  - 'user: 2026-07-14 Korean request to force grill-me for every future sduck installation'
  - src/core/v2/task-lifecycle.ts:46-80
  - src/core/v2/context.ts:52-77
  - .sduck/sduck-assets/agent-rules/core.md:3-16
applies_to:
  - New .decision workspaces initialized by this release
  - v2 work, grill-me, submit, confirm, status, and installed agent-rule flow
avoids:
  - Task-size, CI, TTY, or intent-based bypasses
  - Claiming that hooks can prevent arbitrary editor or shell writes
created_at: '2026-07-14T03:39:55.380Z'
updated_at: '2026-07-14T03:39:55.380Z'
---
# require-grill-before-brief: Require grill-me before a new task can be briefed

## Decision
Every task created in a newly initialized sduck workspace must enter a durable grill-me step before it may submit its decision brief or be confirmed for implementation.

## Rationale
- The requested policy is mandatory for all future sduck installations.
- The central v2 lifecycle is the only cross-agent enforcement point before implementation; agent rules and hooks remain guidance layers.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "require-grill-before-brief",
    "taskId": "TASK-20260714-require-a-grill-me-gate-before-new-work-for-all-",
    "title": "Require grill-me before a new task can be briefed",
    "kind": "EXPLICIT",
    "status": "DRAFT",
    "confidence": 1,
    "summary": "Every task created in a newly initialized sduck workspace must enter a durable grill-me step before it may submit its decision brief or be confirmed for implementation.",
    "rationale": [
      "The requested policy is mandatory for all future sduck installations.",
      "The central v2 lifecycle is the only cross-agent enforcement point before implementation; agent rules and hooks remain guidance layers."
    ],
    "appliesTo": [
      "New .decision workspaces initialized by this release",
      "v2 work, grill-me, submit, confirm, status, and installed agent-rule flow"
    ],
    "avoids": [
      "Task-size, CI, TTY, or intent-based bypasses",
      "Claiming that hooks can prevent arbitrary editor or shell writes"
    ],
    "sourceRefs": [
      "user: 2026-07-14 Korean request to force grill-me for every future sduck installation",
      "src/core/v2/task-lifecycle.ts:46-80",
      "src/core/v2/context.ts:52-77",
      ".sduck/sduck-assets/agent-rules/core.md:3-16"
    ],
    "createdAt": "2026-07-14T03:39:55.380Z",
    "updatedAt": "2026-07-14T03:39:55.380Z"
  }
}
```
