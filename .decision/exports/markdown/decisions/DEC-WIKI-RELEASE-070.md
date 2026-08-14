---
id: DEC-WIKI-RELEASE-070
type: decision
task_id: TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs: []
applies_to:
  - package.json
  - package-lock.json
  - .sduck/sduck-assets/.sduck-version
  - tests/**
  - README.md
  - README.ko.md
  - docs/**
avoids:
  - CHANGELOG.md without demonstrated need
  - git tag
  - git push
  - GitHub release
  - npm publish
created_at: '2026-08-11T13:38:09.882Z'
updated_at: '2026-08-11T13:38:20.347Z'
---
# DEC-WIKI-RELEASE-070: Expose Auto Wiki as the 0.7.0 public surface without releasing it

## Decision
Update package and bundled-asset versions, version assertions, English and Korean documentation, command reference, migration and pilot guidance to 0.7.0; validate the packed artifact but do not tag, push, create a release, or publish.

## Rationale
- Auto Wiki is a new public product surface and therefore warrants the approved minor version bump.
- The approved boundary ends at files and package verification.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-WIKI-RELEASE-070",
    "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
    "title": "Expose Auto Wiki as the 0.7.0 public surface without releasing it",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "Update package and bundled-asset versions, version assertions, English and Korean documentation, command reference, migration and pilot guidance to 0.7.0; validate the packed artifact but do not tag, push, create a release, or publish.",
    "rationale": [
      "Auto Wiki is a new public product surface and therefore warrants the approved minor version bump.",
      "The approved boundary ends at files and package verification."
    ],
    "appliesTo": [
      "package.json",
      "package-lock.json",
      ".sduck/sduck-assets/.sduck-version",
      "tests/**",
      "README.md",
      "README.ko.md",
      "docs/**"
    ],
    "avoids": [
      "CHANGELOG.md without demonstrated need",
      "git tag",
      "git push",
      "GitHub release",
      "npm publish"
    ],
    "sourceRefs": [],
    "createdAt": "2026-08-11T13:38:09.882Z",
    "updatedAt": "2026-08-11T13:38:20.347Z"
  }
}
```
