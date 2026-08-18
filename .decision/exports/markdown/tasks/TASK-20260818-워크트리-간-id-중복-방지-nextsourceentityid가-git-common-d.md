---
id: TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d
type: task
status: CLOSED
title: 워크트리 간 ID 중복 방지 -- nextSourceEntityId가 git common-dir에 공유 카운터를 둬서 여러 worktree가 같은 DEC-/IMPL-/EVAL- 번호를 동시에 발급하지 못하게 한다
record_depth: FULL
created_at: '2026-08-18T07:57:14.180Z'
updated_at: '2026-08-18T08:19:23.993Z'
---
# TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d: 워크트리 간 ID 중복 방지 -- nextSourceEntityId가 git common-dir에 공유 카운터를 둬서 여러 worktree가 같은 DEC-/IMPL-/EVAL- 번호를 동시에 발급하지 못하게 한다

워크트리 간 ID 중복 방지 -- nextSourceEntityId가 git common-dir에 공유 카운터를 둬서 여러 worktree가 같은 DEC-/IMPL-/EVAL- 번호를 동시에 발급하지 못하게 한다

## Sduck source

```json sduck-source
{
  "task": {
    "id": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
    "title": "워크트리 간 ID 중복 방지 -- nextSourceEntityId가 git common-dir에 공유 카운터를 둬서 여러 worktree가 같은 DEC-/IMPL-/EVAL- 번호를 동시에 발급하지 못하게 한다",
    "description": "워크트리 간 ID 중복 방지 -- nextSourceEntityId가 git common-dir에 공유 카운터를 둬서 여러 worktree가 같은 DEC-/IMPL-/EVAL- 번호를 동시에 발급하지 못하게 한다",
    "status": "CLOSED",
    "expectedScope": [
      "src/core/v2/ids.ts",
      "src/core/v2/workspace-lock.ts",
      "src/core/v2/shared-ids.ts",
      "src/core/v2/draft.ts",
      "src/core/v2/retrospective.ts",
      "src/core/v2/brief.ts",
      "src/core/v2/evaluate.ts",
      "src/core/v2/memory.ts",
      "src/core/v2/question.ts",
      "src/core/v2/trace.ts",
      "src/core/v2/context.ts",
      "src/core/v2/source-store.ts",
      "tests/unit/v2-worktree-ids.test.ts"
    ],
    "avoidScope": [
      "nextEntityId(죽은 코드)",
      "TASK id 생성 방식 변경",
      "멀티머신 협업(원격) 시나리오"
    ],
    "guided": true,
    "recordDepth": "FULL",
    "createdAt": "2026-08-18T07:57:14.180Z",
    "updatedAt": "2026-08-18T08:19:23.993Z",
    "implementationPlan": [
      "workspace-lock.ts: withPathLock(lockPath, operation)을 추출하고 withDecisionWorkspaceLock을 그 위에 재구현",
      "shared-ids.ts 신규: gitCommonDir(projectRoot), reserveSharedId(projectRoot, prefix, localMax) -- git 실패 시 localMax+1로 폴백",
      "ids.ts: nextSourceEntityId(ids, prefix, projectRoot)로 시그니처 변경, reserveSharedId 사용",
      "실사용 호출부 13곳에 projectRoot 인자 추가",
      "tests/unit/v2-worktree-ids.test.ts 신규: 실제 git repo + git worktree add로 두 워크트리를 만들고 각각 sduck submit으로 결정을 만들어 ID가 절대 겹치지 않음을 검증. git 저장소가 아닌 기존 임시 워크스페이스에서는 동작이 안 바뀜도 확인"
    ],
    "verificationPlan": [
      "npm run typecheck",
      "npm run build",
      "npm test",
      "npm run lint",
      "npm run format:check"
    ]
  },
  "questions": [],
  "evidence": [],
  "contextItems": [
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "MEM-0012",
      "summary": "Memory capsule: 모든 결정의 sourceRefs를 그래프 엣지로 -- CARRIED_FROM/CITES 구분 — rebuild.ts의 insertGraph가 지금까지 kind==='CARRIED'인 결정에서만 그래프 엣지를 만들어, 실제 인용의 대부분(sdcuk-cli 28/30쌍, adieum-api 7/7쌍)이 그래프에 전혀 반영되지 않고 있었다. 이제 모든 결정의 sourceRefs(DEC- 접두만)를 엣지로 만들되 CARRIED는 CARRIED_FROM(강한 승계), 그 외는 새 CITES(일반 참조)로 구분한다. recall()의 그래프 hop-거리 신호가 처음으로 대부분의 실제 인용에 작동하게 됐다.",
      "metadata": {
        "type": "memory_capsule",
        "sourceTaskId": "TASK-20260818-모든-결정의-sourcerefs를-그래프-엣지로-만든다-carried는-carried-",
        "topics": [
          "graph",
          "recall",
          "cites"
        ],
        "reason": "matched by recall result",
        "score": 1
      },
      "id": "CTX-1696",
      "createdAt": "2026-08-18T07:57:14.446Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "MEM-0011",
      "summary": "Memory capsule: sdcuk-cli 실제 카테고리 체계 확정 + 133개 결정 소급 분류 — sdcuk-cli의 133개 결정 제목을 전부 훑어 9개 대분류(검색/리콜, 워크플로우 라이프사이클, MCP 계약 설계, 릴리스/배포, 메모리 캡슐, Wiki, 컨텍스트 인덱싱, 로케일/국제화, 테스트/CI/품질)를 확정하고, sduck categories tag --stdin 일괄 태깅으로 133개 전부를 한 번에 분류했다. categories 기능 전체(suggest/set/list/browse/tag)가 실제 프로젝트 규모에서 정상 동작함을 확인했다.",
      "metadata": {
        "type": "memory_capsule",
        "sourceTaskId": "TASK-20260818-sdcuk-cli-저장소에-실제-카테고리-체계를-정하고-기존-133개-결정을-전부-소급",
        "topics": [
          "categories",
          "backfill",
          "taxonomy"
        ],
        "reason": "matched by recall result",
        "score": 1
      },
      "id": "CTX-1697",
      "createdAt": "2026-08-18T07:57:14.446Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0089",
      "summary": "Decision applies to relevant file src/commands/v2/index.ts: sduck categories suggest/set/list 명령을 추가한다",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/commands/v2/index.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1709",
      "createdAt": "2026-08-18T07:57:14.449Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0091",
      "summary": "Decision applies to relevant file src/commands/v2/index.ts: sduck categories browse <category> [--uncategorized] 명령을 추가한다",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/commands/v2/index.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1711",
      "createdAt": "2026-08-18T07:57:14.449Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0094",
      "summary": "Decision applies to relevant file src/commands/v2/index.ts: sduck categories tag <id> <category> 및 --stdin 일괄 태깅 명령을 추가한다",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/commands/v2/index.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1716",
      "createdAt": "2026-08-18T07:57:14.451Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0092",
      "summary": "Decision applies to relevant file src/commands/v2/index.ts: browseCategory에 limit 매개변수를 추가하고(기본값 500) sduck categories browse에 --limit 플래그를 노출한다",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/commands/v2/index.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1717",
      "createdAt": "2026-08-18T07:57:14.451Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0079",
      "summary": "Decision applies to relevant file src/commands/v2/index.ts: IMPL-0031의 누락된 파일 목록을 별도 trace로 정정 기록한다",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/commands/v2/index.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1718",
      "createdAt": "2026-08-18T07:57:14.451Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0078",
      "summary": "Decision applies to relevant file src/commands/v2/index.ts: sduck graph show에 --mermaid 출력 옵션을 추가한다",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/commands/v2/index.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1719",
      "createdAt": "2026-08-18T07:57:14.452Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0077",
      "summary": "Decision applies to relevant file src/commands/v2/index.ts: sduck recall에 --json 옵션을 graph show/status와 동일한 패턴으로 추가한다",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/commands/v2/index.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1720",
      "createdAt": "2026-08-18T07:57:14.452Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
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
      "id": "CTX-1721",
      "createdAt": "2026-08-18T07:57:14.452Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-MEMORY-EXPLICIT-BACKFILL",
      "summary": "Decision applies to relevant file src/commands/v2/index.ts: Target the current task by default and make backfill explicit",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/commands/v2/index.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1722",
      "createdAt": "2026-08-18T07:57:14.452Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-MEMORY-PORTABLE-SEARCH-LOCALE",
      "summary": "Decision applies to relevant file src/ui/v2/messages.ts: Make memory digests, search patterns, and localized reasons portable",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "src/ui/v2/messages.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1723",
      "createdAt": "2026-08-18T07:57:14.453Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-MEMORY-AGENT-DISTILLATION",
      "summary": "Decision applies to relevant file src/commands/v2/index.ts: Keep semantic distillation agent-authored and CLI-verified",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "src/commands/v2/index.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1724",
      "createdAt": "2026-08-18T07:57:14.453Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-MEMORY-RECALL-FIRST",
      "summary": "Decision applies to relevant file src/commands/v2/index.ts: Search distilled memory before raw history",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "src/commands/v2/index.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1725",
      "createdAt": "2026-08-18T07:57:14.453Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-WIKI-AGENT-WORKFLOW",
      "summary": "Decision applies to relevant file src/commands/v2/index.ts: Keep Wiki generation agent-driven and task close non-gating",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/commands/v2/index.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1726",
      "createdAt": "2026-08-18T07:57:14.453Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-WIKI-DIRTY-STATUS",
      "summary": "Decision applies to relevant file src/core/v2/git-diff.ts: Compute Wiki dirtiness only from deterministic evidence",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/core/v2/git-diff.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1727",
      "createdAt": "2026-08-18T07:57:14.454Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
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
      "id": "CTX-1729",
      "createdAt": "2026-08-18T07:57:14.454Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
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
      "id": "CTX-1728",
      "createdAt": "2026-08-18T07:57:14.454Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-RELEASE-0-6-2",
      "summary": "Decision applies to relevant file tests/unit/decision-workspace.test.ts: Release Stage 1 as a new 0.6.2 package",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "tests/unit/decision-workspace.test.ts"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-1730",
      "createdAt": "2026-08-18T07:57:14.454Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0-6-release-evidence",
      "summary": "Prior decision: Prove the CLI release from a packed artifact — Release confidence requires source checks plus an installed tarball smoke that observes exact version, bundled assets, supported CLI routes, deferred routes, and Git-hook safety.",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1698",
      "createdAt": "2026-08-18T07:57:14.446Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0003",
      "summary": "Prior decision: Clear commit-hook Git variables before validation commands — Keep lint-staged on the commit index, then clear Git local environment variables before typecheck and test commands so nested fixture repositories use their own Git metadata.",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1699",
      "createdAt": "2026-08-18T07:57:14.446Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0019",
      "summary": "Prior decision: What trace data and CI semantics should sduck verify require? — Bind trace to Git and brief digest",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1700",
      "createdAt": "2026-08-18T07:57:14.447Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0023",
      "summary": "Prior decision: What exact Git-bound trace and sduck verify algorithm should 0.6 use? — Merge-base CI verifier (recommended)",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1701",
      "createdAt": "2026-08-18T07:57:14.447Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0042",
      "summary": "Prior decision: Keep Markdown canonical and project history into rebuildable SQLite graph data — Git-mergeable Markdown remains canonical. SQLite remains a worktree-local rebuildable cache and graph projection that accelerates context and bounded relationship queries but is not required for agent judgment.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1702",
      "createdAt": "2026-08-18T07:57:14.447Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
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
      "id": "CTX-1703",
      "createdAt": "2026-08-18T07:57:14.447Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "IMPL-0018",
      "summary": "Prior implementation trace: Detected 21 changed file(s).",
      "metadata": {
        "type": "implementation_trace",
        "filesChanged": [
          ".gitignore",
          "AGENTS.md",
          "CLAUDE.md",
          "README.ko.md",
          "README.md",
          "docs/design/conversational-workflow.md",
          "docs/design/mcp-control-plane-0.6-contract.md",
          "docs/migration.md",
          "package-lock.json",
          "package.json",
          "src/commands/v2/index.ts",
          "src/core/init.ts",
          "src/core/update.ts",
          "src/core/v2/retrospective.ts",
          "tests/e2e/sdd-cli-reachability.test.ts",
          "tests/e2e/v2-cli.test.ts",
          "tests/e2e/v2-locale-cli.test.ts",
          "tests/e2e/v2-phase2c-matrix.test.ts",
          "tests/unit/sdd-core-regression.test.ts",
          "tests/unit/v2-contract-fixtures.test.ts",
          "tests/unit/v2-lifecycle.test.ts"
        ],
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1704",
      "createdAt": "2026-08-18T07:57:14.448Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0074",
      "summary": "Prior decision: 그래프 확장 깊이는 --depth 옵션으로 노출하고 graph.ts의 MAX_DEPTH(4) 상한을 공유한다 — 1홉 고정 대신 sduck graph show --depth와 동일한 패턴으로 sduck recall --depth <n>을 제공한다. 기본값은 1로 보수적으로 두되 사용자가 최대 4까지 넓힐 수 있다.",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1705",
      "createdAt": "2026-08-18T07:57:14.448Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0082",
      "summary": "Prior decision: search.ts에 순수 함수 reciprocalRankFusion/rankByRrf(k=60)를 추가한다 — Cormack et al. 2009 RRF 공식(score = sum 1/(k+rank))을 그대로 구현한 순수 함수를 추가해 여러 순위 리스트를 스케일 걱정 없이 융합할 수 있게 한다. k=60은 원논문 및 TencentDB-Agent-Memory 구현의 표준값을 그대로 채택한다.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1706",
      "createdAt": "2026-08-18T07:57:14.448Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0080",
      "summary": "Prior decision: searchTerms에 영어 불용어 필터를 추가한다 — 3글자 이상이면 무조건 검색어로 취급하던 필터에, and/the/for/with 같은 흔한 영어 함수어 목록(ENGLISH_STOPWORDS)을 추가로 제외한다. 이 단어들은 FTS5 OR 매칭에서 거의 모든 영어 문서와 매칭돼 무관한 결과를 대거 끌어들인다.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1707",
      "createdAt": "2026-08-18T07:57:14.448Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0087",
      "summary": "Prior decision: policy.json에 프로젝트별 고정 대분류 목록(categories)을 저장하고, 목록에 없는 값은 거부한다 — DecisionWorkspacePolicy에 categories?: string[] 필드를 추가한다(기존 wiki 필드와 같은 패턴: 선택적, strict validation, atomic durable write, 동시성 락). 카파시의 LLM Wiki 패턴(목차를 통째로 컨텍스트에 넣고 에이전트가 직접 고름)을 적용하려면 결정들이 소수의 고정된 대분류로 미리 묶여 있어야 한다. 분류 체계 자체를 즉흥적으로 만들면 '인증'/'로그인'/'보안'처럼 흩어져 오히려 못 찾게 되므로, 목록은 프로젝트마다 한 번 정해두고(sduck categories set) 개별 결정은 그 목록 중에서만 고르게 강제한다.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1708",
      "createdAt": "2026-08-18T07:57:14.449Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0090",
      "summary": "Prior decision: categories.ts에 browseCategory()를 추가해 카테고리 안의 결정을 순위 없이 전부(id+title만) 반환한다 — listCategoryCounts와 같은 가시성 규칙(status IN CONFIRMED/DRAFT, task not ABANDONED)으로 지정한 카테고리(또는 미분류)에 속한 결정을 전부 조회한다. FTS/bm25/RRF 등 어떤 랭킹도 적용하지 않는다 -- 카파시의 LLM Wiki 패턴대로 '목차를 통째로 보여주고 에이전트가 직접 읽고 고르는' 것이 이 기능의 존재 이유이므로, 알고리즘이 먼저 걸러내면 목적이 무너진다. 한 줄당 id+title만 반환해 항목 수가 많아도 비용이 작게 유지되게 한다(summary/rationale 등은 안 보여줌). 카테고리 이름이 없으면 CATEGORY_NOT_FOUND로 거부하고, --uncategorized 플래그로 미분류 버킷도 조회 가능하게 한다. 안전판으로 500개 상한을 두되 초과 시 truncated: true를 정직하게 표시한다(조용히 자르지 않음).",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1710",
      "createdAt": "2026-08-18T07:57:14.449Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0039",
      "summary": "Prior decision: Unify specification and plan in one confirmed Brief — One Brief contains problem, decisions, scope, implementation plan, and verification plan; a single confirm gate authorizes implementation.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1712",
      "createdAt": "2026-08-18T07:57:14.450Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0041",
      "summary": "Prior decision: Reduce grilling through evidence-backed carried decisions — The agent reuses prior decisions only by recording carried decision IDs and rationale. New questions are limited to conflicts, unknowns, or scope and verification changes; no fixed question quota applies.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1713",
      "createdAt": "2026-08-18T07:57:14.450Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0043",
      "summary": "Prior decision: Record evaluation separately from implementation trace and gate close — trace records changed files and decision mapping. evaluate records validation checks, outcomes, and limitations; close requires both an evaluation record and the existing confirmed workflow. The CLI records evidence and does not execute arbitrary checks.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1714",
      "createdAt": "2026-08-18T07:57:14.450Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0044",
      "summary": "Prior decision: Expose bounded graph visibility in the CLI — context automatically summarizes relevant history, and graph show renders a task or decision neighborhood as text or JSON. A general graph query language and visual UI are excluded.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1715",
      "createdAt": "2026-08-18T07:57:14.450Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "DISCOVERY",
      "sourceRef": ".claude/skills/sduck-codebase-decisions.md",
      "summary": "File evidence: name: sduck-codebase-decisions",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "name: sduck-codebase-decisions",
        "line": 2
      },
      "id": "CTX-1731",
      "createdAt": "2026-08-18T07:57:14.455Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/pilot-evaluation.md",
      "summary": "File evidence: # sduck team pilot evaluation",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "# sduck team pilot evaluation",
        "line": 1
      },
      "id": "CTX-1732",
      "createdAt": "2026-08-18T07:57:14.455Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/use-cases.md",
      "summary": "File evidence: sduck는 코딩 에이전트와 함께 일하는 팀을 위한 Git-native decision harness다. 이 문서는 팀이 실사용에서 마주치는 대표 시나리오를 유즈케이스로 정리한다. 각 유즈케이스는 실제 CLI 명령 시퀀스와 시스템이 보장하는 결과를 기준으로 작성했으며, 모두 현재 테스트 스위트가 커버하는 동작이다.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "sduck는 코딩 에이전트와 함께 일하는 팀을 위한 Git-native decision harness다. 이 문서는 팀이 실사용에서 마주치는 대표 시나리오를 유즈케이스로 정리한다. 각 유즈케이스는 실제 CLI 명령 시퀀스와 시스템이 보장하는 결과를 기준으로 작성했으며, 모두 현재 테스트 스위트가 커버하는 동작이다.",
        "line": 3
      },
      "id": "CTX-1733",
      "createdAt": "2026-08-18T07:57:14.455Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/commands/v2/index.ts",
      "summary": "File evidence: tagDecisionCategories,",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "tagDecisionCategories,",
        "line": 15
      },
      "id": "CTX-1734",
      "createdAt": "2026-08-18T07:57:14.455Z"
    },
    {
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/v2/evaluate.ts",
      "summary": "File evidence: import { DecisionWorkspace } from './decision-workspace.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { DecisionWorkspace } from './decision-workspace.js';",
        "line": 1
      },
      "id": "CTX-1735",
      "createdAt": "2026-08-18T07:57:14.456Z"
    }
  ],
  "briefSnapshots": [
    {
      "id": "BRF-0040",
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "snapshot": {
        "task": {
          "id": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
          "title": "워크트리 간 ID 중복 방지 -- nextSourceEntityId가 git common-dir에 공유 카운터를 둬서 여러 worktree가 같은 DEC-/IMPL-/EVAL- 번호를 동시에 발급하지 못하게 한다",
          "description": "워크트리 간 ID 중복 방지 -- nextSourceEntityId가 git common-dir에 공유 카운터를 둬서 여러 worktree가 같은 DEC-/IMPL-/EVAL- 번호를 동시에 발급하지 못하게 한다",
          "status": "CONFIRMED",
          "expectedScope": [
            "src/core/v2/ids.ts",
            "src/core/v2/workspace-lock.ts",
            "src/core/v2/shared-ids.ts",
            "src/core/v2/draft.ts",
            "src/core/v2/retrospective.ts",
            "src/core/v2/brief.ts",
            "src/core/v2/evaluate.ts",
            "src/core/v2/memory.ts",
            "src/core/v2/question.ts",
            "src/core/v2/trace.ts",
            "src/core/v2/context.ts",
            "src/core/v2/source-store.ts",
            "tests/unit/v2-worktree-ids.test.ts"
          ],
          "avoidScope": [
            "nextEntityId(죽은 코드)",
            "TASK id 생성 방식 변경",
            "멀티머신 협업(원격) 시나리오"
          ],
          "guided": true,
          "recordDepth": "FULL",
          "createdAt": "2026-08-18T07:57:14.180Z",
          "updatedAt": "2026-08-18T07:58:07.108Z",
          "implementationPlan": [
            "workspace-lock.ts: withPathLock(lockPath, operation)을 추출하고 withDecisionWorkspaceLock을 그 위에 재구현",
            "shared-ids.ts 신규: gitCommonDir(projectRoot), reserveSharedId(projectRoot, prefix, localMax) -- git 실패 시 localMax+1로 폴백",
            "ids.ts: nextSourceEntityId(ids, prefix, projectRoot)로 시그니처 변경, reserveSharedId 사용",
            "실사용 호출부 13곳에 projectRoot 인자 추가",
            "tests/unit/v2-worktree-ids.test.ts 신규: 실제 git repo + git worktree add로 두 워크트리를 만들고 각각 sduck submit으로 결정을 만들어 ID가 절대 겹치지 않음을 검증. git 저장소가 아닌 기존 임시 워크스페이스에서는 동작이 안 바뀜도 확인"
          ],
          "verificationPlan": [
            "npm run typecheck",
            "npm run build",
            "npm test",
            "npm run lint",
            "npm run format:check"
          ]
        },
        "decisions": {
          "EXPLICIT": [
            {
              "id": "DEC-0097",
              "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
              "title": "nextSourceEntityId가 git common-dir(모든 worktree가 공유)에 둔 공유 카운터 파일을 참고해 다음 번호를 발급하도록 바꾼다",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "지금은 nextSourceEntityId(ids, prefix)가 현재 worktree에서 로컬로 보이는 .decision/exports/markdown/** 파일들만 스캔해 '최댓값+1'을 계산한다. git worktree는 각자 별도 작업 디렉터리를 갖지만(그래서 .decision/의 미커밋 파일은 서로 안 보임) .git 공용 디렉터리(git rev-parse --git-common-dir)는 전부 공유한다. 새 shared-ids.ts에 reserveSharedId(projectRoot, prefix, localMax)를 추가해, 그 공용 디렉터리 아래 sduck-id-counters.json에 prefix별 발급된 최댓값을 기록하고 workspace-lock.ts에서 추출한 범용 withPathLock으로 잠근다. nextSourceEntityId(ids, prefix, projectRoot)가 로컬 스캔값과 공유 카운터 중 큰 쪽+1을 채택하고 카운터를 갱신한다. git 저장소가 아니거나 git 실행이 실패하면(예: 테스트용 임시 디렉터리) 조용히 기존 로컬-전용 동작으로 폴백한다.",
              "rationale": [
                "사용자가 실제로 겪은 문제('워크트리 나눴을 때 번호 겹치는 게 있어서... 짜증남')를 코드로 재현 가능한 근본 원인까지 확인함: nextSourceEntityId는 순수하게 로컬 스캔만 하므로 같은 베이스에서 갈라진 두 worktree가 독립적으로 새 결정을 만들면 반드시 같은 번호를 낼 수 있음",
                "nextEntityId(DB 직접쓰기 버전)의 라이브 호출부가 하나도 없음을 grep으로 확인함(insertDecision/insertQuestion/insertEvidence/context.ts·events.ts의 DB-only 경로 전부 죽은 코드) -- 수정 대상은 nextSourceEntityId 하나뿐",
                "workspace-lock.ts의 기존 mkdirSync 기반 잠금+stale-lock 복구 로직을 재사용하는 게(withPathLock으로 일반화) 새로 잠금 코드를 또 만드는 것보다 안전함",
                "테스트 임시 워크스페이스(os.tmpdir() 하위)는 git 저장소가 아니므로 git rev-parse가 실패해 자동으로 기존 로컬-전용 동작으로 폴백함 -- 기존 테스트가 전부 영향 없음을 코드로 확인함"
              ],
              "appliesTo": [
                "src/core/v2/ids.ts",
                "src/core/v2/workspace-lock.ts",
                "src/core/v2/shared-ids.ts"
              ],
              "avoids": [
                "nextEntityId(죽은 코드) 수정",
                "TASK id(createTaskId, 날짜+슬러그 기반이라 충돌 위험 낮음) 변경"
              ],
              "sourceRefs": [],
              "createdAt": "2026-08-18T07:58:01.400Z",
              "updatedAt": "2026-08-18T07:58:07.108Z"
            },
            {
              "id": "DEC-0098",
              "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
              "title": "nextSourceEntityId의 실사용 호출부 전체(13곳)에 projectRoot를 전달하도록 갱신한다",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "draft.ts, retrospective.ts, brief.ts, evaluate.ts, memory.ts, question.ts, trace.ts, context.ts, source-store.ts(appendSourceEvent)의 모든 nextSourceEntityId 호출에 projectRoot를 추가한다. 전부 이미 DecisionWorkspace(projectRoot).mutate(...) 클로저 안이거나, 상위 함수 인자로 projectRoot를 이미 갖고 있음을 확인했으므로 시그니처 변경만으로 충분하다.",
              "rationale": [
                "일부만 고치면 DEC는 안전한데 IMPL/EVAL 등은 여전히 충돌하는 절반짜리 수정이 되어 사용자의 실제 불만을 완전히 해소하지 못함"
              ],
              "appliesTo": [
                "src/core/v2/draft.ts",
                "src/core/v2/retrospective.ts",
                "src/core/v2/brief.ts",
                "src/core/v2/evaluate.ts",
                "src/core/v2/memory.ts",
                "src/core/v2/question.ts",
                "src/core/v2/trace.ts",
                "src/core/v2/context.ts",
                "src/core/v2/source-store.ts"
              ],
              "avoids": [],
              "sourceRefs": [],
              "createdAt": "2026-08-18T07:58:01.400Z",
              "updatedAt": "2026-08-18T07:58:07.108Z"
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
          "src/core/v2/ids.ts",
          "src/core/v2/workspace-lock.ts",
          "src/core/v2/shared-ids.ts",
          "src/core/v2/draft.ts",
          "src/core/v2/retrospective.ts",
          "src/core/v2/brief.ts",
          "src/core/v2/evaluate.ts",
          "src/core/v2/memory.ts",
          "src/core/v2/question.ts",
          "src/core/v2/trace.ts",
          "src/core/v2/context.ts",
          "src/core/v2/source-store.ts",
          "tests/unit/v2-worktree-ids.test.ts"
        ],
        "avoidScope": [
          "nextEntityId(죽은 코드)",
          "TASK id 생성 방식 변경",
          "멀티머신 협업(원격) 시나리오"
        ],
        "implementationPlan": [
          "workspace-lock.ts: withPathLock(lockPath, operation)을 추출하고 withDecisionWorkspaceLock을 그 위에 재구현",
          "shared-ids.ts 신규: gitCommonDir(projectRoot), reserveSharedId(projectRoot, prefix, localMax) -- git 실패 시 localMax+1로 폴백",
          "ids.ts: nextSourceEntityId(ids, prefix, projectRoot)로 시그니처 변경, reserveSharedId 사용",
          "실사용 호출부 13곳에 projectRoot 인자 추가",
          "tests/unit/v2-worktree-ids.test.ts 신규: 실제 git repo + git worktree add로 두 워크트리를 만들고 각각 sduck submit으로 결정을 만들어 ID가 절대 겹치지 않음을 검증. git 저장소가 아닌 기존 임시 워크스페이스에서는 동작이 안 바뀜도 확인"
        ],
        "verificationPlan": [
          "npm run typecheck",
          "npm run build",
          "npm test",
          "npm run lint",
          "npm run format:check"
        ],
        "openQuestionCount": 0
      },
      "renderedMarkdown": "────────────────────────────────────────\nImplementation Brief\n────────────────────────────────────────\nTask: TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d\n워크트리 간 ID 중복 방지 -- nextSourceEntityId가 git common-dir에 공유 카운터를 둬서 여러 worktree가 같은 DEC-/IMPL-/EVAL- 번호를 동시에 발급하지 못하게 한다\n\nA. Explicit decisions\n[EXPLICIT] DEC-0097. nextSourceEntityId가 git common-dir(모든 worktree가 공유)에 둔 공유 카운터 파일을 참고해 다음 번호를 발급하도록 바꾼다\nConfidence: 1.00\nSummary: 지금은 nextSourceEntityId(ids, prefix)가 현재 worktree에서 로컬로 보이는 .decision/exports/markdown/** 파일들만 스캔해 '최댓값+1'을 계산한다. git worktree는 각자 별도 작업 디렉터리를 갖지만(그래서 .decision/의 미커밋 파일은 서로 안 보임) .git 공용 디렉터리(git rev-parse --git-common-dir)는 전부 공유한다. 새 shared-ids.ts에 reserveSharedId(projectRoot, prefix, localMax)를 추가해, 그 공용 디렉터리 아래 sduck-id-counters.json에 prefix별 발급된 최댓값을 기록하고 workspace-lock.ts에서 추출한 범용 withPathLock으로 잠근다. nextSourceEntityId(ids, prefix, projectRoot)가 로컬 스캔값과 공유 카운터 중 큰 쪽+1을 채택하고 카운터를 갱신한다. git 저장소가 아니거나 git 실행이 실패하면(예: 테스트용 임시 디렉터리) 조용히 기존 로컬-전용 동작으로 폴백한다.\nRationale:\n  - 사용자가 실제로 겪은 문제('워크트리 나눴을 때 번호 겹치는 게 있어서... 짜증남')를 코드로 재현 가능한 근본 원인까지 확인함: nextSourceEntityId는 순수하게 로컬 스캔만 하므로 같은 베이스에서 갈라진 두 worktree가 독립적으로 새 결정을 만들면 반드시 같은 번호를 낼 수 있음\n  - nextEntityId(DB 직접쓰기 버전)의 라이브 호출부가 하나도 없음을 grep으로 확인함(insertDecision/insertQuestion/insertEvidence/context.ts·events.ts의 DB-only 경로 전부 죽은 코드) -- 수정 대상은 nextSourceEntityId 하나뿐\n  - workspace-lock.ts의 기존 mkdirSync 기반 잠금+stale-lock 복구 로직을 재사용하는 게(withPathLock으로 일반화) 새로 잠금 코드를 또 만드는 것보다 안전함\n  - 테스트 임시 워크스페이스(os.tmpdir() 하위)는 git 저장소가 아니므로 git rev-parse가 실패해 자동으로 기존 로컬-전용 동작으로 폴백함 -- 기존 테스트가 전부 영향 없음을 코드로 확인함\nApplies to:\n  - src/core/v2/ids.ts\n  - src/core/v2/workspace-lock.ts\n  - src/core/v2/shared-ids.ts\nAvoids:\n  - nextEntityId(죽은 코드) 수정\n  - TASK id(createTaskId, 날짜+슬러그 기반이라 충돌 위험 낮음) 변경\n\n[EXPLICIT] DEC-0098. nextSourceEntityId의 실사용 호출부 전체(13곳)에 projectRoot를 전달하도록 갱신한다\nConfidence: 1.00\nSummary: draft.ts, retrospective.ts, brief.ts, evaluate.ts, memory.ts, question.ts, trace.ts, context.ts, source-store.ts(appendSourceEvent)의 모든 nextSourceEntityId 호출에 projectRoot를 추가한다. 전부 이미 DecisionWorkspace(projectRoot).mutate(...) 클로저 안이거나, 상위 함수 인자로 projectRoot를 이미 갖고 있음을 확인했으므로 시그니처 변경만으로 충분하다.\nRationale:\n  - 일부만 고치면 DEC는 안전한데 IMPL/EVAL 등은 여전히 충돌하는 절반짜리 수정이 되어 사용자의 실제 불만을 완전히 해소하지 못함\nApplies to:\n  - src/core/v2/draft.ts\n  - src/core/v2/retrospective.ts\n  - src/core/v2/brief.ts\n  - src/core/v2/evaluate.ts\n  - src/core/v2/memory.ts\n  - src/core/v2/question.ts\n  - src/core/v2/trace.ts\n  - src/core/v2/context.ts\n  - src/core/v2/source-store.ts\n\nB. Inferred decisions\n  - none\n\nC. Carried decisions\n  - none\n\nD. Conflicts\n  - none\n\nE. Open decisions\n  - none\n\nProblem:\n  워크트리 간 ID 중복 방지 -- nextSourceEntityId가 git common-dir에 공유 카운터를 둬서 여러 worktree가 같은 DEC-/IMPL-/EVAL- 번호를 동시에 발급하지 못하게 한다\nImplementation plan:\n  - workspace-lock.ts: withPathLock(lockPath, operation)을 추출하고 withDecisionWorkspaceLock을 그 위에 재구현\n  - shared-ids.ts 신규: gitCommonDir(projectRoot), reserveSharedId(projectRoot, prefix, localMax) -- git 실패 시 localMax+1로 폴백\n  - ids.ts: nextSourceEntityId(ids, prefix, projectRoot)로 시그니처 변경, reserveSharedId 사용\n  - 실사용 호출부 13곳에 projectRoot 인자 추가\n  - tests/unit/v2-worktree-ids.test.ts 신규: 실제 git repo + git worktree add로 두 워크트리를 만들고 각각 sduck submit으로 결정을 만들어 ID가 절대 겹치지 않음을 검증. git 저장소가 아닌 기존 임시 워크스페이스에서는 동작이 안 바뀜도 확인\nVerification plan:\n  - npm run typecheck\n  - npm run build\n  - npm test\n  - npm run lint\n  - npm run format:check\nScope expected:\n  - src/core/v2/ids.ts\n  - src/core/v2/workspace-lock.ts\n  - src/core/v2/shared-ids.ts\n  - src/core/v2/draft.ts\n  - src/core/v2/retrospective.ts\n  - src/core/v2/brief.ts\n  - src/core/v2/evaluate.ts\n  - src/core/v2/memory.ts\n  - src/core/v2/question.ts\n  - src/core/v2/trace.ts\n  - src/core/v2/context.ts\n  - src/core/v2/source-store.ts\n  - tests/unit/v2-worktree-ids.test.ts\nScope avoided:\n  - nextEntityId(죽은 코드)\n  - TASK id 생성 방식 변경\n  - 멀티머신 협업(원격) 시나리오\nOpen questions: 0\nEvidence:\n  - none\n────────────────────────────────────────",
      "gitBaseline": {
        "head": "9c709d5438e1108bdfa169a37efa63854323e9cc",
        "dirtyFileHashes": {
          "\".decision/exports/markdown/tasks/TASK-20260818-/352/262/260/354/240/225/354/227/220-/355/224/204/353/241/234/354/240/235/355/212/270/353/263/204-/352/263/240/354/240/225-/353/266/204/353/245/230-/354/262/264/352/263/204-/353/214/200/353/266/204/353/245/230-/353/245/274-/353/266/231/354/235/274-/354/210/230-/354/236/210/353/212/224-/354/235/270/355/224/204/353/235/274-/354/266/224/352/260/200-policy-j.md\"": null,
          "\".decision/exports/markdown/tasks/TASK-20260818-/352/270/260/354/241/264-/355/231/225/354/240/225-/352/262/260/354/240/225/354/227/220-/354/271/264/355/205/214/352/263/240/353/246/254/353/245/274-/354/206/214/352/270/211-/353/266/200/354/227/254/355/225/230/353/212/224-sduck-categories-tag-/353/252/205/353/240/271-.md\"": null,
          "\".decision/exports/markdown/tasks/TASK-20260818-/353/252/250/353/223/240-/352/262/260/354/240/225/354/235/230-sourcerefs/353/245/274-/352/267/270/353/236/230/355/224/204-/354/227/243/354/247/200/353/241/234-/353/247/214/353/223/240/353/213/244-carried/353/212/224-carried-.md\"": null,
          "\".decision/exports/markdown/tasks/TASK-20260818-/354/233/214/355/201/254/355/212/270/353/246/254-/352/260/204-id-/354/244/221/353/263/265-/353/260/251/354/247/200-nextsourceentityid/352/260/200-git-common-d.md\"": null,
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
          ".omc/project-memory.json": "8c80484ebf8cfde7105f0fb820971ab3121d7ae84bca48fc8df22b988deedbb5",
          ".omc/sessions/0df5d112-2f48-4749-97e4-333c1bc3c4a0.json": "88d5203da7bc1b4ed360966921a0383698c96ca3a882213c404911a9be5503b3",
          ".omc/sessions/21700872-d3ec-4974-b033-67d97c77ad59.json": "01d4e0d40dc663d4b07fff5d5a79b929d1eb02ba9e1bf91a55191ba0686f4250",
          ".omc/sessions/46d1799c-c47b-42b3-ac73-d710812fcf0f.json": "8741f8b4480a840a5591a964223a4415aa945ae3a1415995eef7959fb62656f1",
          ".omc/sessions/7d512c3f-2454-47a9-b778-050805847bdf.json": "c4767182fab0532dd40af30af3eaf09ee7e1646ae4672d9a137187330bb93531",
          ".omc/state/agent-replay-e9bc2156-bb4a-4af4-911d-ddcfa7c8660b.jsonl": "e4f15a78c9d86897dcbf88301262f7474097cf9c0c16cb40ef0d242c10446f58",
          ".omc/state/checkpoints/checkpoint-2026-08-18T02-59-19-604Z.json": "1411b8a5d260d81abb5ed96c942930312104cea0f33eb352e4d64463e10e918a",
          ".omc/state/hud-stdin-cache.json": "2bcecfa39e7856f07eb74c6f51031719eaaec92d009e0fb7d726f9703d54db36",
          ".omc/state/idle-notif-cooldown.json": "f7e38eeb0f1d11db04c3c2a3e36a2ca77d62302ae77916847cb9bdbe99e9db92",
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
          ".omc/state/sessions/e9bc2156-bb4a-4af4-911d-ddcfa7c8660b/last-tool-error-state.json": "1d7a9e7e15ed986c476ee0f825baacc38e7b2247a5cce6f21667f74f1ec17158",
          ".omc/state/sessions/e9bc2156-bb4a-4af4-911d-ddcfa7c8660b/mission-state.json": "7073bc73dd51e5fe835dbbe822e56be1e0bd86b030a7c066c3e8d97672556859",
          ".omc/state/sessions/e9bc2156-bb4a-4af4-911d-ddcfa7c8660b/pre-tool-advisory-throttle.json": "bba4bd67ae89a7b971be86b7dcb4c369a3b3fb4d2596f8edc89fe481e9a7db81",
          ".omc/state/sessions/e9bc2156-bb4a-4af4-911d-ddcfa7c8660b/session-started.json": "07824255e164ede69d9edf517d1a421eddb3061d301c4d27f9e0101e2e8204ed",
          ".omc/state/sessions/e9bc2156-bb4a-4af4-911d-ddcfa7c8660b/subagent-tracking-state.json": "18f914ef6e912724a2472f5c9378f5990b25d3c7a29c573425ea71e9a10b0601",
          "src/cli.ts": "d624bf88d4c61a273e762e95ef7686eb1448895fe96a226f37c77aeed4856525",
          "src/commands/v2/errors.ts": "548c7533a1f555783f4dc04afff365ad9c467137731396920e6b0a37f7c7532f",
          "src/commands/v2/index.ts": "cf9319ae3fb7c94b2c542131f1138154901243ea43d3e5bddab551025a09ed78",
          "src/core/v2/categories.ts": "ccddc81d3ecb357ce65435303c2ea7ae25cf978c518eb64bc3dd41145192ce37",
          "src/core/v2/decision.ts": "051fa93de5a5b35ab73aff5838e90571126d9bc3d5da43228402ce1cf08481be",
          "src/core/v2/draft.ts": "beefa814ed362ac1c925bf6da85de7a90827b3d7de3b51f7d33411aec6fca0db",
          "src/core/v2/errors.ts": "17291af8c12d7e046dc7da680bcff00b6a5307109abb1a4faa8bc8de3dcd500c",
          "src/core/v2/graph.ts": "1ed830a0525c422e91a7e0f7d524517774f66cce7e743aa42c87c6ba0fc9bd29",
          "src/core/v2/memory.ts": "8060b42e5f3edd8000cbf74e3e6f264d4125264c3422010cf33d5c4407a26edf",
          "src/core/v2/policy.ts": "230156ece885b93efc0fc7fff7d0bcc94dcbbef668286ccd5efb188d5a79142a",
          "src/core/v2/rebuild.ts": "4644d5307a5afe87f3950dd27bde772659c4a292d460b2fc314336c1a1d06e4e",
          "src/core/v2/recall.ts": "2f24a66bf5ff87cd6f9c91bae0da92b21d772f5cef20bdfca2385d3ef91705f5",
          "src/core/v2/search.ts": "6d9392356dbabfe9998909a87e42ad36f70c46381069cb2396b79ca735882651",
          "src/core/v2/source-store.ts": "211f071f3d9fca98c16630a86694e016c8ad5223b5ed78ad735cfd4964d2e04b",
          "src/core/v2/store.ts": "8f45cd4361d656b57c2a507ed2cfaf9369c6304ddd44f4ca9b1f45553ce07487",
          "src/types/index.ts": "c0a1dec4162e6f15b3003b05b880a1c8f47e964a7d9319cc512646ca8b310e1c",
          "src/ui/v2/messages.ts": "1ca1a598f8a3dd98b3e9e873bdbd5ba6059a637af24cd38feef169647a268b52",
          "src/ui/v2/render.ts": "6b60e38176a638a2a6fc9c4597e1977488954e4123bf9b07224cf49bdc0150a4",
          "tests/e2e/v2-cli.test.ts": "e3ca5723cce47488f29f977c5241a44048ae02835bd9a68e8ee63a636213a40f",
          "tests/unit/decision-workspace.test.ts": "0b3bd18768c559c8ef6f2248c4de20615968fb06008b9a0bd19b01671edf9948",
          "tests/unit/v2-categories.test.ts": "edb728298af24c86584ab1bdba6aed8bd2eb914c9411f753a0bd1e4aa360d721",
          "tests/unit/v2-lifecycle.test.ts": "646f6721b68057139094bc7d7b23a2de514b3f6d6117a0f5cd1155c95f0a233d",
          "tests/unit/v2-memory.test.ts": "86bed0cd69faa028afec311c54074db3767ba2e35e8a58ac9a10cf1bed961050",
          "tests/unit/v2-messages.test.ts": "fc8dae20bd2db245986a48813772e6fe205c7ab2d8df6f78cc437fb27c1582f1",
          "tests/unit/v2-recall.test.ts": "5a9eb83054b9579d3ed4b16e65dfa301f943f0a3abdf4a2f6a25ca11409a7b07",
          "tests/unit/v2-search.test.ts": "d30ccabe217e04ba11dd43f1dcffea33b7d6cc6b009bb71c6bde79e7e04f4d4d"
        }
      },
      "createdAt": "2026-08-18T07:58:07.202Z"
    }
  ],
  "evaluations": [
    {
      "id": "EVAL-0026",
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "traceId": "IMPL-0045",
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
          "name": "typecheck",
          "outcome": "passed"
        },
        {
          "name": "format",
          "outcome": "passed"
        },
        {
          "name": "unit-tests",
          "outcome": "173 passed (신규 v2-worktree-ids.test.ts 1건 포함)"
        },
        {
          "name": "e2e-tests",
          "outcome": "33 passed"
        },
        {
          "name": "regression-test-proof",
          "outcome": "일부러 reserveSharedId를 no-op으로 바꿔 두 워크트리가 실제로 동일한 DEC-0002를 만드는 충돌을 재현해 테스트가 실패함을 확인한 뒤 원복 -- 테스트가 진짜로 버그를 잡아냄을 검증"
        },
        {
          "name": "flaky-test-found-and-fixed",
          "outcome": "전체 스위트 1회 실행에서 v2-memory.test.ts의 무관한 테스트가 우연히 실패(격리 실행/재실행 시 통과) -- 원인은 nextSourceEntityId 호출마다 execFileSync로 git 서브프로세스를 새로 띄우던 것으로 진단, projectRoot별 gitCommonDir 캐시를 추가해 프로세스당 1회만 계산하도록 고침. 이후 전체 스위트 3회 연속 통과로 확인"
        }
      ],
      "createdAt": "2026-08-18T08:15:54.909Z"
    }
  ],
  "events": [
    {
      "id": "EVT-0573",
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "type": "TASK_CREATED",
      "payload": {
        "description": "워크트리 간 ID 중복 방지 -- nextSourceEntityId가 git common-dir에 공유 카운터를 둬서 여러 worktree가 같은 DEC-/IMPL-/EVAL- 번호를 동시에 발급하지 못하게 한다",
        "policy": {
          "grillMeRequired": true
        }
      },
      "createdAt": "2026-08-18T07:57:14.181Z"
    },
    {
      "id": "EVT-0574",
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "type": "GRILL_STARTED",
      "payload": {
        "automatic": true
      },
      "createdAt": "2026-08-18T07:57:14.181Z"
    },
    {
      "id": "EVT-0575",
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "type": "CONTEXT_INDEXED",
      "payload": {
        "itemCount": 40
      },
      "createdAt": "2026-08-18T07:57:14.460Z"
    },
    {
      "id": "EVT-0576",
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "type": "GRILL_COMPLETED",
      "payload": {
        "reason": "사용자가 '워크트리 ID 중복부터'로 최우선순위 명시 확정. nextEntityId(DB 직접쓰기)는 실제로 아무 곳에서도 안 불리는 죽은 코드임을 코드로 확인했고, 실사용되는 nextSourceEntityId의 호출부 13곳 전부가 projectRoot를 이미 클로저로 갖고 있음을 확인했으므로 설계상 모호성 없음.",
        "carried": []
      },
      "createdAt": "2026-08-18T07:57:26.616Z"
    },
    {
      "id": "EVT-0577",
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0097"
      },
      "createdAt": "2026-08-18T07:58:01.401Z"
    },
    {
      "id": "EVT-0578",
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0098"
      },
      "createdAt": "2026-08-18T07:58:01.401Z"
    },
    {
      "id": "EVT-0579",
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 2,
        "questions": 0,
        "evidence": 0,
        "expectedScope": [
          "src/core/v2/ids.ts",
          "src/core/v2/workspace-lock.ts",
          "src/core/v2/shared-ids.ts",
          "src/core/v2/draft.ts",
          "src/core/v2/retrospective.ts",
          "src/core/v2/brief.ts",
          "src/core/v2/evaluate.ts",
          "src/core/v2/memory.ts",
          "src/core/v2/question.ts",
          "src/core/v2/trace.ts",
          "src/core/v2/context.ts",
          "src/core/v2/source-store.ts",
          "tests/unit/v2-worktree-ids.test.ts"
        ],
        "avoidScope": [
          "nextEntityId(죽은 코드)",
          "TASK id 생성 방식 변경",
          "멀티머신 협업(원격) 시나리오"
        ],
        "implementationPlan": [
          "workspace-lock.ts: withPathLock(lockPath, operation)을 추출하고 withDecisionWorkspaceLock을 그 위에 재구현",
          "shared-ids.ts 신규: gitCommonDir(projectRoot), reserveSharedId(projectRoot, prefix, localMax) -- git 실패 시 localMax+1로 폴백",
          "ids.ts: nextSourceEntityId(ids, prefix, projectRoot)로 시그니처 변경, reserveSharedId 사용",
          "실사용 호출부 13곳에 projectRoot 인자 추가",
          "tests/unit/v2-worktree-ids.test.ts 신규: 실제 git repo + git worktree add로 두 워크트리를 만들고 각각 sduck submit으로 결정을 만들어 ID가 절대 겹치지 않음을 검증. git 저장소가 아닌 기존 임시 워크스페이스에서는 동작이 안 바뀜도 확인"
        ],
        "verificationPlan": [
          "npm run typecheck",
          "npm run build",
          "npm test",
          "npm run lint",
          "npm run format:check"
        ]
      },
      "createdAt": "2026-08-18T07:58:01.401Z"
    },
    {
      "id": "EVT-0580",
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "type": "BRIEF_CONFIRMED",
      "payload": {
        "snapshotId": "BRF-0040"
      },
      "createdAt": "2026-08-18T07:58:07.202Z"
    },
    {
      "id": "EVT-0581",
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "type": "TRACE_CREATED",
      "payload": {
        "traceId": "IMPL-0045",
        "filesChanged": [
          ".omc/project-memory.json",
          ".omc/state/hud-stdin-cache.json",
          ".omc/state/sessions/e9bc2156-bb4a-4af4-911d-ddcfa7c8660b/last-tool-error-state.json",
          ".omc/state/sessions/e9bc2156-bb4a-4af4-911d-ddcfa7c8660b/pre-tool-advisory-throttle.json",
          "src/core/v2/brief.ts",
          "src/core/v2/context.ts",
          "src/core/v2/draft.ts",
          "src/core/v2/evaluate.ts",
          "src/core/v2/grill.ts",
          "src/core/v2/memory.ts",
          "src/core/v2/question.ts",
          "src/core/v2/remember.ts",
          "src/core/v2/retrospective.ts",
          "src/core/v2/shared-ids.ts",
          "src/core/v2/source-store.ts",
          "src/core/v2/task.ts",
          "src/core/v2/trace.ts",
          "src/core/v2/workspace-lock.ts",
          "tests/unit/v2-worktree-ids.test.ts"
        ]
      },
      "createdAt": "2026-08-18T08:15:43.564Z"
    },
    {
      "id": "EVT-0582",
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "type": "EVALUATION_RECORDED",
      "payload": {
        "evaluationId": "EVAL-0026",
        "traceId": "IMPL-0045"
      },
      "createdAt": "2026-08-18T08:15:54.910Z"
    },
    {
      "id": "EVT-0583",
      "taskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
      "type": "TASK_CLOSED",
      "payload": {},
      "createdAt": "2026-08-18T08:19:24.006Z"
    }
  ]
}
```
