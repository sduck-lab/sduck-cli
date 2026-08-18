---
id: DEC-claude-md-omc-wiki-note
type: decision
task_id: TASK-20260818-readme에-sduck-categories-명령어-문서화-추가-claude-md에-o
kind: EXPLICIT
status: CONFIRMED
confidence: 0.9
source_refs:
  - DEC-WIKI-SECTION-OWNERSHIP
  - DEC-WIKI-MATERIALIZED-VIEW
applies_to:
  - CLAUDE.md
avoids:
  - OMC wiki_* 도구 자체를 비활성화하거나 재정의
  - docs/wiki/ 생성 섹션 소유권 규칙 변경
created_at: '2026-08-18T08:39:06.355Z'
updated_at: '2026-08-18T08:39:13.616Z'
---
# DEC-claude-md-omc-wiki-note: CLAUDE.md에 OMC wiki_* 도구와 sduck wiki 시스템이 서로 다른 별개 시스템임을 명시하는 메모를 추가한다

## Decision
이 세션에서 사용 가능한 MCP 도구 목록에 mcp__plugin_oh-my-claudecode_t__wiki_add/delete/ingest/lint/list/query/read가 존재함을 확인했다. 이는 sduck의 docs/wiki/(sduck wiki build|status|sync|lint로만 관리되는 캐노니컬 프로젝트 위키)와 이름은 비슷하지만 별개의 저장/스키마를 쓰는 OMC 자체 도구다. 에이전트가 이름의 유사성 때문에 OMC wiki_* 도구로 docs/wiki/를 직접 조작하면 sduck의 생성-섹션 소유권 마커(ownership marker) 규칙을 우회해 사람이 편집한 내용을 덮어쓰거나 sduck wiki lint가 검증하지 않는 불일치 상태를 만들 위험이 있다.

## Rationale
- CLAUDE.md의 기존 'Evidence-backed Wiki workflow' 섹션은 sduck wiki 명령/스킬 이름만 구분하고 있고(sd-build-wiki vs sd-sync-wiki), OMC라는 별도 도구 계열의 존재는 전혀 언급하지 않아 향후 에이전트가 혼동할 수 있는 빈틈이 있었음

## Sduck source

```json sduck-source
{
  "decision": {
    "id": "DEC-claude-md-omc-wiki-note",
    "taskId": "TASK-20260818-readme에-sduck-categories-명령어-문서화-추가-claude-md에-o",
    "title": "CLAUDE.md에 OMC wiki_* 도구와 sduck wiki 시스템이 서로 다른 별개 시스템임을 명시하는 메모를 추가한다",
    "kind": "EXPLICIT",
    "status": "CONFIRMED",
    "confidence": 0.9,
    "summary": "이 세션에서 사용 가능한 MCP 도구 목록에 mcp__plugin_oh-my-claudecode_t__wiki_add/delete/ingest/lint/list/query/read가 존재함을 확인했다. 이는 sduck의 docs/wiki/(sduck wiki build|status|sync|lint로만 관리되는 캐노니컬 프로젝트 위키)와 이름은 비슷하지만 별개의 저장/스키마를 쓰는 OMC 자체 도구다. 에이전트가 이름의 유사성 때문에 OMC wiki_* 도구로 docs/wiki/를 직접 조작하면 sduck의 생성-섹션 소유권 마커(ownership marker) 규칙을 우회해 사람이 편집한 내용을 덮어쓰거나 sduck wiki lint가 검증하지 않는 불일치 상태를 만들 위험이 있다.",
    "rationale": [
      "CLAUDE.md의 기존 'Evidence-backed Wiki workflow' 섹션은 sduck wiki 명령/스킬 이름만 구분하고 있고(sd-build-wiki vs sd-sync-wiki), OMC라는 별도 도구 계열의 존재는 전혀 언급하지 않아 향후 에이전트가 혼동할 수 있는 빈틈이 있었음"
    ],
    "appliesTo": [
      "CLAUDE.md"
    ],
    "avoids": [
      "OMC wiki_* 도구 자체를 비활성화하거나 재정의",
      "docs/wiki/ 생성 섹션 소유권 규칙 변경"
    ],
    "sourceRefs": [
      "DEC-WIKI-SECTION-OWNERSHIP",
      "DEC-WIKI-MATERIALIZED-VIEW"
    ],
    "createdAt": "2026-08-18T08:39:06.355Z",
    "updatedAt": "2026-08-18T08:39:13.616Z"
  }
}
```
