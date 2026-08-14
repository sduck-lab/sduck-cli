---
id: DEC-RELEASE-0-7-0-AUTHORIZATION
type: decision
task_id: TASK-20260814-release-push-and-publish-the-latest-sduck-cli-ve
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs:
  - user:push 및 배포 진행 최신버전
  - package.json
  - docs/release-0.7.0.md
  - DEC-WIKI-RELEASE-070
applies_to:
  - package.json
  - package-lock.json
  - .sduck/sduck-assets/.sduck-version
  - docs/release-0.7.0.md
avoids:
  - publishing any version other than 0.7.0
  - rewriting completed feature behavior during release
created_at: '2026-08-14T07:25:35.114Z'
updated_at: '2026-08-14T07:30:43.862Z'
---
# DEC-RELEASE-0-7-0-AUTHORIZATION: Release the prepared 0.7.0 package

## Decision
Treat the user's new request as authorization to release @sduck/sduck-cli@0.7.0, superseding the earlier implementation task's task-local prohibition on tag, push, and publish.

## Rationale
- package.json, package-lock.json, the bundled asset version, and docs/release-0.7.0.md identify 0.7.0 as the prepared next version.
- The prior no-release boundary constrained the completed implementation task; this separate user-requested release task explicitly expands authority.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-RELEASE-0-7-0-AUTHORIZATION",
    "taskId": "TASK-20260814-release-push-and-publish-the-latest-sduck-cli-ve",
    "title": "Release the prepared 0.7.0 package",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "Treat the user's new request as authorization to release @sduck/sduck-cli@0.7.0, superseding the earlier implementation task's task-local prohibition on tag, push, and publish.",
    "rationale": [
      "package.json, package-lock.json, the bundled asset version, and docs/release-0.7.0.md identify 0.7.0 as the prepared next version.",
      "The prior no-release boundary constrained the completed implementation task; this separate user-requested release task explicitly expands authority."
    ],
    "appliesTo": [
      "package.json",
      "package-lock.json",
      ".sduck/sduck-assets/.sduck-version",
      "docs/release-0.7.0.md"
    ],
    "avoids": [
      "publishing any version other than 0.7.0",
      "rewriting completed feature behavior during release"
    ],
    "sourceRefs": [
      "user:push 및 배포 진행 최신버전",
      "package.json",
      "docs/release-0.7.0.md",
      "DEC-WIKI-RELEASE-070"
    ],
    "createdAt": "2026-08-14T07:25:35.114Z",
    "updatedAt": "2026-08-14T07:30:43.862Z"
  }
}
```
