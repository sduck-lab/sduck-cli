---
id: DEC-WIKI-AGENT-WORKFLOW
type: decision
task_id: TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs: []
applies_to:
  - .sduck/sduck-assets/agent-rules/**
  - src/commands/v2/index.ts
  - src/cli.ts
  - src/core/v2/task.ts
  - tests/e2e/**
avoids:
  - LLM runtime
  - daemon
  - automatic commits
  - tag
  - push
  - publish
created_at: '2026-08-11T13:38:09.882Z'
updated_at: '2026-08-18T06:10:30.112Z'
---
# DEC-WIKI-AGENT-WORKFLOW: Keep Wiki generation agent-driven and task close non-gating

## Decision
Ship sd-build-wiki and sd-sync-wiki agent skills and make managed Codex rules point to their repository paths; the active coding agent creates prose, CLI validates and records it, close reports dirty/stale Wiki state but succeeds, and sync failure leaves stale state visible.

## Rationale
- The user excludes a sduck-owned LLM runtime, daemon, persistent Project Grill engine, and automatic commits.
- Wiki maintenance is advisory and must not become another lifecycle gate.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-WIKI-AGENT-WORKFLOW",
    "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
    "title": "Keep Wiki generation agent-driven and task close non-gating",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "Ship sd-build-wiki and sd-sync-wiki agent skills and make managed Codex rules point to their repository paths; the active coding agent creates prose, CLI validates and records it, close reports dirty/stale Wiki state but succeeds, and sync failure leaves stale state visible.",
    "rationale": [
      "The user excludes a sduck-owned LLM runtime, daemon, persistent Project Grill engine, and automatic commits.",
      "Wiki maintenance is advisory and must not become another lifecycle gate."
    ],
    "appliesTo": [
      ".sduck/sduck-assets/agent-rules/**",
      "src/commands/v2/index.ts",
      "src/cli.ts",
      "src/core/v2/task.ts",
      "tests/e2e/**"
    ],
    "avoids": [
      "LLM runtime",
      "daemon",
      "automatic commits",
      "tag",
      "push",
      "publish"
    ],
    "sourceRefs": [],
    "createdAt": "2026-08-11T13:38:09.882Z",
    "updatedAt": "2026-08-18T06:10:30.112Z",
    "category": "Wiki"
  }
}
```
