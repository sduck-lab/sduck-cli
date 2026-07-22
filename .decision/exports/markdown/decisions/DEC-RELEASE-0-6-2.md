---
id: DEC-RELEASE-0-6-2
type: decision
task_id: TASK-20260722-release-stage-1-as-0-6-2
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs:
  - conversation:2026-07-22
  - npm registry:@sduck/sduck-cli@0.6.1
  - git tag:v0.6.1
applies_to:
  - package.json
  - package-lock.json
  - .sduck/sduck-assets/.sduck-version
  - src/core/v2/source-store.ts
  - tests/**
  - .decision/exports/markdown/**
avoids:
  - .ignore
  - unrelated source changes
  - publishing another version
created_at: '2026-07-22T07:26:17.526Z'
updated_at: '2026-07-22T07:26:17.749Z'
---
# DEC-RELEASE-0-6-2: Release Stage 1 as a new 0.6.2 package

## Decision
Fix release gates, bump all canonical version sources to 0.6.2, validate the tarball, commit and tag the intended release files, then publish exactly @sduck/sduck-cli@0.6.2.

## Rationale
- The user explicitly requested a 0.6.2 version bump and deployment.
- 0.6.1 is already registered and tagged, so modified source cannot be released under that immutable version.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-RELEASE-0-6-2",
    "taskId": "TASK-20260722-release-stage-1-as-0-6-2",
    "title": "Release Stage 1 as a new 0.6.2 package",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "Fix release gates, bump all canonical version sources to 0.6.2, validate the tarball, commit and tag the intended release files, then publish exactly @sduck/sduck-cli@0.6.2.",
    "rationale": [
      "The user explicitly requested a 0.6.2 version bump and deployment.",
      "0.6.1 is already registered and tagged, so modified source cannot be released under that immutable version."
    ],
    "appliesTo": [
      "package.json",
      "package-lock.json",
      ".sduck/sduck-assets/.sduck-version",
      "src/core/v2/source-store.ts",
      "tests/**",
      ".decision/exports/markdown/**"
    ],
    "avoids": [
      ".ignore",
      "unrelated source changes",
      "publishing another version"
    ],
    "sourceRefs": [
      "conversation:2026-07-22",
      "npm registry:@sduck/sduck-cli@0.6.1",
      "git tag:v0.6.1"
    ],
    "createdAt": "2026-07-22T07:26:17.526Z",
    "updatedAt": "2026-07-22T07:26:17.749Z"
  }
}
```
