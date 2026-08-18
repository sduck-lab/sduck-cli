---
id: DEC-command-reference-completeness
type: decision
task_id: TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs:
  - DEC-0074
  - DEC-0077
  - DEC-0078
applies_to:
  - README.md
  - README.ko.md
  - src/cli.ts
avoids:
  - 실제 cli.ts 옵션 변경
  - 표에 없는 옵션을 임의로 추가
created_at: '2026-08-18T10:41:09.525Z'
updated_at: '2026-08-18T10:41:13.432Z'
---
# DEC-command-reference-completeness: README.md/README.ko.md Command reference 표에 누락된 실제 CLI 옵션을 채운다

## Decision
src/cli.ts 대조 결과 grill complete(--changed-assumption), evaluate(--limitation, --json), graph show(--mermaid), recall(--depth, --json), 루트 -V/--version, legacy start/fast-track(--no-git)/clean(--force)/archive(--keep <n>)/update(--dry-run)이 두 README 표 모두에서 누락돼 있었다. 각 표에 해당 옵션을 실제 cli.ts 시그니처 그대로 추가한다.

## Rationale
- 이미 구현·확정된 CLI 표면인데 문서에 없으면 에이전트/사용자가 존재하는 기능을 모르고 못 씀 -- 특히 --mermaid, recall --json은 이번 세션에 새로 추가된 기능이라 누락 위험이 컸음

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-command-reference-completeness",
    "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
    "title": "README.md/README.ko.md Command reference 표에 누락된 실제 CLI 옵션을 채운다",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "src/cli.ts 대조 결과 grill complete(--changed-assumption), evaluate(--limitation, --json), graph show(--mermaid), recall(--depth, --json), 루트 -V/--version, legacy start/fast-track(--no-git)/clean(--force)/archive(--keep <n>)/update(--dry-run)이 두 README 표 모두에서 누락돼 있었다. 각 표에 해당 옵션을 실제 cli.ts 시그니처 그대로 추가한다.",
    "rationale": [
      "이미 구현·확정된 CLI 표면인데 문서에 없으면 에이전트/사용자가 존재하는 기능을 모르고 못 씀 -- 특히 --mermaid, recall --json은 이번 세션에 새로 추가된 기능이라 누락 위험이 컸음"
    ],
    "appliesTo": [
      "README.md",
      "README.ko.md",
      "src/cli.ts"
    ],
    "avoids": [
      "실제 cli.ts 옵션 변경",
      "표에 없는 옵션을 임의로 추가"
    ],
    "sourceRefs": [
      "DEC-0074",
      "DEC-0077",
      "DEC-0078"
    ],
    "createdAt": "2026-08-18T10:41:09.525Z",
    "updatedAt": "2026-08-18T10:41:13.432Z"
  }
}
```
