---
id: DEC-readme-quickstart-parity
type: decision
task_id: TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비
kind: EXPLICIT
status: CONFIRMED
confidence: 0.95
source_refs:
  - DEC-0074
  - DEC-0077
  - DEC-0078
  - DEC-0089
applies_to:
  - README.md
  - README.ko.md
avoids:
  - 기존 정확한 문장의 의미를 바꾸는 재작성
  - 구조 변경(섹션 순서 등)
created_at: '2026-08-18T10:41:09.525Z'
updated_at: '2026-08-18T10:41:13.432Z'
---
# DEC-readme-quickstart-parity: README.md/README.ko.md의 Quick start 스크립트와 EN/KO 패리티 격차를 수정한다

## Decision
Explore 감사 결과 Quick start 코드블록에 categories/recall --json/graph --mermaid 사용례가 전혀 없고, README.ko.md는 --record-depth 예시·설명·표 행이 누락되어 있으며 'unless disabled', 'policy-snapshot' 문구도 빠져 있다. 반대로 README.ko.md의 'README 언어 선택과 CLI locale 설정은 서로 독립적' 문장은 README.md에 대응 문장이 없다. Legacy 섹션 제목도 EN은 복수(commands), KO는 단수(command)로 불일치한다. 이 모든 사실 기반 격차를 상호 반영해 두 문서를 동등하게 맞춘다.

## Rationale
- 제품으로 배포하는 문서에서 언어별로 다른 정보를 주면 사용자가 언어 선택에 따라 다른 기능을 알게 되는 문제가 생김

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-readme-quickstart-parity",
    "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
    "title": "README.md/README.ko.md의 Quick start 스크립트와 EN/KO 패리티 격차를 수정한다",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 0.95,
    "summary": "Explore 감사 결과 Quick start 코드블록에 categories/recall --json/graph --mermaid 사용례가 전혀 없고, README.ko.md는 --record-depth 예시·설명·표 행이 누락되어 있으며 'unless disabled', 'policy-snapshot' 문구도 빠져 있다. 반대로 README.ko.md의 'README 언어 선택과 CLI locale 설정은 서로 독립적' 문장은 README.md에 대응 문장이 없다. Legacy 섹션 제목도 EN은 복수(commands), KO는 단수(command)로 불일치한다. 이 모든 사실 기반 격차를 상호 반영해 두 문서를 동등하게 맞춘다.",
    "rationale": [
      "제품으로 배포하는 문서에서 언어별로 다른 정보를 주면 사용자가 언어 선택에 따라 다른 기능을 알게 되는 문제가 생김"
    ],
    "appliesTo": [
      "README.md",
      "README.ko.md"
    ],
    "avoids": [
      "기존 정확한 문장의 의미를 바꾸는 재작성",
      "구조 변경(섹션 순서 등)"
    ],
    "sourceRefs": [
      "DEC-0074",
      "DEC-0077",
      "DEC-0078",
      "DEC-0089"
    ],
    "createdAt": "2026-08-18T10:41:09.525Z",
    "updatedAt": "2026-08-18T10:41:13.432Z"
  }
}
```
