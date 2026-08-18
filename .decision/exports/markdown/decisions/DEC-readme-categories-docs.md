---
id: DEC-readme-categories-docs
type: decision
task_id: TASK-20260818-readme에-sduck-categories-명령어-문서화-추가-claude-md에-o
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs:
  - DEC-0089
  - DEC-0090
  - DEC-0091
  - DEC-0092
  - DEC-0093
  - DEC-0094
applies_to:
  - README.md
avoids:
  - 실제 명령어 동작 변경
  - 표에 없는 새 옵션 추가
created_at: '2026-08-18T08:39:06.355Z'
updated_at: '2026-08-18T08:39:13.616Z'
---
# DEC-readme-categories-docs: README Command reference에 categories 명령어 표를 추가한다

## Decision
이미 구현·확정된 sduck categories suggest/set/list/browse/tag 명령이 README에 전혀 문서화되어 있지 않음을 grep으로 확인했다(README.md 전체에 'categor' 문자열 0건). 기존 'Command reference'의 다른 하위 섹션(Workspace and config, Decision task flow 등)과 동일한 두 칸 Markdown 표 스타일로 Categories 섹션을 추가하고, cli.ts:507-603의 실제 옵션(--json, --uncategorized, --limit <n>, --stdin)을 그대로 옮긴다.

## Rationale
- categories 기능은 이미 DEC-0087~DEC-0094로 확정, IMPL-0037~0043으로 구현, MEM-0011로 133개 결정 소급 분류까지 검증된 완료 기능인데 사용자 대상 문서에만 빠져 있어 문서-코드 불일치 상태였음

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-readme-categories-docs",
    "taskId": "TASK-20260818-readme에-sduck-categories-명령어-문서화-추가-claude-md에-o",
    "title": "README Command reference에 categories 명령어 표를 추가한다",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "이미 구현·확정된 sduck categories suggest/set/list/browse/tag 명령이 README에 전혀 문서화되어 있지 않음을 grep으로 확인했다(README.md 전체에 'categor' 문자열 0건). 기존 'Command reference'의 다른 하위 섹션(Workspace and config, Decision task flow 등)과 동일한 두 칸 Markdown 표 스타일로 Categories 섹션을 추가하고, cli.ts:507-603의 실제 옵션(--json, --uncategorized, --limit <n>, --stdin)을 그대로 옮긴다.",
    "rationale": [
      "categories 기능은 이미 DEC-0087~DEC-0094로 확정, IMPL-0037~0043으로 구현, MEM-0011로 133개 결정 소급 분류까지 검증된 완료 기능인데 사용자 대상 문서에만 빠져 있어 문서-코드 불일치 상태였음"
    ],
    "appliesTo": [
      "README.md"
    ],
    "avoids": [
      "실제 명령어 동작 변경",
      "표에 없는 새 옵션 추가"
    ],
    "sourceRefs": [
      "DEC-0089",
      "DEC-0090",
      "DEC-0091",
      "DEC-0092",
      "DEC-0093",
      "DEC-0094"
    ],
    "createdAt": "2026-08-18T08:39:06.355Z",
    "updatedAt": "2026-08-18T08:39:13.616Z"
  }
}
```
