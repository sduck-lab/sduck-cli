---
id: DEC-WIKI-DIRTY-STATUS
type: decision
task_id: TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs: []
applies_to:
  - src/core/v2/relevance.ts
  - src/core/v2/git-diff.ts
  - src/core/v2/wiki*.ts
  - tests/unit/wiki*.test.ts
avoids:
  - LLM semantic conflict presented as CLI validation
  - retrospective hook reuse for external commit detection
  - unrelated Wiki page changes
created_at: '2026-08-11T13:38:09.882Z'
updated_at: '2026-08-18T06:10:30.112Z'
---
# DEC-WIKI-DIRTY-STATUS: Compute Wiki dirtiness only from deterministic evidence

## Decision
Status and lint compare referenced source digests, missing or superseded IDs, generated-region digests, observed decision/trace IDs, trace mappings and unmapped decisions, fixed layout, links, and lastSyncedCommit..HEAD file changes scored through existing relevance rules; new decisions or traces always dirty the global recent-changes page.

## Rationale
- These signals are deterministic and align with the user's allowed automatic-detection claims.
- Pages whose source and relevant evidence did not change must not be rewritten.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-WIKI-DIRTY-STATUS",
    "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
    "title": "Compute Wiki dirtiness only from deterministic evidence",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "Status and lint compare referenced source digests, missing or superseded IDs, generated-region digests, observed decision/trace IDs, trace mappings and unmapped decisions, fixed layout, links, and lastSyncedCommit..HEAD file changes scored through existing relevance rules; new decisions or traces always dirty the global recent-changes page.",
    "rationale": [
      "These signals are deterministic and align with the user's allowed automatic-detection claims.",
      "Pages whose source and relevant evidence did not change must not be rewritten."
    ],
    "appliesTo": [
      "src/core/v2/relevance.ts",
      "src/core/v2/git-diff.ts",
      "src/core/v2/wiki*.ts",
      "tests/unit/wiki*.test.ts"
    ],
    "avoids": [
      "LLM semantic conflict presented as CLI validation",
      "retrospective hook reuse for external commit detection",
      "unrelated Wiki page changes"
    ],
    "sourceRefs": [],
    "createdAt": "2026-08-11T13:38:09.882Z",
    "updatedAt": "2026-08-18T06:10:30.112Z",
    "category": "Wiki"
  }
}
```
