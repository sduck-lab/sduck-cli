---
id: DEC-MIGRATE-070-CLI-POLICY
type: decision
task_id: TASK-20260814-migrate-this-repository-to-the-globally-installe
kind: EXPLICIT
status: DRAFT
confidence: 1
source_refs: []
applies_to:
  - .decision/policy.json
  - .sduck/**
  - AGENTS.md
avoids:
  - manual-policy-edit
  - canonical-history-rewrite
  - automatic-wiki-build
created_at: '2026-08-14T08:14:45.780Z'
updated_at: '2026-08-18T06:10:30.112Z'
---
# DEC-MIGRATE-070-CLI-POLICY: Migrate the workspace through the installed 0.7.0 CLI

## Decision
Use sduck update rather than direct edits so the existing 0.7.0 asset set is preserved and the missing durable Wiki policy is created atomically.

## Rationale
- The user explicitly requested conversion to the newly installed sduck.
- The 0.7.0 update dry-run reports only the pending Wiki policy migration.
- The documented migration path preserves existing canonical records and legacy workflow/grill behavior.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-MIGRATE-070-CLI-POLICY",
    "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
    "title": "Migrate the workspace through the installed 0.7.0 CLI",
    "kind": "EXPLICIT",
    "status": "DRAFT",
    "confidence": 1,
    "summary": "Use sduck update rather than direct edits so the existing 0.7.0 asset set is preserved and the missing durable Wiki policy is created atomically.",
    "rationale": [
      "The user explicitly requested conversion to the newly installed sduck.",
      "The 0.7.0 update dry-run reports only the pending Wiki policy migration.",
      "The documented migration path preserves existing canonical records and legacy workflow/grill behavior."
    ],
    "appliesTo": [
      ".decision/policy.json",
      ".sduck/**",
      "AGENTS.md"
    ],
    "avoids": [
      "manual-policy-edit",
      "canonical-history-rewrite",
      "automatic-wiki-build"
    ],
    "sourceRefs": [],
    "createdAt": "2026-08-14T08:14:45.780Z",
    "updatedAt": "2026-08-18T06:10:30.112Z",
    "category": "릴리스/배포"
  }
}
```
