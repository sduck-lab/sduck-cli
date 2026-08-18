---
id: TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-
type: task
status: CLOSED
title: 카테고리별 전체 결정 목록을 순위 없이 그대로 보여주는 sduck categories browse 명령 추가 -- 카파시 LLM Wiki 패턴처럼 에이전트가 직접 읽고 고르게 함
record_depth: FULL
created_at: '2026-08-18T05:13:08.220Z'
updated_at: '2026-08-18T05:18:50.481Z'
---
# TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-: 카테고리별 전체 결정 목록을 순위 없이 그대로 보여주는 sduck categories browse 명령 추가 -- 카파시 LLM Wiki 패턴처럼 에이전트가 직접 읽고 고르게 함

카테고리별 전체 결정 목록을 순위 없이 그대로 보여주는 sduck categories browse 명령 추가 -- 카파시 LLM Wiki 패턴처럼 에이전트가 직접 읽고 고르게 함

## Sduck source

```json sduck-source
{
  "task": {
    "id": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
    "title": "카테고리별 전체 결정 목록을 순위 없이 그대로 보여주는 sduck categories browse 명령 추가 -- 카파시 LLM Wiki 패턴처럼 에이전트가 직접 읽고 고르게 함",
    "description": "카테고리별 전체 결정 목록을 순위 없이 그대로 보여주는 sduck categories browse 명령 추가 -- 카파시 LLM Wiki 패턴처럼 에이전트가 직접 읽고 고르게 함",
    "status": "CLOSED",
    "expectedScope": [
      "src/core/v2/categories.ts",
      "src/core/v2/errors.ts",
      "src/cli.ts",
      "src/commands/v2/index.ts",
      "src/ui/v2/render.ts",
      "src/ui/v2/messages.ts",
      "tests/unit/v2-categories.test.ts"
    ],
    "avoidScope": [
      "카테고리 이름 자동완성/퍼지 매칭",
      "요약/근거 등 부가 필드를 목록에 노출",
      "browse 결과에 랭킹 적용"
    ],
    "guided": true,
    "recordDepth": "FULL",
    "createdAt": "2026-08-18T05:13:08.220Z",
    "updatedAt": "2026-08-18T05:18:50.481Z",
    "implementationPlan": [
      "categories.ts: browseCategory(projectRoot, category, {uncategorized?}) 추가, 500개 상한+truncated",
      "errors.ts + messages.ts(en/ko): CATEGORY_NOT_FOUND 에러 코드/메시지 추가",
      "render.ts: renderCategoryBrowse(view, messages) 추가",
      "commands/v2/index.ts: runCategoriesBrowseCommand 추가",
      "cli.ts: categories browse <category> [--uncategorized] [--json] 배선",
      "tests/unit/v2-categories.test.ts: browse 정상 케이스, 존재하지 않는 카테고리, --uncategorized, 상한 truncated 검증"
    ],
    "verificationPlan": [
      "npm run build",
      "npm test",
      "npm run lint",
      "sdcuk-cli에 실제로 sduck categories set 후 browse를 수동 실행해 확인"
    ]
  },
  "questions": [],
  "evidence": [],
  "contextItems": [
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
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
      "id": "CTX-1490",
      "createdAt": "2026-08-18T05:13:08.452Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
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
      "id": "CTX-1491",
      "createdAt": "2026-08-18T05:13:08.452Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
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
      "id": "CTX-1492",
      "createdAt": "2026-08-18T05:13:08.452Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
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
      "id": "CTX-1493",
      "createdAt": "2026-08-18T05:13:08.452Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
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
      "id": "CTX-1494",
      "createdAt": "2026-08-18T05:13:08.453Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
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
      "id": "CTX-1495",
      "createdAt": "2026-08-18T05:13:08.453Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "sourceType": "MEMORY",
      "sourceRef": "MEM-0002",
      "summary": "Memory capsule: Memory Capsule retrieval and recovery hardening — Memory retrieval now folds only capsule-cited raw records, stale or orphaned capsules cannot block canonical work, canonical Markdown round-trips embedded source-fence prose, automatic context reflects current candidates, and backfill, digest, search, and Korean presentation contracts are explicit and portable.",
      "metadata": {
        "type": "memory_capsule",
        "sourceTaskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
        "topics": [
          "memory-capsules",
          "recall",
          "doctor-repair",
          "canonical-markdown",
          "context-refresh",
          "localization"
        ],
        "reason": "matched by recall result",
        "score": 1
      },
      "id": "CTX-1496",
      "createdAt": "2026-08-18T05:13:08.453Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
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
      "id": "CTX-1497",
      "createdAt": "2026-08-18T05:13:08.453Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
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
      "id": "CTX-1500",
      "createdAt": "2026-08-18T05:13:08.455Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0087",
      "summary": "Decision applies to relevant file src/core/v2/policy.ts: policy.json에 프로젝트별 고정 대분류 목록(categories)을 저장하고, 목록에 없는 값은 거부한다",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/core/v2/policy.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1510",
      "createdAt": "2026-08-18T05:13:08.457Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
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
      "id": "CTX-1511",
      "createdAt": "2026-08-18T05:13:08.457Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
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
      "id": "CTX-1512",
      "createdAt": "2026-08-18T05:13:08.457Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-RELEASE-0-7-0-CONTENTS",
      "summary": "Decision applies to relevant file AGENTS.md: Commit the completed release payload and canonical records",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "AGENTS.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1513",
      "createdAt": "2026-08-18T05:13:08.457Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
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
      "id": "CTX-1514",
      "createdAt": "2026-08-18T05:13:08.458Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
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
      "id": "CTX-1515",
      "createdAt": "2026-08-18T05:13:08.458Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
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
      "id": "CTX-1516",
      "createdAt": "2026-08-18T05:13:08.458Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
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
      "id": "CTX-1517",
      "createdAt": "2026-08-18T05:13:08.458Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-WIKI-POLICY-MIGRATION",
      "summary": "Decision applies to relevant file src/core/v2/policy.ts: Default Wiki on only for new workspaces and migrate durable workspaces explicitly",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/core/v2/policy.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1521",
      "createdAt": "2026-08-18T05:13:08.459Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-WIKI-RELEASE-070",
      "summary": "Decision applies to relevant file README.ko.md: Expose Auto Wiki as the 0.7.0 public surface without releasing it",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "README.ko.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1522",
      "createdAt": "2026-08-18T05:13:08.459Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-STAGE-ONE-DURABLE-RECORD-DEPTH",
      "summary": "Decision applies to relevant file docs/migration.md: Ship durable record-depth storage before changing lifecycle behavior",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "docs/migration.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1525",
      "createdAt": "2026-08-18T05:13:08.460Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-SUPERSEDE-INSTRUCTION-ONLY-TRIAGE",
      "summary": "Decision applies to relevant file docs/migration.md: Replace instruction-only triage with durable task classification",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "docs/migration.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1526",
      "createdAt": "2026-08-18T05:13:08.460Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-WORKSPACE-MODE-NOT-TASK-ROUTER",
      "summary": "Decision applies to relevant file src/core/v2/policy.ts: Keep workspace mode separate from task record depth",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/core/v2/policy.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1527",
      "createdAt": "2026-08-18T05:13:08.460Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-TASK-SCOPED-RECORD-DEPTH",
      "summary": "Decision applies to relevant file AGENTS.md: Choose task-scoped record depth without changing workspace mode",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "AGENTS.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1528",
      "createdAt": "2026-08-18T05:13:08.461Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-WIKI-DIRTY-STATUS",
      "summary": "Decision applies to relevant file src/core/v2/wiki.ts: Compute Wiki dirtiness only from deterministic evidence",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/core/v2/wiki.ts"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-1518",
      "createdAt": "2026-08-18T05:13:08.458Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-WIKI-EVIDENCE-LANGUAGE",
      "summary": "Decision applies to relevant file README.ko.md: Keep intent, implementation claims, changes, and validation reports distinct",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "README.ko.md"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-1519",
      "createdAt": "2026-08-18T05:13:08.459Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-WIKI-MATERIALIZED-VIEW",
      "summary": "Decision applies to relevant file src/core/v2/wiki.ts: Make a fixed Markdown Wiki the human-facing materialized view",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/core/v2/wiki.ts"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-1520",
      "createdAt": "2026-08-18T05:13:08.459Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-WIKI-SECTION-OWNERSHIP",
      "summary": "Decision applies to relevant file src/core/v2/wiki.ts: Protect human edits with generated-section ownership",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/core/v2/wiki.ts"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-1523",
      "createdAt": "2026-08-18T05:13:08.460Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-RELEASE-0-6-2",
      "summary": "Decision applies to relevant file tests/unit/v2-categories.test.ts: Release Stage 1 as a new 0.6.2 package",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "tests/unit/v2-categories.test.ts"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-1524",
      "createdAt": "2026-08-18T05:13:08.460Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0081",
      "summary": "Prior decision: IMPL-0033의 누락된 파일 목록을 별도 trace로 정정 기록한다 — DEC-0080(영어 불용어 필터)의 실제 구현은 정확하지만 동일한 confirm-타이밍 문제로 IMPL-0033의 changed-files가 비었다. search.ts만 git stash로 격리해 baseline을 정확히 만든 뒤 이 태스크에서 trace를 재기록한다.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1498",
      "createdAt": "2026-08-18T05:13:08.454Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0073",
      "summary": "Prior decision: 그래프 확장 결과는 RecallResult에 related 필드로 추가하고 기존 필드는 그대로 둔다 — memories/decisions/traces의 기존 형태와 정렬 순서를 바꾸지 않고, 그래프로 찾은 연결 항목만 별도 related 필드로 얹는다.",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1499",
      "createdAt": "2026-08-18T05:13:08.454Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0009",
      "summary": "Prior decision: Authorize only the 0.6 MCP control plane — This task implements 0.6a–0.6d only; it does not implement a sduck-owned coding runtime.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1501",
      "createdAt": "2026-08-18T05:13:08.455Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0011",
      "summary": "Prior decision: Require local digest confirmation by default — MCP may prepare a canonical brief, but default confirmation is interactive local sduck confirm --digest; non-human MCP acknowledgement is explicit policy opt-in with provenance.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1502",
      "createdAt": "2026-08-18T05:13:08.455Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0019",
      "summary": "Prior decision: What trace data and CI semantics should sduck verify require? — Bind trace to Git and brief digest",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1503",
      "createdAt": "2026-08-18T05:13:08.455Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0020",
      "summary": "Prior decision: What exact BriefDigestProjectionV1 and canonical serializer should sduck use? — RFC 8785 projection v1 (recommended)",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1504",
      "createdAt": "2026-08-18T05:13:08.455Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0023",
      "summary": "Prior decision: What exact Git-bound trace and sduck verify algorithm should 0.6 use? — Merge-base CI verifier (recommended)",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1505",
      "createdAt": "2026-08-18T05:13:08.456Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
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
      "id": "CTX-1506",
      "createdAt": "2026-08-18T05:13:08.456Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
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
      "id": "CTX-1507",
      "createdAt": "2026-08-18T05:13:08.456Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "sourceType": "MEMORY",
      "sourceRef": "IMPL-0026",
      "summary": "Prior implementation trace: Detected 41 changed file(s).",
      "metadata": {
        "type": "implementation_trace",
        "filesChanged": [
          ".agents/rules/sduck-core.md",
          ".claude/hooks/sdd-guard.sh",
          ".claude/settings.json",
          ".claude/skills/sd-build-wiki.md",
          ".claude/skills/sd-sync-wiki.md",
          ".claude/skills/sduck-codebase-decisions.md",
          ".claude/skills/sduck-retrospective-capture.md",
          ".cursor/rules/sduck-core.mdc",
          "AGENTS.md",
          "CLAUDE.md",
          "GEMINI.md",
          "README.ko.md",
          "README.md",
          "docs/migration.md",
          "docs/use-cases.md",
          "src/cli.ts",
          "src/commands/v2/index.ts",
          "src/core/v2/cache-bundle.ts",
          "src/core/v2/context.ts",
          "src/core/v2/decision-workspace.ts",
          "src/core/v2/errors.ts",
          "src/core/v2/memory-source.ts",
          "src/core/v2/memory.ts",
          "src/core/v2/paths.ts",
          "src/core/v2/rebuild.ts",
          "src/core/v2/recall.ts",
          "src/core/v2/remember.ts",
          "src/core/v2/source-store.ts",
          "src/core/v2/source-types.ts",
          "src/core/v2/store.ts",
          "src/core/v2/workspace.ts",
          "src/types/index.ts",
          "src/ui/v2/messages.ts",
          "src/ui/v2/render.ts",
          "tests/e2e/sdd-cli-reachability.test.ts",
          "tests/e2e/v2-memory-cli.test.ts",
          "tests/e2e/v2-phase2c-matrix.test.ts",
          "tests/unit/decision-workspace.test.ts",
          "tests/unit/sdd-core-regression.test.ts",
          "tests/unit/v2-memory.test.ts",
          "tests/unit/v2-messages.test.ts"
        ],
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1508",
      "createdAt": "2026-08-18T05:13:08.456Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "sourceType": "MEMORY",
      "sourceRef": "IMPL-0037",
      "summary": "Prior implementation trace: Detected 18 changed file(s).",
      "metadata": {
        "type": "implementation_trace",
        "filesChanged": [
          ".omc/project-memory.json",
          ".omc/state/hud-stdin-cache.json",
          ".omc/state/sessions/e9bc2156-bb4a-4af4-911d-ddcfa7c8660b/last-tool-error-state.json",
          ".omc/state/sessions/e9bc2156-bb4a-4af4-911d-ddcfa7c8660b/pre-tool-advisory-throttle.json",
          "src/cli.ts",
          "src/commands/v2/index.ts",
          "src/core/v2/categories.ts",
          "src/core/v2/decision.ts",
          "src/core/v2/draft.ts",
          "src/core/v2/errors.ts",
          "src/core/v2/policy.ts",
          "src/core/v2/rebuild.ts",
          "src/core/v2/source-store.ts",
          "src/core/v2/store.ts",
          "src/types/index.ts",
          "src/ui/v2/messages.ts",
          "src/ui/v2/render.ts",
          "tests/unit/v2-categories.test.ts"
        ],
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1509",
      "createdAt": "2026-08-18T05:13:08.457Z"
    },
    {
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "sourceType": "DISCOVERY",
      "sourceRef": ".agents/rules/sduck-core.md",
      "summary": "File evidence: Canonical v2 sequence: `sduck work` → `sduck context` → `sduck grill complete --reason \"...\"` → `sduck submit --stdin` → `sduck ask`/`sduck answer` → `sduck brief`/`sduck confirm` → implementation activity → `sduck trace` → `sduck evaluate`",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "Canonical v2 sequence: `sduck work` → `sduck context` → `sduck grill complete --reason \"...\"` → `sduck submit --stdin` → `sduck ask`/`sduck answer` → `sduck brief`/`sduck confirm` → implementation activity → `sduck trace` → `sduck evaluate`",
        "line": 3
      },
      "id": "CTX-1529",
      "createdAt": "2026-08-18T05:13:08.461Z"
    }
  ],
  "briefSnapshots": [
    {
      "id": "BRF-0035",
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "snapshot": {
        "task": {
          "id": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
          "title": "카테고리별 전체 결정 목록을 순위 없이 그대로 보여주는 sduck categories browse 명령 추가 -- 카파시 LLM Wiki 패턴처럼 에이전트가 직접 읽고 고르게 함",
          "description": "카테고리별 전체 결정 목록을 순위 없이 그대로 보여주는 sduck categories browse 명령 추가 -- 카파시 LLM Wiki 패턴처럼 에이전트가 직접 읽고 고르게 함",
          "status": "CONFIRMED",
          "expectedScope": [
            "src/core/v2/categories.ts",
            "src/core/v2/errors.ts",
            "src/cli.ts",
            "src/commands/v2/index.ts",
            "src/ui/v2/render.ts",
            "src/ui/v2/messages.ts",
            "tests/unit/v2-categories.test.ts"
          ],
          "avoidScope": [
            "카테고리 이름 자동완성/퍼지 매칭",
            "요약/근거 등 부가 필드를 목록에 노출",
            "browse 결과에 랭킹 적용"
          ],
          "guided": true,
          "recordDepth": "FULL",
          "createdAt": "2026-08-18T05:13:08.220Z",
          "updatedAt": "2026-08-18T05:13:57.370Z",
          "implementationPlan": [
            "categories.ts: browseCategory(projectRoot, category, {uncategorized?}) 추가, 500개 상한+truncated",
            "errors.ts + messages.ts(en/ko): CATEGORY_NOT_FOUND 에러 코드/메시지 추가",
            "render.ts: renderCategoryBrowse(view, messages) 추가",
            "commands/v2/index.ts: runCategoriesBrowseCommand 추가",
            "cli.ts: categories browse <category> [--uncategorized] [--json] 배선",
            "tests/unit/v2-categories.test.ts: browse 정상 케이스, 존재하지 않는 카테고리, --uncategorized, 상한 truncated 검증"
          ],
          "verificationPlan": [
            "npm run build",
            "npm test",
            "npm run lint",
            "sdcuk-cli에 실제로 sduck categories set 후 browse를 수동 실행해 확인"
          ]
        },
        "decisions": {
          "EXPLICIT": [
            {
              "id": "DEC-0090",
              "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
              "title": "categories.ts에 browseCategory()를 추가해 카테고리 안의 결정을 순위 없이 전부(id+title만) 반환한다",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "listCategoryCounts와 같은 가시성 규칙(status IN CONFIRMED/DRAFT, task not ABANDONED)으로 지정한 카테고리(또는 미분류)에 속한 결정을 전부 조회한다. FTS/bm25/RRF 등 어떤 랭킹도 적용하지 않는다 -- 카파시의 LLM Wiki 패턴대로 '목차를 통째로 보여주고 에이전트가 직접 읽고 고르는' 것이 이 기능의 존재 이유이므로, 알고리즘이 먼저 걸러내면 목적이 무너진다. 한 줄당 id+title만 반환해 항목 수가 많아도 비용이 작게 유지되게 한다(summary/rationale 등은 안 보여줌). 카테고리 이름이 없으면 CATEGORY_NOT_FOUND로 거부하고, --uncategorized 플래그로 미분류 버킷도 조회 가능하게 한다. 안전판으로 500개 상한을 두되 초과 시 truncated: true를 정직하게 표시한다(조용히 자르지 않음).",
              "rationale": [
                "listCategoryCounts의 개수 집계와 browseCategory의 실제 목록이 다른 가시성 규칙을 쓰면 'list에서 본 개수'와 'browse로 실제 읽은 개수'가 어긋나 에이전트가 혼란스러워짐",
                "graph.ts의 MAX_NODES/truncated 패턴을 그대로 재사용해 '조용한 상한'이 아니라 '정직하게 표시된 상한'이라는 이 코드베이스의 기존 원칙을 지킴"
              ],
              "appliesTo": [
                "src/core/v2/categories.ts"
              ],
              "avoids": [
                "요약/근거 등 부가 필드 노출(제목만)",
                "FTS/그래프/RRF 랭킹 적용"
              ],
              "sourceRefs": [
                "DEC-0087",
                "DEC-0088"
              ],
              "createdAt": "2026-08-18T05:13:47.551Z",
              "updatedAt": "2026-08-18T05:13:57.370Z"
            },
            {
              "id": "DEC-0091",
              "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
              "title": "sduck categories browse <category> [--uncategorized] 명령을 추가한다",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "categories suggest/set/list와 같은 Commander 하위 명령 패턴으로 browse를 추가한다. 결과는 id+title 한 줄씩(CONFIRMED가 아니면 상태 표시), 상한 초과 시 truncated 안내를 포함해 렌더링한다. --json으로 기계가 읽는 출력도 지원한다.",
              "rationale": [
                "recall.ts의 renderRecallLocalized가 이미 'CONFIRMED가 아니면 (DRAFT) 표시'하는 규칙을 쓰고 있어 같은 규칙을 재사용하면 출력 일관성이 유지됨"
              ],
              "appliesTo": [
                "src/cli.ts",
                "src/commands/v2/index.ts",
                "src/ui/v2/render.ts",
                "src/ui/v2/messages.ts",
                "src/core/v2/errors.ts"
              ],
              "avoids": [
                "카테고리 자동완성/퍼지 매칭"
              ],
              "sourceRefs": [],
              "createdAt": "2026-08-18T05:13:47.551Z",
              "updatedAt": "2026-08-18T05:13:57.370Z"
            }
          ],
          "INFERRED": [],
          "CARRIED": [],
          "CONFLICT": [],
          "OPEN": []
        },
        "questions": [],
        "evidence": [],
        "expectedScope": [
          "src/core/v2/categories.ts",
          "src/core/v2/errors.ts",
          "src/cli.ts",
          "src/commands/v2/index.ts",
          "src/ui/v2/render.ts",
          "src/ui/v2/messages.ts",
          "tests/unit/v2-categories.test.ts"
        ],
        "avoidScope": [
          "카테고리 이름 자동완성/퍼지 매칭",
          "요약/근거 등 부가 필드를 목록에 노출",
          "browse 결과에 랭킹 적용"
        ],
        "implementationPlan": [
          "categories.ts: browseCategory(projectRoot, category, {uncategorized?}) 추가, 500개 상한+truncated",
          "errors.ts + messages.ts(en/ko): CATEGORY_NOT_FOUND 에러 코드/메시지 추가",
          "render.ts: renderCategoryBrowse(view, messages) 추가",
          "commands/v2/index.ts: runCategoriesBrowseCommand 추가",
          "cli.ts: categories browse <category> [--uncategorized] [--json] 배선",
          "tests/unit/v2-categories.test.ts: browse 정상 케이스, 존재하지 않는 카테고리, --uncategorized, 상한 truncated 검증"
        ],
        "verificationPlan": [
          "npm run build",
          "npm test",
          "npm run lint",
          "sdcuk-cli에 실제로 sduck categories set 후 browse를 수동 실행해 확인"
        ],
        "openQuestionCount": 0
      },
      "renderedMarkdown": "────────────────────────────────────────\nImplementation Brief\n────────────────────────────────────────\nTask: TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-\n카테고리별 전체 결정 목록을 순위 없이 그대로 보여주는 sduck categories browse 명령 추가 -- 카파시 LLM Wiki 패턴처럼 에이전트가 직접 읽고 고르게 함\n\nA. Explicit decisions\n[EXPLICIT] DEC-0090. categories.ts에 browseCategory()를 추가해 카테고리 안의 결정을 순위 없이 전부(id+title만) 반환한다\nConfidence: 1.00\nSummary: listCategoryCounts와 같은 가시성 규칙(status IN CONFIRMED/DRAFT, task not ABANDONED)으로 지정한 카테고리(또는 미분류)에 속한 결정을 전부 조회한다. FTS/bm25/RRF 등 어떤 랭킹도 적용하지 않는다 -- 카파시의 LLM Wiki 패턴대로 '목차를 통째로 보여주고 에이전트가 직접 읽고 고르는' 것이 이 기능의 존재 이유이므로, 알고리즘이 먼저 걸러내면 목적이 무너진다. 한 줄당 id+title만 반환해 항목 수가 많아도 비용이 작게 유지되게 한다(summary/rationale 등은 안 보여줌). 카테고리 이름이 없으면 CATEGORY_NOT_FOUND로 거부하고, --uncategorized 플래그로 미분류 버킷도 조회 가능하게 한다. 안전판으로 500개 상한을 두되 초과 시 truncated: true를 정직하게 표시한다(조용히 자르지 않음).\nSource refs:\n  - DEC-0087\n  - DEC-0088\nRationale:\n  - listCategoryCounts의 개수 집계와 browseCategory의 실제 목록이 다른 가시성 규칙을 쓰면 'list에서 본 개수'와 'browse로 실제 읽은 개수'가 어긋나 에이전트가 혼란스러워짐\n  - graph.ts의 MAX_NODES/truncated 패턴을 그대로 재사용해 '조용한 상한'이 아니라 '정직하게 표시된 상한'이라는 이 코드베이스의 기존 원칙을 지킴\nApplies to:\n  - src/core/v2/categories.ts\nAvoids:\n  - 요약/근거 등 부가 필드 노출(제목만)\n  - FTS/그래프/RRF 랭킹 적용\n\n[EXPLICIT] DEC-0091. sduck categories browse <category> [--uncategorized] 명령을 추가한다\nConfidence: 1.00\nSummary: categories suggest/set/list와 같은 Commander 하위 명령 패턴으로 browse를 추가한다. 결과는 id+title 한 줄씩(CONFIRMED가 아니면 상태 표시), 상한 초과 시 truncated 안내를 포함해 렌더링한다. --json으로 기계가 읽는 출력도 지원한다.\nRationale:\n  - recall.ts의 renderRecallLocalized가 이미 'CONFIRMED가 아니면 (DRAFT) 표시'하는 규칙을 쓰고 있어 같은 규칙을 재사용하면 출력 일관성이 유지됨\nApplies to:\n  - src/cli.ts\n  - src/commands/v2/index.ts\n  - src/ui/v2/render.ts\n  - src/ui/v2/messages.ts\n  - src/core/v2/errors.ts\nAvoids:\n  - 카테고리 자동완성/퍼지 매칭\n\nB. Inferred decisions\n  - none\n\nC. Carried decisions\n  - none\n\nD. Conflicts\n  - none\n\nE. Open decisions\n  - none\n\nProblem:\n  카테고리별 전체 결정 목록을 순위 없이 그대로 보여주는 sduck categories browse 명령 추가 -- 카파시 LLM Wiki 패턴처럼 에이전트가 직접 읽고 고르게 함\nImplementation plan:\n  - categories.ts: browseCategory(projectRoot, category, {uncategorized?}) 추가, 500개 상한+truncated\n  - errors.ts + messages.ts(en/ko): CATEGORY_NOT_FOUND 에러 코드/메시지 추가\n  - render.ts: renderCategoryBrowse(view, messages) 추가\n  - commands/v2/index.ts: runCategoriesBrowseCommand 추가\n  - cli.ts: categories browse <category> [--uncategorized] [--json] 배선\n  - tests/unit/v2-categories.test.ts: browse 정상 케이스, 존재하지 않는 카테고리, --uncategorized, 상한 truncated 검증\nVerification plan:\n  - npm run build\n  - npm test\n  - npm run lint\n  - sdcuk-cli에 실제로 sduck categories set 후 browse를 수동 실행해 확인\nScope expected:\n  - src/core/v2/categories.ts\n  - src/core/v2/errors.ts\n  - src/cli.ts\n  - src/commands/v2/index.ts\n  - src/ui/v2/render.ts\n  - src/ui/v2/messages.ts\n  - tests/unit/v2-categories.test.ts\nScope avoided:\n  - 카테고리 이름 자동완성/퍼지 매칭\n  - 요약/근거 등 부가 필드를 목록에 노출\n  - browse 결과에 랭킹 적용\nOpen questions: 0\nEvidence:\n  - none\n────────────────────────────────────────",
      "gitBaseline": {
        "head": "9c709d5438e1108bdfa169a37efa63854323e9cc",
        "dirtyFileHashes": {
          "\".decision/exports/markdown/tasks/TASK-20260818-/352/262/260/354/240/225/354/227/220-/355/224/204/353/241/234/354/240/235/355/212/270/353/263/204-/352/263/240/354/240/225-/353/266/204/353/245/230-/354/262/264/352/263/204-/353/214/200/353/266/204/353/245/230-/353/245/274-/353/266/231/354/235/274-/354/210/230-/354/236/210/353/212/224-/354/235/270/355/224/204/353/235/274-/354/266/224/352/260/200-policy-j.md\"": null,
          "\".decision/exports/markdown/tasks/TASK-20260818-/354/271/264/355/205/214/352/263/240/353/246/254/353/263/204-/354/240/204/354/262/264-/352/262/260/354/240/225-/353/252/251/353/241/235/354/235/204-/354/210/234/354/234/204-/354/227/206/354/235/264-/352/267/270/353/214/200/353/241/234-/353/263/264/354/227/254/354/243/274/353/212/224-sduck-categories-.md\"": null,
          "\".decision/exports/markdown/tasks/TASK-20260818-mermaid-graph-export-trace-/354/240/225/354/240/225-impl-0031/354/235/264-confirm.md\"": null,
          "\".decision/exports/markdown/tasks/TASK-20260818-recall-memory-searchterms/354/227/220-/354/230/201/354/226/264-/353/266/210/354/232/251/354/226/264-/355/225/204/355/204/260-/354/266/224/352/260/200-adieum-a.md\"": null,
          "\".decision/exports/markdown/tasks/TASK-20260818-recall/354/227/220-graph-nodes-edges-/354/227/260/352/262/260-fts5-trigram-/352/262/200/354/203/211-/354/266/224/352/260/200.md\"": null,
          "\".decision/exports/markdown/tasks/TASK-20260818-recall/354/235/230-decisions-traces-/353/236/255/355/202/271/354/235/204-fts-bm25-/354/210/234/354/234/204/354/231/200-/352/267/270/353/236/230/355/224/204-ho.md\"": null,
          "\".decision/exports/markdown/tasks/TASK-20260818-recall/354/235/264-draft-/354/203/201/355/203/234-/352/262/260/354/240/225/353/217/204-/354/260/276/354/235/204-/354/210/230-/354/236/210/353/217/204/353/241/235-confirmed-/354/240/204/354/232/251-/355/225/204/355/204/260/353/245/274-/354/231/204.md\"": null,
          "\".decision/exports/markdown/tasks/TASK-20260818-sduck-graph-show/354/227/220-mermaid-/354/266/234/353/240/245-/354/230/265/354/205/230-/354/266/224/352/260/200.md\"": null,
          "\".decision/exports/markdown/tasks/TASK-20260818-sduck-recall/354/227/220-json-/354/266/234/353/240/245-/354/230/265/354/205/230-/354/266/224/352/260/200.md\"": null,
          "\".decision/exports/markdown/tasks/TASK-20260818-search-ts-/353/266/210/354/232/251/354/226/264-/355/225/204/355/204/260-trace-/354/240/225/354/240/225-impl-0033-/355/214/214/354/235/274-/353/252/251/353/241/235-/353/210/204/353/235/275-/354/236/254/352/270/260/353/241/235.md\"": null,
          ".omc/project-memory.json": "53532c17684196afbe6ccee147a3a6b5de753c8eefa3668f15c5b2e951a49097",
          ".omc/sessions/0df5d112-2f48-4749-97e4-333c1bc3c4a0.json": "88d5203da7bc1b4ed360966921a0383698c96ca3a882213c404911a9be5503b3",
          ".omc/sessions/21700872-d3ec-4974-b033-67d97c77ad59.json": "01d4e0d40dc663d4b07fff5d5a79b929d1eb02ba9e1bf91a55191ba0686f4250",
          ".omc/sessions/46d1799c-c47b-42b3-ac73-d710812fcf0f.json": "8741f8b4480a840a5591a964223a4415aa945ae3a1415995eef7959fb62656f1",
          ".omc/sessions/7d512c3f-2454-47a9-b778-050805847bdf.json": "c4767182fab0532dd40af30af3eaf09ee7e1646ae4672d9a137187330bb93531",
          ".omc/state/agent-replay-e9bc2156-bb4a-4af4-911d-ddcfa7c8660b.jsonl": "55a50622f1a4334938f292b3642a2546c90e540dd2f21e76c3888fa342dcc12c",
          ".omc/state/checkpoints/checkpoint-2026-08-18T02-59-19-604Z.json": "1411b8a5d260d81abb5ed96c942930312104cea0f33eb352e4d64463e10e918a",
          ".omc/state/hud-stdin-cache.json": "a6c84774b7df0c71e23870af130d27b15747210d668148217d78254f3234353f",
          ".omc/state/idle-notif-cooldown.json": "adabb9cced7341054932b70e8ee6a005880f7e536ca093a642525c4f0a26c435",
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
          ".omc/state/sessions/e9bc2156-bb4a-4af4-911d-ddcfa7c8660b/pre-tool-advisory-throttle.json": "b563a3a9295ed9bfbd34db5e9583f22f3fb9ced3b453ad7c9f749063a5379fe5",
          ".omc/state/sessions/e9bc2156-bb4a-4af4-911d-ddcfa7c8660b/session-started.json": "07824255e164ede69d9edf517d1a421eddb3061d301c4d27f9e0101e2e8204ed",
          ".omc/state/sessions/e9bc2156-bb4a-4af4-911d-ddcfa7c8660b/subagent-tracking-state.json": "92678f5c32e1dfca895d53004aa566f938c5626f406b29c6f3764b1c77c615fc",
          "src/cli.ts": "c3f52536bc4b1f2132a31323e355703012ccec749712335e92106ea22a07154c",
          "src/commands/v2/index.ts": "3843986c1985157f4ae5497d9fa2f4766a8b4c7c44cf5be7ea3f28a71f101fe4",
          "src/core/v2/categories.ts": "60cb6bbfaf90ac8b8072d515701ce26ab1f53760330bb9ae9eb0fc4610e8aec7",
          "src/core/v2/decision.ts": "051fa93de5a5b35ab73aff5838e90571126d9bc3d5da43228402ce1cf08481be",
          "src/core/v2/draft.ts": "9632fc64c6001559b68d2e2a36f1743b2a65544b6dd01cc0c50c66b9f06fc990",
          "src/core/v2/errors.ts": "ec8748ae68d4bbc9a6a2f2cd01c8e0bf114cc71c9f6e8699db47df070d84863d",
          "src/core/v2/graph.ts": "e1bfe86c6cb97163c87f6e9defac9b6f63f2d11a6d71b85decb934f448f3b73c",
          "src/core/v2/memory.ts": "8060b42e5f3edd8000cbf74e3e6f264d4125264c3422010cf33d5c4407a26edf",
          "src/core/v2/policy.ts": "230156ece885b93efc0fc7fff7d0bcc94dcbbef668286ccd5efb188d5a79142a",
          "src/core/v2/rebuild.ts": "e163add5672e56c9266082b37dd41bf792b3278d1fefcf1b85ddb54bce4a8715",
          "src/core/v2/recall.ts": "4596bbb0aab62fe4460f84089243d02675ae5ba488a81a171e124fb988008ce9",
          "src/core/v2/search.ts": "71a8e49b5c9724ed64301d411d66b2b3e530a004df6e0f49079a0db6c693e7e0",
          "src/core/v2/source-store.ts": "211f071f3d9fca98c16630a86694e016c8ad5223b5ed78ad735cfd4964d2e04b",
          "src/core/v2/store.ts": "8f45cd4361d656b57c2a507ed2cfaf9369c6304ddd44f4ca9b1f45553ce07487",
          "src/types/index.ts": "c0a1dec4162e6f15b3003b05b880a1c8f47e964a7d9319cc512646ca8b310e1c",
          "src/ui/v2/messages.ts": "395779dbc8fd2d1db84af9a7d99b116c24620e52426e0fc6f16e8b3efec068bc",
          "src/ui/v2/render.ts": "334e8aff0ad595acb3282f7ea6aded8df1acb6ea5822322a848e3d3dc1f29dba",
          "tests/e2e/v2-cli.test.ts": "e3ca5723cce47488f29f977c5241a44048ae02835bd9a68e8ee63a636213a40f",
          "tests/unit/decision-workspace.test.ts": "0b3bd18768c559c8ef6f2248c4de20615968fb06008b9a0bd19b01671edf9948",
          "tests/unit/v2-categories.test.ts": "5322350b0f2f5869261f92db6f4301f9f9b73a24fdf6598d08127230aba7fc62",
          "tests/unit/v2-lifecycle.test.ts": "4a76497d17684b00666acbb30a78ab72f59c3b5eb74eddf8c7f7cce942eacc7c",
          "tests/unit/v2-memory.test.ts": "86bed0cd69faa028afec311c54074db3767ba2e35e8a58ac9a10cf1bed961050",
          "tests/unit/v2-recall.test.ts": "5a9eb83054b9579d3ed4b16e65dfa301f943f0a3abdf4a2f6a25ca11409a7b07",
          "tests/unit/v2-search.test.ts": "d30ccabe217e04ba11dd43f1dcffea33b7d6cc6b009bb71c6bde79e7e04f4d4d"
        }
      },
      "createdAt": "2026-08-18T05:13:57.440Z"
    }
  ],
  "evaluations": [
    {
      "id": "EVAL-0021",
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "traceId": "IMPL-0039",
      "checks": [
        {
          "name": "build",
          "outcome": "passed"
        },
        {
          "name": "lint",
          "outcome": "passed"
        },
        {
          "name": "unit-tests",
          "outcome": "170 passed"
        },
        {
          "name": "e2e-tests",
          "outcome": "33 passed"
        },
        {
          "name": "manual-smoke-test",
          "outcome": "sduck categories browse <미설정 카테고리>가 CATEGORY_NOT_FOUND로 거부됨을 확인, --uncategorized로 실제 미분류 결정 id+title 목록이 출력됨을 확인"
        }
      ],
      "limitations": [
        "500개 상한/truncated 플래그는 코드 리뷰로만 검증함 -- 실제로 501개 결정을 만들어 자동 테스트하는 건 비용이 커서 생략함",
        "카테고리 이름 자동완성/오타 교정은 없음 -- 정확히 일치하는 이름만 허용, 안 맞으면 sduck categories list를 안내"
      ],
      "createdAt": "2026-08-18T05:18:27.365Z"
    }
  ],
  "events": [
    {
      "id": "EVT-0520",
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "type": "TASK_CREATED",
      "payload": {
        "description": "카테고리별 전체 결정 목록을 순위 없이 그대로 보여주는 sduck categories browse 명령 추가 -- 카파시 LLM Wiki 패턴처럼 에이전트가 직접 읽고 고르게 함",
        "policy": {
          "grillMeRequired": false
        }
      },
      "createdAt": "2026-08-18T05:13:08.221Z"
    },
    {
      "id": "EVT-0521",
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "type": "GRILL_STARTED",
      "payload": {
        "automatic": true
      },
      "createdAt": "2026-08-18T05:13:08.221Z"
    },
    {
      "id": "EVT-0522",
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "type": "CONTEXT_INDEXED",
      "payload": {
        "itemCount": 40
      },
      "createdAt": "2026-08-18T05:13:08.465Z"
    },
    {
      "id": "EVT-0523",
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "type": "GRILL_COMPLETED",
      "payload": {
        "reason": "사용자가 '기능 먼저 만들자'로 browse 기능 진행을 명시적으로 확정함. 이전 categories 인프라 작업(DEC-0087~0089)에서 이미 설계 방향(1단계 분류, 순위 없이 전체 노출)이 정해져 있어 추가 모호성 없음.",
        "carried": []
      },
      "createdAt": "2026-08-18T05:13:19.340Z"
    },
    {
      "id": "EVT-0524",
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0090"
      },
      "createdAt": "2026-08-18T05:13:47.552Z"
    },
    {
      "id": "EVT-0525",
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0091"
      },
      "createdAt": "2026-08-18T05:13:47.552Z"
    },
    {
      "id": "EVT-0526",
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 2,
        "questions": 0,
        "evidence": 0,
        "expectedScope": [
          "src/core/v2/categories.ts",
          "src/core/v2/errors.ts",
          "src/cli.ts",
          "src/commands/v2/index.ts",
          "src/ui/v2/render.ts",
          "src/ui/v2/messages.ts",
          "tests/unit/v2-categories.test.ts"
        ],
        "avoidScope": [
          "카테고리 이름 자동완성/퍼지 매칭",
          "요약/근거 등 부가 필드를 목록에 노출",
          "browse 결과에 랭킹 적용"
        ],
        "implementationPlan": [
          "categories.ts: browseCategory(projectRoot, category, {uncategorized?}) 추가, 500개 상한+truncated",
          "errors.ts + messages.ts(en/ko): CATEGORY_NOT_FOUND 에러 코드/메시지 추가",
          "render.ts: renderCategoryBrowse(view, messages) 추가",
          "commands/v2/index.ts: runCategoriesBrowseCommand 추가",
          "cli.ts: categories browse <category> [--uncategorized] [--json] 배선",
          "tests/unit/v2-categories.test.ts: browse 정상 케이스, 존재하지 않는 카테고리, --uncategorized, 상한 truncated 검증"
        ],
        "verificationPlan": [
          "npm run build",
          "npm test",
          "npm run lint",
          "sdcuk-cli에 실제로 sduck categories set 후 browse를 수동 실행해 확인"
        ]
      },
      "createdAt": "2026-08-18T05:13:47.553Z"
    },
    {
      "id": "EVT-0527",
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "type": "BRIEF_CONFIRMED",
      "payload": {
        "snapshotId": "BRF-0035"
      },
      "createdAt": "2026-08-18T05:13:57.440Z"
    },
    {
      "id": "EVT-0528",
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "type": "TRACE_CREATED",
      "payload": {
        "traceId": "IMPL-0039",
        "filesChanged": [
          ".omc/project-memory.json",
          ".omc/state/hud-stdin-cache.json",
          ".omc/state/sessions/e9bc2156-bb4a-4af4-911d-ddcfa7c8660b/pre-tool-advisory-throttle.json",
          "src/cli.ts",
          "src/commands/v2/index.ts",
          "src/core/v2/categories.ts",
          "src/core/v2/errors.ts",
          "src/ui/v2/messages.ts",
          "src/ui/v2/render.ts",
          "tests/unit/v2-categories.test.ts"
        ]
      },
      "createdAt": "2026-08-18T05:18:19.691Z"
    },
    {
      "id": "EVT-0529",
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "type": "EVALUATION_RECORDED",
      "payload": {
        "evaluationId": "EVAL-0021",
        "traceId": "IMPL-0039"
      },
      "createdAt": "2026-08-18T05:18:27.366Z"
    },
    {
      "id": "EVT-0530",
      "taskId": "TASK-20260818-카테고리별-전체-결정-목록을-순위-없이-그대로-보여주는-sduck-categories-",
      "type": "TASK_CLOSED",
      "payload": {},
      "createdAt": "2026-08-18T05:18:50.482Z"
    }
  ]
}
```
