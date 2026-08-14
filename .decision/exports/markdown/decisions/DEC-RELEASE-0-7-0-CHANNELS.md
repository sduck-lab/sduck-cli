---
id: DEC-RELEASE-0-7-0-CHANNELS
type: decision
task_id: TASK-20260814-release-push-and-publish-the-latest-sduck-cli-ve
kind: INFERRED
status: CONFIRMED
confidence: 0.9
source_refs:
  - user:push 및 배포 진행 최신버전
  - git remote -v
  - gh release list
  - npm view @sduck/sduck-cli version dist-tags
applies_to:
  - origin/main
  - refs/tags/v0.7.0
  - npm:latest
avoids:
  - GitHub Release creation
  - unrelated branches
  - force operations
created_at: '2026-08-14T07:25:35.114Z'
updated_at: '2026-08-14T07:30:43.862Z'
---
# DEC-RELEASE-0-7-0-CHANNELS: Limit release channels to Git and npm

## Decision
Push only main and the new annotated v0.7.0 tag, and publish @sduck/sduck-cli@0.7.0 with the npm latest dist-tag; do not create a GitHub Release or push unrelated branches.

## Rationale
- The user requested push and deployment, and this CLI's established distribution channel is npm.
- The repository has no prior GitHub Releases and the user did not request one.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-RELEASE-0-7-0-CHANNELS",
    "taskId": "TASK-20260814-release-push-and-publish-the-latest-sduck-cli-ve",
    "title": "Limit release channels to Git and npm",
    "kind": "INFERRED",
    "status": "CONFIRMED",
    "confidence": 0.9,
    "summary": "Push only main and the new annotated v0.7.0 tag, and publish @sduck/sduck-cli@0.7.0 with the npm latest dist-tag; do not create a GitHub Release or push unrelated branches.",
    "rationale": [
      "The user requested push and deployment, and this CLI's established distribution channel is npm.",
      "The repository has no prior GitHub Releases and the user did not request one."
    ],
    "appliesTo": [
      "origin/main",
      "refs/tags/v0.7.0",
      "npm:latest"
    ],
    "avoids": [
      "GitHub Release creation",
      "unrelated branches",
      "force operations"
    ],
    "sourceRefs": [
      "user:push 및 배포 진행 최신버전",
      "git remote -v",
      "gh release list",
      "npm view @sduck/sduck-cli version dist-tags"
    ],
    "createdAt": "2026-08-14T07:25:35.114Z",
    "updatedAt": "2026-08-14T07:30:43.862Z"
  }
}
```
