---
id: DEC-version-bump-0-8-0
type: decision
task_id: TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비
kind: EXPLICIT
status: CONFIRMED
confidence: 1
source_refs:
  - DEC-0097
  - DEC-0098
  - DEC-0089
  - DEC-0090
  - DEC-0091
  - DEC-0092
  - DEC-0093
  - DEC-0094
  - DEC-0074
  - DEC-0077
  - DEC-0078
  - DEC-0085
applies_to:
  - package.json
  - README.md
  - README.ko.md
  - docs/release-0.8.0.md
avoids:
  - git tag 생성
  - npm publish
  - git push
  - docs/release-0.7.0.md 수정
created_at: '2026-08-18T10:41:09.525Z'
updated_at: '2026-08-18T10:41:13.432Z'
---
# DEC-version-bump-0-8-0: package.json 버전을 0.8.0으로 올리고 README 'What is new' 섹션과 docs/release-0.8.0.md를 신규 작성한다

## Decision
이번 세션에 병합된 커밋(570dedc)이 categories 명령 전체, 워크트리 간 ID 충돌 방지, recall DRAFT 가시성/그래프 엣지(CARRIED_FROM·CITES)/FTS5 검색, graph show --mermaid 등 새 공개 기능을 추가했지만 package.json 버전(0.7.0)이 이를 반영하지 못하고 있었다. 사용자에게 직접 확인해 semver상 새 명령/옵션 추가는 minor 범위라는 판단으로 0.8.0으로 올리고, docs/release-0.7.0.md와 같은 포맷의 docs/release-0.8.0.md를 새로 작성하며, 두 README의 'What is new' 섹션을 0.8.0 최신 기능으로 교체한다(기존 컨벤션상 README는 최신 버전만 강조, 과거 버전은 각자의 release note 파일에 보존됨). git tag/npm publish/push 등 실제 배포 행위는 이번 범위에서 명시적으로 제외한다.

## Rationale
- 사용자가 AskUserQuestion에서 '버전 올리고 release note 추가'를 명시적으로 선택함
- docs/release-0.7.0.md가 이미 Auto Wiki 전용으로 확정된 release note이므로 이번 세션 기능을 그 안에 끼워넣는 대신 별도 0.8.0 release note로 분리하는 것이 기존 파일 구조 컨벤션과 일치함

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-version-bump-0-8-0",
    "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
    "title": "package.json 버전을 0.8.0으로 올리고 README 'What is new' 섹션과 docs/release-0.8.0.md를 신규 작성한다",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 1,
    "summary": "이번 세션에 병합된 커밋(570dedc)이 categories 명령 전체, 워크트리 간 ID 충돌 방지, recall DRAFT 가시성/그래프 엣지(CARRIED_FROM·CITES)/FTS5 검색, graph show --mermaid 등 새 공개 기능을 추가했지만 package.json 버전(0.7.0)이 이를 반영하지 못하고 있었다. 사용자에게 직접 확인해 semver상 새 명령/옵션 추가는 minor 범위라는 판단으로 0.8.0으로 올리고, docs/release-0.7.0.md와 같은 포맷의 docs/release-0.8.0.md를 새로 작성하며, 두 README의 'What is new' 섹션을 0.8.0 최신 기능으로 교체한다(기존 컨벤션상 README는 최신 버전만 강조, 과거 버전은 각자의 release note 파일에 보존됨). git tag/npm publish/push 등 실제 배포 행위는 이번 범위에서 명시적으로 제외한다.",
    "rationale": [
      "사용자가 AskUserQuestion에서 '버전 올리고 release note 추가'를 명시적으로 선택함",
      "docs/release-0.7.0.md가 이미 Auto Wiki 전용으로 확정된 release note이므로 이번 세션 기능을 그 안에 끼워넣는 대신 별도 0.8.0 release note로 분리하는 것이 기존 파일 구조 컨벤션과 일치함"
    ],
    "appliesTo": [
      "package.json",
      "README.md",
      "README.ko.md",
      "docs/release-0.8.0.md"
    ],
    "avoids": [
      "git tag 생성",
      "npm publish",
      "git push",
      "docs/release-0.7.0.md 수정"
    ],
    "sourceRefs": [
      "DEC-0097",
      "DEC-0098",
      "DEC-0089",
      "DEC-0090",
      "DEC-0091",
      "DEC-0092",
      "DEC-0093",
      "DEC-0094",
      "DEC-0074",
      "DEC-0077",
      "DEC-0078",
      "DEC-0085"
    ],
    "createdAt": "2026-08-18T10:41:09.525Z",
    "updatedAt": "2026-08-18T10:41:13.432Z"
  }
}
```
