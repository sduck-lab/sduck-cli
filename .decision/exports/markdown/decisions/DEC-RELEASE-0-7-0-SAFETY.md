---
id: DEC-RELEASE-0-7-0-SAFETY
type: decision
task_id: TASK-20260814-release-push-and-publish-the-latest-sduck-cli-ve
kind: INFERRED
status: CONFIRMED
confidence: 1
source_refs:
  - DEC-0-6-release-evidence
  - DEC-RELEASE-READINESS-IS-ARTIFACT-BASED
  - .github/workflows/ci.yml
  - 'npm whoami: E401 Unauthorized'
applies_to:
  - .github/workflows/ci.yml
  - package.json
  - package-lock.json
  - v0.7.0
  - origin/main
  - '@sduck/sduck-cli@0.7.0'
avoids:
  - force push
  - moving an existing tag
  - publishing before CI success
  - publishing without authenticated npm identity
  - publishing a tarball different from the validated artifact
created_at: '2026-08-14T07:25:35.114Z'
updated_at: '2026-08-18T06:10:30.112Z'
---
# DEC-RELEASE-0-7-0-SAFETY: Gate irreversible release mutations on fresh evidence

## Decision
Run the repository CI-equivalent checks, validate and smoke-test the packed tarball in isolation, verify GitHub and npm identity plus remote/registry freshness, push main, wait for its GitHub Actions CI to succeed, then create and push an annotated v0.7.0 tag and publish the exact tarball to npm latest.

## Rationale
- Prior release decisions require artifact-based validation rather than source-only checks.
- Waiting for main CI before tag and npm publication minimizes partial release risk.
- npm whoami currently fails with 401, so no irreversible release mutation should begin until npm authentication succeeds.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-RELEASE-0-7-0-SAFETY",
    "taskId": "TASK-20260814-release-push-and-publish-the-latest-sduck-cli-ve",
    "title": "Gate irreversible release mutations on fresh evidence",
    "kind": "INFERRED",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "Run the repository CI-equivalent checks, validate and smoke-test the packed tarball in isolation, verify GitHub and npm identity plus remote/registry freshness, push main, wait for its GitHub Actions CI to succeed, then create and push an annotated v0.7.0 tag and publish the exact tarball to npm latest.",
    "rationale": [
      "Prior release decisions require artifact-based validation rather than source-only checks.",
      "Waiting for main CI before tag and npm publication minimizes partial release risk.",
      "npm whoami currently fails with 401, so no irreversible release mutation should begin until npm authentication succeeds."
    ],
    "appliesTo": [
      ".github/workflows/ci.yml",
      "package.json",
      "package-lock.json",
      "v0.7.0",
      "origin/main",
      "@sduck/sduck-cli@0.7.0"
    ],
    "avoids": [
      "force push",
      "moving an existing tag",
      "publishing before CI success",
      "publishing without authenticated npm identity",
      "publishing a tarball different from the validated artifact"
    ],
    "sourceRefs": [
      "DEC-0-6-release-evidence",
      "DEC-RELEASE-READINESS-IS-ARTIFACT-BASED",
      ".github/workflows/ci.yml",
      "npm whoami: E401 Unauthorized"
    ],
    "createdAt": "2026-08-14T07:25:35.114Z",
    "updatedAt": "2026-08-18T06:10:30.112Z",
    "category": "릴리스/배포"
  }
}
```
