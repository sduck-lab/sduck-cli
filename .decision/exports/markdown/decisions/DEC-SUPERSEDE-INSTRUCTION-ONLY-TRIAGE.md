---
id: DEC-SUPERSEDE-INSTRUCTION-ONLY-TRIAGE
type: decision
task_id: TASK-20260722-configure-risk-based-sduck-workflow-activation
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs:
  - conversation:2026-07-22
  - DEC-TASK-SCOPED-RECORD-DEPTH
  - DEC-0065
  - src/core/v2/retrospective.ts
applies_to:
  - src/core/v2/**
  - src/commands/v2/**
  - .sduck/sduck-assets/agent-rules/**
  - tests/**
  - README.md
  - docs/migration.md
avoids:
  - instruction-only lifecycle bypass
  - automatic sduck workflow enable or disable invocation
created_at: '2026-07-22T05:44:00.965Z'
updated_at: '2026-07-22T06:48:11.316Z'
---
# DEC-SUPERSEDE-INSTRUCTION-ONLY-TRIAGE: Replace instruction-only triage with durable task classification

## Decision
Supersede the earlier template-only record-depth proposal. The target is a first-class FULL/LIGHTWEIGHT task classification with FULL-by-default semantics; current full lifecycle remains until it exists.

## Rationale
- The user selected the first-class classification model after comparing strict lifecycle, instruction-only skips, and durable classification.
- Instruction-only skips create unrecorded exceptions while workflow mode is enabled.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-SUPERSEDE-INSTRUCTION-ONLY-TRIAGE",
    "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
    "title": "Replace instruction-only triage with durable task classification",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "Supersede the earlier template-only record-depth proposal. The target is a first-class FULL/LIGHTWEIGHT task classification with FULL-by-default semantics; current full lifecycle remains until it exists.",
    "rationale": [
      "The user selected the first-class classification model after comparing strict lifecycle, instruction-only skips, and durable classification.",
      "Instruction-only skips create unrecorded exceptions while workflow mode is enabled."
    ],
    "appliesTo": [
      "src/core/v2/**",
      "src/commands/v2/**",
      ".sduck/sduck-assets/agent-rules/**",
      "tests/**",
      "README.md",
      "docs/migration.md"
    ],
    "avoids": [
      "instruction-only lifecycle bypass",
      "automatic sduck workflow enable or disable invocation"
    ],
    "sourceRefs": [
      "conversation:2026-07-22",
      "DEC-TASK-SCOPED-RECORD-DEPTH",
      "DEC-0065",
      "src/core/v2/retrospective.ts"
    ],
    "createdAt": "2026-07-22T05:44:00.965Z",
    "updatedAt": "2026-07-22T06:48:11.316Z"
  }
}
```
