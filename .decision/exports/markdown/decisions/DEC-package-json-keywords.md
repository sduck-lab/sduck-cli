---
id: DEC-package-json-keywords
type: decision
task_id: TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비
kind: EXPLICIT
status: CONFIRMED
confidence: 0.9
source_refs:
  - DEC-readme-categories-docs
applies_to:
  - package.json
avoids:
  - description/repository 등 다른 필드 변경
created_at: '2026-08-18T10:41:09.525Z'
updated_at: '2026-08-18T10:41:13.432Z'
---
# DEC-package-json-keywords: package.json에 npm 검색성을 위한 keywords 배열을 추가한다

## Decision
package.json 감사 결과 keywords 필드가 아예 없어 npm 레지스트리 검색성에 불리했다. description("Terminal-first decision briefing harness for coding agents")과 실제 기능(decision record, coding agent workflow, CLI)에 부합하는 키워드 배열을 추가한다.

## Rationale
- 제품으로 배포하는 npm 패키지에서 keywords 부재는 discoverability를 직접 해치는 명백한 누락

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-package-json-keywords",
    "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
    "title": "package.json에 npm 검색성을 위한 keywords 배열을 추가한다",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 0.9,
    "summary": "package.json 감사 결과 keywords 필드가 아예 없어 npm 레지스트리 검색성에 불리했다. description(\"Terminal-first decision briefing harness for coding agents\")과 실제 기능(decision record, coding agent workflow, CLI)에 부합하는 키워드 배열을 추가한다.",
    "rationale": [
      "제품으로 배포하는 npm 패키지에서 keywords 부재는 discoverability를 직접 해치는 명백한 누락"
    ],
    "appliesTo": [
      "package.json"
    ],
    "avoids": [
      "description/repository 등 다른 필드 변경"
    ],
    "sourceRefs": [
      "DEC-readme-categories-docs"
    ],
    "createdAt": "2026-08-18T10:41:09.525Z",
    "updatedAt": "2026-08-18T10:41:13.432Z"
  }
}
```
