---
id: DEC-0-6-safe-retrospective-hook
type: decision
task_id: TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs: []
applies_to:
  - src/core/init.ts
  - src/commands/v2/index.ts
  - src/core/v2/retrospective.ts
  - .sduck/sduck-assets/agent-rules/hooks/sduck-retrospective-post-commit.sh
  - tests
avoids: []
created_at: '2026-07-21T08:47:37.727Z'
updated_at: '2026-07-21T08:47:37.727Z'
---
# DEC-0-6-safe-retrospective-hook: Use a safe managed retrospective-hook state machine

## Decision
0.6.0 installs automation only when safe, never overwrites existing hooks, leaves managed hooks inert while enabled, blocks enable with pending markers, and warns rather than failing disable when user hooks prevent automation.

## Rationale
- none

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-0-6-safe-retrospective-hook",
    "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
    "title": "Use a safe managed retrospective-hook state machine",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "0.6.0 installs automation only when safe, never overwrites existing hooks, leaves managed hooks inert while enabled, blocks enable with pending markers, and warns rather than failing disable when user hooks prevent automation.",
    "rationale": [],
    "appliesTo": [
      "src/core/init.ts",
      "src/commands/v2/index.ts",
      "src/core/v2/retrospective.ts",
      ".sduck/sduck-assets/agent-rules/hooks/sduck-retrospective-post-commit.sh",
      "tests"
    ],
    "avoids": [],
    "sourceRefs": [],
    "createdAt": "2026-07-21T08:47:37.727Z",
    "updatedAt": "2026-07-21T08:47:37.727Z"
  }
}
```
