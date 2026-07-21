---
id: DEC-0-6-cli-foundation
type: decision
task_id: TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs: []
applies_to:
  - README.md
  - README.ko.md
  - docs/design/mcp-control-plane-0.6-contract.md
  - docs/design/conversational-workflow.md
  - src/cli.ts
  - package.json
avoids: []
created_at: '2026-07-21T08:39:55.739Z'
updated_at: '2026-07-21T08:39:55.739Z'
---
# DEC-0-6-cli-foundation: Ship 0.6.0 as CLI foundations, not an MCP runtime

## Decision
The user will use the CLI only. 0.6.0 ships supported CLI foundations and repository-only Phase 0 fixtures while every MCP runtime/control-plane surface remains deferred.

## Rationale
- none

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-0-6-cli-foundation",
    "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
    "title": "Ship 0.6.0 as CLI foundations, not an MCP runtime",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "The user will use the CLI only. 0.6.0 ships supported CLI foundations and repository-only Phase 0 fixtures while every MCP runtime/control-plane surface remains deferred.",
    "rationale": [],
    "appliesTo": [
      "README.md",
      "README.ko.md",
      "docs/design/mcp-control-plane-0.6-contract.md",
      "docs/design/conversational-workflow.md",
      "src/cli.ts",
      "package.json"
    ],
    "avoids": [],
    "sourceRefs": [],
    "createdAt": "2026-07-21T08:39:55.739Z",
    "updatedAt": "2026-07-21T08:39:55.739Z"
  }
}
```
