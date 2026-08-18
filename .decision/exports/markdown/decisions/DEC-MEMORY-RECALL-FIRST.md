---
id: DEC-MEMORY-RECALL-FIRST
type: decision
task_id: TASK-20260811-add-source-backed-memory-capsules-and-persistent
kind: INFERRED
status: CONFIRMED
confidence: 0.95
source_refs:
  - src/core/v2/recall.ts
  - src/core/v2/context.ts:240
applies_to:
  - src/core/v2/recall.ts
  - src/core/v2/memory.ts
  - src/ui/v2/render.ts
  - src/commands/v2/index.ts
  - src/cli.ts
avoids:
  - Removing existing recall result categories
created_at: '2026-08-11T14:37:48.747Z'
updated_at: '2026-08-18T06:10:30.112Z'
---
# DEC-MEMORY-RECALL-FIRST: Search distilled memory before raw history

## Decision
Add capsule-first results to recall and a memory status command that reports missing or stale capsules, while retaining bounded decision and trace fallback results for backward compatibility.

## Rationale
- Distillation only reduces working context if retrieval prefers it.
- Status makes maintenance explicit without silently rewriting semantic content.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-MEMORY-RECALL-FIRST",
    "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
    "title": "Search distilled memory before raw history",
    "kind": "INFERRED",
    "status": "CONFIRMED",
    "confidence": 0.95,
    "summary": "Add capsule-first results to recall and a memory status command that reports missing or stale capsules, while retaining bounded decision and trace fallback results for backward compatibility.",
    "rationale": [
      "Distillation only reduces working context if retrieval prefers it.",
      "Status makes maintenance explicit without silently rewriting semantic content."
    ],
    "appliesTo": [
      "src/core/v2/recall.ts",
      "src/core/v2/memory.ts",
      "src/ui/v2/render.ts",
      "src/commands/v2/index.ts",
      "src/cli.ts"
    ],
    "avoids": [
      "Removing existing recall result categories"
    ],
    "sourceRefs": [
      "src/core/v2/recall.ts",
      "src/core/v2/context.ts:240"
    ],
    "createdAt": "2026-08-11T14:37:48.747Z",
    "updatedAt": "2026-08-18T06:10:30.112Z",
    "category": "메모리 캡슐"
  }
}
```
