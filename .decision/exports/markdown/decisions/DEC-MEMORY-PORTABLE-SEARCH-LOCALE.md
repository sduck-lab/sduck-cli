---
id: DEC-MEMORY-PORTABLE-SEARCH-LOCALE
type: decision
task_id: TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing
kind: INFERRED
status: CONFIRMED
confidence: 0.7
source_refs: []
applies_to:
  - src/core/v2/memory-source.ts
  - src/core/v2/memory.ts
  - src/core/v2/context.ts
  - src/core/v2/recall.ts
  - src/ui/v2/messages.ts
  - src/ui/v2/render.ts
avoids:
  - Locale-dependent canonical digests
  - Changing machine-readable reason slugs
created_at: '2026-08-12T05:10:34.572Z'
updated_at: '2026-08-12T05:10:34.572Z'
---
# DEC-MEMORY-PORTABLE-SEARCH-LOCALE: Make memory digests, search patterns, and localized reasons portable

## Decision
Use code-unit ordering for digests, escape SQL LIKE wildcards, retain two-character Korean tokens, and translate human-readable memory reasons while leaving JSON slugs stable.

## Rationale
- These adjacent fixes close the review's low-risk portability, query, and localization gaps without changing canonical JSON contracts.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-MEMORY-PORTABLE-SEARCH-LOCALE",
    "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
    "title": "Make memory digests, search patterns, and localized reasons portable",
    "kind": "INFERRED",
    "status": "CONFIRMED",
    "confidence": 0.7,
    "summary": "Use code-unit ordering for digests, escape SQL LIKE wildcards, retain two-character Korean tokens, and translate human-readable memory reasons while leaving JSON slugs stable.",
    "rationale": [
      "These adjacent fixes close the review's low-risk portability, query, and localization gaps without changing canonical JSON contracts."
    ],
    "appliesTo": [
      "src/core/v2/memory-source.ts",
      "src/core/v2/memory.ts",
      "src/core/v2/context.ts",
      "src/core/v2/recall.ts",
      "src/ui/v2/messages.ts",
      "src/ui/v2/render.ts"
    ],
    "avoids": [
      "Locale-dependent canonical digests",
      "Changing machine-readable reason slugs"
    ],
    "sourceRefs": [],
    "createdAt": "2026-08-12T05:10:34.572Z",
    "updatedAt": "2026-08-12T05:10:34.572Z"
  }
}
```
