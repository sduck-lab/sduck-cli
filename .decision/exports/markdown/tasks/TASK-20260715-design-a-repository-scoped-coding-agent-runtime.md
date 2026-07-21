---
id: TASK-20260715-design-a-repository-scoped-coding-agent-runtime
type: task
status: ABANDONED
title: Design a repository-scoped coding agent runtime
created_at: '2026-07-15T04:04:08.373Z'
updated_at: '2026-07-15T06:56:44.163Z'
---
# TASK-20260715-design-a-repository-scoped-coding-agent-runtime: Design a repository-scoped coding agent runtime

Design a repository-scoped coding agent runtime

## Sduck source

```json sduck-source
{
  "task": {
    "id": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
    "title": "Design a repository-scoped coding agent runtime",
    "description": "Design a repository-scoped coding agent runtime",
    "status": "ABANDONED",
    "expectedScope": [
      "0.6 core lifecycle and MCP control plane",
      "0.7 bounded coding runtime design",
      "tests, CI verification, docs, and package smoke checks"
    ],
    "avoidScope": [
      "full Hermes feature parity",
      "unbounded autonomous operations",
      "production remote execution before local/Docker validation"
    ],
    "createdAt": "2026-07-15T04:04:08.373Z",
    "updatedAt": "2026-07-15T06:56:44.163Z"
  },
  "questions": [],
  "evidence": [],
  "contextItems": [
    {
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "sourceType": "MEMORY",
      "sourceRef": "english-default-korean-v2-locale",
      "summary": "Prior decision: Default to English and offer a global Korean v2 locale — Use English as the default for CLI output and documentation, publish a Korean README, and provide a user-global locale preference for Korean v2 CLI output; v1 is not localized or redesigned.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0095",
      "createdAt": "2026-07-15T04:04:08.445Z"
    },
    {
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "sourceType": "MEMORY",
      "sourceRef": "v2-workflow-is-primary",
      "summary": "Prior decision: Make v2 the single primary documented workflow — Reorganize public documentation, installed agent rules, and v2 next-step guidance around one canonical flow: init → work → context → grill-me → submit → ask/answer → brief/confirm → implement → trace → remember/recall → close.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0096",
      "createdAt": "2026-07-15T04:04:08.445Z"
    },
    {
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
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
      "id": "CTX-0097",
      "createdAt": "2026-07-15T04:04:08.445Z"
    },
    {
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
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
      "id": "CTX-0098",
      "createdAt": "2026-07-15T04:04:08.445Z"
    },
    {
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "sourceType": "DISCOVERY",
      "sourceRef": ".backup/AGENT.md",
      "summary": "Filename/path appears relevant to: Design a repository-scoped coding agent runtime",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false
      },
      "id": "CTX-0099",
      "createdAt": "2026-07-15T04:04:08.445Z"
    },
    {
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "sourceType": "DISCOVERY",
      "sourceRef": ".idea/copilot.data.migration.ask2agent.xml",
      "summary": "Filename/path appears relevant to: Design a repository-scoped coding agent runtime",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false
      },
      "id": "CTX-0100",
      "createdAt": "2026-07-15T04:04:08.446Z"
    },
    {
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "sourceType": "DISCOVERY",
      "sourceRef": ".sduck/sduck-archive/2026-03/20260319-0209-feature-init-agent-rules/meta.yml",
      "summary": "Filename/path appears relevant to: Design a repository-scoped coding agent runtime",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false
      },
      "id": "CTX-0101",
      "createdAt": "2026-07-15T04:04:08.446Z"
    },
    {
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "sourceType": "DISCOVERY",
      "sourceRef": ".sduck/sduck-archive/2026-03/20260319-0209-feature-init-agent-rules/plan.md",
      "summary": "Filename/path appears relevant to: Design a repository-scoped coding agent runtime",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false
      },
      "id": "CTX-0102",
      "createdAt": "2026-07-15T04:04:08.446Z"
    },
    {
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "sourceType": "DISCOVERY",
      "sourceRef": ".sduck/sduck-archive/2026-03/20260319-0209-feature-init-agent-rules/spec.md",
      "summary": "Filename/path appears relevant to: Design a repository-scoped coding agent runtime",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false
      },
      "id": "CTX-0103",
      "createdAt": "2026-07-15T04:04:08.446Z"
    },
    {
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "sourceType": "DISCOVERY",
      "sourceRef": ".sduck/sduck-archive/2026-03/20260319-0523-fix-init-agent-selection-md-files/meta.yml",
      "summary": "Filename/path appears relevant to: Design a repository-scoped coding agent runtime",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false
      },
      "id": "CTX-0104",
      "createdAt": "2026-07-15T04:04:08.446Z"
    },
    {
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "sourceType": "DISCOVERY",
      "sourceRef": ".sduck/sduck-archive/2026-03/20260319-0523-fix-init-agent-selection-md-files/plan.md",
      "summary": "Filename/path appears relevant to: Design a repository-scoped coding agent runtime",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false
      },
      "id": "CTX-0105",
      "createdAt": "2026-07-15T04:04:08.446Z"
    },
    {
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "sourceType": "DISCOVERY",
      "sourceRef": ".sduck/sduck-archive/2026-03/20260319-0523-fix-init-agent-selection-md-files/spec.md",
      "summary": "Filename/path appears relevant to: Design a repository-scoped coding agent runtime",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false
      },
      "id": "CTX-0106",
      "createdAt": "2026-07-15T04:04:08.446Z"
    },
    {
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "sourceType": "DISCOVERY",
      "sourceRef": ".sduck/sduck-archive/2026-03/20260319-0556-fix-init-execution-result-agents/meta.yml",
      "summary": "Filename/path appears relevant to: Design a repository-scoped coding agent runtime",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false
      },
      "id": "CTX-0107",
      "createdAt": "2026-07-15T04:04:08.446Z"
    },
    {
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "sourceType": "DISCOVERY",
      "sourceRef": ".sduck/sduck-archive/2026-03/20260319-0556-fix-init-execution-result-agents/plan.md",
      "summary": "Filename/path appears relevant to: Design a repository-scoped coding agent runtime",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false
      },
      "id": "CTX-0108",
      "createdAt": "2026-07-15T04:04:08.446Z"
    },
    {
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "sourceType": "DISCOVERY",
      "sourceRef": ".sduck/sduck-archive/2026-03/20260319-0556-fix-init-execution-result-agents/spec.md",
      "summary": "Filename/path appears relevant to: Design a repository-scoped coding agent runtime",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false
      },
      "id": "CTX-0109",
      "createdAt": "2026-07-15T04:04:08.446Z"
    },
    {
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "sourceType": "DISCOVERY",
      "sourceRef": ".sduck/sduck-archive/2026-03/20260319-0604-fix-init-interactive-agent-selection/meta.yml",
      "summary": "Filename/path appears relevant to: Design a repository-scoped coding agent runtime",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false
      },
      "id": "CTX-0110",
      "createdAt": "2026-07-15T04:04:08.446Z"
    },
    {
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "sourceType": "DISCOVERY",
      "sourceRef": ".sduck/sduck-archive/2026-03/20260319-0604-fix-init-interactive-agent-selection/plan.md",
      "summary": "Filename/path appears relevant to: Design a repository-scoped coding agent runtime",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false
      },
      "id": "CTX-0111",
      "createdAt": "2026-07-15T04:04:08.446Z"
    },
    {
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "sourceType": "DISCOVERY",
      "sourceRef": ".sduck/sduck-archive/2026-03/20260319-0604-fix-init-interactive-agent-selection/spec.md",
      "summary": "Filename/path appears relevant to: Design a repository-scoped coding agent runtime",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false
      },
      "id": "CTX-0112",
      "createdAt": "2026-07-15T04:04:08.446Z"
    },
    {
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "sourceType": "DISCOVERY",
      "sourceRef": ".sduck/sduck-archive/2026-03/20260319-0713-fix-agent-rule-doc-parity/meta.yml",
      "summary": "Filename/path appears relevant to: Design a repository-scoped coding agent runtime",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false
      },
      "id": "CTX-0113",
      "createdAt": "2026-07-15T04:04:08.446Z"
    },
    {
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "sourceType": "DISCOVERY",
      "sourceRef": ".sduck/sduck-archive/2026-03/20260319-0713-fix-agent-rule-doc-parity/plan.md",
      "summary": "Filename/path appears relevant to: Design a repository-scoped coding agent runtime",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false
      },
      "id": "CTX-0114",
      "createdAt": "2026-07-15T04:04:08.446Z"
    },
    {
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "sourceType": "DISCOVERY",
      "sourceRef": ".sduck/sduck-archive/2026-03/20260319-0713-fix-agent-rule-doc-parity/spec.md",
      "summary": "Filename/path appears relevant to: Design a repository-scoped coding agent runtime",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false
      },
      "id": "CTX-0115",
      "createdAt": "2026-07-15T04:04:08.446Z"
    },
    {
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "sourceType": "DISCOVERY",
      "sourceRef": ".sduck/sduck-assets/agent-rules/antigravity.md",
      "summary": "Filename/path appears relevant to: Design a repository-scoped coding agent runtime",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false
      },
      "id": "CTX-0116",
      "createdAt": "2026-07-15T04:04:08.446Z"
    },
    {
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "sourceType": "DISCOVERY",
      "sourceRef": ".sduck/sduck-assets/agent-rules/claude-code.md",
      "summary": "Filename/path appears relevant to: Design a repository-scoped coding agent runtime",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false
      },
      "id": "CTX-0117",
      "createdAt": "2026-07-15T04:04:08.446Z"
    },
    {
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "sourceType": "DISCOVERY",
      "sourceRef": ".sduck/sduck-assets/agent-rules/codex.md",
      "summary": "Filename/path appears relevant to: Design a repository-scoped coding agent runtime",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false
      },
      "id": "CTX-0118",
      "createdAt": "2026-07-15T04:04:08.446Z"
    }
  ],
  "briefSnapshots": [],
  "events": [
    {
      "id": "EVT-0040",
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "type": "TASK_CREATED",
      "payload": {
        "description": "Design a repository-scoped coding agent runtime"
      },
      "createdAt": "2026-07-15T04:04:08.374Z"
    },
    {
      "id": "EVT-0041",
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "type": "CONTEXT_INDEXED",
      "payload": {
        "itemCount": 24
      },
      "createdAt": "2026-07-15T04:04:08.446Z"
    },
    {
      "id": "EVT-0042",
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "type": "GRILL_STARTED",
      "payload": {
        "prompt": "Interview the user relentlessly about every aspect of this plan until shared understanding is reached.\nWalk down each branch of the design tree, resolving dependencies between decisions one-by-one.\nAsk one question at a time.\nFor each question, provide a recommended answer and rationale.\nIf a question can be answered by exploring the codebase, explore the codebase instead and cite evidence/source refs.\nDo not ask what can already be inferred from context.\nClassify outcomes as EXPLICIT, INFERRED, CARRIED, CONFLICT, or OPEN decisions.\nWhen the decision tree is sufficiently resolved, submit a structured draft with `sduck submit --stdin`.",
        "protocol": [
          "Ask one question at a time.",
          "Do not ask what can be inferred from context.",
          "Provide a recommended answer with rationale.",
          "Separate EXPLICIT, INFERRED, CARRIED, CONFLICT, and OPEN decisions.",
          "Submit structured draft with `sduck submit --stdin`."
        ]
      },
      "createdAt": "2026-07-15T04:07:13.635Z"
    },
    {
      "id": "EVT-0043",
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0004"
      },
      "createdAt": "2026-07-15T04:10:18.099Z"
    },
    {
      "id": "EVT-0044",
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0005"
      },
      "createdAt": "2026-07-15T04:10:18.099Z"
    },
    {
      "id": "EVT-0045",
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0006"
      },
      "createdAt": "2026-07-15T04:10:18.099Z"
    },
    {
      "id": "EVT-0046",
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0007"
      },
      "createdAt": "2026-07-15T04:10:18.099Z"
    },
    {
      "id": "EVT-0047",
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0008"
      },
      "createdAt": "2026-07-15T04:10:18.099Z"
    },
    {
      "id": "EVT-0048",
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 5,
        "questions": 0,
        "evidence": 0,
        "expectedScope": [
          "0.6 core lifecycle and MCP control plane",
          "0.7 bounded coding runtime design",
          "tests, CI verification, docs, and package smoke checks"
        ],
        "avoidScope": [
          "full Hermes feature parity",
          "unbounded autonomous operations",
          "production remote execution before local/Docker validation"
        ]
      },
      "createdAt": "2026-07-15T04:10:18.099Z"
    },
    {
      "id": "EVT-0049",
      "taskId": "TASK-20260715-design-a-repository-scoped-coding-agent-runtime",
      "type": "TASK_ABANDONED",
      "payload": {},
      "createdAt": "2026-07-15T06:56:44.163Z"
    }
  ]
}
```
