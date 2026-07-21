---
id: DEC-0-6-release-evidence
type: decision
task_id: TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc
kind: INFERRED
status: CONFIRMED
confidence: 0.7
source_refs: []
applies_to:
  - package.json
  - package-lock.json
  - tests
  - README.md
avoids: []
created_at: '2026-07-21T08:39:55.739Z'
updated_at: '2026-07-21T08:39:55.739Z'
---
# DEC-0-6-release-evidence: Prove the CLI release from a packed artifact

## Decision
Release confidence requires source checks plus an installed tarball smoke that observes exact version, bundled assets, supported CLI routes, deferred routes, and Git-hook safety.

## Rationale
- none

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-0-6-release-evidence",
    "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
    "title": "Prove the CLI release from a packed artifact",
    "kind": "INFERRED",
    "status": "CONFIRMED",
    "confidence": 0.7,
    "summary": "Release confidence requires source checks plus an installed tarball smoke that observes exact version, bundled assets, supported CLI routes, deferred routes, and Git-hook safety.",
    "rationale": [],
    "appliesTo": [
      "package.json",
      "package-lock.json",
      "tests",
      "README.md"
    ],
    "avoids": [],
    "sourceRefs": [],
    "createdAt": "2026-07-21T08:39:55.739Z",
    "updatedAt": "2026-07-21T08:39:55.739Z"
  }
}
```
