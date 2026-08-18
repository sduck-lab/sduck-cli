---
id: TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가
type: task
status: CLOSED
title: recall에 graph_nodes/edges 연결 + FTS5(trigram) 검색 추가
record_depth: FULL
created_at: '2026-08-18T01:24:57.965Z'
updated_at: '2026-08-18T01:39:37.817Z'
---
# TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가: recall에 graph_nodes/edges 연결 + FTS5(trigram) 검색 추가

recall에 graph_nodes/edges 연결 + FTS5(trigram) 검색 추가

## Sduck source

```json sduck-source
{
  "task": {
    "id": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
    "title": "recall에 graph_nodes/edges 연결 + FTS5(trigram) 검색 추가",
    "description": "recall에 graph_nodes/edges 연결 + FTS5(trigram) 검색 추가",
    "status": "CLOSED",
    "expectedScope": [
      "src/core/v2/store.ts",
      "src/core/v2/rebuild.ts",
      "src/core/v2/cache.ts",
      "src/core/v2/recall.ts",
      "src/core/v2/graph.ts",
      "src/core/v2/search.ts",
      "src/types/index.ts",
      "src/ui/v2/render.ts",
      "src/ui/v2/messages.ts",
      "src/cli.ts",
      "tests/unit/v2-recall.test.ts"
    ],
    "avoidScope": [
      "위키 자동 업데이트 GitHub Action cron (별도 decision task로 분리, 이번 스코프 아님)",
      "범용 그래프 쿼리 언어",
      "원격/외부 그래프 서비스",
      "sduck 소유 LLM runtime 또는 daemon"
    ],
    "guided": true,
    "recordDepth": "FULL",
    "createdAt": "2026-08-18T01:24:57.965Z",
    "updatedAt": "2026-08-18T01:39:37.817Z",
    "implementationPlan": [
      "store.ts: decisions_fts/traces_fts/memory_fts FTS5(trigram) 가상 테이블 스키마 추가",
      "rebuild.ts: 기존 bulk insert 단계에서 FTS5 테이블 채우기, GRAPH_PROJECTION_VERSION 상향",
      "search.ts: FTS5 MATCH 쿼리 문자열을 안전하게 구성하는 헬퍼 추가(각 term을 큰따옴표로 감싸고 3자 미만은 제외)",
      "graph.ts: 단일 root 대신 다중 seed 배열과 depth를 받는 순회 헬퍼로 일반화(showGraph와 공유)",
      "recall.ts: 3자 이상은 FTS5+bm25, 3자 미만은 LIKE로 병합, 매칭 id를 시드로 그래프 확장해 related 필드 채움",
      "types/index.ts: RecallResult에 related 필드 추가",
      "cli.ts: recall 커맨드에 --depth <n> 옵션 추가(기본 1, 최대 graph.ts MAX_DEPTH)",
      "render.ts/messages.ts: related 섹션 렌더링과 en/ko 라벨 추가"
    ],
    "verificationPlan": [
      "tests/unit/v2-recall.test.ts 신규: FTS 매칭, 3자 미만 한글 LIKE fallback, depth로 그래프 확장된 related 항목 검증",
      "npm run build && npm test && npm run lint",
      "이 저장소의 실제 .decision 데이터로 sduck recall 수동 실행해 출력 형태 확인"
    ]
  },
  "questions": [],
  "evidence": [
    {
      "id": "EVD-0087",
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/store.ts:205-216",
      "summary": "graph_nodes/graph_edges 테이블이 이미 존재하고 양방향 인덱스가 걸려있음",
      "confidence": 0.7,
      "createdAt": "2026-08-18T01:28:29.212Z"
    },
    {
      "id": "EVD-0088",
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/recall.ts:21-58",
      "summary": "현재 recall은 SQL LIKE 부분일치만 사용하고 graph_nodes/edges를 전혀 사용하지 않음",
      "confidence": 0.7,
      "createdAt": "2026-08-18T01:28:29.212Z"
    },
    {
      "id": "EVD-0089",
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/graph.ts:16-86",
      "summary": "showGraph가 단일 root에서 depth 파라미터(최대 4)로 bounded BFS를 이미 구현하고 있어 재사용 가능",
      "confidence": 0.7,
      "createdAt": "2026-08-18T01:28:29.212Z"
    },
    {
      "id": "EVD-0090",
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "decisionId": null,
      "sourceType": "DISCOVERY",
      "sourceRef": "node:sqlite v22.22.0 FTS5 실측",
      "summary": "CREATE VIRTUAL TABLE ... USING fts5(tokenize='trigram') 및 bm25() 랭킹이 정상 동작. 단 trigram은 3자 미만 쿼리 매칭 불가, 하이픈 포함 토큰은 MATCH 문자열에서 큰따옴표로 감싸야 구문 오류가 나지 않음",
      "confidence": 0.7,
      "createdAt": "2026-08-18T01:28:29.212Z"
    },
    {
      "id": "EVD-0091",
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "decisionId": null,
      "sourceType": "USER_ANSWER",
      "sourceRef": "AskUserQuestion 2026-08-18",
      "summary": "그래프 확장 깊이를 고정 1홉이 아니라 파라미터화하길 원함. 위키 자동 업데이트 GitHub Action cron은 이번 턴에는 보류/취소, 별도 결정 사항으로 다룸",
      "confidence": 0.7,
      "createdAt": "2026-08-18T01:28:29.212Z"
    },
    {
      "id": "EVD-0092",
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "decisionId": null,
      "sourceType": "DECISION_DOC",
      "sourceRef": "DEC-0042",
      "summary": "SQLite는 재구축 가능한 그래프 프로젝션이며 bounded relationship query 가속이 목적",
      "confidence": 0.7,
      "createdAt": "2026-08-18T01:28:29.212Z"
    },
    {
      "id": "EVD-0093",
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "decisionId": null,
      "sourceType": "DECISION_DOC",
      "sourceRef": "DEC-0044",
      "summary": "bounded graph visibility만 노출, 범용 그래프 쿼리 언어와 시각 UI는 배제",
      "confidence": 0.7,
      "createdAt": "2026-08-18T01:28:29.212Z"
    }
  ],
  "contextItems": [
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-RELEASE-0-7-0-CONTENTS",
      "summary": "Decision applies to relevant file README.ko.md: Commit the completed release payload and canonical records",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "README.ko.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1111",
      "createdAt": "2026-08-18T01:24:58.391Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-CONTEXT-CURRENT-CANDIDATE-SNAPSHOT",
      "summary": "Decision applies to relevant file src/core/v2/context.ts: Reconcile automatic context from the current candidate snapshot",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/core/v2/context.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1117",
      "createdAt": "2026-08-18T01:24:58.393Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-MEMORY-CITED-SOURCE-SUPPRESSION",
      "summary": "Decision applies to relevant file src/core/v2/context.ts: Suppress only raw sources actually cited by a matching capsule",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/core/v2/context.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1118",
      "createdAt": "2026-08-18T01:24:58.393Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-MEMORY-DEGRADED-READ-RECOVERY",
      "summary": "Decision applies to relevant file src/core/v2/rebuild.ts: Keep canonical history usable when a capsule reference breaks",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/core/v2/rebuild.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1119",
      "createdAt": "2026-08-18T01:24:58.393Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
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
      "id": "CTX-1120",
      "createdAt": "2026-08-18T01:24:58.395Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-MEMORY-PORTABLE-SEARCH-LOCALE",
      "summary": "Decision applies to relevant file src/core/v2/context.ts: Make memory digests, search patterns, and localized reasons portable",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "src/core/v2/context.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1121",
      "createdAt": "2026-08-18T01:24:58.395Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-CONTEXT-PERSISTENT-UPSERT",
      "summary": "Decision applies to relevant file src/core/v2/context.ts: Make persisted context indexing idempotent",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "src/core/v2/context.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1122",
      "createdAt": "2026-08-18T01:24:58.396Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
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
      "id": "CTX-1123",
      "createdAt": "2026-08-18T01:24:58.396Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-MEMORY-CAPSULE-BOUNDARY",
      "summary": "Decision applies to relevant file src/core/v2/rebuild.ts: Store one source-backed Memory Capsule per task",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/core/v2/rebuild.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1124",
      "createdAt": "2026-08-18T01:24:58.396Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
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
      "id": "CTX-1125",
      "createdAt": "2026-08-18T01:24:58.397Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
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
      "id": "CTX-1126",
      "createdAt": "2026-08-18T01:24:58.397Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-WIKI-DIRTY-STATUS",
      "summary": "Decision applies to relevant file src/core/v2/relevance.ts: Compute Wiki dirtiness only from deterministic evidence",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/core/v2/relevance.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1127",
      "createdAt": "2026-08-18T01:24:58.398Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
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
      "id": "CTX-1129",
      "createdAt": "2026-08-18T01:24:58.398Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
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
      "id": "CTX-1131",
      "createdAt": "2026-08-18T01:24:58.399Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
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
      "id": "CTX-1132",
      "createdAt": "2026-08-18T01:24:58.399Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0064",
      "summary": "Decision applies to relevant file README.ko.md: Clarify the public documentation in both README locales",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "README.ko.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1133",
      "createdAt": "2026-08-18T01:24:58.399Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0-6-safe-retrospective-hook",
      "summary": "Decision applies to relevant file src/commands/v2/index.ts: Use a safe managed retrospective-hook state machine",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/commands/v2/index.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1134",
      "createdAt": "2026-08-18T01:24:58.400Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0-6-cli-foundation",
      "summary": "Decision applies to relevant file docs/design/mcp-control-plane-0.6-contract.md: Ship 0.6.0 as CLI foundations, not an MCP runtime",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "docs/design/mcp-control-plane-0.6-contract.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1135",
      "createdAt": "2026-08-18T01:24:58.403Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0-6-release-evidence",
      "summary": "Decision applies to relevant file README.md: Prove the CLI release from a packed artifact",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "README.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1136",
      "createdAt": "2026-08-18T01:24:58.403Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0-6-release-safety",
      "summary": "Decision applies to relevant file src/commands/v2/index.ts: Make packaged workflow guidance and retrospective hooks release-safe",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "src/commands/v2/index.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1137",
      "createdAt": "2026-08-18T01:24:58.405Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0057",
      "summary": "Decision applies to relevant file README.ko.md: Document disabled-workflow automatic retrospective capture",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "README.ko.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1138",
      "createdAt": "2026-08-18T01:24:58.405Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0056",
      "summary": "Decision applies to relevant file src/cli.ts: Capture disabled-workflow decisions retrospectively without another prompt",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/cli.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1139",
      "createdAt": "2026-08-18T01:24:58.406Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0054",
      "summary": "Decision applies to relevant file src/cli.ts: Disable only new work creation and preserve existing records",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/cli.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1140",
      "createdAt": "2026-08-18T01:24:58.406Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0055",
      "summary": "Decision applies to relevant file README.ko.md: Provide explicit workspace workflow commands",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "README.ko.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1141",
      "createdAt": "2026-08-18T01:24:58.406Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
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
      "id": "CTX-1128",
      "createdAt": "2026-08-18T01:24:58.398Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-RELEASE-0-6-2",
      "summary": "Decision applies to relevant file tests/e2e/v2-cli.test.ts: Release Stage 1 as a new 0.6.2 package",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "tests/e2e/v2-cli.test.ts"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-1130",
      "createdAt": "2026-08-18T01:24:58.398Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0038",
      "summary": "Prior decision: Keep sduck CLI-first and defer the MCP control plane — Sduck remains a local CLI workflow tool. MCP server, protocol control plane, owned agent runtime, and remote graph services are deferred because they exceed the current internal-tool need.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1112",
      "createdAt": "2026-08-18T01:24:58.392Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0042",
      "summary": "Prior decision: Keep Markdown canonical and project history into rebuildable SQLite graph data — Git-mergeable Markdown remains canonical. SQLite remains a worktree-local rebuildable cache and graph projection that accelerates context and bounded relationship queries but is not required for agent judgment.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1113",
      "createdAt": "2026-08-18T01:24:58.392Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0044",
      "summary": "Prior decision: Expose bounded graph visibility in the CLI — context automatically summarizes relevant history, and graph show renders a task or decision neighborhood as text or JSON. A general graph query language and visual UI are excluded.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1114",
      "createdAt": "2026-08-18T01:24:58.392Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
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
      "id": "CTX-1115",
      "createdAt": "2026-08-18T01:24:58.392Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
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
      "id": "CTX-1116",
      "createdAt": "2026-08-18T01:24:58.392Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/v2/graph.ts",
      "summary": "File evidence: export interface GraphShowView {",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "export interface GraphShowView {",
        "line": 5
      },
      "id": "CTX-1142",
      "createdAt": "2026-08-18T01:24:58.406Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/commands/v2/index.ts",
      "summary": "File evidence: import { showGraph } from '../../core/v2/graph.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { showGraph } from '../../core/v2/graph.js';",
        "line": 17
      },
      "id": "CTX-1143",
      "createdAt": "2026-08-18T01:24:58.406Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/v2/rebuild.ts",
      "summary": "File evidence: export const GRAPH_PROJECTION_VERSION = 'v1';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "export const GRAPH_PROJECTION_VERSION = 'v1';",
        "line": 21
      },
      "id": "CTX-1144",
      "createdAt": "2026-08-18T01:24:58.407Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/v2/relevance.ts",
      "summary": "File evidence: import { decisionGraphExportPath, graphifyGraphPath, toRelativePath } from './paths.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { decisionGraphExportPath, graphifyGraphPath, toRelativePath } from './paths.js';",
        "line": 4
      },
      "id": "CTX-1145",
      "createdAt": "2026-08-18T01:24:58.407Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/v2/store.ts",
      "summary": "File evidence: CREATE TABLE IF NOT EXISTS graph_nodes (",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "CREATE TABLE IF NOT EXISTS graph_nodes (",
        "line": 205
      },
      "id": "CTX-1146",
      "createdAt": "2026-08-18T01:24:58.407Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/ui/v2/messages.ts",
      "summary": "File evidence: nodes: string;",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "nodes: string;",
        "line": 128
      },
      "id": "CTX-1147",
      "createdAt": "2026-08-18T01:24:58.408Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/e2e/v2-cli.test.ts",
      "summary": "File evidence: const supportsNodeSqlite = (() => {",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "const supportsNodeSqlite = (() => {",
        "line": 10
      },
      "id": "CTX-1148",
      "createdAt": "2026-08-18T01:24:58.408Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/unit/decision-workspace.test.ts",
      "summary": "File evidence: import { showGraph } from '../../src/core/v2/graph.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { showGraph } from '../../src/core/v2/graph.js';",
        "line": 13
      },
      "id": "CTX-1149",
      "createdAt": "2026-08-18T01:24:58.408Z"
    },
    {
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/use-cases.md",
      "summary": "File evidence: 11. `sduck remember`로 재사용 가능한 graph export를 남기고 `sduck close`로 종료한다.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "11. `sduck remember`로 재사용 가능한 graph export를 남기고 `sduck close`로 종료한다.",
        "line": 27
      },
      "id": "CTX-1150",
      "createdAt": "2026-08-18T01:24:58.409Z"
    }
  ],
  "briefSnapshots": [
    {
      "id": "BRF-0026",
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "snapshot": {
        "task": {
          "id": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
          "title": "recall에 graph_nodes/edges 연결 + FTS5(trigram) 검색 추가",
          "description": "recall에 graph_nodes/edges 연결 + FTS5(trigram) 검색 추가",
          "status": "CONFIRMED",
          "expectedScope": [
            "src/core/v2/store.ts",
            "src/core/v2/rebuild.ts",
            "src/core/v2/cache.ts",
            "src/core/v2/recall.ts",
            "src/core/v2/graph.ts",
            "src/core/v2/search.ts",
            "src/types/index.ts",
            "src/ui/v2/render.ts",
            "src/ui/v2/messages.ts",
            "src/cli.ts",
            "tests/unit/v2-recall.test.ts"
          ],
          "avoidScope": [
            "위키 자동 업데이트 GitHub Action cron (별도 decision task로 분리, 이번 스코프 아님)",
            "범용 그래프 쿼리 언어",
            "원격/외부 그래프 서비스",
            "sduck 소유 LLM runtime 또는 daemon"
          ],
          "guided": true,
          "recordDepth": "FULL",
          "createdAt": "2026-08-18T01:24:57.965Z",
          "updatedAt": "2026-08-18T01:28:39.987Z",
          "implementationPlan": [
            "store.ts: decisions_fts/traces_fts/memory_fts FTS5(trigram) 가상 테이블 스키마 추가",
            "rebuild.ts: 기존 bulk insert 단계에서 FTS5 테이블 채우기, GRAPH_PROJECTION_VERSION 상향",
            "search.ts: FTS5 MATCH 쿼리 문자열을 안전하게 구성하는 헬퍼 추가(각 term을 큰따옴표로 감싸고 3자 미만은 제외)",
            "graph.ts: 단일 root 대신 다중 seed 배열과 depth를 받는 순회 헬퍼로 일반화(showGraph와 공유)",
            "recall.ts: 3자 이상은 FTS5+bm25, 3자 미만은 LIKE로 병합, 매칭 id를 시드로 그래프 확장해 related 필드 채움",
            "types/index.ts: RecallResult에 related 필드 추가",
            "cli.ts: recall 커맨드에 --depth <n> 옵션 추가(기본 1, 최대 graph.ts MAX_DEPTH)",
            "render.ts/messages.ts: related 섹션 렌더링과 en/ko 라벨 추가"
          ],
          "verificationPlan": [
            "tests/unit/v2-recall.test.ts 신규: FTS 매칭, 3자 미만 한글 LIKE fallback, depth로 그래프 확장된 related 항목 검증",
            "npm run build && npm test && npm run lint",
            "이 저장소의 실제 .decision 데이터로 sduck recall 수동 실행해 출력 형태 확인"
          ]
        },
        "decisions": {
          "EXPLICIT": [
            {
              "id": "DEC-0072",
              "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
              "title": "recall에 FTS5(trigram)와 graph_edges 다단계 순회를 연결한다",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "recall.ts가 LIKE 부분일치만 쓰던 것을 FTS5(trigram) 랭킹 검색으로 강화하고, 매칭된 결과를 시드로 graph_edges를 순회해 연결된 항목을 추가로 노출한다.",
              "rationale": [
                "사용자가 명시적으로 두 항목을 지시함",
                "DEC-0042: SQLite는 bounded relationship query를 가속하는 재구축 가능한 그래프 프로젝션으로 설계됨"
              ],
              "appliesTo": [
                "src/core/v2/store.ts",
                "src/core/v2/rebuild.ts",
                "src/core/v2/recall.ts",
                "src/core/v2/graph.ts",
                "src/core/v2/search.ts"
              ],
              "avoids": [],
              "sourceRefs": [
                "DEC-0042"
              ],
              "createdAt": "2026-08-18T01:28:29.212Z",
              "updatedAt": "2026-08-18T01:28:39.987Z"
            }
          ],
          "INFERRED": [
            {
              "id": "DEC-0073",
              "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
              "title": "그래프 확장 결과는 RecallResult에 related 필드로 추가하고 기존 필드는 그대로 둔다",
              "kind": "INFERRED",
              "status": "CONFIRMED",
              "confidence": 0.7,
              "summary": "memories/decisions/traces의 기존 형태와 정렬 순서를 바꾸지 않고, 그래프로 찾은 연결 항목만 별도 related 필드로 얹는다.",
              "rationale": [
                "DEC-MEMORY-RECALL-FIRST가 capsule 우선 + decision/trace 하위호환 fallback 유지를 이미 명시함"
              ],
              "appliesTo": [
                "src/types/index.ts",
                "src/core/v2/recall.ts"
              ],
              "avoids": [],
              "sourceRefs": [
                "DEC-MEMORY-RECALL-FIRST"
              ],
              "createdAt": "2026-08-18T01:28:29.212Z",
              "updatedAt": "2026-08-18T01:28:39.987Z"
            },
            {
              "id": "DEC-0074",
              "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
              "title": "그래프 확장 깊이는 --depth 옵션으로 노출하고 graph.ts의 MAX_DEPTH(4) 상한을 공유한다",
              "kind": "INFERRED",
              "status": "CONFIRMED",
              "confidence": 0.7,
              "summary": "1홉 고정 대신 sduck graph show --depth와 동일한 패턴으로 sduck recall --depth <n>을 제공한다. 기본값은 1로 보수적으로 두되 사용자가 최대 4까지 넓힐 수 있다.",
              "rationale": [
                "사용자가 AskUserQuestion에서 hop 수를 고정하지 말고 넓혀두길 원한다고 답함",
                "DEC-0044가 bounded graph visibility만 허용하고 범용 그래프 쿼리 언어는 배제하므로 기존 MAX_DEPTH 상한을 그대로 재사용"
              ],
              "appliesTo": [
                "src/core/v2/graph.ts",
                "src/core/v2/recall.ts",
                "src/cli.ts"
              ],
              "avoids": [],
              "sourceRefs": [
                "DEC-0044"
              ],
              "createdAt": "2026-08-18T01:28:29.212Z",
              "updatedAt": "2026-08-18T01:28:39.987Z"
            },
            {
              "id": "DEC-0075",
              "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
              "title": "3글자 미만 검색어는 기존 LIKE 경로를 유지하는 하이브리드 검색을 쓴다",
              "kind": "INFERRED",
              "status": "CONFIRMED",
              "confidence": 0.7,
              "summary": "FTS5 trigram 토크나이저는 3글자 미만 쿼리를 매칭할 수 없음을 직접 확인했다. 2글자 한글 토큰을 버리지 않기 위해 짧은 검색어는 LIKE로, 3글자 이상은 FTS5 MATCH+bm25()로 처리하고 id 기준으로 병합한다.",
              "rationale": [
                "DEC-MEMORY-PORTABLE-SEARCH-LOCALE이 2글자 한글 토큰 보존을 이미 결정함",
                "node:sqlite(Node 22.22)에서 trigram 토크나이저로 2글자 쿼리가 매칭되지 않음을 직접 테스트로 확인"
              ],
              "appliesTo": [
                "src/core/v2/search.ts",
                "src/core/v2/recall.ts"
              ],
              "avoids": [],
              "sourceRefs": [
                "DEC-MEMORY-PORTABLE-SEARCH-LOCALE"
              ],
              "createdAt": "2026-08-18T01:28:29.212Z",
              "updatedAt": "2026-08-18T01:28:39.987Z"
            },
            {
              "id": "DEC-0076",
              "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
              "title": "FTS5 테이블은 rebuild.ts의 기존 캐시 재구축 경로에서만 채운다",
              "kind": "INFERRED",
              "status": "CONFIRMED",
              "confidence": 0.7,
              "summary": "decisions_fts/traces_fts/memory_fts를 rebuildDecisionCache의 기존 bulk insert 단계에 추가하고, GRAPH_PROJECTION_VERSION을 올려 기존 캐시가 ensureReadableCache를 통해 자동 재생성되게 한다. 새 마이그레이션 커맨드는 만들지 않는다.",
              "rationale": [
                "db.sqlite는 캐노니컬 마크다운에서 재구축 가능한 로컬 캐시이므로 기존 fingerprint/projection-version 메커니즘을 그대로 재사용하는 것이 가장 낮은 리스크"
              ],
              "appliesTo": [
                "src/core/v2/store.ts",
                "src/core/v2/rebuild.ts",
                "src/core/v2/cache.ts"
              ],
              "avoids": [],
              "sourceRefs": [],
              "createdAt": "2026-08-18T01:28:29.212Z",
              "updatedAt": "2026-08-18T01:28:39.987Z"
            }
          ],
          "CARRIED": [],
          "CONFLICT": [],
          "OPEN": []
        },
        "questions": [],
        "evidence": [
          {
            "id": "EVD-0087",
            "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
            "decisionId": null,
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/store.ts:205-216",
            "summary": "graph_nodes/graph_edges 테이블이 이미 존재하고 양방향 인덱스가 걸려있음",
            "confidence": 0.7,
            "createdAt": "2026-08-18T01:28:29.212Z"
          },
          {
            "id": "EVD-0088",
            "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
            "decisionId": null,
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/recall.ts:21-58",
            "summary": "현재 recall은 SQL LIKE 부분일치만 사용하고 graph_nodes/edges를 전혀 사용하지 않음",
            "confidence": 0.7,
            "createdAt": "2026-08-18T01:28:29.212Z"
          },
          {
            "id": "EVD-0089",
            "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
            "decisionId": null,
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/graph.ts:16-86",
            "summary": "showGraph가 단일 root에서 depth 파라미터(최대 4)로 bounded BFS를 이미 구현하고 있어 재사용 가능",
            "confidence": 0.7,
            "createdAt": "2026-08-18T01:28:29.212Z"
          },
          {
            "id": "EVD-0090",
            "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
            "decisionId": null,
            "sourceType": "DISCOVERY",
            "sourceRef": "node:sqlite v22.22.0 FTS5 실측",
            "summary": "CREATE VIRTUAL TABLE ... USING fts5(tokenize='trigram') 및 bm25() 랭킹이 정상 동작. 단 trigram은 3자 미만 쿼리 매칭 불가, 하이픈 포함 토큰은 MATCH 문자열에서 큰따옴표로 감싸야 구문 오류가 나지 않음",
            "confidence": 0.7,
            "createdAt": "2026-08-18T01:28:29.212Z"
          },
          {
            "id": "EVD-0091",
            "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
            "decisionId": null,
            "sourceType": "USER_ANSWER",
            "sourceRef": "AskUserQuestion 2026-08-18",
            "summary": "그래프 확장 깊이를 고정 1홉이 아니라 파라미터화하길 원함. 위키 자동 업데이트 GitHub Action cron은 이번 턴에는 보류/취소, 별도 결정 사항으로 다룸",
            "confidence": 0.7,
            "createdAt": "2026-08-18T01:28:29.212Z"
          },
          {
            "id": "EVD-0092",
            "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
            "decisionId": null,
            "sourceType": "DECISION_DOC",
            "sourceRef": "DEC-0042",
            "summary": "SQLite는 재구축 가능한 그래프 프로젝션이며 bounded relationship query 가속이 목적",
            "confidence": 0.7,
            "createdAt": "2026-08-18T01:28:29.212Z"
          },
          {
            "id": "EVD-0093",
            "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
            "decisionId": null,
            "sourceType": "DECISION_DOC",
            "sourceRef": "DEC-0044",
            "summary": "bounded graph visibility만 노출, 범용 그래프 쿼리 언어와 시각 UI는 배제",
            "confidence": 0.7,
            "createdAt": "2026-08-18T01:28:29.212Z"
          }
        ],
        "expectedScope": [
          "src/core/v2/store.ts",
          "src/core/v2/rebuild.ts",
          "src/core/v2/cache.ts",
          "src/core/v2/recall.ts",
          "src/core/v2/graph.ts",
          "src/core/v2/search.ts",
          "src/types/index.ts",
          "src/ui/v2/render.ts",
          "src/ui/v2/messages.ts",
          "src/cli.ts",
          "tests/unit/v2-recall.test.ts"
        ],
        "avoidScope": [
          "위키 자동 업데이트 GitHub Action cron (별도 decision task로 분리, 이번 스코프 아님)",
          "범용 그래프 쿼리 언어",
          "원격/외부 그래프 서비스",
          "sduck 소유 LLM runtime 또는 daemon"
        ],
        "implementationPlan": [
          "store.ts: decisions_fts/traces_fts/memory_fts FTS5(trigram) 가상 테이블 스키마 추가",
          "rebuild.ts: 기존 bulk insert 단계에서 FTS5 테이블 채우기, GRAPH_PROJECTION_VERSION 상향",
          "search.ts: FTS5 MATCH 쿼리 문자열을 안전하게 구성하는 헬퍼 추가(각 term을 큰따옴표로 감싸고 3자 미만은 제외)",
          "graph.ts: 단일 root 대신 다중 seed 배열과 depth를 받는 순회 헬퍼로 일반화(showGraph와 공유)",
          "recall.ts: 3자 이상은 FTS5+bm25, 3자 미만은 LIKE로 병합, 매칭 id를 시드로 그래프 확장해 related 필드 채움",
          "types/index.ts: RecallResult에 related 필드 추가",
          "cli.ts: recall 커맨드에 --depth <n> 옵션 추가(기본 1, 최대 graph.ts MAX_DEPTH)",
          "render.ts/messages.ts: related 섹션 렌더링과 en/ko 라벨 추가"
        ],
        "verificationPlan": [
          "tests/unit/v2-recall.test.ts 신규: FTS 매칭, 3자 미만 한글 LIKE fallback, depth로 그래프 확장된 related 항목 검증",
          "npm run build && npm test && npm run lint",
          "이 저장소의 실제 .decision 데이터로 sduck recall 수동 실행해 출력 형태 확인"
        ],
        "openQuestionCount": 0
      },
      "renderedMarkdown": "────────────────────────────────────────\nImplementation Brief\n────────────────────────────────────────\nTask: TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가\nrecall에 graph_nodes/edges 연결 + FTS5(trigram) 검색 추가\n\nA. Explicit decisions\n[EXPLICIT] DEC-0072. recall에 FTS5(trigram)와 graph_edges 다단계 순회를 연결한다\nConfidence: 1.00\nSummary: recall.ts가 LIKE 부분일치만 쓰던 것을 FTS5(trigram) 랭킹 검색으로 강화하고, 매칭된 결과를 시드로 graph_edges를 순회해 연결된 항목을 추가로 노출한다.\nSource refs:\n  - DEC-0042\nRationale:\n  - 사용자가 명시적으로 두 항목을 지시함\n  - DEC-0042: SQLite는 bounded relationship query를 가속하는 재구축 가능한 그래프 프로젝션으로 설계됨\nApplies to:\n  - src/core/v2/store.ts\n  - src/core/v2/rebuild.ts\n  - src/core/v2/recall.ts\n  - src/core/v2/graph.ts\n  - src/core/v2/search.ts\n\nB. Inferred decisions\n[INFERRED] DEC-0073. 그래프 확장 결과는 RecallResult에 related 필드로 추가하고 기존 필드는 그대로 둔다\nConfidence: 0.70\nSummary: memories/decisions/traces의 기존 형태와 정렬 순서를 바꾸지 않고, 그래프로 찾은 연결 항목만 별도 related 필드로 얹는다.\nSource refs:\n  - DEC-MEMORY-RECALL-FIRST\nRationale:\n  - DEC-MEMORY-RECALL-FIRST가 capsule 우선 + decision/trace 하위호환 fallback 유지를 이미 명시함\nApplies to:\n  - src/types/index.ts\n  - src/core/v2/recall.ts\n\n[INFERRED] DEC-0074. 그래프 확장 깊이는 --depth 옵션으로 노출하고 graph.ts의 MAX_DEPTH(4) 상한을 공유한다\nConfidence: 0.70\nSummary: 1홉 고정 대신 sduck graph show --depth와 동일한 패턴으로 sduck recall --depth <n>을 제공한다. 기본값은 1로 보수적으로 두되 사용자가 최대 4까지 넓힐 수 있다.\nSource refs:\n  - DEC-0044\nRationale:\n  - 사용자가 AskUserQuestion에서 hop 수를 고정하지 말고 넓혀두길 원한다고 답함\n  - DEC-0044가 bounded graph visibility만 허용하고 범용 그래프 쿼리 언어는 배제하므로 기존 MAX_DEPTH 상한을 그대로 재사용\nApplies to:\n  - src/core/v2/graph.ts\n  - src/core/v2/recall.ts\n  - src/cli.ts\n\n[INFERRED] DEC-0075. 3글자 미만 검색어는 기존 LIKE 경로를 유지하는 하이브리드 검색을 쓴다\nConfidence: 0.70\nSummary: FTS5 trigram 토크나이저는 3글자 미만 쿼리를 매칭할 수 없음을 직접 확인했다. 2글자 한글 토큰을 버리지 않기 위해 짧은 검색어는 LIKE로, 3글자 이상은 FTS5 MATCH+bm25()로 처리하고 id 기준으로 병합한다.\nSource refs:\n  - DEC-MEMORY-PORTABLE-SEARCH-LOCALE\nRationale:\n  - DEC-MEMORY-PORTABLE-SEARCH-LOCALE이 2글자 한글 토큰 보존을 이미 결정함\n  - node:sqlite(Node 22.22)에서 trigram 토크나이저로 2글자 쿼리가 매칭되지 않음을 직접 테스트로 확인\nApplies to:\n  - src/core/v2/search.ts\n  - src/core/v2/recall.ts\n\n[INFERRED] DEC-0076. FTS5 테이블은 rebuild.ts의 기존 캐시 재구축 경로에서만 채운다\nConfidence: 0.70\nSummary: decisions_fts/traces_fts/memory_fts를 rebuildDecisionCache의 기존 bulk insert 단계에 추가하고, GRAPH_PROJECTION_VERSION을 올려 기존 캐시가 ensureReadableCache를 통해 자동 재생성되게 한다. 새 마이그레이션 커맨드는 만들지 않는다.\nRationale:\n  - db.sqlite는 캐노니컬 마크다운에서 재구축 가능한 로컬 캐시이므로 기존 fingerprint/projection-version 메커니즘을 그대로 재사용하는 것이 가장 낮은 리스크\nApplies to:\n  - src/core/v2/store.ts\n  - src/core/v2/rebuild.ts\n  - src/core/v2/cache.ts\n\nC. Carried decisions\n  - none\n\nD. Conflicts\n  - none\n\nE. Open decisions\n  - none\n\nProblem:\n  recall에 graph_nodes/edges 연결 + FTS5(trigram) 검색 추가\nImplementation plan:\n  - store.ts: decisions_fts/traces_fts/memory_fts FTS5(trigram) 가상 테이블 스키마 추가\n  - rebuild.ts: 기존 bulk insert 단계에서 FTS5 테이블 채우기, GRAPH_PROJECTION_VERSION 상향\n  - search.ts: FTS5 MATCH 쿼리 문자열을 안전하게 구성하는 헬퍼 추가(각 term을 큰따옴표로 감싸고 3자 미만은 제외)\n  - graph.ts: 단일 root 대신 다중 seed 배열과 depth를 받는 순회 헬퍼로 일반화(showGraph와 공유)\n  - recall.ts: 3자 이상은 FTS5+bm25, 3자 미만은 LIKE로 병합, 매칭 id를 시드로 그래프 확장해 related 필드 채움\n  - types/index.ts: RecallResult에 related 필드 추가\n  - cli.ts: recall 커맨드에 --depth <n> 옵션 추가(기본 1, 최대 graph.ts MAX_DEPTH)\n  - render.ts/messages.ts: related 섹션 렌더링과 en/ko 라벨 추가\nVerification plan:\n  - tests/unit/v2-recall.test.ts 신규: FTS 매칭, 3자 미만 한글 LIKE fallback, depth로 그래프 확장된 related 항목 검증\n  - npm run build && npm test && npm run lint\n  - 이 저장소의 실제 .decision 데이터로 sduck recall 수동 실행해 출력 형태 확인\nScope expected:\n  - src/core/v2/store.ts\n  - src/core/v2/rebuild.ts\n  - src/core/v2/cache.ts\n  - src/core/v2/recall.ts\n  - src/core/v2/graph.ts\n  - src/core/v2/search.ts\n  - src/types/index.ts\n  - src/ui/v2/render.ts\n  - src/ui/v2/messages.ts\n  - src/cli.ts\n  - tests/unit/v2-recall.test.ts\nScope avoided:\n  - 위키 자동 업데이트 GitHub Action cron (별도 decision task로 분리, 이번 스코프 아님)\n  - 범용 그래프 쿼리 언어\n  - 원격/외부 그래프 서비스\n  - sduck 소유 LLM runtime 또는 daemon\nOpen questions: 0\nEvidence:\n  - [CODE] src/core/v2/store.ts:205-216 (0.7): graph_nodes/graph_edges 테이블이 이미 존재하고 양방향 인덱스가 걸려있음\n  - [CODE] src/core/v2/recall.ts:21-58 (0.7): 현재 recall은 SQL LIKE 부분일치만 사용하고 graph_nodes/edges를 전혀 사용하지 않음\n  - [CODE] src/core/v2/graph.ts:16-86 (0.7): showGraph가 단일 root에서 depth 파라미터(최대 4)로 bounded BFS를 이미 구현하고 있어 재사용 가능\n  - [DISCOVERY] node:sqlite v22.22.0 FTS5 실측 (0.7): CREATE VIRTUAL TABLE ... USING fts5(tokenize='trigram') 및 bm25() 랭킹이 정상 동작. 단 trigram은 3자 미만 쿼리 매칭 불가, 하이픈 포함 토큰은 MATCH 문자열에서 큰따옴표로 감싸야 구문 오류가 나지 않음\n  - [USER_ANSWER] AskUserQuestion 2026-08-18 (0.7): 그래프 확장 깊이를 고정 1홉이 아니라 파라미터화하길 원함. 위키 자동 업데이트 GitHub Action cron은 이번 턴에는 보류/취소, 별도 결정 사항으로 다룸\n  - [DECISION_DOC] DEC-0042 (0.7): SQLite는 재구축 가능한 그래프 프로젝션이며 bounded relationship query 가속이 목적\n  - [DECISION_DOC] DEC-0044 (0.7): bounded graph visibility만 노출, 범용 그래프 쿼리 언어와 시각 UI는 배제\n────────────────────────────────────────",
      "gitBaseline": {
        "head": "9c709d5438e1108bdfa169a37efa63854323e9cc",
        "dirtyFileHashes": {
          "\".decision/exports/markdown/tasks/TASK-20260818-recall/354/227/220-graph-nodes-edges-/354/227/260/352/262/260-fts5-trigram-/352/262/200/354/203/211-/354/266/224/352/260/200.md\"": null,
          ".omc/project-memory.json": "c031f90e3cd868579d55ce3153c1c6507d5e0364747b5d76a91a99b2b035ecce",
          ".omc/sessions/0df5d112-2f48-4749-97e4-333c1bc3c4a0.json": "88d5203da7bc1b4ed360966921a0383698c96ca3a882213c404911a9be5503b3",
          ".omc/sessions/21700872-d3ec-4974-b033-67d97c77ad59.json": "01d4e0d40dc663d4b07fff5d5a79b929d1eb02ba9e1bf91a55191ba0686f4250",
          ".omc/state/hud-stdin-cache.json": "14fcb5958ec9a483d483de7a28572a14e4c7728c580818c1ceb64a4307022bda",
          ".omc/state/idle-notif-cooldown.json": "84cb134c15834d213fb56150474175e6336e60b99a7906a0b5741145ffbd94b3",
          ".omc/state/session-end-jobs/0df5d112-2f48-4749-97e4-333c1bc3c4a0.json": "23473ac7bd47049be42d9c5fcd8f3adf5b446a5f2288f3a67511966852517ae0",
          ".omc/state/session-end-jobs/21700872-d3ec-4974-b033-67d97c77ad59.json": "9b801558c6e700078e9c4c39d77eb25a18d16a6dddb622d6d76dc2ca7cb219c1",
          ".omc/state/session-end-jobs/discovery.json": "d6dade806bf8faeba158cfec3a256f5319bd1883f3958ad5618ca9c51be89965",
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
          ".omc/state/sessions/e9bc2156-bb4a-4af4-911d-ddcfa7c8660b/hud-state.json": "5a7ebb7efc648a3c2c1f6b287d7dbfff7909920f041b5baca52e600ee8cf6c40",
          ".omc/state/sessions/e9bc2156-bb4a-4af4-911d-ddcfa7c8660b/pre-tool-advisory-throttle.json": "425706a098345b28257597456a08572e562214b02a7b6c4942209ebfa837c8b6",
          ".omc/state/sessions/e9bc2156-bb4a-4af4-911d-ddcfa7c8660b/session-started.json": "3c4aee0148199b25236a57fd0d35895b21c1bc080b6bd1b549f8a58986c37bca"
        }
      },
      "createdAt": "2026-08-18T01:28:40.055Z"
    }
  ],
  "evaluations": [
    {
      "id": "EVAL-0012",
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "traceId": "IMPL-0029",
      "checks": [
        {
          "name": "typecheck",
          "outcome": "passed"
        },
        {
          "name": "build",
          "outcome": "passed"
        },
        {
          "name": "unit_tests",
          "outcome": "passed (161/161)"
        },
        {
          "name": "e2e_tests",
          "outcome": "passed (33/33)"
        },
        {
          "name": "lint",
          "outcome": "passed"
        },
        {
          "name": "manual_recall_smoke",
          "outcome": "passed"
        }
      ],
      "createdAt": "2026-08-18T01:38:56.655Z"
    }
  ],
  "events": [
    {
      "id": "EVT-0419",
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "type": "TASK_CREATED",
      "payload": {
        "description": "recall에 graph_nodes/edges 연결 + FTS5(trigram) 검색 추가",
        "policy": {
          "grillMeRequired": false
        }
      },
      "createdAt": "2026-08-18T01:24:57.965Z"
    },
    {
      "id": "EVT-0420",
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "type": "GRILL_STARTED",
      "payload": {
        "automatic": true
      },
      "createdAt": "2026-08-18T01:24:57.965Z"
    },
    {
      "id": "EVT-0421",
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "type": "CONTEXT_INDEXED",
      "payload": {
        "itemCount": 40
      },
      "createdAt": "2026-08-18T01:24:58.411Z"
    },
    {
      "id": "EVT-0422",
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "type": "GRILL_COMPLETED",
      "payload": {
        "reason": "그래프 hop 깊이 노출 여부와 위키 cron 처리 방식을 AskUserQuestion으로 확인; 나머지는 기존 결정 기록(DEC-0042/0044/MEMORY-RECALL-FIRST/PORTABLE-SEARCH-LOCALE)에서 이미 답이 나와 있어 재질문 생략",
        "carried": []
      },
      "createdAt": "2026-08-18T01:27:09.901Z"
    },
    {
      "id": "EVT-0423",
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0072"
      },
      "createdAt": "2026-08-18T01:28:29.213Z"
    },
    {
      "id": "EVT-0424",
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0073"
      },
      "createdAt": "2026-08-18T01:28:29.213Z"
    },
    {
      "id": "EVT-0425",
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0074"
      },
      "createdAt": "2026-08-18T01:28:29.213Z"
    },
    {
      "id": "EVT-0426",
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0075"
      },
      "createdAt": "2026-08-18T01:28:29.213Z"
    },
    {
      "id": "EVT-0427",
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0076"
      },
      "createdAt": "2026-08-18T01:28:29.213Z"
    },
    {
      "id": "EVT-0428",
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 5,
        "questions": 0,
        "evidence": 7,
        "expectedScope": [
          "src/core/v2/store.ts",
          "src/core/v2/rebuild.ts",
          "src/core/v2/cache.ts",
          "src/core/v2/recall.ts",
          "src/core/v2/graph.ts",
          "src/core/v2/search.ts",
          "src/types/index.ts",
          "src/ui/v2/render.ts",
          "src/ui/v2/messages.ts",
          "src/cli.ts",
          "tests/unit/v2-recall.test.ts"
        ],
        "avoidScope": [
          "위키 자동 업데이트 GitHub Action cron (별도 decision task로 분리, 이번 스코프 아님)",
          "범용 그래프 쿼리 언어",
          "원격/외부 그래프 서비스",
          "sduck 소유 LLM runtime 또는 daemon"
        ],
        "implementationPlan": [
          "store.ts: decisions_fts/traces_fts/memory_fts FTS5(trigram) 가상 테이블 스키마 추가",
          "rebuild.ts: 기존 bulk insert 단계에서 FTS5 테이블 채우기, GRAPH_PROJECTION_VERSION 상향",
          "search.ts: FTS5 MATCH 쿼리 문자열을 안전하게 구성하는 헬퍼 추가(각 term을 큰따옴표로 감싸고 3자 미만은 제외)",
          "graph.ts: 단일 root 대신 다중 seed 배열과 depth를 받는 순회 헬퍼로 일반화(showGraph와 공유)",
          "recall.ts: 3자 이상은 FTS5+bm25, 3자 미만은 LIKE로 병합, 매칭 id를 시드로 그래프 확장해 related 필드 채움",
          "types/index.ts: RecallResult에 related 필드 추가",
          "cli.ts: recall 커맨드에 --depth <n> 옵션 추가(기본 1, 최대 graph.ts MAX_DEPTH)",
          "render.ts/messages.ts: related 섹션 렌더링과 en/ko 라벨 추가"
        ],
        "verificationPlan": [
          "tests/unit/v2-recall.test.ts 신규: FTS 매칭, 3자 미만 한글 LIKE fallback, depth로 그래프 확장된 related 항목 검증",
          "npm run build && npm test && npm run lint",
          "이 저장소의 실제 .decision 데이터로 sduck recall 수동 실행해 출력 형태 확인"
        ]
      },
      "createdAt": "2026-08-18T01:28:29.213Z"
    },
    {
      "id": "EVT-0429",
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "type": "BRIEF_CONFIRMED",
      "payload": {
        "snapshotId": "BRF-0026"
      },
      "createdAt": "2026-08-18T01:28:40.056Z"
    },
    {
      "id": "EVT-0430",
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "type": "TRACE_CREATED",
      "payload": {
        "traceId": "IMPL-0029",
        "filesChanged": [
          ".omc/project-memory.json",
          ".omc/state/hud-stdin-cache.json",
          ".omc/state/sessions/e9bc2156-bb4a-4af4-911d-ddcfa7c8660b/last-tool-error-state.json",
          ".omc/state/sessions/e9bc2156-bb4a-4af4-911d-ddcfa7c8660b/pre-tool-advisory-throttle.json",
          "src/cli.ts",
          "src/commands/v2/index.ts",
          "src/core/v2/graph.ts",
          "src/core/v2/memory.ts",
          "src/core/v2/rebuild.ts",
          "src/core/v2/recall.ts",
          "src/core/v2/search.ts",
          "src/core/v2/store.ts",
          "src/types/index.ts",
          "src/ui/v2/messages.ts",
          "src/ui/v2/render.ts",
          "tests/unit/v2-memory.test.ts",
          "tests/unit/v2-recall.test.ts"
        ]
      },
      "createdAt": "2026-08-18T01:38:46.536Z"
    },
    {
      "id": "EVT-0431",
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "type": "EVALUATION_RECORDED",
      "payload": {
        "evaluationId": "EVAL-0012",
        "traceId": "IMPL-0029"
      },
      "createdAt": "2026-08-18T01:38:56.656Z"
    },
    {
      "id": "EVT-0432",
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "type": "EXPORT_WRITTEN",
      "payload": {
        "created": [
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260714-organize-the-complete-workflow-and-update-the-re.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260714-require-a-grill-me-gate-before-new-work-for-all-.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-bump-the-release-version-and-restore-ci-coverage.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-correct-phase-0-contract-fixtures-and-trace.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-design-a-repository-scoped-coding-agent-runtime.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-harden-doctor-state-recovery-diagnostics.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-implement-phase-1-canonical-foundation.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-implement-the-0-6-mcp-control-plane.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-isolate-nested-git-fixture-tests-from-pre-commit.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260716-implement-cli-first-guided-decision-workflow.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260718-document-guided-cli-workflow-0-5-0.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260720-add-automatic-retrospective-capture-for-disabled.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260720-add-retrospective-decision-capture-skill.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260720-add-workspace-workflow-toggle.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260720-correct-retrospective-skill-guidance.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260720-document-automatic-retrospective-capture.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260721-prepare-the-verified-sduck-0-5-0-release-commit-.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260722-configure-risk-based-sduck-workflow-activation.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260722-migrate-repository-workflow-to-sduck-cli-0-6-1.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260722-push-v0-6-2-release-tag-to-origin.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260722-release-stage-1-as-0-6-2.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260722-validate-stage-1-release-readiness.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260811-add-source-backed-memory-capsules-and-persistent.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260811-evaluate-which-tencentdb-agent-memory-ideas-fit-.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260814-migrate-this-repository-to-the-globally-installe.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260814-release-push-and-publish-the-latest-sduck-cli-ve.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0-6-cli-foundation.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0-6-release-evidence.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0-6-release-safety.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0-6-safe-retrospective-hook.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0001.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0002.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0003.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0004.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0005.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0006.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0007.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0008.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0009.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0010.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0011.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0012.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0013.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0014.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0015.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0016.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0017.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0018.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0019.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0020.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0021.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0022.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0023.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0024.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0025.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0026.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0027.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0028.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0029.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0030.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0031.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0032.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0033.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0034.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0035.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0036.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0037.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0038.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0039.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0040.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0041.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0042.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0043.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0044.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0045.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0046.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0047.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0048.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0049.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0050.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0051.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0052.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0053.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0054.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0055.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0056.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0057.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0058.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0059.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0060.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0061.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0062.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0063.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0064.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0065.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0066.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0067.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0068.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0069.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0070.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0071.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0072.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0073.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0074.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0075.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0076.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-CONTEXT-CURRENT-CANDIDATE-SNAPSHOT.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-CONTEXT-PERSISTENT-UPSERT.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-MEMORY-AGENT-DISTILLATION.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-MEMORY-CAPSULE-BOUNDARY.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-MEMORY-CITED-SOURCE-SUPPRESSION.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-MEMORY-DEFER-COLD-ARCHIVE.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-MEMORY-DEGRADED-READ-RECOVERY.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-MEMORY-EXPLICIT-BACKFILL.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-MEMORY-PORTABLE-SEARCH-LOCALE.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-MEMORY-RECALL-FIRST.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-MIGRATE-061.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-MIGRATE-070-CLI-POLICY.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-RELEASE-0-6-2.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-RELEASE-0-7-0-AUTHORIZATION.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-RELEASE-0-7-0-CHANNELS.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-RELEASE-0-7-0-CONTENTS.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-RELEASE-0-7-0-SAFETY.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-RELEASE-READINESS-IS-ARTIFACT-BASED.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-SOURCE-CANONICAL-LAST-BLOCK.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-STAGE-ONE-DURABLE-RECORD-DEPTH.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-SUPERSEDE-INSTRUCTION-ONLY-TRIAGE.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-TASK-SCOPED-RECORD-DEPTH.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-WIKI-AGENT-WORKFLOW.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-WIKI-DIRTY-STATUS.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-WIKI-EVIDENCE-LANGUAGE.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-WIKI-MATERIALIZED-VIEW.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-WIKI-POLICY-MIGRATION.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-WIKI-RELEASE-070.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-WIKI-SECTION-OWNERSHIP.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-WORKSPACE-MODE-NOT-TASK-ROUTER.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/english-default-korean-v2-locale.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/global-locale-config-shape.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/preserve-existing-workspaces.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/require-grill-before-brief.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/v2-workflow-is-primary.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0001.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0002.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0003.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0004.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0005.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0006.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0007.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0008.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0009.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0010.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0011.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0012.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0013.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0014.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0015.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0016.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0017.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0018.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0019.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0020.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0021.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0022.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0023.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0024.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0025.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0026.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0027.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0028.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0029.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/memories/MEM-0001.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/memories/MEM-0002.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/memories/MEM-0003.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/memories/MEM-0004.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/DECISION_REPORT.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/decision-graph.json"
        ]
      },
      "createdAt": "2026-08-18T01:39:31.383Z"
    },
    {
      "id": "EVT-0433",
      "taskId": "TASK-20260818-recall에-graph-nodes-edges-연결-fts5-trigram-검색-추가",
      "type": "TASK_CLOSED",
      "payload": {},
      "createdAt": "2026-08-18T01:39:37.818Z"
    }
  ]
}
```
