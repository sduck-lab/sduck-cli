---
id: DEC-readme-ko-categories-parity
type: decision
task_id: TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs:
  - DEC-readme-categories-docs
  - DEC-0089
  - DEC-0090
  - DEC-0091
  - DEC-0092
  - DEC-0093
  - DEC-0094
applies_to:
  - README.ko.md
avoids:
  - 영어 표를 그대로 복사(번역하지 않음)
created_at: '2026-08-18T10:41:09.525Z'
updated_at: '2026-08-18T10:41:13.432Z'
---
# DEC-readme-ko-categories-parity: README.ko.md에 Categories 섹션을 README.md와 1:1 대응으로 추가한다

## Decision
이전 태스크(DEC-readme-categories-docs)에서 README.md에만 Categories 섹션을 추가하고 README.ko.md는 빠뜨렸음을 이번 감사(Explore agent)에서 확인했다. 같은 위치(Decision task flow와 Bounded memory 사이)에 같은 표 구조로 한국어 설명을 추가한다.

## Rationale
- README.ko.md는 README.md의 '완전한 한국어 counterpart'라고 문서 자체(README.ko.md:44)가 명시하고 있어 섹션 누락은 그 자체로 문서 계약 위반

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-readme-ko-categories-parity",
    "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
    "title": "README.ko.md에 Categories 섹션을 README.md와 1:1 대응으로 추가한다",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "이전 태스크(DEC-readme-categories-docs)에서 README.md에만 Categories 섹션을 추가하고 README.ko.md는 빠뜨렸음을 이번 감사(Explore agent)에서 확인했다. 같은 위치(Decision task flow와 Bounded memory 사이)에 같은 표 구조로 한국어 설명을 추가한다.",
    "rationale": [
      "README.ko.md는 README.md의 '완전한 한국어 counterpart'라고 문서 자체(README.ko.md:44)가 명시하고 있어 섹션 누락은 그 자체로 문서 계약 위반"
    ],
    "appliesTo": [
      "README.ko.md"
    ],
    "avoids": [
      "영어 표를 그대로 복사(번역하지 않음)"
    ],
    "sourceRefs": [
      "DEC-readme-categories-docs",
      "DEC-0089",
      "DEC-0090",
      "DEC-0091",
      "DEC-0092",
      "DEC-0093",
      "DEC-0094"
    ],
    "createdAt": "2026-08-18T10:41:09.525Z",
    "updatedAt": "2026-08-18T10:41:13.432Z"
  }
}
```
