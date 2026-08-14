---
id: DEC-WIKI-EVIDENCE-LANGUAGE
type: decision
task_id: TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs: []
applies_to:
  - src/core/v2/wiki*.ts
  - .sduck/sduck-assets/agent-rules/**
  - README*.md
avoids:
  - claims that sduck verified code semantics
  - claims that evaluation strings are executable CI evidence
  - general claim graph
created_at: '2026-08-11T13:38:09.882Z'
updated_at: '2026-08-11T13:38:20.347Z'
---
# DEC-WIKI-EVIDENCE-LANGUAGE: Keep intent, implementation claims, changes, and validation reports distinct

## Decision
Use typed explanatory blocks with block-level source IDs and visible provenance labels so decision intent, agent-submitted implementation claims, Git/trace change tracking, evaluation-string reports, and agent-proposed semantic conflicts cannot be rendered as the same evidence class.

## Rationale
- The CLI can validate IDs, trace structure, digests, markers, paths, and links but cannot prove source-code meaning or CI truth.
- Block-level provenance is traceable without attaching a citation to every ordinary sentence.

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-WIKI-EVIDENCE-LANGUAGE",
    "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
    "title": "Keep intent, implementation claims, changes, and validation reports distinct",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "Use typed explanatory blocks with block-level source IDs and visible provenance labels so decision intent, agent-submitted implementation claims, Git/trace change tracking, evaluation-string reports, and agent-proposed semantic conflicts cannot be rendered as the same evidence class.",
    "rationale": [
      "The CLI can validate IDs, trace structure, digests, markers, paths, and links but cannot prove source-code meaning or CI truth.",
      "Block-level provenance is traceable without attaching a citation to every ordinary sentence."
    ],
    "appliesTo": [
      "src/core/v2/wiki*.ts",
      ".sduck/sduck-assets/agent-rules/**",
      "README*.md"
    ],
    "avoids": [
      "claims that sduck verified code semantics",
      "claims that evaluation strings are executable CI evidence",
      "general claim graph"
    ],
    "sourceRefs": [],
    "createdAt": "2026-08-11T13:38:09.882Z",
    "updatedAt": "2026-08-11T13:38:20.347Z"
  }
}
```
