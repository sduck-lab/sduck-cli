---
id: DEC-RELEASE-0-7-0-CONTENTS
type: decision
task_id: TASK-20260814-release-push-and-publish-the-latest-sduck-cli-ve
kind: INFERRED
status: CONFIRMED
confidence: 0.95
source_refs:
  - IMPL-0025
  - IMPL-0026
  - IMPL-0027
  - git status --porcelain=v2
applies_to:
  - src/**
  - tests/**
  - README.md
  - README.ko.md
  - docs/**
  - .sduck/sduck-assets/**
  - .decision/exports/markdown/**
  - AGENTS.md
  - CLAUDE.md
  - GEMINI.md
  - .agents/**
  - .claude/**
  - .cursor/**
  - .ignore
  - .prettierignore
  - package.json
  - package-lock.json
avoids:
  - .omc/**
  - .decision/db.sqlite
  - .decision/state.json
  - dist/**
  - coverage/**
  - node_modules/**
  - unrelated branch changes
created_at: '2026-08-14T07:25:35.114Z'
updated_at: '2026-08-18T06:10:30.112Z'
---
# DEC-RELEASE-0-7-0-CONTENTS: Commit the completed release payload and canonical records

## Decision
Create one release commit from the completed 0.7.0 code, tests, documentation, bundled agent assets, generated repository agent rules, and canonical .decision records, while excluding local .omc session artifacts and ignored caches/build output.

## Rationale
- Closed task traces IMPL-0025, IMPL-0026, and IMPL-0027 map the current code, documentation, tests, root agent assets, and decision exports to completed work.
- .omc contains local session and callback state, is not part of the package files contract, and appears in no completed implementation trace.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-RELEASE-0-7-0-CONTENTS",
    "taskId": "TASK-20260814-release-push-and-publish-the-latest-sduck-cli-ve",
    "title": "Commit the completed release payload and canonical records",
    "kind": "INFERRED",
    "status": "CONFIRMED",
    "confidence": 0.95,
    "summary": "Create one release commit from the completed 0.7.0 code, tests, documentation, bundled agent assets, generated repository agent rules, and canonical .decision records, while excluding local .omc session artifacts and ignored caches/build output.",
    "rationale": [
      "Closed task traces IMPL-0025, IMPL-0026, and IMPL-0027 map the current code, documentation, tests, root agent assets, and decision exports to completed work.",
      ".omc contains local session and callback state, is not part of the package files contract, and appears in no completed implementation trace."
    ],
    "appliesTo": [
      "src/**",
      "tests/**",
      "README.md",
      "README.ko.md",
      "docs/**",
      ".sduck/sduck-assets/**",
      ".decision/exports/markdown/**",
      "AGENTS.md",
      "CLAUDE.md",
      "GEMINI.md",
      ".agents/**",
      ".claude/**",
      ".cursor/**",
      ".ignore",
      ".prettierignore",
      "package.json",
      "package-lock.json"
    ],
    "avoids": [
      ".omc/**",
      ".decision/db.sqlite",
      ".decision/state.json",
      "dist/**",
      "coverage/**",
      "node_modules/**",
      "unrelated branch changes"
    ],
    "sourceRefs": [
      "IMPL-0025",
      "IMPL-0026",
      "IMPL-0027",
      "git status --porcelain=v2"
    ],
    "createdAt": "2026-08-14T07:25:35.114Z",
    "updatedAt": "2026-08-18T06:10:30.112Z",
    "category": "릴리스/배포"
  }
}
```
