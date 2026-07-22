---
id: DEC-TASK-SCOPED-RECORD-DEPTH
type: decision
task_id: TASK-20260722-configure-risk-based-sduck-workflow-activation
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs:
  - conversation:2026-07-22
  - src/core/v2/policy.ts
  - src/core/v2/task.ts
  - src/commands/v2/index.ts
applies_to:
  - .sduck/sduck-assets/agent-rules/core.md
  - AGENTS.md
  - CLAUDE.md
avoids:
  - src/**
  - .decision/policy.json
  - automatic sduck workflow enable or disable invocation
created_at: '2026-07-22T03:49:48.147Z'
updated_at: '2026-07-22T06:48:11.316Z'
---
# DEC-TASK-SCOPED-RECORD-DEPTH: Choose task-scoped record depth without changing workspace mode

## Decision
Keep the repository workflow mode unchanged. Agent guidance will select full decision recording only for risky or uncertain work and will not automatically toggle the global workflow setting.

## Rationale
- The user selected task-scoped record depth over per-task global mode toggling.
- workflowEnabled is a workspace-wide tracked setting and task creation is the only gated operation.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-TASK-SCOPED-RECORD-DEPTH",
    "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
    "title": "Choose task-scoped record depth without changing workspace mode",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "Keep the repository workflow mode unchanged. Agent guidance will select full decision recording only for risky or uncertain work and will not automatically toggle the global workflow setting.",
    "rationale": [
      "The user selected task-scoped record depth over per-task global mode toggling.",
      "workflowEnabled is a workspace-wide tracked setting and task creation is the only gated operation."
    ],
    "appliesTo": [
      ".sduck/sduck-assets/agent-rules/core.md",
      "AGENTS.md",
      "CLAUDE.md"
    ],
    "avoids": [
      "src/**",
      ".decision/policy.json",
      "automatic sduck workflow enable or disable invocation"
    ],
    "sourceRefs": [
      "conversation:2026-07-22",
      "src/core/v2/policy.ts",
      "src/core/v2/task.ts",
      "src/commands/v2/index.ts"
    ],
    "createdAt": "2026-07-22T03:49:48.147Z",
    "updatedAt": "2026-07-22T06:48:11.316Z"
  }
}
```
