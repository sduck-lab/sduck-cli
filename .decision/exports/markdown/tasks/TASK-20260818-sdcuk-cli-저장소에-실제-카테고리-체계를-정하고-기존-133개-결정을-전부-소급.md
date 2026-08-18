---
id: TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급
type: task
status: CLOSED
title: sdcuk-cli 저장소에 실제 카테고리 체계를 정하고 기존 133개 결정을 전부 소급 분류한다 -- categories 기능의 실전 검증
record_depth: FULL
created_at: '2026-08-18T06:08:41.289Z'
updated_at: '2026-08-18T06:14:08.032Z'
---
# TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급: sdcuk-cli 저장소에 실제 카테고리 체계를 정하고 기존 133개 결정을 전부 소급 분류한다 -- categories 기능의 실전 검증

sdcuk-cli 저장소에 실제 카테고리 체계를 정하고 기존 133개 결정을 전부 소급 분류한다 -- categories 기능의 실전 검증

## Sduck source

```json sduck-source
{
  "task": {
    "id": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
    "title": "sdcuk-cli 저장소에 실제 카테고리 체계를 정하고 기존 133개 결정을 전부 소급 분류한다 -- categories 기능의 실전 검증",
    "description": "sdcuk-cli 저장소에 실제 카테고리 체계를 정하고 기존 133개 결정을 전부 소급 분류한다 -- categories 기능의 실전 검증",
    "status": "CLOSED",
    "expectedScope": [],
    "avoidScope": [
      "adieum-api 분류(별도 태스크)"
    ],
    "guided": true,
    "recordDepth": "FULL",
    "createdAt": "2026-08-18T06:08:41.289Z",
    "updatedAt": "2026-08-18T06:14:08.032Z",
    "implementationPlan": [
      "sduck categories set으로 10개 대분류 확정",
      "133개 결정에 대한 id->category 매핑을 만들어 sduck categories tag --stdin으로 일괄 배정",
      "sduck categories list/browse로 결과 확인"
    ],
    "verificationPlan": [
      "categories list의 개수 합이 133과 일치하는지 확인",
      "categories browse로 몇 개 카테고리를 실제로 열어 내용이 맞는지 확인",
      "git diff로 category/updatedAt 외 필드가 안 바뀌었는지 샘플 확인"
    ]
  },
  "questions": [],
  "evidence": [],
  "contextItems": [
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0074",
      "summary": "Decision applies to relevant file src/cli.ts: 그래프 확장 깊이는 --depth 옵션으로 노출하고 graph.ts의 MAX_DEPTH(4) 상한을 공유한다",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "src/cli.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1612",
      "createdAt": "2026-08-18T06:08:41.544Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "MEM-0010",
      "summary": "Memory capsule: sduck categories tag -- 기존 확정 결정에 카테고리 소급 부여 — categories.ts의 tagDecisionCategories()가 DecisionWorkspace.mutate를 재사용해 기존(이미 CONFIRMED인) 결정의 category 필드만 안전하게 갱신한다. sduck categories tag <id> <category> 단건, 또는 --stdin으로 {assignments:[...]} 일괄 처리를 지원한다. 실제 결정(DEC-0001)에 적용해 git diff로 category/updatedAt만 바뀌고 다른 필드는 전혀 안 바뀜을 확인했다.",
      "metadata": {
        "type": "memory_capsule",
        "sourceTaskId": "TASK-20260818-기존-확정-결정에-카테고리를-소급-부여하는-sduck-categories-tag-명령-",
        "topics": [
          "categories",
          "backfill",
          "decision-workspace"
        ],
        "reason": "matched by recall result",
        "score": 1
      },
      "id": "CTX-1613",
      "createdAt": "2026-08-18T06:08:41.545Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "MEM-0009",
      "summary": "Memory capsule: categories browse의 500개 상한을 --limit로 노출 — browseCategory의 하드코딩 500개 상한을 제거하고 limit 매개변수(기본값 DEFAULT_BROWSE_LIMIT=500)로 바꿨다. sduck categories browse에 --limit <n> 옵션을 추가해 recall --depth와 동일한 패턴(기본값+호출별 오버라이드)으로 사용자가 직접 조정할 수 있게 했다.",
      "metadata": {
        "type": "memory_capsule",
        "sourceTaskId": "TASK-20260818-categories-browse의-500개-상한을-하드코딩-대신-limit-플래그로-노",
        "topics": [
          "categories",
          "browse"
        ],
        "reason": "matched by recall result",
        "score": 1
      },
      "id": "CTX-1614",
      "createdAt": "2026-08-18T06:08:41.545Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "MEM-0008",
      "summary": "Memory capsule: sduck categories browse -- 카파시 LLM Wiki식 무순위 전체 목록 — 카테고리(또는 미분류) 안의 결정을 FTS/그래프/RRF 랭킹 없이 id+title만 전부 반환하는 sduck categories browse 명령을 추가했다. listCategoryCounts와 동일한 가시성 규칙(status IN CONFIRMED/DRAFT, task not ABANDONED)을 써서 list에서 본 개수와 browse로 실제 읽는 개수가 항상 일치한다.",
      "metadata": {
        "type": "memory_capsule",
        "sourceTaskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
        "topics": [
          "categories",
          "browse",
          "recall"
        ],
        "reason": "matched by recall result",
        "score": 1
      },
      "id": "CTX-1615",
      "createdAt": "2026-08-18T06:08:41.545Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "MEM-0007",
      "summary": "Memory capsule: 프로젝트별 고정 결정 카테고리 분류 체계 인프라 — policy.json에 프로젝트별 고정 대분류 목록(categories)을 저장하고, Decision.category가 그 목록 안의 값만 허용되도록 submit 시점에 검증한다. sduck categories suggest/set/list 명령을 추가했다. 카파시의 LLM Wiki 패턴(전체 목차를 컨텍스트에 넣고 에이전트가 직접 골라 읽기)을 적용하려면 결정들이 소수의 고정 대분류로 미리 묶여 있어야 한다는 게 동기다.",
      "metadata": {
        "type": "memory_capsule",
        "sourceTaskId": "TASK-20260818-결정에-프로젝트별-고정-분류-체계-대분류-를-붙일-수-있는-인프라-추가-policy-j",
        "topics": [
          "categories",
          "taxonomy",
          "policy",
          "recall"
        ],
        "reason": "matched by recall result",
        "score": 1
      },
      "id": "CTX-1616",
      "createdAt": "2026-08-18T06:08:41.546Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "MEM-0006",
      "summary": "Memory capsule: recall이 DRAFT 상태 결정도 찾도록 CONFIRMED 전용 필터 완화 — recall.ts의 결정 조회(FTS/LIKE/그래프 보강)가 status='CONFIRMED'만 허용하던 것을 status IN ('CONFIRMED','DRAFT')로 완화했다. REJECTED/SUPERSEDED와 ABANDONED 태스크 소속 결정은 계속 제외한다. sduck-recall-bench로 실측한 결과 sdcuk-cli는 변화 없었고(유일한 DRAFT 대상의 태스크가 ABANDONED라 범위 밖) adieum-api는 Hit@5/Hit@10이 28.6%->57.1%로 2배 개선됐다.",
      "metadata": {
        "type": "memory_capsule",
        "sourceTaskId": "TASK-20260818-recall이-draft-상태-결정도-찾을-수-있도록-confirmed-전용-필터를-완",
        "topics": [
          "recall",
          "draft-status",
          "benchmark"
        ],
        "reason": "matched by recall result",
        "score": 1
      },
      "id": "CTX-1617",
      "createdAt": "2026-08-18T06:08:41.546Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "MEM-0005",
      "summary": "Memory capsule: recall RRF 융합: FTS bm25 + LIKE + 그래프 hop-거리 순위 — recall()의 decisions/traces가 FTS 우선 이어붙이기 대신 FTS bm25 순위, LIKE 순위, 그래프 hop-거리 순위(시드 제외) 3개 리스트를 RRF(k=60)로 융합한 순서를 쓰도록 바꿨다. graph.ts의 expandGraph는 노드를 알파벳순이 아니라 (hop level, id)로 정렬해 이 순위 신호를 실제로 제공한다.",
      "metadata": {
        "type": "memory_capsule",
        "sourceTaskId": "TASK-20260818-recall의-decisions-traces-랭킹을-fts-bm25-순위와-그래프-ho",
        "topics": [
          "recall",
          "rrf",
          "graph",
          "ranking",
          "search"
        ],
        "reason": "matched by recall result",
        "score": 1
      },
      "id": "CTX-1618",
      "createdAt": "2026-08-18T06:08:41.546Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "MEM-0004",
      "summary": "Memory capsule: recall FTS5(trigram) + graph_edges 하이브리드 검색 — recall과 memory capsule 검색을 LIKE 부분일치에서 FTS5(trigram)+bm25 랭킹으로 강화하고, 매칭된 항목을 시드로 graph_edges를 bounded 순회해 related 필드로 노출한다.",
      "metadata": {
        "type": "memory_capsule",
        "sourceTaskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
        "topics": [
          "recall",
          "fts5",
          "graph",
          "memory"
        ],
        "reason": "matched by recall result",
        "score": 1
      },
      "id": "CTX-1619",
      "createdAt": "2026-08-18T06:08:41.546Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "MEM-0003",
      "summary": "Memory capsule: sduck CLI 0.7.0 release — Released @sduck/sduck-cli 0.7.0 through origin/main, the annotated v0.7.0 tag, and npm latest after local package validation and a fully green GitHub Actions run.",
      "metadata": {
        "type": "memory_capsule",
        "sourceTaskId": "TASK-20260814-release-push-and-publish-the-latest-sduck-cli-ve",
        "topics": [
          "sduck-0.7.0",
          "release",
          "npm",
          "git-tag",
          "ci"
        ],
        "reason": "matched by recall result",
        "score": 1
      },
      "id": "CTX-1620",
      "createdAt": "2026-08-18T06:08:41.547Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "MEM-0001",
      "summary": "Memory capsule: Source-backed bounded memory — Store one stable, provenance-checked Memory Capsule per task; prefer capsules during retrieval; and keep automatically discovered context idempotent and bounded while preserving raw canonical records.",
      "metadata": {
        "type": "memory_capsule",
        "sourceTaskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
        "topics": [
          "memory",
          "context",
          "recall",
          "provenance"
        ],
        "reason": "matched by recall result",
        "score": 1
      },
      "id": "CTX-1621",
      "createdAt": "2026-08-18T06:08:41.547Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0079",
      "summary": "Decision applies to relevant file src/cli.ts: IMPL-0031의 누락된 파일 목록을 별도 trace로 정정 기록한다",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/cli.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1632",
      "createdAt": "2026-08-18T06:08:41.550Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0093",
      "summary": "Decision applies to relevant file src/core/v2/categories.ts: DecisionWorkspace.mutate로 기존 결정의 category 필드만 갱신하는 tagDecisionCategories()를 추가한다",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/core/v2/categories.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1633",
      "createdAt": "2026-08-18T06:08:41.550Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0094",
      "summary": "Decision applies to relevant file src/cli.ts: sduck categories tag <id> <category> 및 --stdin 일괄 태깅 명령을 추가한다",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/cli.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1634",
      "createdAt": "2026-08-18T06:08:41.550Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0092",
      "summary": "Decision applies to relevant file src/cli.ts: browseCategory에 limit 매개변수를 추가하고(기본값 500) sduck categories browse에 --limit 플래그를 노출한다",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/cli.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1635",
      "createdAt": "2026-08-18T06:08:41.551Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0090",
      "summary": "Decision applies to relevant file src/core/v2/categories.ts: categories.ts에 browseCategory()를 추가해 카테고리 안의 결정을 순위 없이 전부(id+title만) 반환한다",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/core/v2/categories.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1636",
      "createdAt": "2026-08-18T06:08:41.551Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0091",
      "summary": "Decision applies to relevant file src/cli.ts: sduck categories browse <category> [--uncategorized] 명령을 추가한다",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/cli.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1637",
      "createdAt": "2026-08-18T06:08:41.551Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0089",
      "summary": "Decision applies to relevant file src/cli.ts: sduck categories suggest/set/list 명령을 추가한다",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/cli.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1638",
      "createdAt": "2026-08-18T06:08:41.552Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0078",
      "summary": "Decision applies to relevant file src/cli.ts: sduck graph show에 --mermaid 출력 옵션을 추가한다",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/cli.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1639",
      "createdAt": "2026-08-18T06:08:41.552Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0077",
      "summary": "Decision applies to relevant file src/cli.ts: sduck recall에 --json 옵션을 graph show/status와 동일한 패턴으로 추가한다",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/cli.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1640",
      "createdAt": "2026-08-18T06:08:41.552Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-MEMORY-EXPLICIT-BACKFILL",
      "summary": "Decision applies to relevant file src/cli.ts: Target the current task by default and make backfill explicit",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/cli.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1642",
      "createdAt": "2026-08-18T06:08:41.553Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-MEMORY-AGENT-DISTILLATION",
      "summary": "Decision applies to relevant file src/cli.ts: Keep semantic distillation agent-authored and CLI-verified",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "src/cli.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1643",
      "createdAt": "2026-08-18T06:08:41.553Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-MEMORY-RECALL-FIRST",
      "summary": "Decision applies to relevant file src/cli.ts: Search distilled memory before raw history",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "src/cli.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1644",
      "createdAt": "2026-08-18T06:08:41.553Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-WIKI-AGENT-WORKFLOW",
      "summary": "Decision applies to relevant file src/cli.ts: Keep Wiki generation agent-driven and task close non-gating",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/cli.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1645",
      "createdAt": "2026-08-18T06:08:41.553Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-STAGE-ONE-DURABLE-RECORD-DEPTH",
      "summary": "Decision applies to relevant file src/cli.ts: Ship durable record-depth storage before changing lifecycle behavior",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/cli.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1648",
      "createdAt": "2026-08-18T06:08:41.554Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-RELEASE-0-7-0-CONTENTS",
      "summary": "Decision applies to relevant file docs/use-cases.md: Commit the completed release payload and canonical records",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "docs/use-cases.md"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-1641",
      "createdAt": "2026-08-18T06:08:41.552Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-WIKI-RELEASE-070",
      "summary": "Decision applies to relevant file docs/use-cases.md: Expose Auto Wiki as the 0.7.0 public surface without releasing it",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "docs/use-cases.md"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-1646",
      "createdAt": "2026-08-18T06:08:41.554Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-RELEASE-0-6-2",
      "summary": "Decision applies to relevant file tests/e2e/sdd-cli-reachability.test.ts: Release Stage 1 as a new 0.6.2 package",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "tests/e2e/sdd-cli-reachability.test.ts"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-1647",
      "createdAt": "2026-08-18T06:08:41.554Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0-6-cli-foundation",
      "summary": "Prior decision: Ship 0.6.0 as CLI foundations, not an MCP runtime — The user will use the CLI only. 0.6.0 ships supported CLI foundations and repository-only Phase 0 fixtures while every MCP runtime/control-plane surface remains deferred.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1622",
      "createdAt": "2026-08-18T06:08:41.547Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0-6-release-evidence",
      "summary": "Prior decision: Prove the CLI release from a packed artifact — Release confidence requires source checks plus an installed tarball smoke that observes exact version, bundled assets, supported CLI routes, deferred routes, and Git-hook safety.",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1623",
      "createdAt": "2026-08-18T06:08:41.547Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0-6-release-safety",
      "summary": "Prior decision: Make packaged workflow guidance and retrospective hooks release-safe — Bundled rules must match the guided CLI lifecycle, and retrospective integration must not overwrite user hooks or create unusable enabled-mode markers.",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1624",
      "createdAt": "2026-08-18T06:08:41.548Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0038",
      "summary": "Prior decision: Keep sduck CLI-first and defer the MCP control plane — Sduck remains a local CLI workflow tool. MCP server, protocol control plane, owned agent runtime, and remote graph services are deferred because they exceed the current internal-tool need.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1625",
      "createdAt": "2026-08-18T06:08:41.548Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0040",
      "summary": "Prior decision: Start mandatory agent-led grilling when work begins — work automatically starts a grill session and emits context-aware instructions. The agent, not a fixed CLI wizard, generates questions. A reasoned grill completion is required before Brief submission.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1626",
      "createdAt": "2026-08-18T06:08:41.548Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "IMPL-0001",
      "summary": "Prior implementation trace: Detected 33 changed file(s).",
      "metadata": {
        "type": "implementation_trace",
        "filesChanged": [
          ".backup/AGENT.md",
          ".backup/CLAUDE.md",
          ".decision/",
          ".sduck/sduck-assets/agent-rules/core.md",
          ".sduck/sduck-assets/types/fix.md",
          "README.md",
          "docs/use-cases.md",
          "src/cli.ts",
          "src/commands/init.ts",
          "src/commands/v2/index.ts",
          "src/core/agent-rules.ts",
          "src/core/init.ts",
          "src/core/v2/context.ts",
          "src/core/v2/decision-workspace.ts",
          "src/core/v2/decision.ts",
          "src/core/v2/doctor.ts",
          "src/core/v2/grill.ts",
          "src/core/v2/paths.ts",
          "src/core/v2/policy.ts",
          "src/core/v2/question.ts",
          "src/core/v2/source-store.ts",
          "src/core/v2/state.ts",
          "src/core/v2/status.ts",
          "src/core/v2/store.ts",
          "src/core/v2/task-lifecycle.ts",
          "src/core/v2/task.ts",
          "src/core/v2/workspace.ts",
          "src/types/index.ts",
          "src/ui/v2/render.ts",
          "tests/e2e/v2-cli.test.ts",
          "tests/unit/decision-workspace.test.ts",
          "tests/unit/v2-core.test.ts",
          "tests/unit/v2-lifecycle.test.ts"
        ],
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1627",
      "createdAt": "2026-08-18T06:08:41.548Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "IMPL-0002",
      "summary": "Prior implementation trace: Detected 50 changed file(s).",
      "metadata": {
        "type": "implementation_trace",
        "filesChanged": [
          ".gitignore",
          ".ignore",
          "README.ko.md",
          "README.md",
          "docs/agents/domain.md",
          "docs/agents/triage-labels.md",
          "docs/migration.md",
          "docs/pilot-evaluation.md",
          "docs/use-cases.md",
          "src/cli.ts",
          "src/commands/init.ts",
          "src/commands/v2/errors.ts",
          "src/commands/v2/index.ts",
          "src/config/global-config.ts",
          "src/core/init.ts",
          "src/core/v2/brief.ts",
          "src/core/v2/context.ts",
          "src/core/v2/decision-workspace.ts",
          "src/core/v2/decision.ts",
          "src/core/v2/doctor.ts",
          "src/core/v2/draft.ts",
          "src/core/v2/errors.ts",
          "src/core/v2/evidence.ts",
          "src/core/v2/grill.ts",
          "src/core/v2/paths.ts",
          "src/core/v2/policy.ts",
          "src/core/v2/question.ts",
          "src/core/v2/rebuild.ts",
          "src/core/v2/remember.ts",
          "src/core/v2/source-store.ts",
          "src/core/v2/state.ts",
          "src/core/v2/status.ts",
          "src/core/v2/task-lifecycle.ts",
          "src/core/v2/task.ts",
          "src/core/v2/trace.ts",
          "src/core/v2/workspace-lock.ts",
          "src/ui/v2/messages.ts",
          "src/ui/v2/prompts.ts",
          "src/ui/v2/render.ts",
          "tests/e2e/sdd-cli-reachability.test.ts",
          "tests/e2e/v2-cli.test.ts",
          "tests/e2e/v2-locale-cli.test.ts",
          "tests/e2e/v2-phase2c-matrix.test.ts",
          "tests/helpers/run-cli.ts",
          "tests/unit/decision-workspace.test.ts",
          "tests/unit/global-config.test.ts",
          "tests/unit/sdd-core-regression.test.ts",
          "tests/unit/v2-core.test.ts",
          "tests/unit/v2-lifecycle.test.ts",
          "tests/unit/v2-messages.test.ts"
        ],
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1628",
      "createdAt": "2026-08-18T06:08:41.549Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "IMPL-0011",
      "summary": "Prior implementation trace: Detected 28 changed file(s).",
      "metadata": {
        "type": "implementation_trace",
        "filesChanged": [
          "src/cli.ts",
          "src/commands/v2/index.ts",
          "src/core/v2/brief.ts",
          "src/core/v2/cache-bundle.ts",
          "src/core/v2/cache.ts",
          "src/core/v2/context.ts",
          "src/core/v2/draft.ts",
          "src/core/v2/errors.ts",
          "src/core/v2/evaluate.ts",
          "src/core/v2/graph.ts",
          "src/core/v2/grill.ts",
          "src/core/v2/rebuild.ts",
          "src/core/v2/remember.ts",
          "src/core/v2/source-store.ts",
          "src/core/v2/source-types.ts",
          "src/core/v2/status.ts",
          "src/core/v2/store.ts",
          "src/core/v2/task-lifecycle.ts",
          "src/core/v2/task.ts",
          "src/types/index.ts",
          "src/ui/v2/messages.ts",
          "src/ui/v2/render.ts",
          "tests/e2e/v2-cli.test.ts",
          "tests/e2e/v2-locale-cli.test.ts",
          "tests/e2e/v2-phase2c-matrix.test.ts",
          "tests/unit/decision-workspace.test.ts",
          "tests/unit/v2-lifecycle.test.ts",
          "tests/unit/v2-messages.test.ts"
        ],
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1629",
      "createdAt": "2026-08-18T06:08:41.549Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "IMPL-0013",
      "summary": "Prior implementation trace: Detected 107 changed file(s).",
      "metadata": {
        "type": "implementation_trace",
        "filesChanged": [
          ".decision/exports/markdown/decisions/DEC-0004.md",
          ".decision/exports/markdown/decisions/DEC-0005.md",
          ".decision/exports/markdown/decisions/DEC-0006.md",
          ".decision/exports/markdown/decisions/DEC-0007.md",
          ".decision/exports/markdown/decisions/DEC-0008.md",
          ".decision/exports/markdown/decisions/DEC-0009.md",
          ".decision/exports/markdown/decisions/DEC-0010.md",
          ".decision/exports/markdown/decisions/DEC-0011.md",
          ".decision/exports/markdown/decisions/DEC-0012.md",
          ".decision/exports/markdown/decisions/DEC-0013.md",
          ".decision/exports/markdown/decisions/DEC-0014.md",
          ".decision/exports/markdown/decisions/DEC-0015.md",
          ".decision/exports/markdown/decisions/DEC-0016.md",
          ".decision/exports/markdown/decisions/DEC-0017.md",
          ".decision/exports/markdown/decisions/DEC-0018.md",
          ".decision/exports/markdown/decisions/DEC-0019.md",
          ".decision/exports/markdown/decisions/DEC-0020.md",
          ".decision/exports/markdown/decisions/DEC-0021.md",
          ".decision/exports/markdown/decisions/DEC-0022.md",
          ".decision/exports/markdown/decisions/DEC-0023.md",
          ".decision/exports/markdown/decisions/DEC-0024.md",
          ".decision/exports/markdown/decisions/DEC-0025.md",
          ".decision/exports/markdown/decisions/DEC-0026.md",
          ".decision/exports/markdown/decisions/DEC-0027.md",
          ".decision/exports/markdown/decisions/DEC-0028.md",
          ".decision/exports/markdown/decisions/DEC-0029.md",
          ".decision/exports/markdown/decisions/DEC-0030.md",
          ".decision/exports/markdown/decisions/DEC-0031.md",
          ".decision/exports/markdown/decisions/DEC-0032.md",
          ".decision/exports/markdown/decisions/DEC-0033.md",
          ".decision/exports/markdown/decisions/DEC-0034.md",
          ".decision/exports/markdown/decisions/DEC-0035.md",
          ".decision/exports/markdown/decisions/DEC-0036.md",
          ".decision/exports/markdown/decisions/DEC-0037.md",
          ".decision/exports/markdown/decisions/DEC-0038.md",
          ".decision/exports/markdown/decisions/DEC-0039.md",
          ".decision/exports/markdown/decisions/DEC-0040.md",
          ".decision/exports/markdown/decisions/DEC-0041.md",
          ".decision/exports/markdown/decisions/DEC-0042.md",
          ".decision/exports/markdown/decisions/DEC-0043.md",
          ".decision/exports/markdown/decisions/DEC-0044.md",
          ".decision/exports/markdown/decisions/DEC-0045.md",
          ".decision/exports/markdown/decisions/DEC-0046.md",
          ".decision/exports/markdown/decisions/DEC-0047.md",
          ".decision/exports/markdown/decisions/DEC-0048.md",
          ".decision/exports/markdown/decisions/DEC-0049.md",
          ".decision/exports/markdown/implementations/IMPL-0005.md",
          ".decision/exports/markdown/implementations/IMPL-0006.md",
          ".decision/exports/markdown/implementations/IMPL-0007.md",
          ".decision/exports/markdown/implementations/IMPL-0008.md",
          ".decision/exports/markdown/implementations/IMPL-0009.md",
          ".decision/exports/markdown/implementations/IMPL-0010.md",
          ".decision/exports/markdown/implementations/IMPL-0011.md",
          ".decision/exports/markdown/implementations/IMPL-0012.md",
          ".decision/exports/markdown/tasks/TASK-20260715-correct-phase-0-contract-fixtures-and-trace.md",
          ".decision/exports/markdown/tasks/TASK-20260715-design-a-repository-scoped-coding-agent-runtime.md",
          ".decision/exports/markdown/tasks/TASK-20260715-harden-doctor-state-recovery-diagnostics.md",
          ".decision/exports/markdown/tasks/TASK-20260715-implement-phase-1-canonical-foundation.md",
          ".decision/exports/markdown/tasks/TASK-20260715-implement-the-0-6-mcp-control-plane.md",
          ".decision/exports/markdown/tasks/TASK-20260716-implement-cli-first-guided-decision-workflow.md",
          ".decision/exports/markdown/tasks/TASK-20260718-document-guided-cli-workflow-0-5-0.md",
          ".decision/exports/markdown/tasks/TASK-20260720-add-retrospective-decision-capture-skill.md",
          ".ignore",
          ".prettierignore",
          ".sduck/sduck-assets/agent-rules/core.md",
          ".sduck/sduck-assets/agent-rules/skills/sduck-retrospective-capture/",
          "AGENTS.md",
          "CLAUDE.md",
          "README.ko.md",
          "README.md",
          "docs/design/",
          "src/cli.ts",
          "src/commands/v2/index.ts",
          "src/core/assets.ts",
          "src/core/init.ts",
          "src/core/v2/brief.ts",
          "src/core/v2/cache-bundle.ts",
          "src/core/v2/cache.ts",
          "src/core/v2/context.ts",
          "src/core/v2/doctor.ts",
          "src/core/v2/draft.ts",
          "src/core/v2/errors.ts",
          "src/core/v2/evaluate.ts",
          "src/core/v2/graph.ts",
          "src/core/v2/grill.ts",
          "src/core/v2/rebuild.ts",
          "src/core/v2/remember.ts",
          "src/core/v2/source-store.ts",
          "src/core/v2/source-types.ts",
          "src/core/v2/status.ts",
          "src/core/v2/store.ts",
          "src/core/v2/task-lifecycle.ts",
          "src/core/v2/task.ts",
          "src/types/index.ts",
          "src/ui/v2/messages.ts",
          "src/ui/v2/render.ts",
          "tests/e2e/sdd-cli-reachability.test.ts",
          "tests/e2e/v2-cli.test.ts",
          "tests/e2e/v2-locale-cli.test.ts",
          "tests/e2e/v2-phase2c-matrix.test.ts",
          "tests/fixtures/brief-digest/",
          "tests/fixtures/source-envelope/",
          "tests/unit/decision-workspace.test.ts",
          "tests/unit/sdd-core-regression.test.ts",
          "tests/unit/v2-contract-fixtures.test.ts",
          "tests/unit/v2-lifecycle.test.ts",
          "tests/unit/v2-messages.test.ts"
        ],
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1630",
      "createdAt": "2026-08-18T06:08:41.549Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "MEMORY",
      "sourceRef": "IMPL-0014",
      "summary": "Prior implementation trace: Detected 2 changed file(s).",
      "metadata": {
        "type": "implementation_trace",
        "filesChanged": [
          "tests/e2e/v2-locale-cli.test.ts",
          "tests/unit/sdd-core-regression.test.ts"
        ],
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1631",
      "createdAt": "2026-08-18T06:08:41.549Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/cli.ts",
      "summary": "File evidence: runCategoriesBrowseCommand,",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "runCategoriesBrowseCommand,",
        "line": 28
      },
      "id": "CTX-1649",
      "createdAt": "2026-08-18T06:08:41.554Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/unit/v2-categories.test.ts",
      "summary": "File evidence: it('rejects a malformed categories field in policy.json', async () => {",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "it('rejects a malformed categories field in policy.json', async () => {",
        "line": 15
      },
      "id": "CTX-1650",
      "createdAt": "2026-08-18T06:08:41.555Z"
    },
    {
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "sourceType": "DISCOVERY",
      "sourceRef": ".omc/project-memory.json",
      "summary": "File evidence: \"projectRoot\": \"/Users/taehee/Workspace/03_Temp/sdcuk-cli\",",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "\"projectRoot\": \"/Users/taehee/Workspace/03_Temp/sdcuk-cli\",",
        "line": 4
      },
      "id": "CTX-1651",
      "createdAt": "2026-08-18T06:08:41.555Z"
    }
  ],
  "briefSnapshots": [
    {
      "id": "BRF-0038",
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "snapshot": {
        "task": {
          "id": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
          "title": "sdcuk-cli 저장소에 실제 카테고리 체계를 정하고 기존 133개 결정을 전부 소급 분류한다 -- categories 기능의 실전 검증",
          "description": "sdcuk-cli 저장소에 실제 카테고리 체계를 정하고 기존 133개 결정을 전부 소급 분류한다 -- categories 기능의 실전 검증",
          "status": "CONFIRMED",
          "expectedScope": [],
          "avoidScope": [
            "adieum-api 분류(별도 태스크)"
          ],
          "guided": true,
          "recordDepth": "FULL",
          "createdAt": "2026-08-18T06:08:41.289Z",
          "updatedAt": "2026-08-18T06:09:23.912Z",
          "implementationPlan": [
            "sduck categories set으로 10개 대분류 확정",
            "133개 결정에 대한 id->category 매핑을 만들어 sduck categories tag --stdin으로 일괄 배정",
            "sduck categories list/browse로 결과 확인"
          ],
          "verificationPlan": [
            "categories list의 개수 합이 133과 일치하는지 확인",
            "categories browse로 몇 개 카테고리를 실제로 열어 내용이 맞는지 확인",
            "git diff로 category/updatedAt 외 필드가 안 바뀌었는지 샘플 확인"
          ]
        },
        "decisions": {
          "EXPLICIT": [
            {
              "id": "DEC-0095",
              "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
              "title": "sdcuk-cli의 대분류 체계를 10개로 정하고 기존 133개 결정 전부를 소급 분류한다",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 0.85,
              "summary": "133개 결정의 id+title을 전부 훑어 실제 존재하는 클러스터를 확인했다: 검색/리콜(FTS5·그래프·RRF·카테고리 기능 자체 포함, ~28개), 워크플로우 라이프사이클(grill-me·brief·confirm·close 게이트·record-depth 등, ~31개), MCP 계약 설계(대부분 폐기된 0.6 RFC 디지스트/엔벨로프 논의, ~31개), 릴리스/배포(~15개), 메모리 캡슐(~8개), Wiki(~8개), 컨텍스트 인덱싱(~5개), 로케일/국제화(~4개), 테스트/CI/품질(~3개). categories.suggest의 범용 기초 제안 대신 이 프로젝트 실제 이력에 맞춘 10개를 채택했다. sduck categories set으로 확정한 뒤, 133개 전부를 sduck categories tag --stdin 일괄 배정으로 소급 분류한다.",
              "rationale": [
                "사용자가 '이 저장소에 테스트'를 명시적으로 요청함 -- 실제 규모(133개)로 카테고리 인프라가 동작하는지 확인하는 게 목적이므로 실제 이력에 맞는 분류가 필요함",
                "MCP 계약 설계(~31개)와 워크플로우 라이프사이클(~31개)이 가장 큰 두 덩어리인 건 이 프로젝트가 실제로 0.6 MCP RFC 단계를 거쳤다가 CLI-first로 회귀한 역사를 그대로 반영한 것 -- 분류가 균등하지 않은 건 실제 이력의 정직한 반영이지 결함이 아님",
                "confidence를 0.85로 낮게 잡은 이유: 다수 결정(133개)에 대한 카테고리 배정은 제목만 보고 내린 판단이라 개별 항목의 경계선 판단(예: DEC-0071을 검색/리콜 vs 메모리 캡슐 중 어디에 넣을지)에는 이견 여지가 있음을 인정함"
              ],
              "appliesTo": [],
              "avoids": [
                "소분류(2단계) 도입",
                "adieum-api 분류(별도 태스크)"
              ],
              "sourceRefs": [
                "DEC-0087",
                "DEC-0093"
              ],
              "createdAt": "2026-08-18T06:09:16.997Z",
              "updatedAt": "2026-08-18T06:09:23.912Z"
            }
          ],
          "INFERRED": [],
          "CARRIED": [],
          "CONFLICT": [],
          "OPEN": []
        },
        "questions": [],
        "evidence": [],
        "expectedScope": [],
        "avoidScope": [
          "adieum-api 분류(별도 태스크)"
        ],
        "implementationPlan": [
          "sduck categories set으로 10개 대분류 확정",
          "133개 결정에 대한 id->category 매핑을 만들어 sduck categories tag --stdin으로 일괄 배정",
          "sduck categories list/browse로 결과 확인"
        ],
        "verificationPlan": [
          "categories list의 개수 합이 133과 일치하는지 확인",
          "categories browse로 몇 개 카테고리를 실제로 열어 내용이 맞는지 확인",
          "git diff로 category/updatedAt 외 필드가 안 바뀌었는지 샘플 확인"
        ],
        "openQuestionCount": 0
      },
      "renderedMarkdown": "────────────────────────────────────────\nImplementation Brief\n────────────────────────────────────────\nTask: TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급\nsdcuk-cli 저장소에 실제 카테고리 체계를 정하고 기존 133개 결정을 전부 소급 분류한다 -- categories 기능의 실전 검증\n\nA. Explicit decisions\n[EXPLICIT] DEC-0095. sdcuk-cli의 대분류 체계를 10개로 정하고 기존 133개 결정 전부를 소급 분류한다\nConfidence: 0.85\nSummary: 133개 결정의 id+title을 전부 훑어 실제 존재하는 클러스터를 확인했다: 검색/리콜(FTS5·그래프·RRF·카테고리 기능 자체 포함, ~28개), 워크플로우 라이프사이클(grill-me·brief·confirm·close 게이트·record-depth 등, ~31개), MCP 계약 설계(대부분 폐기된 0.6 RFC 디지스트/엔벨로프 논의, ~31개), 릴리스/배포(~15개), 메모리 캡슐(~8개), Wiki(~8개), 컨텍스트 인덱싱(~5개), 로케일/국제화(~4개), 테스트/CI/품질(~3개). categories.suggest의 범용 기초 제안 대신 이 프로젝트 실제 이력에 맞춘 10개를 채택했다. sduck categories set으로 확정한 뒤, 133개 전부를 sduck categories tag --stdin 일괄 배정으로 소급 분류한다.\nSource refs:\n  - DEC-0087\n  - DEC-0093\nRationale:\n  - 사용자가 '이 저장소에 테스트'를 명시적으로 요청함 -- 실제 규모(133개)로 카테고리 인프라가 동작하는지 확인하는 게 목적이므로 실제 이력에 맞는 분류가 필요함\n  - MCP 계약 설계(~31개)와 워크플로우 라이프사이클(~31개)이 가장 큰 두 덩어리인 건 이 프로젝트가 실제로 0.6 MCP RFC 단계를 거쳤다가 CLI-first로 회귀한 역사를 그대로 반영한 것 -- 분류가 균등하지 않은 건 실제 이력의 정직한 반영이지 결함이 아님\n  - confidence를 0.85로 낮게 잡은 이유: 다수 결정(133개)에 대한 카테고리 배정은 제목만 보고 내린 판단이라 개별 항목의 경계선 판단(예: DEC-0071을 검색/리콜 vs 메모리 캡슐 중 어디에 넣을지)에는 이견 여지가 있음을 인정함\nAvoids:\n  - 소분류(2단계) 도입\n  - adieum-api 분류(별도 태스크)\n\nB. Inferred decisions\n  - none\n\nC. Carried decisions\n  - none\n\nD. Conflicts\n  - none\n\nE. Open decisions\n  - none\n\nProblem:\n  sdcuk-cli 저장소에 실제 카테고리 체계를 정하고 기존 133개 결정을 전부 소급 분류한다 -- categories 기능의 실전 검증\nImplementation plan:\n  - sduck categories set으로 10개 대분류 확정\n  - 133개 결정에 대한 id->category 매핑을 만들어 sduck categories tag --stdin으로 일괄 배정\n  - sduck categories list/browse로 결과 확인\nVerification plan:\n  - categories list의 개수 합이 133과 일치하는지 확인\n  - categories browse로 몇 개 카테고리를 실제로 열어 내용이 맞는지 확인\n  - git diff로 category/updatedAt 외 필드가 안 바뀌었는지 샘플 확인\nScope expected:\n  - none\nScope avoided:\n  - adieum-api 분류(별도 태스크)\nOpen questions: 0\nEvidence:\n  - none\n────────────────────────────────────────",
      "gitBaseline": {
        "head": "9c709d5438e1108bdfa169a37efa63854323e9cc",
        "dirtyFileHashes": {
          "\".decision/exports/markdown/tasks/TASK-20260818-/352/262/260/354/240/225/354/227/220-/355/224/204/353/241/234/354/240/235/355/212/270/353/263/204-/352/263/240/354/240/225-/353/266/204/353/245/230-/354/262/264/352/263/204-/353/214/200/353/266/204/353/245/230-/353/245/274-/353/266/231/354/235/274-/354/210/230-/354/236/210/353/212/224-/354/235/270/355/224/204/353/235/274-/354/266/224/352/260/200-policy-j.md\"": null,
          "\".decision/exports/markdown/tasks/TASK-20260818-/352/270/260/354/241/264-/355/231/225/354/240/225-/352/262/260/354/240/225/354/227/220-/354/271/264/355/205/214/352/263/240/353/246/254/353/245/274-/354/206/214/352/270/211-/353/266/200/354/227/254/355/225/230/353/212/224-sduck-categories-tag-/353/252/205/353/240/271-.md\"": null,
          "\".decision/exports/markdown/tasks/TASK-20260818-/354/271/264/355/205/214/352/263/240/353/246/254/353/263/204-/354/240/204/354/262/264-/352/262/260/354/240/225-/353/252/251/353/241/235/354/235/204-/354/210/234/354/234/204-/354/227/206/354/235/264-/352/267/270/353/214/200/353/241/234-/353/263/264/354/227/254/354/243/274/353/212/224-sduck-categories-.md\"": null,
          "\".decision/exports/markdown/tasks/TASK-20260818-categories-browse/354/235/230-500/352/260/234-/354/203/201/355/225/234/354/235/204-/355/225/230/353/223/234/354/275/224/353/224/251-/353/214/200/354/213/240-limit-/355/224/214/353/236/230/352/267/270/353/241/234-/353/205/270.md\"": null,
          "\".decision/exports/markdown/tasks/TASK-20260818-mermaid-graph-export-trace-/354/240/225/354/240/225-impl-0031/354/235/264-confirm.md\"": null,
          "\".decision/exports/markdown/tasks/TASK-20260818-recall-memory-searchterms/354/227/220-/354/230/201/354/226/264-/353/266/210/354/232/251/354/226/264-/355/225/204/355/204/260-/354/266/224/352/260/200-adieum-a.md\"": null,
          "\".decision/exports/markdown/tasks/TASK-20260818-recall/354/227/220-graph-nodes-edges-/354/227/260/352/262/260-fts5-trigram-/352/262/200/354/203/211-/354/266/224/352/260/200.md\"": null,
          "\".decision/exports/markdown/tasks/TASK-20260818-recall/354/235/230-decisions-traces-/353/236/255/355/202/271/354/235/204-fts-bm25-/354/210/234/354/234/204/354/231/200-/352/267/270/353/236/230/355/224/204-ho.md\"": null,
          "\".decision/exports/markdown/tasks/TASK-20260818-recall/354/235/264-draft-/354/203/201/355/203/234-/352/262/260/354/240/225/353/217/204-/354/260/276/354/235/204-/354/210/230-/354/236/210/353/217/204/353/241/235-confirmed-/354/240/204/354/232/251-/355/225/204/355/204/260/353/245/274-/354/231/204.md\"": null,
          "\".decision/exports/markdown/tasks/TASK-20260818-sdcuk-cli-/354/240/200/354/236/245/354/206/214/354/227/220-/354/213/244/354/240/234-/354/271/264/355/205/214/352/263/240/353/246/254-/354/262/264/352/263/204/353/245/274-/354/240/225/355/225/230/352/263/240-/352/270/260/354/241/264-133/352/260/234-/352/262/260/354/240/225/354/235/204-/354/240/204/353/266/200-/354/206/214/352/270/211.md\"": null,
          "\".decision/exports/markdown/tasks/TASK-20260818-sduck-graph-show/354/227/220-mermaid-/354/266/234/353/240/245-/354/230/265/354/205/230-/354/266/224/352/260/200.md\"": null,
          "\".decision/exports/markdown/tasks/TASK-20260818-sduck-recall/354/227/220-json-/354/266/234/353/240/245-/354/230/265/354/205/230-/354/266/224/352/260/200.md\"": null,
          "\".decision/exports/markdown/tasks/TASK-20260818-search-ts-/353/266/210/354/232/251/354/226/264-/355/225/204/355/204/260-trace-/354/240/225/354/240/225-impl-0033-/355/214/214/354/235/274-/353/252/251/353/241/235-/353/210/204/353/235/275-/354/236/254/352/270/260/353/241/235.md\"": null,
          ".omc/project-memory.json": "787277cd23ec572abb5a4e485ecf13d057a0c03ca7af1bb17ee8e6ecd8de1528",
          ".omc/sessions/0df5d112-2f48-4749-97e4-333c1bc3c4a0.json": "88d5203da7bc1b4ed360966921a0383698c96ca3a882213c404911a9be5503b3",
          ".omc/sessions/21700872-d3ec-4974-b033-67d97c77ad59.json": "01d4e0d40dc663d4b07fff5d5a79b929d1eb02ba9e1bf91a55191ba0686f4250",
          ".omc/sessions/46d1799c-c47b-42b3-ac73-d710812fcf0f.json": "8741f8b4480a840a5591a964223a4415aa945ae3a1415995eef7959fb62656f1",
          ".omc/sessions/7d512c3f-2454-47a9-b778-050805847bdf.json": "c4767182fab0532dd40af30af3eaf09ee7e1646ae4672d9a137187330bb93531",
          ".omc/state/agent-replay-e9bc2156-bb4a-4af4-911d-ddcfa7c8660b.jsonl": "69cb650bba940c1f4bab0e38e7c711062b74ec3aec18b4315bcdbc32cfa26717",
          ".omc/state/checkpoints/checkpoint-2026-08-18T02-59-19-604Z.json": "1411b8a5d260d81abb5ed96c942930312104cea0f33eb352e4d64463e10e918a",
          ".omc/state/hud-stdin-cache.json": "c7af15428cbfab2b0aaae4702a24ce660401b544caf9263814a9b9ed6de39efc",
          ".omc/state/idle-notif-cooldown.json": "9dd341543a406814122cacb41e872e92fe0f79deda457b807706281d79c38d34",
          ".omc/state/session-end-jobs/0df5d112-2f48-4749-97e4-333c1bc3c4a0.json": "23473ac7bd47049be42d9c5fcd8f3adf5b446a5f2288f3a67511966852517ae0",
          ".omc/state/session-end-jobs/21700872-d3ec-4974-b033-67d97c77ad59.json": "9b801558c6e700078e9c4c39d77eb25a18d16a6dddb622d6d76dc2ca7cb219c1",
          ".omc/state/session-end-jobs/46d1799c-c47b-42b3-ac73-d710812fcf0f.json": "192ea2bce39b0187bf499ff8596a79ff2c613cca5f23d5b76d0e888f391a2980",
          ".omc/state/session-end-jobs/7d512c3f-2454-47a9-b778-050805847bdf.json": "61ddcc213eb1c28d93c88ea0967faa2c68201f651a037987e6ffc4b00b184e9c",
          ".omc/state/session-end-jobs/discovery.json": "a7e462728f7887b3c13d927fe0ada007a4a74d6f2360af0f42be7d448a2fb6ee",
          ".omc/state/session-end-jobs/runs/23522eab-6b77-41d1-86a4-60950e66ee58/callback/1/3a610d66-4514-428f-8d90-57e2efd54cb1/arm.json": "a2835f9123f8f62e209e3f40c42d59099904512e44255f1489c27f6e3c2ce7ac",
          ".omc/state/session-end-jobs/runs/23522eab-6b77-41d1-86a4-60950e66ee58/callback/1/3a610d66-4514-428f-8d90-57e2efd54cb1/control.json": "d2602513a310ba2cbb70be234de364bd59293386772e6a9def7250323dfea09b",
          ".omc/state/session-end-jobs/runs/23522eab-6b77-41d1-86a4-60950e66ee58/callback/1/3a610d66-4514-428f-8d90-57e2efd54cb1/result.json": "0d7cca7c7b93f2c5fbd43e26b4ed79f2a596f6c417cb6f8628105159616288dc",
          ".omc/state/session-end-jobs/runs/23522eab-6b77-41d1-86a4-60950e66ee58/callback/1/3a610d66-4514-428f-8d90-57e2efd54cb1/watchdog.json": "c2662dae7f8a79404502ea00ca48f3deffb463044a4162a21c443515d5ece8ec",
          ".omc/state/session-end-jobs/runs/23522eab-6b77-41d1-86a4-60950e66ee58/notification/1/d5d0d4c5-fd69-4470-8bd7-cf5ac112bd3e/arm.json": "bc3bfaf9fc6cba8b45524e486d97c239463ae96b1f8d67e50bbe6830a335c656",
          ".omc/state/session-end-jobs/runs/23522eab-6b77-41d1-86a4-60950e66ee58/notification/1/d5d0d4c5-fd69-4470-8bd7-cf5ac112bd3e/control.json": "36177add64d77179e351570c19ad02e6bed610bdf5e4ddb8eefa5ab506fbf86c",
          ".omc/state/session-end-jobs/runs/23522eab-6b77-41d1-86a4-60950e66ee58/notification/1/d5d0d4c5-fd69-4470-8bd7-cf5ac112bd3e/result.json": "dca5d32fdb5ab316a4970290c709d388ca90740b9b6f8300cc1845ec60fc27dd",
          ".omc/state/session-end-jobs/runs/23522eab-6b77-41d1-86a4-60950e66ee58/notification/1/d5d0d4c5-fd69-4470-8bd7-cf5ac112bd3e/watchdog.json": "4e786cb7e6cd4051fd5a750e0dc529d849ddc6b8bbb5c362e866996676b846c8",
          ".omc/state/session-end-jobs/runs/23522eab-6b77-41d1-86a4-60950e66ee58/openclaw/1/fda3c0b7-f5d5-4753-9c37-02a33b8d4632/arm.json": "3a32b4862274370a7cc84605b0628a5d5369e33dc80fd220def1dd875154f63d",
          ".omc/state/session-end-jobs/runs/23522eab-6b77-41d1-86a4-60950e66ee58/openclaw/1/fda3c0b7-f5d5-4753-9c37-02a33b8d4632/control.json": "40161ce9782ae0a1f4dd5dcb95e7e767abefdb8bdd87be6f242d316cf4490a81",
          ".omc/state/session-end-jobs/runs/23522eab-6b77-41d1-86a4-60950e66ee58/openclaw/1/fda3c0b7-f5d5-4753-9c37-02a33b8d4632/result.json": "c49e322086fdc9e39624072e440a612b70614b301eddffacf7c500e4b752d9a6",
          ".omc/state/session-end-jobs/runs/23522eab-6b77-41d1-86a4-60950e66ee58/openclaw/1/fda3c0b7-f5d5-4753-9c37-02a33b8d4632/watchdog.json": "36f106d53f9adccc02c5499d7c9557869fd5aba085019c29e26c7dc05fbe5af3",
          ".omc/state/session-end-jobs/runs/23522eab-6b77-41d1-86a4-60950e66ee58/python-cleanup/1/5059d3ab-59a0-45ee-ac1b-ef5c7536fcb1/arm.json": "8deeaf1e67690e886d361f9896088c96d98ed318314d714a5a2f27f3d25b507e",
          ".omc/state/session-end-jobs/runs/23522eab-6b77-41d1-86a4-60950e66ee58/python-cleanup/1/5059d3ab-59a0-45ee-ac1b-ef5c7536fcb1/control.json": "0aa258ee32baf89bfd093b425cfd011bd48b68433a667511772661cad25f9a1f",
          ".omc/state/session-end-jobs/runs/23522eab-6b77-41d1-86a4-60950e66ee58/python-cleanup/1/5059d3ab-59a0-45ee-ac1b-ef5c7536fcb1/result.json": "41bf3d8dd80915731a02a25f4d03d8feda780edaece2d0c098fb8c45034dc6cc",
          ".omc/state/session-end-jobs/runs/23522eab-6b77-41d1-86a4-60950e66ee58/python-cleanup/1/5059d3ab-59a0-45ee-ac1b-ef5c7536fcb1/watchdog.json": "6a1ffeb63f1b0d4d859658688282f0e267ea9ee7bcfccb9569a1a0a68210439f",
          ".omc/state/session-end-jobs/runs/23522eab-6b77-41d1-86a4-60950e66ee58/reply-cleanup/1/8945626f-64e5-432c-b1b8-ec036b887797/arm.json": "edaf6fa447a2a11070bc485d1471ae3398f751a2b870eaa5f057beee493c07d5",
          ".omc/state/session-end-jobs/runs/23522eab-6b77-41d1-86a4-60950e66ee58/reply-cleanup/1/8945626f-64e5-432c-b1b8-ec036b887797/control.json": "6bd818b9fb0f451a5ba51e74746aca1df02d5c496bd67270ec358d6a2cebf745",
          ".omc/state/session-end-jobs/runs/23522eab-6b77-41d1-86a4-60950e66ee58/reply-cleanup/1/8945626f-64e5-432c-b1b8-ec036b887797/result.json": "5bf95dc3b4bfad174ca3656b78aa20b4c3006ffb3a93e6a3d1203b3d4bfa0814",
          ".omc/state/session-end-jobs/runs/23522eab-6b77-41d1-86a4-60950e66ee58/reply-cleanup/1/8945626f-64e5-432c-b1b8-ec036b887797/watchdog.json": "c2f0439e78a18b1a46a0990460881f5c1310765ef63eed044cf6f95b300de0a1",
          ".omc/state/session-end-jobs/runs/23522eab-6b77-41d1-86a4-60950e66ee58/team-cleanup/1/f5d655eb-238c-4b68-ba38-fb946752c814/arm.json": "d8e19724de6b81bcf5694364cb57f3be0461b9c45831205a28138d3cd36fd9bd",
          ".omc/state/session-end-jobs/runs/23522eab-6b77-41d1-86a4-60950e66ee58/team-cleanup/1/f5d655eb-238c-4b68-ba38-fb946752c814/control.json": "d5a916a2598b89e21ca2b48eb56928a1dbdd882e9eb787a1e09399618582170b",
          ".omc/state/session-end-jobs/runs/23522eab-6b77-41d1-86a4-60950e66ee58/team-cleanup/1/f5d655eb-238c-4b68-ba38-fb946752c814/result.json": "313dd27efba29ff9ac455d2c50fd3b1f7fa9143dc60ed00d7fb9f15ba0ecbc53",
          ".omc/state/session-end-jobs/runs/23522eab-6b77-41d1-86a4-60950e66ee58/team-cleanup/1/f5d655eb-238c-4b68-ba38-fb946752c814/watchdog.json": "de8673c8adde211b0838f04266fab027d23aa155786fa013c8773101c069987f",
          ".omc/state/session-end-jobs/runs/2666bcd5-f49b-405a-b076-ba34d8abf927/callback/1/2bc16a73-0ae8-4258-967b-c71c745231af/arm.json": "200bbc53bcf36da51872088a7c810dc5ac132f9928e1e64c5109aff3411577e5",
          ".omc/state/session-end-jobs/runs/2666bcd5-f49b-405a-b076-ba34d8abf927/callback/1/2bc16a73-0ae8-4258-967b-c71c745231af/control.json": "a8ea31bb67333d098eb4281b1027c38adf6cefa56b3b4c56064eb303094dce47",
          ".omc/state/session-end-jobs/runs/2666bcd5-f49b-405a-b076-ba34d8abf927/callback/1/2bc16a73-0ae8-4258-967b-c71c745231af/result.json": "825298bbc892c9793690e14387b727d9d1ca4ebdf41dcd572cbbd104d5eed51f",
          ".omc/state/session-end-jobs/runs/2666bcd5-f49b-405a-b076-ba34d8abf927/callback/1/2bc16a73-0ae8-4258-967b-c71c745231af/watchdog.json": "e1dfd6752253c8e2c5141439022d887c2553319aa84f9785ae58218e87e80f89",
          ".omc/state/session-end-jobs/runs/2666bcd5-f49b-405a-b076-ba34d8abf927/notification/1/68dc7105-f39c-4fad-b9b2-6c1941a42620/arm.json": "439eec5756798e462c90db8564d34a6394cc9a085f3387b3122678a0b0040773",
          ".omc/state/session-end-jobs/runs/2666bcd5-f49b-405a-b076-ba34d8abf927/notification/1/68dc7105-f39c-4fad-b9b2-6c1941a42620/control.json": "463e4563ebc96200a9d393385948d390ac84d0ea3fde918b3df0008e30383d28",
          ".omc/state/session-end-jobs/runs/2666bcd5-f49b-405a-b076-ba34d8abf927/notification/1/68dc7105-f39c-4fad-b9b2-6c1941a42620/result.json": "88521b5379a44c7299cefc195d9a5196b3e09f03c3b1d31b9ccba3267bc77cb6",
          ".omc/state/session-end-jobs/runs/2666bcd5-f49b-405a-b076-ba34d8abf927/notification/1/68dc7105-f39c-4fad-b9b2-6c1941a42620/watchdog.json": "19f404f360be62cbb114541115b23d4ad486ed03fbdba1c84047ed82536f8479",
          ".omc/state/session-end-jobs/runs/2666bcd5-f49b-405a-b076-ba34d8abf927/openclaw/1/8deae159-06c3-4557-8a3d-9dfb58187220/arm.json": "ec35474938a30312a454feaad79c680a0630492875c75ae7ac4dc153472daf1e",
          ".omc/state/session-end-jobs/runs/2666bcd5-f49b-405a-b076-ba34d8abf927/openclaw/1/8deae159-06c3-4557-8a3d-9dfb58187220/control.json": "fd170f6df087cd355222013bf4cd21380b4d476acc3b8743c1ef90d6f57a4595",
          ".omc/state/session-end-jobs/runs/2666bcd5-f49b-405a-b076-ba34d8abf927/openclaw/1/8deae159-06c3-4557-8a3d-9dfb58187220/result.json": "01e1278900161d42bb8dacc3fa11419ddbb60df8f793c142580e679f89a65f8f",
          ".omc/state/session-end-jobs/runs/2666bcd5-f49b-405a-b076-ba34d8abf927/openclaw/1/8deae159-06c3-4557-8a3d-9dfb58187220/watchdog.json": "5f738dcb95e90090e5395d9ae5629bf721393b5b011569f73c7da1a53c736035",
          ".omc/state/session-end-jobs/runs/2666bcd5-f49b-405a-b076-ba34d8abf927/python-cleanup/1/a73a0c12-42e9-4f31-823a-61fe2e71e468/arm.json": "0461e997dc3aaa1580072c2433120868a3f0a60d37dfbcdf12bb854f257eb2b1",
          ".omc/state/session-end-jobs/runs/2666bcd5-f49b-405a-b076-ba34d8abf927/python-cleanup/1/a73a0c12-42e9-4f31-823a-61fe2e71e468/control.json": "0e05eec7837846e32f300e5e6ecef45684580a150072034d4e88dd8e9293db0e",
          ".omc/state/session-end-jobs/runs/2666bcd5-f49b-405a-b076-ba34d8abf927/python-cleanup/1/a73a0c12-42e9-4f31-823a-61fe2e71e468/result.json": "1ad42be6b2788350ccb46995cd8f4c861d93e9070940e048724e18da56e90a85",
          ".omc/state/session-end-jobs/runs/2666bcd5-f49b-405a-b076-ba34d8abf927/python-cleanup/1/a73a0c12-42e9-4f31-823a-61fe2e71e468/watchdog.json": "80ddfa600985895e0e9c73002502917211963c6ff4c24cc2f699ed2a551a7cbf",
          ".omc/state/session-end-jobs/runs/2666bcd5-f49b-405a-b076-ba34d8abf927/reply-cleanup/1/9c1fc09e-44de-4344-893f-ac9b9e92d44e/arm.json": "8e697802b10cf32034ce291610cba52241a87e2dd5b5c60092ddffd15df8c73d",
          ".omc/state/session-end-jobs/runs/2666bcd5-f49b-405a-b076-ba34d8abf927/reply-cleanup/1/9c1fc09e-44de-4344-893f-ac9b9e92d44e/control.json": "5154e11eb3450b73bef58c3b30f362358645225bfc3ced3a224f6326e3094b89",
          ".omc/state/session-end-jobs/runs/2666bcd5-f49b-405a-b076-ba34d8abf927/reply-cleanup/1/9c1fc09e-44de-4344-893f-ac9b9e92d44e/result.json": "a3982896874e799445f9053316695abec21cb86680a1d443d36e3554d1fe6e3b",
          ".omc/state/session-end-jobs/runs/2666bcd5-f49b-405a-b076-ba34d8abf927/reply-cleanup/1/9c1fc09e-44de-4344-893f-ac9b9e92d44e/watchdog.json": "8ca40e27b1da50a3c938b2871b6c5de67b6c1e33603d7552853b09e1335bb7ee",
          ".omc/state/session-end-jobs/runs/2666bcd5-f49b-405a-b076-ba34d8abf927/team-cleanup/1/250ce04e-345f-4760-b187-3117fd06f64a/arm.json": "5130c1e15160efd52139474d60bcd30e7591bd80ddb5da93767611175f87266b",
          ".omc/state/session-end-jobs/runs/2666bcd5-f49b-405a-b076-ba34d8abf927/team-cleanup/1/250ce04e-345f-4760-b187-3117fd06f64a/control.json": "7bf05f402cce4400210518f13f9d0bdbe66ae9867f4bcedebf749d97be75ede3",
          ".omc/state/session-end-jobs/runs/2666bcd5-f49b-405a-b076-ba34d8abf927/team-cleanup/1/250ce04e-345f-4760-b187-3117fd06f64a/result.json": "ecab38351420c1462cf973aeea0711a50bcf6ad0773ace5a3fccb57a1a6bcde6",
          ".omc/state/session-end-jobs/runs/2666bcd5-f49b-405a-b076-ba34d8abf927/team-cleanup/1/250ce04e-345f-4760-b187-3117fd06f64a/watchdog.json": "551c1b1457184de152ed200c604a8cff2f3b46a58534550eb8e2d06b559ffdd1",
          ".omc/state/session-end-jobs/runs/59505fa9-aa0d-458d-ab4b-dab52b0afac2/callback/1/eaaceac5-4d90-4faf-91f4-3767c38d9853/arm.json": "ef7024884f994fa710ca57002a4b3a3b3795a9b191053e31136be34a710414ec",
          ".omc/state/session-end-jobs/runs/59505fa9-aa0d-458d-ab4b-dab52b0afac2/callback/1/eaaceac5-4d90-4faf-91f4-3767c38d9853/control.json": "dc6504b315c0ca68f0240b1284c07b035f5a2a99eb66961530fce33d5cde0a49",
          ".omc/state/session-end-jobs/runs/59505fa9-aa0d-458d-ab4b-dab52b0afac2/callback/1/eaaceac5-4d90-4faf-91f4-3767c38d9853/result.json": "cb2fa8360bba297aac3ef8158532c6574c0026e0e86f83f2e07e848b1df80621",
          ".omc/state/session-end-jobs/runs/59505fa9-aa0d-458d-ab4b-dab52b0afac2/callback/1/eaaceac5-4d90-4faf-91f4-3767c38d9853/watchdog.json": "36bb127bca560fc893775a9ab80988ef5d9b984e7403c42a8cad3f2d228d17a3",
          ".omc/state/session-end-jobs/runs/59505fa9-aa0d-458d-ab4b-dab52b0afac2/notification/1/d41d86c2-d6eb-424e-9114-53f51beff0d0/arm.json": "7514cd0a393acd924c3f4ef09b8d1ed2e222e7ee8ce2493ed5b2afd83cb53fe1",
          ".omc/state/session-end-jobs/runs/59505fa9-aa0d-458d-ab4b-dab52b0afac2/notification/1/d41d86c2-d6eb-424e-9114-53f51beff0d0/control.json": "78e317d3df96202a013ea22dca0f0e970c35fda111fab129026ca2cbfb7edcdb",
          ".omc/state/session-end-jobs/runs/59505fa9-aa0d-458d-ab4b-dab52b0afac2/notification/1/d41d86c2-d6eb-424e-9114-53f51beff0d0/result.json": "6653c30c605895c396ad9b8039811a124d658c999d66a8850957a7f987bc9276",
          ".omc/state/session-end-jobs/runs/59505fa9-aa0d-458d-ab4b-dab52b0afac2/notification/1/d41d86c2-d6eb-424e-9114-53f51beff0d0/watchdog.json": "901d22a4587d6c31f9f71599d2df5313a0547790fd54956510f1a1685fbf23a1",
          ".omc/state/session-end-jobs/runs/59505fa9-aa0d-458d-ab4b-dab52b0afac2/openclaw/1/745d5618-4950-4e7c-8cc4-7cfec6775be5/arm.json": "6a12d98b86b5ebdc8891bb4d0c4732dfef586d96b087368a727110f6c9646089",
          ".omc/state/session-end-jobs/runs/59505fa9-aa0d-458d-ab4b-dab52b0afac2/openclaw/1/745d5618-4950-4e7c-8cc4-7cfec6775be5/control.json": "2399b6e5877089bd6aff678857c8c954b6a3a85a14f6fc49b905bd5a7279f07a",
          ".omc/state/session-end-jobs/runs/59505fa9-aa0d-458d-ab4b-dab52b0afac2/openclaw/1/745d5618-4950-4e7c-8cc4-7cfec6775be5/result.json": "2c15ca364991e5d4f5c096e9a53449101ad585ab6125b7518409e62e2d76f547",
          ".omc/state/session-end-jobs/runs/59505fa9-aa0d-458d-ab4b-dab52b0afac2/openclaw/1/745d5618-4950-4e7c-8cc4-7cfec6775be5/watchdog.json": "84c00253ebd4f20f71f665f800d2824cfb4082ff75c2a1e1685728c5cdc23146",
          ".omc/state/session-end-jobs/runs/59505fa9-aa0d-458d-ab4b-dab52b0afac2/python-cleanup/1/219d7879-5870-4814-b295-99dd20bd2d80/arm.json": "6581f234e79a08a764fcddf4ab04942916710c116566336e7ba67bc2ac1b4e4c",
          ".omc/state/session-end-jobs/runs/59505fa9-aa0d-458d-ab4b-dab52b0afac2/python-cleanup/1/219d7879-5870-4814-b295-99dd20bd2d80/control.json": "3a27ada4df6b910d2a59b01313c7ba88e044656d098422b82991e09360c1f5c4",
          ".omc/state/session-end-jobs/runs/59505fa9-aa0d-458d-ab4b-dab52b0afac2/python-cleanup/1/219d7879-5870-4814-b295-99dd20bd2d80/result.json": "bdaad3a8dc15077543208000b4fecd9bc50025e60c76b96fa70857193e181ce4",
          ".omc/state/session-end-jobs/runs/59505fa9-aa0d-458d-ab4b-dab52b0afac2/python-cleanup/1/219d7879-5870-4814-b295-99dd20bd2d80/watchdog.json": "3fafde07bd15dc471380adf35a932cbe3f02dc30e6700e2848ec666ca14b5358",
          ".omc/state/session-end-jobs/runs/59505fa9-aa0d-458d-ab4b-dab52b0afac2/reply-cleanup/1/a7caf64a-23a6-4ef3-ad93-4a8e4c5c3150/arm.json": "0e6ad6fd2a420979601fdd54f81078f2bb8fb4c9efae450e03db895a86270b3b",
          ".omc/state/session-end-jobs/runs/59505fa9-aa0d-458d-ab4b-dab52b0afac2/reply-cleanup/1/a7caf64a-23a6-4ef3-ad93-4a8e4c5c3150/control.json": "959edc90f6441c5ed953757585a68a2dc19ba473712d4bb0421c0b6bcb8010a6",
          ".omc/state/session-end-jobs/runs/59505fa9-aa0d-458d-ab4b-dab52b0afac2/reply-cleanup/1/a7caf64a-23a6-4ef3-ad93-4a8e4c5c3150/result.json": "e0002044685128a1371482be0ce5023d632fa43ba57dca6e9a789f5b60ef32c5",
          ".omc/state/session-end-jobs/runs/59505fa9-aa0d-458d-ab4b-dab52b0afac2/reply-cleanup/1/a7caf64a-23a6-4ef3-ad93-4a8e4c5c3150/watchdog.json": "706e082d7ec7448f4484f381623d0b2b595d4fddbb82ed206e5f3ea4a3acf871",
          ".omc/state/session-end-jobs/runs/59505fa9-aa0d-458d-ab4b-dab52b0afac2/team-cleanup/1/8bf9a78a-4c09-4d19-b30b-23cce3444d84/arm.json": "4f133b658e2159b88e35c8d46de27b1d72e97fbf57552b986f9919aeb89f7471",
          ".omc/state/session-end-jobs/runs/59505fa9-aa0d-458d-ab4b-dab52b0afac2/team-cleanup/1/8bf9a78a-4c09-4d19-b30b-23cce3444d84/control.json": "121bdf3ab78dd7719a1bf0e3ef60e09805ccba24e20c30091c6309d73e226b7b",
          ".omc/state/session-end-jobs/runs/59505fa9-aa0d-458d-ab4b-dab52b0afac2/team-cleanup/1/8bf9a78a-4c09-4d19-b30b-23cce3444d84/result.json": "1a04332f52979796f6d69ae31803f05b47e4287d97b61d54b2d4228b3393452a",
          ".omc/state/session-end-jobs/runs/59505fa9-aa0d-458d-ab4b-dab52b0afac2/team-cleanup/1/8bf9a78a-4c09-4d19-b30b-23cce3444d84/watchdog.json": "df03ff34b72f39866056c1639ae7f2d5371d50369e6c93407de9320601a8fd64",
          ".omc/state/session-end-jobs/runs/5b225e52-718a-41dd-9d9d-99fa5b3ea9e9/callback/1/13247a4a-0820-4d7b-a650-5670b1b650c8/arm.json": "58d36cfed22cfaf46e2fb0189828ab6de01930b7250aa2d77d875496b276e430",
          ".omc/state/session-end-jobs/runs/5b225e52-718a-41dd-9d9d-99fa5b3ea9e9/callback/1/13247a4a-0820-4d7b-a650-5670b1b650c8/control.json": "ac13b1ff411ff0047274fc62d4e4dc22cf86b5bab8f3a5f24aba1e427b601b8c",
          ".omc/state/session-end-jobs/runs/5b225e52-718a-41dd-9d9d-99fa5b3ea9e9/callback/1/13247a4a-0820-4d7b-a650-5670b1b650c8/result.json": "74f5910f4900975308cc78d1369be0b5f702a3e21879040cec25fb60ae5bedbd",
          ".omc/state/session-end-jobs/runs/5b225e52-718a-41dd-9d9d-99fa5b3ea9e9/callback/1/13247a4a-0820-4d7b-a650-5670b1b650c8/watchdog.json": "f4763d834a6b681ab27f1d9559ccac58bf24819be187b34bba8566f3179721d2",
          ".omc/state/session-end-jobs/runs/5b225e52-718a-41dd-9d9d-99fa5b3ea9e9/notification/1/ee6d3de9-ba4f-4e9b-801d-0c6ec88c7bad/arm.json": "d54c23960a0d7684c9da044625db8957dde124e9430706c1702eeb4a44c09255",
          ".omc/state/session-end-jobs/runs/5b225e52-718a-41dd-9d9d-99fa5b3ea9e9/notification/1/ee6d3de9-ba4f-4e9b-801d-0c6ec88c7bad/control.json": "1fece755b05558ca1b0991ead18b1525e97e06ae6a14c7f424d01a59cca17e1a",
          ".omc/state/session-end-jobs/runs/5b225e52-718a-41dd-9d9d-99fa5b3ea9e9/notification/1/ee6d3de9-ba4f-4e9b-801d-0c6ec88c7bad/result.json": "bc8f0527ff7bbc6d2c138267148836a650c8fbc965acb2f4055ff07d20396a73",
          ".omc/state/session-end-jobs/runs/5b225e52-718a-41dd-9d9d-99fa5b3ea9e9/notification/1/ee6d3de9-ba4f-4e9b-801d-0c6ec88c7bad/watchdog.json": "f27b81b996804d5d94224e9b6be2567333b64c0647bdfa36425cf353fa96214b",
          ".omc/state/session-end-jobs/runs/5b225e52-718a-41dd-9d9d-99fa5b3ea9e9/openclaw/1/2b128079-3697-452a-9df9-4d34427f4384/arm.json": "6a2a9214cb42cd4a0baa0bee1038bd513f3efa2e59a8035e1fcdf0e5acdc3f62",
          ".omc/state/session-end-jobs/runs/5b225e52-718a-41dd-9d9d-99fa5b3ea9e9/openclaw/1/2b128079-3697-452a-9df9-4d34427f4384/control.json": "13d042ead1a661063f1b53359cbdc92f384c0bdfb597c600f8847abaa8a95ad4",
          ".omc/state/session-end-jobs/runs/5b225e52-718a-41dd-9d9d-99fa5b3ea9e9/openclaw/1/2b128079-3697-452a-9df9-4d34427f4384/result.json": "66f5e9ea137b023e966c2818f867de4232a4b4203e05d28f74432345e271cc4a",
          ".omc/state/session-end-jobs/runs/5b225e52-718a-41dd-9d9d-99fa5b3ea9e9/openclaw/1/2b128079-3697-452a-9df9-4d34427f4384/watchdog.json": "48505fca1f641ca294703d47cb8076a47e2e64ab7b5f71eab3e45976ea488384",
          ".omc/state/session-end-jobs/runs/5b225e52-718a-41dd-9d9d-99fa5b3ea9e9/python-cleanup/1/cda964da-8bf9-4b1a-b388-fbb4a3b429de/arm.json": "ff4c5f1aa17500d5cf59aa48b9fd437bb3305ea531625bcd742cfd4745f47fba",
          ".omc/state/session-end-jobs/runs/5b225e52-718a-41dd-9d9d-99fa5b3ea9e9/python-cleanup/1/cda964da-8bf9-4b1a-b388-fbb4a3b429de/control.json": "9eae6ee25385dabcf0a69e27bee8df72516d34fc13efc105465b0258e10c835a",
          ".omc/state/session-end-jobs/runs/5b225e52-718a-41dd-9d9d-99fa5b3ea9e9/python-cleanup/1/cda964da-8bf9-4b1a-b388-fbb4a3b429de/result.json": "fed788803802c1094c0ea069cb1d09ae021a7ad42a9650bd8d0cee77ea049ca7",
          ".omc/state/session-end-jobs/runs/5b225e52-718a-41dd-9d9d-99fa5b3ea9e9/python-cleanup/1/cda964da-8bf9-4b1a-b388-fbb4a3b429de/watchdog.json": "15787a9b138f5d0ee84f8dfcd2757a76f9afc1b50ac782d02eda94863cadba73",
          ".omc/state/session-end-jobs/runs/5b225e52-718a-41dd-9d9d-99fa5b3ea9e9/reply-cleanup/1/4b96301f-9587-421b-a92f-8760711f6bf6/arm.json": "11dc39726c37052ae2130b0f84702d4eb17a386b1d187063c85cfd95805ca978",
          ".omc/state/session-end-jobs/runs/5b225e52-718a-41dd-9d9d-99fa5b3ea9e9/reply-cleanup/1/4b96301f-9587-421b-a92f-8760711f6bf6/control.json": "9244d4e357a3badbed10bcd8c2c347b4db6da84646d54e26f0d5e02e8986c108",
          ".omc/state/session-end-jobs/runs/5b225e52-718a-41dd-9d9d-99fa5b3ea9e9/reply-cleanup/1/4b96301f-9587-421b-a92f-8760711f6bf6/result.json": "f1316ec4fdd03a45b1139974113d1e574e75a1d7e0a2a86d377831bf2691117a",
          ".omc/state/session-end-jobs/runs/5b225e52-718a-41dd-9d9d-99fa5b3ea9e9/reply-cleanup/1/4b96301f-9587-421b-a92f-8760711f6bf6/watchdog.json": "1f98acbbf7f4dd5fb5cb75feb2dbcba90a1c8d9d725d57f6996a624e9afc94d4",
          ".omc/state/session-end-jobs/runs/5b225e52-718a-41dd-9d9d-99fa5b3ea9e9/team-cleanup/1/ff0bdf41-818b-46f9-b440-8e7cbc8046bc/arm.json": "4ec80a38b7ea73d82bc2dc1cc9817f3bf0f9ad834d231f6aa5f94cfd90759fe0",
          ".omc/state/session-end-jobs/runs/5b225e52-718a-41dd-9d9d-99fa5b3ea9e9/team-cleanup/1/ff0bdf41-818b-46f9-b440-8e7cbc8046bc/control.json": "946104251001dda21a883f9947cbcf7bf4c85910342adbb6bece823b516e7e8b",
          ".omc/state/session-end-jobs/runs/5b225e52-718a-41dd-9d9d-99fa5b3ea9e9/team-cleanup/1/ff0bdf41-818b-46f9-b440-8e7cbc8046bc/result.json": "2ac092b387feedc6af767f54ea93bce92c324e6027b507cb1e2de69bd9d500de",
          ".omc/state/session-end-jobs/runs/5b225e52-718a-41dd-9d9d-99fa5b3ea9e9/team-cleanup/1/ff0bdf41-818b-46f9-b440-8e7cbc8046bc/watchdog.json": "518c3a2b6623b34229339003e5f8b7331f295bb5757421680078d15578230177",
          ".omc/state/sessions/0df5d112-2f48-4749-97e4-333c1bc3c4a0/hud-state.json": "7e6e7710f4d386577470a748334d91d8c7f002eac2fdbd5d9aad5eaddef8ca66",
          ".omc/state/sessions/0df5d112-2f48-4749-97e4-333c1bc3c4a0/pre-tool-advisory-throttle.json": "a499d61dba2a186fcfd05f0cc95b59a21ec5130df7b6ec446b819b909ab628e2",
          ".omc/state/sessions/0df5d112-2f48-4749-97e4-333c1bc3c4a0/subagent-tracking-state.json": "d7006628382dd78859e55d1ca71881952290831a1ad418420dcae885f8b7e066",
          ".omc/state/sessions/21700872-d3ec-4974-b033-67d97c77ad59/hud-state.json": "a92a75d32ddd42c98eddec9409bd72b9c236b2427fee727ee977543f3c757965",
          ".omc/state/sessions/21700872-d3ec-4974-b033-67d97c77ad59/last-tool-error-state.json": "b7a0fb5455d8a0764a45ff42b15c749a37d3a09fdecc4473d3c7ed97eb6520c5",
          ".omc/state/sessions/21700872-d3ec-4974-b033-67d97c77ad59/pre-tool-advisory-throttle.json": "a9d605081bfb5c0da39f232d0e9a48c44ac1bd51d702abf16e074b9132d805f0",
          ".omc/state/sessions/21700872-d3ec-4974-b033-67d97c77ad59/subagent-tracking-state.json": "cb3b4ffdbbd38df4be108ab68f7e98ee500a1626abb9fb2a8f18d21ed5f0698e",
          ".omc/state/sessions/46d1799c-c47b-42b3-ac73-d710812fcf0f/hud-state.json": "f8ef6e7649dd8fcda8eac876c37c5e01772cc11ef212e1e25ce1cdeab5ada0ef",
          ".omc/state/sessions/8c8fa4f5-78d3-4ea6-8e32-42bda9cf691b/session-started.json": "80180bff001942bfb3dfe2145358245bb710ef7ba08037f9a20e2cb6ec48110c",
          ".omc/state/sessions/ced2a3ff-785b-4826-8940-664c13b04e34/hud-state.json": "75ce10ab98d43aaa9b9b66d507b042a3b41957c1a232bf502e37af85c35f690a",
          ".omc/state/sessions/ced2a3ff-785b-4826-8940-664c13b04e34/pre-tool-advisory-throttle.json": "5368b4cea8da184ed8d9d139e491f6750cb9cca1f4154a4fad46b0f2ded59a16",
          ".omc/state/sessions/ced2a3ff-785b-4826-8940-664c13b04e34/session-started.json": "64761daf73e041c6098482672f0e13678245b1cbe4a753c9c6d989341f82646d",
          ".omc/state/sessions/ced2a3ff-785b-4826-8940-664c13b04e34/subagent-tracking-state.json": "87de5d365fa1ffaa701376476e78108f7b4680c15dd0144d179965030b741810",
          ".omc/state/sessions/e87dea76-5ff4-4189-8b45-516b9e9dfee9/session-started.json": "1e06c275b15558835c47bdecb9f0fbcc6b19bc1f39839033f3c9dd322d7ee62f",
          ".omc/state/sessions/e9bc2156-bb4a-4af4-911d-ddcfa7c8660b/hud-state.json": "5a7ebb7efc648a3c2c1f6b287d7dbfff7909920f041b5baca52e600ee8cf6c40",
          ".omc/state/sessions/e9bc2156-bb4a-4af4-911d-ddcfa7c8660b/last-tool-error-state.json": "514a5933de95104cb5391d0747fae8f96c537e322203c11c882d8fbc5144d9e2",
          ".omc/state/sessions/e9bc2156-bb4a-4af4-911d-ddcfa7c8660b/pre-tool-advisory-throttle.json": "9dfadffe5559fc4648fe438596474879627ff1a0d1a530d9283a3fb0dff75770",
          ".omc/state/sessions/e9bc2156-bb4a-4af4-911d-ddcfa7c8660b/session-started.json": "07824255e164ede69d9edf517d1a421eddb3061d301c4d27f9e0101e2e8204ed",
          ".omc/state/sessions/e9bc2156-bb4a-4af4-911d-ddcfa7c8660b/subagent-tracking-state.json": "0a1be0a8426bb13ef72efae1041431394330909a0eb8a371e815930dd67e0a31",
          "src/cli.ts": "27506b307dad066f37a29a15fcd59d5ef71c624f9d0d50252c6401d9515d5fe7",
          "src/commands/v2/errors.ts": "548c7533a1f555783f4dc04afff365ad9c467137731396920e6b0a37f7c7532f",
          "src/commands/v2/index.ts": "6646198ed22f0475f5c95db52c0b7ea8e5178cd8f9ef92d3166abb3b92f27ae5",
          "src/core/v2/categories.ts": "244a7e5f5a559c923eb4e30343b4e79f4e0375be81afd5521e0b3751225635ef",
          "src/core/v2/decision.ts": "051fa93de5a5b35ab73aff5838e90571126d9bc3d5da43228402ce1cf08481be",
          "src/core/v2/draft.ts": "9632fc64c6001559b68d2e2a36f1743b2a65544b6dd01cc0c50c66b9f06fc990",
          "src/core/v2/errors.ts": "17291af8c12d7e046dc7da680bcff00b6a5307109abb1a4faa8bc8de3dcd500c",
          "src/core/v2/graph.ts": "e1bfe86c6cb97163c87f6e9defac9b6f63f2d11a6d71b85decb934f448f3b73c",
          "src/core/v2/memory.ts": "8060b42e5f3edd8000cbf74e3e6f264d4125264c3422010cf33d5c4407a26edf",
          "src/core/v2/policy.ts": "230156ece885b93efc0fc7fff7d0bcc94dcbbef668286ccd5efb188d5a79142a",
          "src/core/v2/rebuild.ts": "e163add5672e56c9266082b37dd41bf792b3278d1fefcf1b85ddb54bce4a8715",
          "src/core/v2/recall.ts": "4596bbb0aab62fe4460f84089243d02675ae5ba488a81a171e124fb988008ce9",
          "src/core/v2/search.ts": "71a8e49b5c9724ed64301d411d66b2b3e530a004df6e0f49079a0db6c693e7e0",
          "src/core/v2/source-store.ts": "211f071f3d9fca98c16630a86694e016c8ad5223b5ed78ad735cfd4964d2e04b",
          "src/core/v2/store.ts": "8f45cd4361d656b57c2a507ed2cfaf9369c6304ddd44f4ca9b1f45553ce07487",
          "src/types/index.ts": "c0a1dec4162e6f15b3003b05b880a1c8f47e964a7d9319cc512646ca8b310e1c",
          "src/ui/v2/messages.ts": "ba9efe0d540fcd75fe7fc5b734206dd0e765f844a5f46e00bf7a0108e5771ae8",
          "src/ui/v2/render.ts": "6b60e38176a638a2a6fc9c4597e1977488954e4123bf9b07224cf49bdc0150a4",
          "tests/e2e/v2-cli.test.ts": "e3ca5723cce47488f29f977c5241a44048ae02835bd9a68e8ee63a636213a40f",
          "tests/unit/decision-workspace.test.ts": "0b3bd18768c559c8ef6f2248c4de20615968fb06008b9a0bd19b01671edf9948",
          "tests/unit/v2-categories.test.ts": "e03c34266c7705725b9ad3e973bb7879ae18de22939a33f7c81eea94dce640af",
          "tests/unit/v2-lifecycle.test.ts": "4a76497d17684b00666acbb30a78ab72f59c3b5eb74eddf8c7f7cce942eacc7c",
          "tests/unit/v2-memory.test.ts": "86bed0cd69faa028afec311c54074db3767ba2e35e8a58ac9a10cf1bed961050",
          "tests/unit/v2-recall.test.ts": "5a9eb83054b9579d3ed4b16e65dfa301f943f0a3abdf4a2f6a25ca11409a7b07",
          "tests/unit/v2-search.test.ts": "d30ccabe217e04ba11dd43f1dcffea33b7d6cc6b009bb71c6bde79e7e04f4d4d"
        }
      },
      "createdAt": "2026-08-18T06:09:23.975Z"
    }
  ],
  "evaluations": [
    {
      "id": "EVAL-0024",
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "traceId": "IMPL-0043",
      "checks": [
        {
          "name": "categories-set",
          "outcome": "9개 대분류 확정(검색/리콜, 워크플로우 라이프사이클, MCP 계약 설계, 릴리스/배포, 메모리 캡슐, Wiki, 컨텍스트 인덱싱, 로케일/국제화, 테스트/CI/품질)"
        },
        {
          "name": "categories-tag",
          "outcome": "133/133개 결정 전체를 한 번의 원자적 --stdin 일괄 태깅으로 소급 분류. id 목록을 실제 추출 결과와 교차검증해 누락/오타 없음을 확인"
        },
        {
          "name": "categories-list",
          "outcome": "list 합계가 116(가시)+17(포기된 태스크 소속이라 recall과 동일 규칙으로 비가시)=133으로 정확히 일치함을 확인 -- 처음엔 불일치로 보였으나 DEC-0005/0031/0059 등을 직접 조사해 전부 ABANDONED 태스크 소속임을 확인, 버그 아님"
        },
        {
          "name": "git-diff-sample",
          "outcome": "여러 파일 diff 샘플링(DEC-WIKI-MATERIALIZED-VIEW 등)으로 category/updated_at 외 필드가 전혀 안 바뀌었음을 확인, 109개 tracked 파일 변경"
        },
        {
          "name": "unit-tests",
          "outcome": "172 passed"
        },
        {
          "name": "e2e-tests",
          "outcome": "33 passed"
        }
      ],
      "createdAt": "2026-08-18T06:13:36.028Z"
    }
  ],
  "events": [
    {
      "id": "EVT-0552",
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "type": "TASK_CREATED",
      "payload": {
        "description": "sdcuk-cli 저장소에 실제 카테고리 체계를 정하고 기존 133개 결정을 전부 소급 분류한다 -- categories 기능의 실전 검증",
        "policy": {
          "grillMeRequired": false
        }
      },
      "createdAt": "2026-08-18T06:08:41.289Z"
    },
    {
      "id": "EVT-0553",
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "type": "GRILL_STARTED",
      "payload": {
        "automatic": true
      },
      "createdAt": "2026-08-18T06:08:41.289Z"
    },
    {
      "id": "EVT-0554",
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "type": "CONTEXT_INDEXED",
      "payload": {
        "itemCount": 40
      },
      "createdAt": "2026-08-18T06:08:41.560Z"
    },
    {
      "id": "EVT-0555",
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "type": "GRILL_COMPLETED",
      "payload": {
        "reason": "사용자가 '이 저장소에 테스트 + adieum-api 복사해서 테스트'를 명시적으로 요청함. 133개 결정 제목을 직접 훑어 실제 클러스터(검색/리콜, 메모리, Wiki, 릴리스, 워크플로우, MCP RFC, 로케일, 컨텍스트, 테스트/CI)를 확인했으므로 설계상 모호성 없음.",
        "carried": []
      },
      "createdAt": "2026-08-18T06:08:52.609Z"
    },
    {
      "id": "EVT-0556",
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0095"
      },
      "createdAt": "2026-08-18T06:09:16.998Z"
    },
    {
      "id": "EVT-0557",
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 1,
        "questions": 0,
        "evidence": 0,
        "expectedScope": [],
        "avoidScope": [
          "adieum-api 분류(별도 태스크)"
        ],
        "implementationPlan": [
          "sduck categories set으로 10개 대분류 확정",
          "133개 결정에 대한 id->category 매핑을 만들어 sduck categories tag --stdin으로 일괄 배정",
          "sduck categories list/browse로 결과 확인"
        ],
        "verificationPlan": [
          "categories list의 개수 합이 133과 일치하는지 확인",
          "categories browse로 몇 개 카테고리를 실제로 열어 내용이 맞는지 확인",
          "git diff로 category/updatedAt 외 필드가 안 바뀌었는지 샘플 확인"
        ]
      },
      "createdAt": "2026-08-18T06:09:16.998Z"
    },
    {
      "id": "EVT-0558",
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "type": "BRIEF_CONFIRMED",
      "payload": {
        "snapshotId": "BRF-0038"
      },
      "createdAt": "2026-08-18T06:09:23.975Z"
    },
    {
      "id": "EVT-0559",
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "type": "TRACE_CREATED",
      "payload": {
        "traceId": "IMPL-0042",
        "filesChanged": [
          ".omc/state/hud-stdin-cache.json",
          ".omc/state/sessions/e9bc2156-bb4a-4af4-911d-ddcfa7c8660b/last-tool-error-state.json"
        ]
      },
      "createdAt": "2026-08-18T06:12:51.961Z"
    },
    {
      "id": "EVT-0560",
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "type": "TRACE_CREATED",
      "payload": {
        "traceId": "IMPL-0043",
        "filesChanged": [
          ".omc/state/hud-stdin-cache.json",
          ".omc/state/sessions/e9bc2156-bb4a-4af4-911d-ddcfa7c8660b/last-tool-error-state.json"
        ]
      },
      "createdAt": "2026-08-18T06:12:52.239Z"
    },
    {
      "id": "EVT-0561",
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "type": "EVALUATION_RECORDED",
      "payload": {
        "evaluationId": "EVAL-0024",
        "traceId": "IMPL-0043"
      },
      "createdAt": "2026-08-18T06:13:36.029Z"
    },
    {
      "id": "EVT-0562",
      "taskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
      "type": "TASK_CLOSED",
      "payload": {},
      "createdAt": "2026-08-18T06:14:08.033Z"
    }
  ]
}
```
