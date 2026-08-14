---
id: DEC-MEMORY-AGENT-DISTILLATION
type: decision
task_id: TASK-20260811-add-source-backed-memory-capsules-and-persistent
kind: INFERRED
status: CONFIRMED
confidence: 0.95
source_refs:
  - src/core/v2/remember.ts
  - src/core/v2/source-store.ts
applies_to:
  - src/core/v2/memory.ts
  - src/commands/v2/index.ts
  - src/cli.ts
  - src/ui/v2/render.ts
avoids:
  - Built-in LLM calls
  - Unverifiable free-form summaries
created_at: '2026-08-11T14:37:48.747Z'
updated_at: '2026-08-11T14:37:48.747Z'
---
# DEC-MEMORY-AGENT-DISTILLATION: Keep semantic distillation agent-authored and CLI-verified

## Decision
Expose a stdin-based memory distillation command. The agent supplies concise claims; the CLI validates task ownership, claim-to-source type compatibility, source existence, source status, and a deterministic digest without embedding an LLM.

## Rationale
- The CLI already records agent decisions but does not contain a model runtime.
- Per-claim source references retain auditability and let stale memory be detected deterministically.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-MEMORY-AGENT-DISTILLATION",
    "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
    "title": "Keep semantic distillation agent-authored and CLI-verified",
    "kind": "INFERRED",
    "status": "CONFIRMED",
    "confidence": 0.95,
    "summary": "Expose a stdin-based memory distillation command. The agent supplies concise claims; the CLI validates task ownership, claim-to-source type compatibility, source existence, source status, and a deterministic digest without embedding an LLM.",
    "rationale": [
      "The CLI already records agent decisions but does not contain a model runtime.",
      "Per-claim source references retain auditability and let stale memory be detected deterministically."
    ],
    "appliesTo": [
      "src/core/v2/memory.ts",
      "src/commands/v2/index.ts",
      "src/cli.ts",
      "src/ui/v2/render.ts"
    ],
    "avoids": [
      "Built-in LLM calls",
      "Unverifiable free-form summaries"
    ],
    "sourceRefs": [
      "src/core/v2/remember.ts",
      "src/core/v2/source-store.ts"
    ],
    "createdAt": "2026-08-11T14:37:48.747Z",
    "updatedAt": "2026-08-11T14:37:48.747Z"
  }
}
```
