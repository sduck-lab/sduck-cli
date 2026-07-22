---
id: DEC-RELEASE-READINESS-IS-ARTIFACT-BASED
type: decision
task_id: TASK-20260722-validate-stage-1-release-readiness
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs:
  - conversation:2026-07-22
  - DEC-0-6-release-evidence
  - package.json
applies_to:
  - package.json
  - npm package artifact
  - release validation commands
avoids:
  - npm publish
  - version mutation
  - Git mutation
created_at: '2026-07-22T06:57:25.712Z'
updated_at: '2026-07-22T06:57:25.970Z'
---
# DEC-RELEASE-READINESS-IS-ARTIFACT-BASED: Validate the packaged CLI rather than only the source tree

## Decision
Release readiness will require declared source checks plus an isolated npm tarball installation and CLI smoke; no publish or release mutation is authorized.

## Rationale
- The user requested deployment readiness, and prior release evidence requires a packed-artifact smoke.
- Source-only checks cannot prove that package files and CLI entry points are included correctly.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-RELEASE-READINESS-IS-ARTIFACT-BASED",
    "taskId": "TASK-20260722-validate-stage-1-release-readiness",
    "title": "Validate the packaged CLI rather than only the source tree",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "Release readiness will require declared source checks plus an isolated npm tarball installation and CLI smoke; no publish or release mutation is authorized.",
    "rationale": [
      "The user requested deployment readiness, and prior release evidence requires a packed-artifact smoke.",
      "Source-only checks cannot prove that package files and CLI entry points are included correctly."
    ],
    "appliesTo": [
      "package.json",
      "npm package artifact",
      "release validation commands"
    ],
    "avoids": [
      "npm publish",
      "version mutation",
      "Git mutation"
    ],
    "sourceRefs": [
      "conversation:2026-07-22",
      "DEC-0-6-release-evidence",
      "package.json"
    ],
    "createdAt": "2026-07-22T06:57:25.712Z",
    "updatedAt": "2026-07-22T06:57:25.970Z"
  }
}
```
