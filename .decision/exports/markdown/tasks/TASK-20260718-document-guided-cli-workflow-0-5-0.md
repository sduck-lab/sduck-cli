---
id: TASK-20260718-document-guided-cli-workflow-0-5-0
type: task
status: CLOSED
title: Document guided CLI workflow 0.5.0
created_at: '2026-07-17T15:05:03.041Z'
updated_at: '2026-07-17T15:10:20.661Z'
---
# TASK-20260718-document-guided-cli-workflow-0-5-0: Document guided CLI workflow 0.5.0

Document guided CLI workflow 0.5.0

## Sduck source

```json sduck-source
{
  "task": {
    "id": "TASK-20260718-document-guided-cli-workflow-0-5-0",
    "title": "Document guided CLI workflow 0.5.0",
    "description": "Document guided CLI workflow 0.5.0",
    "status": "CLOSED",
    "expectedScope": [
      "Add an English 0.5.0 guided-workflow introduction to README.md.",
      "Add equivalent Korean guidance to README.ko.md.",
      "Document task start, automatic grill, grill completion, unified Brief, confirm, trace, evaluate, graph inspection, and close.",
      "State the current compatibility boundary for existing historical tasks and do not claim unimplemented migration or toggle commands."
    ],
    "avoidScope": [
      "CLI behavior changes",
      "migration implementation",
      "workflow enable or disable controls",
      "version bump"
    ],
    "guided": true,
    "createdAt": "2026-07-17T15:05:03.041Z",
    "updatedAt": "2026-07-17T15:10:20.661Z",
    "implementationPlan": [
      "Read the existing English and Korean README workflow sections.",
      "Insert a concise 0.5.0 guided-workflow section with copyable command examples and compatibility notes.",
      "Keep the two language documents behaviorally aligned without changing unrelated legacy documentation."
    ],
    "verificationPlan": [
      "Check README links, command names, and examples against the implemented CLI help.",
      "Run formatting verification for the edited Markdown files.",
      "Review the documentation diff for unsupported product claims."
    ]
  },
  "questions": [],
  "evidence": [
    {
      "id": "EVD-0040",
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/cli.ts",
      "summary": "The implemented CLI exposes work, grill complete, evaluate, and graph show surfaces.",
      "confidence": 1,
      "createdAt": "2026-07-17T15:05:24.895Z"
    },
    {
      "id": "EVD-0041",
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/task-lifecycle.ts",
      "summary": "Guided task gates and legacy compatibility are implemented in the current lifecycle.",
      "confidence": 1,
      "createdAt": "2026-07-17T15:05:24.895Z"
    }
  ],
  "contextItems": [
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0038",
      "summary": "Decision applies to relevant file src/cli.ts: Keep sduck CLI-first and defer the MCP control plane",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/cli.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0283",
      "createdAt": "2026-07-17T15:05:03.134Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0043",
      "summary": "Decision applies to relevant file src/commands/v2/index.ts: Record evaluation separately from implementation trace and gate close",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/commands/v2/index.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0284",
      "createdAt": "2026-07-17T15:05:03.134Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0044",
      "summary": "Decision applies to relevant file src/cli.ts: Expose bounded graph visibility in the CLI",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/cli.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0285",
      "createdAt": "2026-07-17T15:05:03.134Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0046",
      "summary": "Decision applies to relevant file src/commands/v2/index.ts: Defer convenience submission commands until the workflow gates are stable",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "src/commands/v2/index.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0286",
      "createdAt": "2026-07-17T15:05:03.134Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "MEMORY",
      "sourceRef": "english-default-korean-v2-locale",
      "summary": "Prior decision: Default to English and offer a global Korean v2 locale — Use English as the default for CLI output and documentation, publish a Korean README, and provide a user-global locale preference for Korean v2 CLI output; v1 is not localized or redesigned.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0287",
      "createdAt": "2026-07-17T15:05:03.134Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "MEMORY",
      "sourceRef": "v2-workflow-is-primary",
      "summary": "Prior decision: Make v2 the single primary documented workflow — Reorganize public documentation, installed agent rules, and v2 next-step guidance around one canonical flow: init → work → context → grill-me → submit → ask/answer → brief/confirm → implement → trace → remember/recall → close.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0288",
      "createdAt": "2026-07-17T15:05:03.134Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0040",
      "summary": "Prior decision: Start mandatory agent-led grilling when work begins — work automatically starts a grill session and emits context-aware instructions. The agent, not a fixed CLI wizard, generates questions. A reasoned grill completion is required before Brief submission.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0289",
      "createdAt": "2026-07-17T15:05:03.134Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
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
      "id": "CTX-0290",
      "createdAt": "2026-07-17T15:05:03.134Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
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
      "id": "CTX-0291",
      "createdAt": "2026-07-17T15:05:03.134Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
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
      "id": "CTX-0292",
      "createdAt": "2026-07-17T15:05:03.134Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0001",
      "summary": "Decision applies to relevant file README.ko.md: Release the backward-compatible feature set as 0.5.0",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "README.ko.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0293",
      "createdAt": "2026-07-17T15:05:03.134Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0014",
      "summary": "Decision applies to relevant file docs/design/conversational-workflow.md: Supersede conflicting conversational-workflow proposals",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "docs/design/conversational-workflow.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0294",
      "createdAt": "2026-07-17T15:05:03.134Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0045",
      "summary": "Decision applies to relevant file docs/design/conversational-workflow.md: Keep queue coordination separate from decision history",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "docs/design/conversational-workflow.md"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-0295",
      "createdAt": "2026-07-17T15:05:03.134Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0026",
      "summary": "Decision applies to relevant file docs/design/mcp-control-plane-0.6-contract.md: Correct Phase 0 fixtures into executable contracts",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "docs/design/mcp-control-plane-0.6-contract.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0296",
      "createdAt": "2026-07-17T15:05:03.134Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0009",
      "summary": "Decision applies to relevant file src/cli.ts: Authorize only the 0.6 MCP control plane",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/cli.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0297",
      "createdAt": "2026-07-17T15:05:03.134Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0002",
      "summary": "Decision applies to relevant file tests/e2e/sdd-cli-reachability.test.ts: Restore coverage through executable coverage, not a lower bar",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "tests/e2e/sdd-cli-reachability.test.ts"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-0298",
      "createdAt": "2026-07-17T15:05:03.134Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/cli.ts",
      "summary": "File evidence: import { CLI_DESCRIPTION, CLI_NAME, CLI_VERSION } from './core/command-metadata.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { CLI_DESCRIPTION, CLI_NAME, CLI_VERSION } from './core/command-metadata.js';",
        "line": 49
      },
      "id": "CTX-0299",
      "createdAt": "2026-07-17T15:05:03.134Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/e2e/v2-cli.test.ts",
      "summary": "File evidence: import { runCli } from '../helpers/run-cli.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { runCli } from '../helpers/run-cli.js';",
        "line": 7
      },
      "id": "CTX-0300",
      "createdAt": "2026-07-17T15:05:03.134Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/e2e/sdd-cli-reachability.test.ts",
      "summary": "File evidence: import { runCli } from '../helpers/run-cli.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { runCli } from '../helpers/run-cli.js';",
        "line": 5
      },
      "id": "CTX-0301",
      "createdAt": "2026-07-17T15:05:03.134Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/design/conversational-workflow.md",
      "summary": "File evidence: 기록 매체를 CLI JSON 파이프에서 **에이전트 대화**로 옮긴다. 사용자는 평소처럼 에이전트와 대화하고, 결정·질문·답변·확정·트레이스는 MCP 툴 호출의 부산물로 canonical Markdown에 쌓인다. 기존 계약은 유지한다:",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "기록 매체를 CLI JSON 파이프에서 **에이전트 대화**로 옮긴다. 사용자는 평소처럼 에이전트와 대화하고, 결정·질문·답변·확정·트레이스는 MCP 툴 호출의 부산물로 canonical Markdown에 쌓인다. 기존 계약은 유지한다:",
        "line": 9
      },
      "id": "CTX-0302",
      "createdAt": "2026-07-17T15:05:03.135Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/design/mcp-control-plane-0.6-contract.md",
      "summary": "File evidence: 이 문서는 0.6 구현의 규범 계약이다. `conversational-workflow.md`의 초안 제안 중 이 문서와 충돌하는 내용은 이 문서가 우선한다. 0.7 provider/runtime/worktree 실행은 이 문서의 구현 범위가 아니다.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "이 문서는 0.6 구현의 규범 계약이다. `conversational-workflow.md`의 초안 제안 중 이 문서와 충돌하는 내용은 이 문서가 우선한다. 0.7 provider/runtime/worktree 실행은 이 문서의 구현 범위가 아니다.",
        "line": 6
      },
      "id": "CTX-0303",
      "createdAt": "2026-07-17T15:05:03.135Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "DISCOVERY",
      "sourceRef": "README.md",
      "summary": "File evidence: The primary public workflow is v2, stored in `.decision/`. Legacy SDD commands still exist for compatibility, but new documentation and installed agent rules point to the v2 decision briefing flow.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "The primary public workflow is v2, stored in `.decision/`. Legacy SDD commands still exist for compatibility, but new documentation and installed agent rules point to the v2 decision briefing flow.",
        "line": 7
      },
      "id": "CTX-0304",
      "createdAt": "2026-07-17T15:05:03.135Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/e2e/v2-locale-cli.test.ts",
      "summary": "File evidence: import { runCli } from '../helpers/run-cli.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { runCli } from '../helpers/run-cli.js';",
        "line": 8
      },
      "id": "CTX-0305",
      "createdAt": "2026-07-17T15:05:03.135Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/e2e/v2-phase2c-matrix.test.ts",
      "summary": "File evidence: import { runCli } from '../helpers/run-cli.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { runCli } from '../helpers/run-cli.js';",
        "line": 7
      },
      "id": "CTX-0306",
      "createdAt": "2026-07-17T15:05:03.135Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/helpers/run-cli.ts",
      "summary": "File evidence: export interface RunCliResult {",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "export interface RunCliResult {",
        "line": 5
      },
      "id": "CTX-0307",
      "createdAt": "2026-07-17T15:05:03.135Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/unit/sdd-core-regression.test.ts",
      "summary": "File evidence: import { runDoneWorkflow, loadDoneTargets } from '../../src/core/done.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { runDoneWorkflow, loadDoneTargets } from '../../src/core/done.js';",
        "line": 8
      },
      "id": "CTX-0308",
      "createdAt": "2026-07-17T15:05:03.135Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "DISCOVERY",
      "sourceRef": ".backup/AGENT.md",
      "summary": "File evidence: 워크플로우 구조와 규칙은 `sduck` CLI와 동일하다.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "워크플로우 구조와 규칙은 `sduck` CLI와 동일하다.",
        "line": 9
      },
      "id": "CTX-0309",
      "createdAt": "2026-07-17T15:05:03.135Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "DISCOVERY",
      "sourceRef": ".backup/CLAUDE.md",
      "summary": "File evidence: - Follow the repository SDD workflow exactly.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "- Follow the repository SDD workflow exactly.",
        "line": 9
      },
      "id": "CTX-0310",
      "createdAt": "2026-07-17T15:05:03.135Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "DISCOVERY",
      "sourceRef": ".github/workflows/ci.yml",
      "summary": "Path appears relevant to: Document guided CLI workflow 0.5.0",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false
      },
      "id": "CTX-0311",
      "createdAt": "2026-07-17T15:05:03.135Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "DISCOVERY",
      "sourceRef": "AGENTS.md",
      "summary": "File evidence: Use v2 `.decision` briefing as the default workflow. Legacy SDD gates apply only when `current_work_id` is non-null.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "Use v2 `.decision` briefing as the default workflow. Legacy SDD gates apply only when `current_work_id` is non-null.",
        "line": 7
      },
      "id": "CTX-0312",
      "createdAt": "2026-07-17T15:05:03.135Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "DISCOVERY",
      "sourceRef": "CLAUDE.md",
      "summary": "File evidence: Use v2 `.decision` briefing as the default workflow. Legacy SDD gates apply only when `current_work_id` is non-null.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "Use v2 `.decision` briefing as the default workflow. Legacy SDD gates apply only when `current_work_id` is non-null.",
        "line": 7
      },
      "id": "CTX-0313",
      "createdAt": "2026-07-17T15:05:03.135Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/migration.md",
      "summary": "File evidence: # Migration to the Git-native decision workflow",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "# Migration to the Git-native decision workflow",
        "line": 1
      },
      "id": "CTX-0314",
      "createdAt": "2026-07-17T15:05:03.135Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
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
      "id": "CTX-0315",
      "createdAt": "2026-07-17T15:05:03.135Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "DISCOVERY",
      "sourceRef": "README.ko.md",
      "summary": "File evidence: 현재 기본 공개 workflow는 v2 `.decision` workflow입니다. legacy SDD(v1) 명령은 호환성을 위해 남아 있지만, 새 문서와 설치되는 agent rule은 v2 decision briefing을 기본으로 안내합니다.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "현재 기본 공개 workflow는 v2 `.decision` workflow입니다. legacy SDD(v1) 명령은 호환성을 위해 남아 있지만, 새 문서와 설치되는 agent rule은 v2 decision briefing을 기본으로 안내합니다.",
        "line": 7
      },
      "id": "CTX-0316",
      "createdAt": "2026-07-17T15:05:03.135Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/commands/v2/index.ts",
      "summary": "File evidence: `  sduck ${messages.workflow.work} \"<task description>\"`,",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "`  sduck ${messages.workflow.work} \"<task description>\"`,",
        "line": 87
      },
      "id": "CTX-0317",
      "createdAt": "2026-07-17T15:05:03.135Z"
    },
    {
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/command-metadata.ts",
      "summary": "File evidence: export const CLI_NAME = 'sduck';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "export const CLI_NAME = 'sduck';",
        "line": 3
      },
      "id": "CTX-0318",
      "createdAt": "2026-07-17T15:05:03.135Z"
    }
  ],
  "briefSnapshots": [
    {
      "id": "BRF-0009",
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "snapshot": {
        "task": {
          "id": "TASK-20260718-document-guided-cli-workflow-0-5-0",
          "title": "Document guided CLI workflow 0.5.0",
          "description": "Document guided CLI workflow 0.5.0",
          "status": "CONFIRMED",
          "expectedScope": [
            "Add an English 0.5.0 guided-workflow introduction to README.md.",
            "Add equivalent Korean guidance to README.ko.md.",
            "Document task start, automatic grill, grill completion, unified Brief, confirm, trace, evaluate, graph inspection, and close.",
            "State the current compatibility boundary for existing historical tasks and do not claim unimplemented migration or toggle commands."
          ],
          "avoidScope": [
            "CLI behavior changes",
            "migration implementation",
            "workflow enable or disable controls",
            "version bump"
          ],
          "guided": true,
          "createdAt": "2026-07-17T15:05:03.041Z",
          "updatedAt": "2026-07-17T15:05:25.423Z",
          "implementationPlan": [
            "Read the existing English and Korean README workflow sections.",
            "Insert a concise 0.5.0 guided-workflow section with copyable command examples and compatibility notes.",
            "Keep the two language documents behaviorally aligned without changing unrelated legacy documentation."
          ],
          "verificationPlan": [
            "Check README links, command names, and examples against the implemented CLI help.",
            "Run formatting verification for the edited Markdown files.",
            "Review the documentation diff for unsupported product claims."
          ]
        },
        "decisions": {
          "EXPLICIT": [
            {
              "id": "DEC-0047",
              "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
              "title": "Document the implemented 0.5.0 guided workflow without promising future controls",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "README documentation introduces the current CLI-only guided workflow, its commands, and legacy-task compatibility. Migration and enable or disable controls remain unimplemented and are not documented as available.",
              "rationale": [
                "User requested the 0.5.0 introduction first.",
                "New work tasks are guided while historical unmarked tasks retain legacy behavior."
              ],
              "appliesTo": [
                "README.md",
                "README.ko.md"
              ],
              "avoids": [
                "unimplemented migration commands",
                "unimplemented workflow toggles"
              ],
              "sourceRefs": [],
              "createdAt": "2026-07-17T15:05:24.895Z",
              "updatedAt": "2026-07-17T15:05:25.423Z"
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
            "id": "EVD-0040",
            "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
            "decisionId": null,
            "sourceType": "CODE",
            "sourceRef": "src/cli.ts",
            "summary": "The implemented CLI exposes work, grill complete, evaluate, and graph show surfaces.",
            "confidence": 1,
            "createdAt": "2026-07-17T15:05:24.895Z"
          },
          {
            "id": "EVD-0041",
            "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
            "decisionId": null,
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/task-lifecycle.ts",
            "summary": "Guided task gates and legacy compatibility are implemented in the current lifecycle.",
            "confidence": 1,
            "createdAt": "2026-07-17T15:05:24.895Z"
          }
        ],
        "expectedScope": [
          "Add an English 0.5.0 guided-workflow introduction to README.md.",
          "Add equivalent Korean guidance to README.ko.md.",
          "Document task start, automatic grill, grill completion, unified Brief, confirm, trace, evaluate, graph inspection, and close.",
          "State the current compatibility boundary for existing historical tasks and do not claim unimplemented migration or toggle commands."
        ],
        "avoidScope": [
          "CLI behavior changes",
          "migration implementation",
          "workflow enable or disable controls",
          "version bump"
        ],
        "implementationPlan": [
          "Read the existing English and Korean README workflow sections.",
          "Insert a concise 0.5.0 guided-workflow section with copyable command examples and compatibility notes.",
          "Keep the two language documents behaviorally aligned without changing unrelated legacy documentation."
        ],
        "verificationPlan": [
          "Check README links, command names, and examples against the implemented CLI help.",
          "Run formatting verification for the edited Markdown files.",
          "Review the documentation diff for unsupported product claims."
        ],
        "openQuestionCount": 0
      },
      "renderedMarkdown": "────────────────────────────────────────\nImplementation Brief\n────────────────────────────────────────\nTask: TASK-20260718-document-guided-cli-workflow-0-5-0\nDocument guided CLI workflow 0.5.0\n\nA. Explicit decisions\n[EXPLICIT] DEC-0047. Document the implemented 0.5.0 guided workflow without promising future controls\nConfidence: 1.00\nSummary: README documentation introduces the current CLI-only guided workflow, its commands, and legacy-task compatibility. Migration and enable or disable controls remain unimplemented and are not documented as available.\nRationale:\n  - User requested the 0.5.0 introduction first.\n  - New work tasks are guided while historical unmarked tasks retain legacy behavior.\nApplies to:\n  - README.md\n  - README.ko.md\nAvoids:\n  - unimplemented migration commands\n  - unimplemented workflow toggles\n\nB. Inferred decisions\n  - none\n\nC. Carried decisions\n  - none\n\nD. Conflicts\n  - none\n\nE. Open decisions\n  - none\n\nProblem:\n  Document guided CLI workflow 0.5.0\nImplementation plan:\n  - Read the existing English and Korean README workflow sections.\n  - Insert a concise 0.5.0 guided-workflow section with copyable command examples and compatibility notes.\n  - Keep the two language documents behaviorally aligned without changing unrelated legacy documentation.\nVerification plan:\n  - Check README links, command names, and examples against the implemented CLI help.\n  - Run formatting verification for the edited Markdown files.\n  - Review the documentation diff for unsupported product claims.\nScope expected:\n  - Add an English 0.5.0 guided-workflow introduction to README.md.\n  - Add equivalent Korean guidance to README.ko.md.\n  - Document task start, automatic grill, grill completion, unified Brief, confirm, trace, evaluate, graph inspection, and close.\n  - State the current compatibility boundary for existing historical tasks and do not claim unimplemented migration or toggle commands.\nScope avoided:\n  - CLI behavior changes\n  - migration implementation\n  - workflow enable or disable controls\n  - version bump\nOpen questions: 0\nEvidence:\n  - [CODE] src/cli.ts (1): The implemented CLI exposes work, grill complete, evaluate, and graph show surfaces.\n  - [CODE] src/core/v2/task-lifecycle.ts (1): Guided task gates and legacy compatibility are implemented in the current lifecycle.\n────────────────────────────────────────",
      "gitBaseline": {
        "head": "4fb70744ee432a5801242673de38551bf9109826",
        "dirtyFileHashes": {
          ".ignore": "d848d497c18118c6142a789e167a989adbc2c2227e371b0164480a6206bab443",
          ".prettierignore": "c0efdf6a8bebcb6f2d5f390eadaad516b16239b1b83914f3005b9efe3f6f0a94",
          "docs/design/conversational-workflow.md": "39393af5444abee5a4146ba56421ec6c39c69856654ec1fd5b5ecae9f81e5809",
          "docs/design/mcp-control-plane-0.6-contract.md": "54e436b84bcfffcc61c7639e758e40023431f602f09f3bb6dd78e5902a6dfad1",
          "src/cli.ts": "4d6c4c3a60e05c8497978a30c78686263bee8e654268e2ca7edf8ea719a80fd7",
          "src/commands/v2/index.ts": "ab1b35f610cd69737e7673219d9bac5ff5f53f3297b3e8fe806f9dab43a6eed7",
          "src/core/v2/brief.ts": "4cd81145bbbbbd3a7e69f370524d9cddfa351ef61aec4f7a8c3e674bef04910c",
          "src/core/v2/cache-bundle.ts": "0def5debf4fa5090ef1747213fbd44471aa3d61a724fffca31bd30e6b1bc8569",
          "src/core/v2/cache.ts": "b8423bfaea681dd0f837b49ed7096b47cd27e85008207421b993a811871edbae",
          "src/core/v2/context.ts": "d305b5c9a66ceeed0f0949a322edfc1bce772e1fbb8a4530c660f41432a8ff9d",
          "src/core/v2/doctor.ts": "1bee99f9177f6afe4da4049aba9e7b0969e7c6538503639cd3eebd571c0bb26d",
          "src/core/v2/draft.ts": "c373222d8b32c71594658e1dad7c518c789fd4c14ba397885772d91b9dbe404b",
          "src/core/v2/errors.ts": "500aafa4539b9c1c95d64b1aa4243a9324cb9e93c131fd0968c1b4ce5d25ac88",
          "src/core/v2/evaluate.ts": "f56443f1cb102e366fe8ddb1cd27f147a9a568bdc8b336b4cca7580ba641a7fd",
          "src/core/v2/graph.ts": "9ad2cfb846a9e74a2e5bad680506712186ae02188e0729364011b2769ba3029c",
          "src/core/v2/grill.ts": "f3d3ffad0ff3ff7e43b2da5e2e44342762e9c25e0c4729f7aba371f519e952c4",
          "src/core/v2/rebuild.ts": "9ee85e34eebcf29af9841b64e99a9835e98cc44030355daba4549013a30a32d1",
          "src/core/v2/remember.ts": "56ea2d317f8d3aa942405e5f8c1d635c02de62a981e860d2dcececcdd3785f4e",
          "src/core/v2/source-store.ts": "82e0970e7144613d4af8a297e1b10500a777e6620271840ee187de94960da389",
          "src/core/v2/source-types.ts": "3b035cc4c6554eeb0eecda1e10d6e1d4f0aa9cb095afc4f4de0712e1d2ca3018",
          "src/core/v2/status.ts": "5a4fe43c0c1a4f4ba392ff28f7f0fda8bd26e43364416f5afe39423c3d260fee",
          "src/core/v2/store.ts": "999d44718ce057295920c2ba24151061d487b9d2196946892c6dc92060cda4a8",
          "src/core/v2/task-lifecycle.ts": "368dd1ca9ed0fad5f7b8d2bcfa8484682e806a57f5ca3154e071537cc6efcce1",
          "src/core/v2/task.ts": "dc8f901e0bada408498870e78a80fe0873e386a6c7cd5714a6c858669d9b16a8",
          "src/types/index.ts": "28819d470ba40415af71c55e3f465d5eab317e9187ae03e4bc9dea683bac1968",
          "src/ui/v2/messages.ts": "ccd2f9957a44d2be118c36bac89b59a05175753afd89d6ddd1919a98d65cb472",
          "src/ui/v2/render.ts": "5a91e203b3ce21fa648abc44444c4f7d31dcf3a8bb46ee231ae392cbf8a9a752",
          "tests/e2e/v2-cli.test.ts": "9395830a6ea2f19f67e20a37bb8d45bb5b149c4c5f6a157e963c556990c38a04",
          "tests/e2e/v2-locale-cli.test.ts": "5150413cecc21a4a56b7f06b27bc6509b01a6eafab9e5ce5f63cc879c4d95520",
          "tests/e2e/v2-phase2c-matrix.test.ts": "937c175f5f7fdaf4cdfc809d9c1630ffb34c432ac3e84f7b14a5578bc04db7db",
          "tests/fixtures/brief-digest/v1/unicode-projection.canonical.json": "0f74bac6885884c18343d95b688801484985d79ea6f5d29b32398cc181385045",
          "tests/fixtures/brief-digest/v1/unicode-projection.digest.txt": "92983f135b93bf163d319b8438f5662453642644ad1a4784b299e3293f89a26b",
          "tests/fixtures/brief-digest/v1/unicode-projection.source.json": "31a0551bb87ee247bbf87ac1429b9e52fc303f430f09dee03087c862298eb937",
          "tests/fixtures/brief-digest/v1/unicode-projection.unsorted-input.json": "d48401b8851d195130c7229273df23b7bbce261a521b8400947eb4248103150b",
          "tests/fixtures/source-envelope/v1/confirmation-snapshot.contract.json": "6cece7bd8e0dd17a56992b3b441cbc4fc252471e87e64644a211367c23c33da8",
          "tests/fixtures/source-envelope/v1/decision-envelope.contract.json": "79b67887b847294fa1b55cf01ab32ac9cd28e2696c7d491309227a30e46e03bb",
          "tests/fixtures/source-envelope/v1/mcp-tools.contract.json": "0757739b781b3c430d07e6e60dde4a6c6a043139c729f66b0a754bbe94f47d97",
          "tests/fixtures/source-envelope/v1/receipt-event.contract.json": "d1c6d29b899977649fbd8a38760117d18f77901a0db34b686353e1347f153fb7",
          "tests/fixtures/source-envelope/v1/task-envelope.contract.json": "6f15d8c53ac3ec454ea807a9378bdd0567702e1ce24963ddb23e235c9269d32f",
          "tests/fixtures/source-envelope/v1/trace-manifest.contract.json": "9fa0175e5063182e6bcd10a35b04ae661f0824c731e4a060d10d8f12921c331a",
          "tests/fixtures/source-envelope/v1/verifier-result.contract.json": "ad9379ca65d1ca235e1a3988bf48908547aac00b45c2c65835301ff8bb688168",
          "tests/unit/decision-workspace.test.ts": "b4ee0b66332cb6d820f8342d864fa9229de716c67d6360e4d5a507c9d2922731",
          "tests/unit/v2-contract-fixtures.test.ts": "af9b602764822d89578de375ef3c50c86c38a24d20f6c7502ef212a743e396de",
          "tests/unit/v2-lifecycle.test.ts": "8db8733496048ff2c2f58728de5f770ed3fa916156c1451a5be260ce4ff2b618",
          "tests/unit/v2-messages.test.ts": "d17e92613d455c9c6149d5f161cc2c38aa7e848167b8ed72356c8f1843cf892b"
        }
      },
      "createdAt": "2026-07-17T15:05:25.481Z"
    }
  ],
  "events": [
    {
      "id": "EVT-0148",
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "type": "TASK_CREATED",
      "payload": {
        "description": "Document guided CLI workflow 0.5.0",
        "policy": {
          "grillMeRequired": false
        }
      },
      "createdAt": "2026-07-17T15:05:03.041Z"
    },
    {
      "id": "EVT-0149",
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "type": "GRILL_STARTED",
      "payload": {
        "automatic": true
      },
      "createdAt": "2026-07-17T15:05:03.041Z"
    },
    {
      "id": "EVT-0150",
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "type": "CONTEXT_INDEXED",
      "payload": {
        "itemCount": 36
      },
      "createdAt": "2026-07-17T15:05:03.135Z"
    },
    {
      "id": "EVT-0151",
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "type": "GRILL_COMPLETED",
      "payload": {
        "reason": "The requested 0.5.0 documentation scope is clear: introduce the implemented guided CLI workflow and its current compatibility boundary without documenting unimplemented migration or toggle commands.",
        "carried": []
      },
      "createdAt": "2026-07-17T15:05:24.600Z"
    },
    {
      "id": "EVT-0152",
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0047"
      },
      "createdAt": "2026-07-17T15:05:24.896Z"
    },
    {
      "id": "EVT-0153",
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 1,
        "questions": 0,
        "evidence": 2,
        "expectedScope": [
          "Add an English 0.5.0 guided-workflow introduction to README.md.",
          "Add equivalent Korean guidance to README.ko.md.",
          "Document task start, automatic grill, grill completion, unified Brief, confirm, trace, evaluate, graph inspection, and close.",
          "State the current compatibility boundary for existing historical tasks and do not claim unimplemented migration or toggle commands."
        ],
        "avoidScope": [
          "CLI behavior changes",
          "migration implementation",
          "workflow enable or disable controls",
          "version bump"
        ],
        "implementationPlan": [
          "Read the existing English and Korean README workflow sections.",
          "Insert a concise 0.5.0 guided-workflow section with copyable command examples and compatibility notes.",
          "Keep the two language documents behaviorally aligned without changing unrelated legacy documentation."
        ],
        "verificationPlan": [
          "Check README links, command names, and examples against the implemented CLI help.",
          "Run formatting verification for the edited Markdown files.",
          "Review the documentation diff for unsupported product claims."
        ]
      },
      "createdAt": "2026-07-17T15:05:24.896Z"
    },
    {
      "id": "EVT-0154",
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "type": "BRIEF_CONFIRMED",
      "payload": {
        "snapshotId": "BRF-0009"
      },
      "createdAt": "2026-07-17T15:05:25.481Z"
    },
    {
      "id": "EVT-0155",
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "type": "TRACE_CREATED",
      "payload": {
        "traceId": "IMPL-0012",
        "filesChanged": [
          "README.ko.md",
          "README.md"
        ]
      },
      "createdAt": "2026-07-17T15:10:19.761Z"
    },
    {
      "id": "EVT-0156",
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "type": "EVALUATION_RECORDED",
      "payload": {
        "evaluationId": "EVAL-0002",
        "traceId": "IMPL-0012"
      },
      "createdAt": "2026-07-17T15:10:20.061Z"
    },
    {
      "id": "EVT-0157",
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
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
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/DECISION_REPORT.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/decision-graph.json"
        ]
      },
      "createdAt": "2026-07-17T15:10:20.363Z"
    },
    {
      "id": "EVT-0158",
      "taskId": "TASK-20260718-document-guided-cli-workflow-0-5-0",
      "type": "TASK_CLOSED",
      "payload": {},
      "createdAt": "2026-07-17T15:10:20.662Z"
    }
  ]
}
```
