---
id: TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비
type: task
status: CLOSED
title: >-
  sduck 0.8.0 릴리스 준비: README/README.ko 문서 정합성 전면 정비, 누락된 CLI 옵션 문서화, package.json keywords 추가, 버전 0.8.0 승격 및 release
  note 작성
record_depth: FULL
created_at: '2026-08-18T10:40:01.316Z'
updated_at: '2026-08-18T10:49:46.815Z'
---
# TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비: sduck 0.8.0 릴리스 준비: README/README.ko 문서 정합성 전면 정비, 누락된 CLI 옵션 문서화, package.json keywords 추가, 버전 0.8.0 승격 및 release note 작성

sduck 0.8.0 릴리스 준비: README/README.ko 문서 정합성 전면 정비, 누락된 CLI 옵션 문서화, package.json keywords 추가, 버전 0.8.0 승격 및 release note 작성

## Sduck source

```json sduck-source
{
  "task": {
    "id": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
    "title": "sduck 0.8.0 릴리스 준비: README/README.ko 문서 정합성 전면 정비, 누락된 CLI 옵션 문서화, package.json keywords 추가, 버전 0.8.0 승격 및 release note 작성",
    "description": "sduck 0.8.0 릴리스 준비: README/README.ko 문서 정합성 전면 정비, 누락된 CLI 옵션 문서화, package.json keywords 추가, 버전 0.8.0 승격 및 release note 작성",
    "status": "CLOSED",
    "expectedScope": [
      "README.ko.md에 Categories 섹션 신규 추가 (README.md와 1:1 대응)",
      "README.md/README.ko.md Quick start 스크립트에 categories, recall --json, graph show --mermaid 사용례 추가",
      "README.md/README.ko.md의 EN/KO 패리티 격차 수정 (record-depth 관련 quick start/표/설명, 'unless disabled', 'policy-snapshot' 문구, locale 독립성 문구, Legacy heading 단복수)",
      "README.md/README.ko.md Command reference 표에 실제 cli.ts 옵션 반영 (grill complete --changed-assumption, evaluate --limitation/--json, graph show --mermaid, recall --depth/--json, -V/--version 행, legacy 명령 옵션들)",
      "package.json에 keywords 배열 추가",
      "package.json 버전을 0.8.0으로 올리고 README/README.ko의 'What is new' 섹션을 0.8.0 내용으로 갱신, docs/release-0.8.0.md 신규 작성"
    ],
    "avoidScope": [
      "실제 CLI 동작/코드 변경 (문서만 수정)",
      "git tag, npm publish, git push 등 실제 배포 행위",
      "CHANGELOG.md 신규 도입 (현재 컨벤션에 없음, 이번 범위 밖)",
      "docs/release-0.7.0.md 등 과거 release note 수정"
    ],
    "guided": true,
    "recordDepth": "FULL",
    "createdAt": "2026-08-18T10:40:01.316Z",
    "updatedAt": "2026-08-18T10:49:46.815Z",
    "implementationPlan": [
      "README.ko.md의 'Decision task flow' 표와 'Bounded memory' 사이에 Categories 섹션을 README.md와 동일한 내용으로(한국어 표현) 추가",
      "README.md/README.ko.md의 Quick start 코드블록에 'sduck categories suggest/list', 'sduck recall ... --json', 'sduck graph show ... --mermaid' 예시 라인 추가",
      "README.ko.md 빠른 시작에 '--record-depth FULL|LIGHTWEIGHT' 예시 두 줄 추가, Decision task flow 표의 work 행에 --record-depth 반영, Workflow contract 섹션에 record-depth 설명 문장 추가, Guided workflow 섹션에 'policy-snapshot' 문구 추가, init 관련 문장에 'unless disabled(비활성화하지 않은 경우)' 반영",
      "README.md의 'Language and locale' 섹션에 'README 언어 선택과 CLI locale 설정은 서로 독립적' 문장의 영어 대응 bullet 추가",
      "README.md 'Legacy compatibility commands'(복수) 제목에 맞춰 README.ko.md 'Legacy compatibility command'를 복수형으로 통일",
      "양쪽 README의 Command reference 표에서: grill complete 행에 [--changed-assumption <text>] 추가, evaluate 행에 [--limitation <text...>] [--json] 추가, graph show 행에 [--mermaid] 추가, recall 행에 [--depth <n>] [--json] 추가, Workspace and config 표에 -V/--version 행 추가, Legacy compatibility 코드블록 예시에 start/fast-track --no-git, clean --force, archive --keep <n>, update --dry-run 옵션 주석 추가",
      "package.json에 keywords 배열 추가 (예: cli, decision-briefing, coding-agent, decision-record, ai-agent-workflow 등 실제 설명과 일치하는 값)",
      "package.json version을 0.8.0으로 변경",
      "README.md/README.ko.md의 'What is new in 0.7.0'/'0.7.0에서 달라진 점' 제목과 bullet을 0.8.0 기준으로 교체: 워크트리 간 ID 충돌 방지, categories 고정 분류 체계(suggest/set/list/browse/tag), recall 개선(DRAFT 결정 노출, 모든 sourceRefs가 CARRIED_FROM/CITES 그래프 엣지화, FTS5/trigram 검색), graph show --mermaid export. 기존 0.7.0 Auto Wiki 내용은 별도 release note(docs/release-0.7.0.md)에 이미 보존되어 있으므로 README에서는 최신 버전만 강조하는 기존 컨벤션 유지",
      "docs/release-0.7.0.md와 동일한 포맷으로 docs/release-0.8.0.md 신규 작성 (User experience, 세부 기능별 섹션, Safety and compatibility, Intentionally not included)"
    ],
    "verificationPlan": [
      "README.md/README.ko.md의 모든 Command reference 표 옵션을 src/cli.ts 실제 Commander 정의와 재대조",
      "npm run build && npm run lint && npm run typecheck로 문서/메타데이터 변경이 빌드에 영향 없음을 확인",
      "npm pack --dry-run(package:check)으로 package.json 변경이 패키징에 문제 없는지 확인"
    ]
  },
  "questions": [],
  "evidence": [
    {
      "id": "EVD-doc-audit-report",
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "decisionId": null,
      "sourceType": "DISCOVERY",
      "sourceRef": "Explore agent audit (this session)",
      "summary": "README.md/README.ko.md 전체 대조 + src/cli.ts 전체 command/option 목록 대조 + package.json 대조로 15곳 이상의 구체적 격차를 file:line 단위로 확인",
      "confidence": 1,
      "createdAt": "2026-08-18T10:41:09.525Z"
    }
  ],
  "contextItems": [
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
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
      "id": "CTX-1793",
      "createdAt": "2026-08-18T10:40:01.603Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "sourceType": "MEMORY",
      "sourceRef": "MEM-0014",
      "summary": "Memory capsule: README에 categories 명령어 문서화, CLAUDE.md에 OMC wiki 충돌 방지 메모 추가 — 이미 구현·확정된 sduck categories(suggest/set/list/browse/tag) 명령이 README에 전혀 문서화되어 있지 않았다(grep 0건). README의 Command reference에 기존 표 스타일 그대로 Categories 섹션을 추가하고 cli.ts의 실제 옵션(--json/--uncategorized/--limit/--stdin)을 옮겼다. 또한 이 세션에서 OMC(oh-my-claudecode)의 wiki_* MCP 도구(add/delete/ingest/lint/list/query/read)가 sduck의 docs/wiki/(sduck wiki build|status|sync|lint 전용)와 이름은 비슷하지만 별개 저장/스키마를 쓰는 시스템임을 확인해, 혼동 방지 메모를 CLAUDE.md의 Evidence-backed Wiki workflow 섹션에 추가했다.",
      "metadata": {
        "type": "memory_capsule",
        "sourceTaskId": "TASK-20260818-readme에-sduck-categories-명령어-문서화-추가-claude-md에-o",
        "topics": [
          "documentation",
          "categories",
          "wiki",
          "omc"
        ],
        "reason": "matched by recall result",
        "score": 1
      },
      "id": "CTX-1794",
      "createdAt": "2026-08-18T10:40:01.604Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "sourceType": "MEMORY",
      "sourceRef": "MEM-0013",
      "summary": "Memory capsule: 워크트리 간 ID 중복 방지 -- git common-dir 공유 카운터 — nextSourceEntityId가 로컬 .decision/ 스캔값만으로 다음 번호를 정해서, 같은 베이스에서 갈라진 두 git worktree가 독립적으로 새 결정을 만들면 같은 DEC-/IMPL-/EVAL- 번호를 발급할 수 있었다. 이제 git rev-parse --git-common-dir(모든 worktree가 공유)에 sduck-id-counters.json을 두고 워크스페이스 잠금과 같은 mkdirSync 기반 잠금(workspace-lock.ts에서 withPathLock으로 일반화)으로 보호해, 로컬 스캔값과 공유 카운터 중 큰 쪽+1을 채택한다. git 저장소가 아니면(테스트 임시 디렉터리 등) 조용히 기존 로컬-전용 동작으로 폴백한다.",
      "metadata": {
        "type": "memory_capsule",
        "sourceTaskId": "TASK-20260818-워크트리-간-id-중복-방지-nextsourceentityid가-git-common-d",
        "topics": [
          "worktree",
          "ids",
          "concurrency"
        ],
        "reason": "matched by recall result",
        "score": 1
      },
      "id": "CTX-1795",
      "createdAt": "2026-08-18T10:40:01.604Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
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
      "id": "CTX-1796",
      "createdAt": "2026-08-18T10:40:01.605Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
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
      "id": "CTX-1797",
      "createdAt": "2026-08-18T10:40:01.605Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-readme-categories-docs",
      "summary": "Decision applies to relevant file README.md: README Command reference에 categories 명령어 표를 추가한다",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "README.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1812",
      "createdAt": "2026-08-18T10:40:01.615Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
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
      "id": "CTX-1813",
      "createdAt": "2026-08-18T10:40:01.616Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
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
      "id": "CTX-1814",
      "createdAt": "2026-08-18T10:40:01.616Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
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
      "id": "CTX-1815",
      "createdAt": "2026-08-18T10:40:01.617Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
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
      "id": "CTX-1816",
      "createdAt": "2026-08-18T10:40:01.617Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
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
      "id": "CTX-1817",
      "createdAt": "2026-08-18T10:40:01.618Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
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
      "id": "CTX-1818",
      "createdAt": "2026-08-18T10:40:01.618Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
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
      "id": "CTX-1819",
      "createdAt": "2026-08-18T10:40:01.619Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-RELEASE-0-7-0-AUTHORIZATION",
      "summary": "Decision applies to relevant file docs/release-0.7.0.md: Release the prepared 0.7.0 package",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "docs/release-0.7.0.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1820",
      "createdAt": "2026-08-18T10:40:01.619Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-RELEASE-0-7-0-CONTENTS",
      "summary": "Decision applies to relevant file package.json: Commit the completed release payload and canonical records",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "package.json"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1821",
      "createdAt": "2026-08-18T10:40:01.620Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-RELEASE-0-7-0-SAFETY",
      "summary": "Decision applies to relevant file package.json: Gate irreversible release mutations on fresh evidence",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "package.json"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1822",
      "createdAt": "2026-08-18T10:40:01.620Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
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
      "id": "CTX-1823",
      "createdAt": "2026-08-18T10:40:01.620Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
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
      "id": "CTX-1824",
      "createdAt": "2026-08-18T10:40:01.621Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
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
      "id": "CTX-1825",
      "createdAt": "2026-08-18T10:40:01.622Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
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
      "id": "CTX-1826",
      "createdAt": "2026-08-18T10:40:01.622Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-WIKI-RELEASE-070",
      "summary": "Decision applies to relevant file package.json: Expose Auto Wiki as the 0.7.0 public surface without releasing it",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "package.json"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1829",
      "createdAt": "2026-08-18T10:40:01.623Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-WIKI-DIRTY-STATUS",
      "summary": "Decision applies to relevant file tests/unit/wiki.test.ts: Compute Wiki dirtiness only from deterministic evidence",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "tests/unit/wiki.test.ts"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-1827",
      "createdAt": "2026-08-18T10:40:01.623Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
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
      "id": "CTX-1828",
      "createdAt": "2026-08-18T10:40:01.623Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0009",
      "summary": "Prior decision: Authorize only the 0.6 MCP control plane — This task implements 0.6a–0.6d only; it does not implement a sduck-owned coding runtime.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1798",
      "createdAt": "2026-08-18T10:40:01.606Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0011",
      "summary": "Prior decision: Require local digest confirmation by default — MCP may prepare a canonical brief, but default confirmation is interactive local sduck confirm --digest; non-human MCP acknowledgement is explicit policy opt-in with provenance.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1799",
      "createdAt": "2026-08-18T10:40:01.607Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0019",
      "summary": "Prior decision: What trace data and CI semantics should sduck verify require? — Bind trace to Git and brief digest",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1800",
      "createdAt": "2026-08-18T10:40:01.607Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0020",
      "summary": "Prior decision: What exact BriefDigestProjectionV1 and canonical serializer should sduck use? — RFC 8785 projection v1 (recommended)",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1801",
      "createdAt": "2026-08-18T10:40:01.608Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0023",
      "summary": "Prior decision: What exact Git-bound trace and sduck verify algorithm should 0.6 use? — Merge-base CI verifier (recommended)",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1802",
      "createdAt": "2026-08-18T10:40:01.609Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
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
      "id": "CTX-1803",
      "createdAt": "2026-08-18T10:40:01.609Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
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
      "id": "CTX-1804",
      "createdAt": "2026-08-18T10:40:01.610Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
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
      "id": "CTX-1805",
      "createdAt": "2026-08-18T10:40:01.610Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0047",
      "summary": "Prior decision: Document the implemented 0.5.0 guided workflow without promising future controls — README documentation introduces the current CLI-only guided workflow, its commands, and legacy-task compatibility. Migration and enable or disable controls remain unimplemented and are not documented as available.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1806",
      "createdAt": "2026-08-18T10:40:01.611Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0064",
      "summary": "Prior decision: Clarify the public documentation in both README locales — Add a short user-facing UX clarification to README.md and README.ko.md because the current English wording is scattered and does not plainly distinguish agent-internal commands from conversational user interaction.",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1807",
      "createdAt": "2026-08-18T10:40:01.612Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "sourceType": "MEMORY",
      "sourceRef": "english-default-korean-v2-locale",
      "summary": "Prior decision: Default to English and offer a global Korean v2 locale — Use English as the default for CLI output and documentation, publish a Korean README, and provide a user-global locale preference for Korean v2 CLI output; v1 is not localized or redesigned.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1808",
      "createdAt": "2026-08-18T10:40:01.612Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
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
      "id": "CTX-1809",
      "createdAt": "2026-08-18T10:40:01.613Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "sourceType": "MEMORY",
      "sourceRef": "IMPL-0012",
      "summary": "Prior implementation trace: Detected 2 changed file(s).",
      "metadata": {
        "type": "implementation_trace",
        "filesChanged": [
          "README.ko.md",
          "README.md"
        ],
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1810",
      "createdAt": "2026-08-18T10:40:01.614Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "sourceType": "MEMORY",
      "sourceRef": "IMPL-0015",
      "summary": "Prior implementation trace: Detected 14 changed file(s).",
      "metadata": {
        "type": "implementation_trace",
        "filesChanged": [
          "README.ko.md",
          "README.md",
          "docs/migration.md",
          "src/cli.ts",
          "src/commands/v2/index.ts",
          "src/core/v2/errors.ts",
          "src/core/v2/policy.ts",
          "src/core/v2/task.ts",
          "src/core/v2/workspace.ts",
          "src/ui/v2/messages.ts",
          "tests/e2e/v2-locale-cli.test.ts",
          "tests/e2e/v2-phase2c-matrix.test.ts",
          "tests/unit/v2-lifecycle.test.ts",
          "tests/unit/v2-messages.test.ts"
        ],
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1811",
      "createdAt": "2026-08-18T10:40:01.614Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "sourceType": "DISCOVERY",
      "sourceRef": "README.ko.md",
      "summary": "File evidence: # sduck",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "# sduck",
        "line": 1
      },
      "id": "CTX-1830",
      "createdAt": "2026-08-18T10:40:01.624Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "sourceType": "DISCOVERY",
      "sourceRef": "README.md",
      "summary": "File evidence: # sduck",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "# sduck",
        "line": 1
      },
      "id": "CTX-1831",
      "createdAt": "2026-08-18T10:40:01.624Z"
    },
    {
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "sourceType": "DISCOVERY",
      "sourceRef": "package.json",
      "summary": "File evidence: \"name\": \"@sduck/sduck-cli\",",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "\"name\": \"@sduck/sduck-cli\",",
        "line": 2
      },
      "id": "CTX-1832",
      "createdAt": "2026-08-18T10:40:01.625Z"
    }
  ],
  "briefSnapshots": [
    {
      "id": "BRF-0042",
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "snapshot": {
        "task": {
          "id": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
          "title": "sduck 0.8.0 릴리스 준비: README/README.ko 문서 정합성 전면 정비, 누락된 CLI 옵션 문서화, package.json keywords 추가, 버전 0.8.0 승격 및 release note 작성",
          "description": "sduck 0.8.0 릴리스 준비: README/README.ko 문서 정합성 전면 정비, 누락된 CLI 옵션 문서화, package.json keywords 추가, 버전 0.8.0 승격 및 release note 작성",
          "status": "CONFIRMED",
          "expectedScope": [
            "README.ko.md에 Categories 섹션 신규 추가 (README.md와 1:1 대응)",
            "README.md/README.ko.md Quick start 스크립트에 categories, recall --json, graph show --mermaid 사용례 추가",
            "README.md/README.ko.md의 EN/KO 패리티 격차 수정 (record-depth 관련 quick start/표/설명, 'unless disabled', 'policy-snapshot' 문구, locale 독립성 문구, Legacy heading 단복수)",
            "README.md/README.ko.md Command reference 표에 실제 cli.ts 옵션 반영 (grill complete --changed-assumption, evaluate --limitation/--json, graph show --mermaid, recall --depth/--json, -V/--version 행, legacy 명령 옵션들)",
            "package.json에 keywords 배열 추가",
            "package.json 버전을 0.8.0으로 올리고 README/README.ko의 'What is new' 섹션을 0.8.0 내용으로 갱신, docs/release-0.8.0.md 신규 작성"
          ],
          "avoidScope": [
            "실제 CLI 동작/코드 변경 (문서만 수정)",
            "git tag, npm publish, git push 등 실제 배포 행위",
            "CHANGELOG.md 신규 도입 (현재 컨벤션에 없음, 이번 범위 밖)",
            "docs/release-0.7.0.md 등 과거 release note 수정"
          ],
          "guided": true,
          "recordDepth": "FULL",
          "createdAt": "2026-08-18T10:40:01.316Z",
          "updatedAt": "2026-08-18T10:41:13.432Z",
          "implementationPlan": [
            "README.ko.md의 'Decision task flow' 표와 'Bounded memory' 사이에 Categories 섹션을 README.md와 동일한 내용으로(한국어 표현) 추가",
            "README.md/README.ko.md의 Quick start 코드블록에 'sduck categories suggest/list', 'sduck recall ... --json', 'sduck graph show ... --mermaid' 예시 라인 추가",
            "README.ko.md 빠른 시작에 '--record-depth FULL|LIGHTWEIGHT' 예시 두 줄 추가, Decision task flow 표의 work 행에 --record-depth 반영, Workflow contract 섹션에 record-depth 설명 문장 추가, Guided workflow 섹션에 'policy-snapshot' 문구 추가, init 관련 문장에 'unless disabled(비활성화하지 않은 경우)' 반영",
            "README.md의 'Language and locale' 섹션에 'README 언어 선택과 CLI locale 설정은 서로 독립적' 문장의 영어 대응 bullet 추가",
            "README.md 'Legacy compatibility commands'(복수) 제목에 맞춰 README.ko.md 'Legacy compatibility command'를 복수형으로 통일",
            "양쪽 README의 Command reference 표에서: grill complete 행에 [--changed-assumption <text>] 추가, evaluate 행에 [--limitation <text...>] [--json] 추가, graph show 행에 [--mermaid] 추가, recall 행에 [--depth <n>] [--json] 추가, Workspace and config 표에 -V/--version 행 추가, Legacy compatibility 코드블록 예시에 start/fast-track --no-git, clean --force, archive --keep <n>, update --dry-run 옵션 주석 추가",
            "package.json에 keywords 배열 추가 (예: cli, decision-briefing, coding-agent, decision-record, ai-agent-workflow 등 실제 설명과 일치하는 값)",
            "package.json version을 0.8.0으로 변경",
            "README.md/README.ko.md의 'What is new in 0.7.0'/'0.7.0에서 달라진 점' 제목과 bullet을 0.8.0 기준으로 교체: 워크트리 간 ID 충돌 방지, categories 고정 분류 체계(suggest/set/list/browse/tag), recall 개선(DRAFT 결정 노출, 모든 sourceRefs가 CARRIED_FROM/CITES 그래프 엣지화, FTS5/trigram 검색), graph show --mermaid export. 기존 0.7.0 Auto Wiki 내용은 별도 release note(docs/release-0.7.0.md)에 이미 보존되어 있으므로 README에서는 최신 버전만 강조하는 기존 컨벤션 유지",
            "docs/release-0.7.0.md와 동일한 포맷으로 docs/release-0.8.0.md 신규 작성 (User experience, 세부 기능별 섹션, Safety and compatibility, Intentionally not included)"
          ],
          "verificationPlan": [
            "README.md/README.ko.md의 모든 Command reference 표 옵션을 src/cli.ts 실제 Commander 정의와 재대조",
            "npm run build && npm run lint && npm run typecheck로 문서/메타데이터 변경이 빌드에 영향 없음을 확인",
            "npm pack --dry-run(package:check)으로 package.json 변경이 패키징에 문제 없는지 확인"
          ]
        },
        "decisions": {
          "EXPLICIT": [
            {
              "id": "DEC-command-reference-completeness",
              "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
              "title": "README.md/README.ko.md Command reference 표에 누락된 실제 CLI 옵션을 채운다",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "src/cli.ts 대조 결과 grill complete(--changed-assumption), evaluate(--limitation, --json), graph show(--mermaid), recall(--depth, --json), 루트 -V/--version, legacy start/fast-track(--no-git)/clean(--force)/archive(--keep <n>)/update(--dry-run)이 두 README 표 모두에서 누락돼 있었다. 각 표에 해당 옵션을 실제 cli.ts 시그니처 그대로 추가한다.",
              "rationale": [
                "이미 구현·확정된 CLI 표면인데 문서에 없으면 에이전트/사용자가 존재하는 기능을 모르고 못 씀 -- 특히 --mermaid, recall --json은 이번 세션에 새로 추가된 기능이라 누락 위험이 컸음"
              ],
              "appliesTo": [
                "README.md",
                "README.ko.md",
                "src/cli.ts"
              ],
              "avoids": [
                "실제 cli.ts 옵션 변경",
                "표에 없는 옵션을 임의로 추가"
              ],
              "sourceRefs": [
                "DEC-0074",
                "DEC-0077",
                "DEC-0078"
              ],
              "createdAt": "2026-08-18T10:41:09.525Z",
              "updatedAt": "2026-08-18T10:41:13.432Z"
            },
            {
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
            },
            {
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
            },
            {
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
            },
            {
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
          ],
          "INFERRED": [],
          "CARRIED": [],
          "CONFLICT": [],
          "OPEN": []
        },
        "questions": [],
        "evidence": [
          {
            "id": "EVD-doc-audit-report",
            "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
            "decisionId": null,
            "sourceType": "DISCOVERY",
            "sourceRef": "Explore agent audit (this session)",
            "summary": "README.md/README.ko.md 전체 대조 + src/cli.ts 전체 command/option 목록 대조 + package.json 대조로 15곳 이상의 구체적 격차를 file:line 단위로 확인",
            "confidence": 1,
            "createdAt": "2026-08-18T10:41:09.525Z"
          }
        ],
        "expectedScope": [
          "README.ko.md에 Categories 섹션 신규 추가 (README.md와 1:1 대응)",
          "README.md/README.ko.md Quick start 스크립트에 categories, recall --json, graph show --mermaid 사용례 추가",
          "README.md/README.ko.md의 EN/KO 패리티 격차 수정 (record-depth 관련 quick start/표/설명, 'unless disabled', 'policy-snapshot' 문구, locale 독립성 문구, Legacy heading 단복수)",
          "README.md/README.ko.md Command reference 표에 실제 cli.ts 옵션 반영 (grill complete --changed-assumption, evaluate --limitation/--json, graph show --mermaid, recall --depth/--json, -V/--version 행, legacy 명령 옵션들)",
          "package.json에 keywords 배열 추가",
          "package.json 버전을 0.8.0으로 올리고 README/README.ko의 'What is new' 섹션을 0.8.0 내용으로 갱신, docs/release-0.8.0.md 신규 작성"
        ],
        "avoidScope": [
          "실제 CLI 동작/코드 변경 (문서만 수정)",
          "git tag, npm publish, git push 등 실제 배포 행위",
          "CHANGELOG.md 신규 도입 (현재 컨벤션에 없음, 이번 범위 밖)",
          "docs/release-0.7.0.md 등 과거 release note 수정"
        ],
        "implementationPlan": [
          "README.ko.md의 'Decision task flow' 표와 'Bounded memory' 사이에 Categories 섹션을 README.md와 동일한 내용으로(한국어 표현) 추가",
          "README.md/README.ko.md의 Quick start 코드블록에 'sduck categories suggest/list', 'sduck recall ... --json', 'sduck graph show ... --mermaid' 예시 라인 추가",
          "README.ko.md 빠른 시작에 '--record-depth FULL|LIGHTWEIGHT' 예시 두 줄 추가, Decision task flow 표의 work 행에 --record-depth 반영, Workflow contract 섹션에 record-depth 설명 문장 추가, Guided workflow 섹션에 'policy-snapshot' 문구 추가, init 관련 문장에 'unless disabled(비활성화하지 않은 경우)' 반영",
          "README.md의 'Language and locale' 섹션에 'README 언어 선택과 CLI locale 설정은 서로 독립적' 문장의 영어 대응 bullet 추가",
          "README.md 'Legacy compatibility commands'(복수) 제목에 맞춰 README.ko.md 'Legacy compatibility command'를 복수형으로 통일",
          "양쪽 README의 Command reference 표에서: grill complete 행에 [--changed-assumption <text>] 추가, evaluate 행에 [--limitation <text...>] [--json] 추가, graph show 행에 [--mermaid] 추가, recall 행에 [--depth <n>] [--json] 추가, Workspace and config 표에 -V/--version 행 추가, Legacy compatibility 코드블록 예시에 start/fast-track --no-git, clean --force, archive --keep <n>, update --dry-run 옵션 주석 추가",
          "package.json에 keywords 배열 추가 (예: cli, decision-briefing, coding-agent, decision-record, ai-agent-workflow 등 실제 설명과 일치하는 값)",
          "package.json version을 0.8.0으로 변경",
          "README.md/README.ko.md의 'What is new in 0.7.0'/'0.7.0에서 달라진 점' 제목과 bullet을 0.8.0 기준으로 교체: 워크트리 간 ID 충돌 방지, categories 고정 분류 체계(suggest/set/list/browse/tag), recall 개선(DRAFT 결정 노출, 모든 sourceRefs가 CARRIED_FROM/CITES 그래프 엣지화, FTS5/trigram 검색), graph show --mermaid export. 기존 0.7.0 Auto Wiki 내용은 별도 release note(docs/release-0.7.0.md)에 이미 보존되어 있으므로 README에서는 최신 버전만 강조하는 기존 컨벤션 유지",
          "docs/release-0.7.0.md와 동일한 포맷으로 docs/release-0.8.0.md 신규 작성 (User experience, 세부 기능별 섹션, Safety and compatibility, Intentionally not included)"
        ],
        "verificationPlan": [
          "README.md/README.ko.md의 모든 Command reference 표 옵션을 src/cli.ts 실제 Commander 정의와 재대조",
          "npm run build && npm run lint && npm run typecheck로 문서/메타데이터 변경이 빌드에 영향 없음을 확인",
          "npm pack --dry-run(package:check)으로 package.json 변경이 패키징에 문제 없는지 확인"
        ],
        "openQuestionCount": 0
      },
      "renderedMarkdown": "────────────────────────────────────────\nImplementation Brief\n────────────────────────────────────────\nTask: TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비\nsduck 0.8.0 릴리스 준비: README/README.ko 문서 정합성 전면 정비, 누락된 CLI 옵션 문서화, package.json keywords 추가, 버전 0.8.0 승격 및 release note 작성\n\nA. Explicit decisions\n[EXPLICIT] DEC-command-reference-completeness. README.md/README.ko.md Command reference 표에 누락된 실제 CLI 옵션을 채운다\nConfidence: 1.00\nSummary: src/cli.ts 대조 결과 grill complete(--changed-assumption), evaluate(--limitation, --json), graph show(--mermaid), recall(--depth, --json), 루트 -V/--version, legacy start/fast-track(--no-git)/clean(--force)/archive(--keep <n>)/update(--dry-run)이 두 README 표 모두에서 누락돼 있었다. 각 표에 해당 옵션을 실제 cli.ts 시그니처 그대로 추가한다.\nSource refs:\n  - DEC-0074\n  - DEC-0077\n  - DEC-0078\nRationale:\n  - 이미 구현·확정된 CLI 표면인데 문서에 없으면 에이전트/사용자가 존재하는 기능을 모르고 못 씀 -- 특히 --mermaid, recall --json은 이번 세션에 새로 추가된 기능이라 누락 위험이 컸음\nApplies to:\n  - README.md\n  - README.ko.md\n  - src/cli.ts\nAvoids:\n  - 실제 cli.ts 옵션 변경\n  - 표에 없는 옵션을 임의로 추가\n\n[EXPLICIT] DEC-package-json-keywords. package.json에 npm 검색성을 위한 keywords 배열을 추가한다\nConfidence: 0.90\nSummary: package.json 감사 결과 keywords 필드가 아예 없어 npm 레지스트리 검색성에 불리했다. description(\"Terminal-first decision briefing harness for coding agents\")과 실제 기능(decision record, coding agent workflow, CLI)에 부합하는 키워드 배열을 추가한다.\nSource refs:\n  - DEC-readme-categories-docs\nRationale:\n  - 제품으로 배포하는 npm 패키지에서 keywords 부재는 discoverability를 직접 해치는 명백한 누락\nApplies to:\n  - package.json\nAvoids:\n  - description/repository 등 다른 필드 변경\n\n[EXPLICIT] DEC-readme-ko-categories-parity. README.ko.md에 Categories 섹션을 README.md와 1:1 대응으로 추가한다\nConfidence: 1.00\nSummary: 이전 태스크(DEC-readme-categories-docs)에서 README.md에만 Categories 섹션을 추가하고 README.ko.md는 빠뜨렸음을 이번 감사(Explore agent)에서 확인했다. 같은 위치(Decision task flow와 Bounded memory 사이)에 같은 표 구조로 한국어 설명을 추가한다.\nSource refs:\n  - DEC-readme-categories-docs\n  - DEC-0089\n  - DEC-0090\n  - DEC-0091\n  - DEC-0092\n  - DEC-0093\n  - DEC-0094\nRationale:\n  - README.ko.md는 README.md의 '완전한 한국어 counterpart'라고 문서 자체(README.ko.md:44)가 명시하고 있어 섹션 누락은 그 자체로 문서 계약 위반\nApplies to:\n  - README.ko.md\nAvoids:\n  - 영어 표를 그대로 복사(번역하지 않음)\n\n[EXPLICIT] DEC-readme-quickstart-parity. README.md/README.ko.md의 Quick start 스크립트와 EN/KO 패리티 격차를 수정한다\nConfidence: 0.95\nSummary: Explore 감사 결과 Quick start 코드블록에 categories/recall --json/graph --mermaid 사용례가 전혀 없고, README.ko.md는 --record-depth 예시·설명·표 행이 누락되어 있으며 'unless disabled', 'policy-snapshot' 문구도 빠져 있다. 반대로 README.ko.md의 'README 언어 선택과 CLI locale 설정은 서로 독립적' 문장은 README.md에 대응 문장이 없다. Legacy 섹션 제목도 EN은 복수(commands), KO는 단수(command)로 불일치한다. 이 모든 사실 기반 격차를 상호 반영해 두 문서를 동등하게 맞춘다.\nSource refs:\n  - DEC-0074\n  - DEC-0077\n  - DEC-0078\n  - DEC-0089\nRationale:\n  - 제품으로 배포하는 문서에서 언어별로 다른 정보를 주면 사용자가 언어 선택에 따라 다른 기능을 알게 되는 문제가 생김\nApplies to:\n  - README.md\n  - README.ko.md\nAvoids:\n  - 기존 정확한 문장의 의미를 바꾸는 재작성\n  - 구조 변경(섹션 순서 등)\n\n[EXPLICIT] DEC-version-bump-0-8-0. package.json 버전을 0.8.0으로 올리고 README 'What is new' 섹션과 docs/release-0.8.0.md를 신규 작성한다\nConfidence: 1.00\nSummary: 이번 세션에 병합된 커밋(570dedc)이 categories 명령 전체, 워크트리 간 ID 충돌 방지, recall DRAFT 가시성/그래프 엣지(CARRIED_FROM·CITES)/FTS5 검색, graph show --mermaid 등 새 공개 기능을 추가했지만 package.json 버전(0.7.0)이 이를 반영하지 못하고 있었다. 사용자에게 직접 확인해 semver상 새 명령/옵션 추가는 minor 범위라는 판단으로 0.8.0으로 올리고, docs/release-0.7.0.md와 같은 포맷의 docs/release-0.8.0.md를 새로 작성하며, 두 README의 'What is new' 섹션을 0.8.0 최신 기능으로 교체한다(기존 컨벤션상 README는 최신 버전만 강조, 과거 버전은 각자의 release note 파일에 보존됨). git tag/npm publish/push 등 실제 배포 행위는 이번 범위에서 명시적으로 제외한다.\nSource refs:\n  - DEC-0097\n  - DEC-0098\n  - DEC-0089\n  - DEC-0090\n  - DEC-0091\n  - DEC-0092\n  - DEC-0093\n  - DEC-0094\n  - DEC-0074\n  - DEC-0077\n  - DEC-0078\n  - DEC-0085\nRationale:\n  - 사용자가 AskUserQuestion에서 '버전 올리고 release note 추가'를 명시적으로 선택함\n  - docs/release-0.7.0.md가 이미 Auto Wiki 전용으로 확정된 release note이므로 이번 세션 기능을 그 안에 끼워넣는 대신 별도 0.8.0 release note로 분리하는 것이 기존 파일 구조 컨벤션과 일치함\nApplies to:\n  - package.json\n  - README.md\n  - README.ko.md\n  - docs/release-0.8.0.md\nAvoids:\n  - git tag 생성\n  - npm publish\n  - git push\n  - docs/release-0.7.0.md 수정\n\nB. Inferred decisions\n  - none\n\nC. Carried decisions\n  - none\n\nD. Conflicts\n  - none\n\nE. Open decisions\n  - none\n\nProblem:\n  sduck 0.8.0 릴리스 준비: README/README.ko 문서 정합성 전면 정비, 누락된 CLI 옵션 문서화, package.json keywords 추가, 버전 0.8.0 승격 및 release note 작성\nImplementation plan:\n  - README.ko.md의 'Decision task flow' 표와 'Bounded memory' 사이에 Categories 섹션을 README.md와 동일한 내용으로(한국어 표현) 추가\n  - README.md/README.ko.md의 Quick start 코드블록에 'sduck categories suggest/list', 'sduck recall ... --json', 'sduck graph show ... --mermaid' 예시 라인 추가\n  - README.ko.md 빠른 시작에 '--record-depth FULL|LIGHTWEIGHT' 예시 두 줄 추가, Decision task flow 표의 work 행에 --record-depth 반영, Workflow contract 섹션에 record-depth 설명 문장 추가, Guided workflow 섹션에 'policy-snapshot' 문구 추가, init 관련 문장에 'unless disabled(비활성화하지 않은 경우)' 반영\n  - README.md의 'Language and locale' 섹션에 'README 언어 선택과 CLI locale 설정은 서로 독립적' 문장의 영어 대응 bullet 추가\n  - README.md 'Legacy compatibility commands'(복수) 제목에 맞춰 README.ko.md 'Legacy compatibility command'를 복수형으로 통일\n  - 양쪽 README의 Command reference 표에서: grill complete 행에 [--changed-assumption <text>] 추가, evaluate 행에 [--limitation <text...>] [--json] 추가, graph show 행에 [--mermaid] 추가, recall 행에 [--depth <n>] [--json] 추가, Workspace and config 표에 -V/--version 행 추가, Legacy compatibility 코드블록 예시에 start/fast-track --no-git, clean --force, archive --keep <n>, update --dry-run 옵션 주석 추가\n  - package.json에 keywords 배열 추가 (예: cli, decision-briefing, coding-agent, decision-record, ai-agent-workflow 등 실제 설명과 일치하는 값)\n  - package.json version을 0.8.0으로 변경\n  - README.md/README.ko.md의 'What is new in 0.7.0'/'0.7.0에서 달라진 점' 제목과 bullet을 0.8.0 기준으로 교체: 워크트리 간 ID 충돌 방지, categories 고정 분류 체계(suggest/set/list/browse/tag), recall 개선(DRAFT 결정 노출, 모든 sourceRefs가 CARRIED_FROM/CITES 그래프 엣지화, FTS5/trigram 검색), graph show --mermaid export. 기존 0.7.0 Auto Wiki 내용은 별도 release note(docs/release-0.7.0.md)에 이미 보존되어 있으므로 README에서는 최신 버전만 강조하는 기존 컨벤션 유지\n  - docs/release-0.7.0.md와 동일한 포맷으로 docs/release-0.8.0.md 신규 작성 (User experience, 세부 기능별 섹션, Safety and compatibility, Intentionally not included)\nVerification plan:\n  - README.md/README.ko.md의 모든 Command reference 표 옵션을 src/cli.ts 실제 Commander 정의와 재대조\n  - npm run build && npm run lint && npm run typecheck로 문서/메타데이터 변경이 빌드에 영향 없음을 확인\n  - npm pack --dry-run(package:check)으로 package.json 변경이 패키징에 문제 없는지 확인\nScope expected:\n  - README.ko.md에 Categories 섹션 신규 추가 (README.md와 1:1 대응)\n  - README.md/README.ko.md Quick start 스크립트에 categories, recall --json, graph show --mermaid 사용례 추가\n  - README.md/README.ko.md의 EN/KO 패리티 격차 수정 (record-depth 관련 quick start/표/설명, 'unless disabled', 'policy-snapshot' 문구, locale 독립성 문구, Legacy heading 단복수)\n  - README.md/README.ko.md Command reference 표에 실제 cli.ts 옵션 반영 (grill complete --changed-assumption, evaluate --limitation/--json, graph show --mermaid, recall --depth/--json, -V/--version 행, legacy 명령 옵션들)\n  - package.json에 keywords 배열 추가\n  - package.json 버전을 0.8.0으로 올리고 README/README.ko의 'What is new' 섹션을 0.8.0 내용으로 갱신, docs/release-0.8.0.md 신규 작성\nScope avoided:\n  - 실제 CLI 동작/코드 변경 (문서만 수정)\n  - git tag, npm publish, git push 등 실제 배포 행위\n  - CHANGELOG.md 신규 도입 (현재 컨벤션에 없음, 이번 범위 밖)\n  - docs/release-0.7.0.md 등 과거 release note 수정\nOpen questions: 0\nEvidence:\n  - [DISCOVERY] Explore agent audit (this session) (1): README.md/README.ko.md 전체 대조 + src/cli.ts 전체 command/option 목록 대조 + package.json 대조로 15곳 이상의 구체적 격차를 file:line 단위로 확인\n────────────────────────────────────────",
      "gitBaseline": {
        "head": "570dedc385210dcd6648f26560d38d22cd707b4f",
        "dirtyFileHashes": {
          "\".decision/exports/markdown/tasks/TASK-20260818-sduck-0-8-0-/353/246/264/353/246/254/354/212/244-/354/244/200/353/271/204-readme-readme-ko-/353/254/270/354/204/234-/354/240/225/355/225/251/354/204/261-/354/240/204/353/251/264-/354/240/225/353/271/204.md\"": null
        }
      },
      "createdAt": "2026-08-18T10:41:13.492Z"
    }
  ],
  "evaluations": [
    {
      "id": "EVAL-0028",
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "traceId": "IMPL-0047",
      "checks": [
        {
          "name": "build",
          "outcome": "pass"
        },
        {
          "name": "lint",
          "outcome": "pass"
        },
        {
          "name": "typecheck",
          "outcome": "pass"
        },
        {
          "name": "unit-tests",
          "outcome": "173 passed"
        },
        {
          "name": "e2e-tests",
          "outcome": "33 passed"
        },
        {
          "name": "npm-pack-dry-run",
          "outcome": "pass (0.8.0 packaged correctly)"
        }
      ],
      "limitations": [
        "sduck update로 .sduck/sduck-assets/.sduck-version을 동기화하려다 Wiki policy 활성화·CLAUDE.md 관리 블록 초기화 등 의도치 않은 부작용이 발생해 git checkout으로 되돌림; 이 파일 자체는 이번 범위에서 갱신하지 않음(별도 릴리스 작업 필요)"
      ],
      "createdAt": "2026-08-18T10:49:15.084Z"
    }
  ],
  "events": [
    {
      "id": "EVT-0595",
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "type": "TASK_CREATED",
      "payload": {
        "description": "sduck 0.8.0 릴리스 준비: README/README.ko 문서 정합성 전면 정비, 누락된 CLI 옵션 문서화, package.json keywords 추가, 버전 0.8.0 승격 및 release note 작성",
        "policy": {
          "grillMeRequired": true
        }
      },
      "createdAt": "2026-08-18T10:40:01.330Z"
    },
    {
      "id": "EVT-0596",
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "type": "GRILL_STARTED",
      "payload": {
        "automatic": true
      },
      "createdAt": "2026-08-18T10:40:01.330Z"
    },
    {
      "id": "EVT-0597",
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "type": "CONTEXT_INDEXED",
      "payload": {
        "itemCount": 40
      },
      "createdAt": "2026-08-18T10:40:01.634Z"
    },
    {
      "id": "EVT-0598",
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "type": "GRILL_COMPLETED",
      "payload": {
        "reason": "Explore 에이전트로 README.md/README.ko.md/cli.ts/package.json 전체를 대조해 15곳+ 구체적 격차(카테고리 섹션 누락, quick start 스크립트 최신화 필요, grill complete/evaluate/graph show/recall CLI 옵션 문서 누락, EN/KO 패리티 불일치, package.json keywords 부재, 버전이 이번 세션 신규 기능을 반영 못함)를 확인 완료. 버전 처리 방식은 AskUserQuestion으로 사용자에게 직접 확인해 '0.8.0으로 올리고 release note 추가'로 명시적 승인받음. 문서 정합성 수정 자체는 이미 확정된 카테고리/워크트리ID/recall 결정들을 문서에 반영하는 사실 기반 작업이라 추가 질문 불필요.",
        "carried": []
      },
      "createdAt": "2026-08-18T10:40:09.115Z"
    },
    {
      "id": "EVT-0605",
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-readme-ko-categories-parity"
      },
      "createdAt": "2026-08-18T10:41:09.537Z"
    },
    {
      "id": "EVT-0606",
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-readme-quickstart-parity"
      },
      "createdAt": "2026-08-18T10:41:09.538Z"
    },
    {
      "id": "EVT-0607",
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-command-reference-completeness"
      },
      "createdAt": "2026-08-18T10:41:09.538Z"
    },
    {
      "id": "EVT-0608",
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-package-json-keywords"
      },
      "createdAt": "2026-08-18T10:41:09.539Z"
    },
    {
      "id": "EVT-0609",
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-version-bump-0-8-0"
      },
      "createdAt": "2026-08-18T10:41:09.539Z"
    },
    {
      "id": "EVT-0610",
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 5,
        "questions": 0,
        "evidence": 1,
        "expectedScope": [
          "README.ko.md에 Categories 섹션 신규 추가 (README.md와 1:1 대응)",
          "README.md/README.ko.md Quick start 스크립트에 categories, recall --json, graph show --mermaid 사용례 추가",
          "README.md/README.ko.md의 EN/KO 패리티 격차 수정 (record-depth 관련 quick start/표/설명, 'unless disabled', 'policy-snapshot' 문구, locale 독립성 문구, Legacy heading 단복수)",
          "README.md/README.ko.md Command reference 표에 실제 cli.ts 옵션 반영 (grill complete --changed-assumption, evaluate --limitation/--json, graph show --mermaid, recall --depth/--json, -V/--version 행, legacy 명령 옵션들)",
          "package.json에 keywords 배열 추가",
          "package.json 버전을 0.8.0으로 올리고 README/README.ko의 'What is new' 섹션을 0.8.0 내용으로 갱신, docs/release-0.8.0.md 신규 작성"
        ],
        "avoidScope": [
          "실제 CLI 동작/코드 변경 (문서만 수정)",
          "git tag, npm publish, git push 등 실제 배포 행위",
          "CHANGELOG.md 신규 도입 (현재 컨벤션에 없음, 이번 범위 밖)",
          "docs/release-0.7.0.md 등 과거 release note 수정"
        ],
        "implementationPlan": [
          "README.ko.md의 'Decision task flow' 표와 'Bounded memory' 사이에 Categories 섹션을 README.md와 동일한 내용으로(한국어 표현) 추가",
          "README.md/README.ko.md의 Quick start 코드블록에 'sduck categories suggest/list', 'sduck recall ... --json', 'sduck graph show ... --mermaid' 예시 라인 추가",
          "README.ko.md 빠른 시작에 '--record-depth FULL|LIGHTWEIGHT' 예시 두 줄 추가, Decision task flow 표의 work 행에 --record-depth 반영, Workflow contract 섹션에 record-depth 설명 문장 추가, Guided workflow 섹션에 'policy-snapshot' 문구 추가, init 관련 문장에 'unless disabled(비활성화하지 않은 경우)' 반영",
          "README.md의 'Language and locale' 섹션에 'README 언어 선택과 CLI locale 설정은 서로 독립적' 문장의 영어 대응 bullet 추가",
          "README.md 'Legacy compatibility commands'(복수) 제목에 맞춰 README.ko.md 'Legacy compatibility command'를 복수형으로 통일",
          "양쪽 README의 Command reference 표에서: grill complete 행에 [--changed-assumption <text>] 추가, evaluate 행에 [--limitation <text...>] [--json] 추가, graph show 행에 [--mermaid] 추가, recall 행에 [--depth <n>] [--json] 추가, Workspace and config 표에 -V/--version 행 추가, Legacy compatibility 코드블록 예시에 start/fast-track --no-git, clean --force, archive --keep <n>, update --dry-run 옵션 주석 추가",
          "package.json에 keywords 배열 추가 (예: cli, decision-briefing, coding-agent, decision-record, ai-agent-workflow 등 실제 설명과 일치하는 값)",
          "package.json version을 0.8.0으로 변경",
          "README.md/README.ko.md의 'What is new in 0.7.0'/'0.7.0에서 달라진 점' 제목과 bullet을 0.8.0 기준으로 교체: 워크트리 간 ID 충돌 방지, categories 고정 분류 체계(suggest/set/list/browse/tag), recall 개선(DRAFT 결정 노출, 모든 sourceRefs가 CARRIED_FROM/CITES 그래프 엣지화, FTS5/trigram 검색), graph show --mermaid export. 기존 0.7.0 Auto Wiki 내용은 별도 release note(docs/release-0.7.0.md)에 이미 보존되어 있으므로 README에서는 최신 버전만 강조하는 기존 컨벤션 유지",
          "docs/release-0.7.0.md와 동일한 포맷으로 docs/release-0.8.0.md 신규 작성 (User experience, 세부 기능별 섹션, Safety and compatibility, Intentionally not included)"
        ],
        "verificationPlan": [
          "README.md/README.ko.md의 모든 Command reference 표 옵션을 src/cli.ts 실제 Commander 정의와 재대조",
          "npm run build && npm run lint && npm run typecheck로 문서/메타데이터 변경이 빌드에 영향 없음을 확인",
          "npm pack --dry-run(package:check)으로 package.json 변경이 패키징에 문제 없는지 확인"
        ]
      },
      "createdAt": "2026-08-18T10:41:09.539Z"
    },
    {
      "id": "EVT-0611",
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "type": "BRIEF_CONFIRMED",
      "payload": {
        "snapshotId": "BRF-0042"
      },
      "createdAt": "2026-08-18T10:41:13.492Z"
    },
    {
      "id": "EVT-0612",
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "type": "TRACE_CREATED",
      "payload": {
        "traceId": "IMPL-0047",
        "filesChanged": [
          "README.ko.md",
          "README.md",
          "docs/release-0.8.0.md",
          "package.json",
          "tests/e2e/v2-cli.test.ts"
        ]
      },
      "createdAt": "2026-08-18T10:49:06.192Z"
    },
    {
      "id": "EVT-0613",
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "type": "EVALUATION_RECORDED",
      "payload": {
        "evaluationId": "EVAL-0028",
        "traceId": "IMPL-0047"
      },
      "createdAt": "2026-08-18T10:49:15.085Z"
    },
    {
      "id": "EVT-0614",
      "taskId": "TASK-20260818-sduck-0-8-0-릴리스-준비-readme-readme-ko-문서-정합성-전면-정비",
      "type": "TASK_CLOSED",
      "payload": {},
      "createdAt": "2026-08-18T10:49:46.828Z"
    }
  ]
}
```
