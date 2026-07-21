---
id: TASK-20260715-correct-phase-0-contract-fixtures-and-trace
type: task
status: CLOSED
title: Correct Phase 0 contract fixtures and trace
created_at: '2026-07-15T09:49:04.512Z'
updated_at: '2026-07-15T10:32:28.640Z'
---
# TASK-20260715-correct-phase-0-contract-fixtures-and-trace: Correct Phase 0 contract fixtures and trace

Correct Phase 0 contract fixtures and trace

## Sduck source

```json sduck-source
{
  "task": {
    "id": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
    "title": "Correct Phase 0 contract fixtures and trace",
    "description": "Correct Phase 0 contract fixtures and trace",
    "status": "CLOSED",
    "expectedScope": [
      "Phase 0 contract docs and fixtures",
      "static fixture tests",
      "exact corrective trace"
    ],
    "avoidScope": [
      "source-envelope parser implementation",
      "digest runtime implementation",
      "MCP server implementation",
      "unrelated decision records"
    ],
    "createdAt": "2026-07-15T09:49:04.512Z",
    "updatedAt": "2026-07-15T10:32:28.640Z"
  },
  "questions": [],
  "evidence": [
    {
      "id": "EVD-0021",
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "tests/unit/v2-contract-fixtures.test.ts",
      "summary": "Existing static test hashes a canonical fixture but does not assert source/canonical equality or exercise entity sorting.",
      "confidence": 0.95,
      "createdAt": "2026-07-15T09:49:33.516Z"
    },
    {
      "id": "EVD-0022",
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/source-store.ts",
      "summary": "Current parser uses fenced source and legacy frontmatter fallback; Phase 0 must preserve this behavior until envelope implementation.",
      "confidence": 0.95,
      "createdAt": "2026-07-15T09:49:33.516Z"
    },
    {
      "id": "EVD-0023",
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "decisionId": null,
      "sourceType": "IMPLEMENTATION_TRACE",
      "sourceRef": ".decision/exports/markdown/implementations/IMPL-0005.md",
      "summary": "Prior Phase 0 trace aggregates directories and includes unrelated decision records, requiring a narrow corrective trace.",
      "confidence": 0.95,
      "createdAt": "2026-07-15T09:49:33.516Z"
    }
  ],
  "contextItems": [
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
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
      "id": "CTX-0145",
      "createdAt": "2026-07-15T09:49:04.587Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
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
      "id": "CTX-0146",
      "createdAt": "2026-07-15T09:49:04.587Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0015",
      "summary": "Prior decision: Which exact versioned projection and digest contract should bind confirmation? — Use canonical JSON v1 plus SHA-256",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0147",
      "createdAt": "2026-07-15T09:49:04.587Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0017",
      "summary": "Prior decision: What canonical idempotency receipt contract should all 0.6 mutations use? — Canonical receipt events",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0148",
      "createdAt": "2026-07-15T09:49:04.587Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "MEMORY",
      "sourceRef": "IMPL-0005",
      "summary": "Prior implementation trace: Detected 29 changed file(s).",
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
          ".decision/exports/markdown/tasks/TASK-20260715-design-a-repository-scoped-coding-agent-runtime.md",
          ".decision/exports/markdown/tasks/TASK-20260715-implement-the-0-6-mcp-control-plane.md",
          ".ignore",
          "docs/design/",
          "tests/fixtures/brief-digest/",
          "tests/fixtures/source-envelope/",
          "tests/unit/v2-contract-fixtures.test.ts"
        ],
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0149",
      "createdAt": "2026-07-15T09:49:04.587Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
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
      "id": "CTX-0150",
      "createdAt": "2026-07-15T09:49:04.587Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0002",
      "summary": "Decision applies to relevant file tests/e2e/v2-locale-cli.test.ts: Restore coverage through executable coverage, not a lower bar",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "tests/e2e/v2-locale-cli.test.ts"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-0151",
      "createdAt": "2026-07-15T09:49:04.587Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0003",
      "summary": "Prior decision: Clear commit-hook Git variables before validation commands — Keep lint-staged on the commit index, then clear Git local environment variables before typecheck and test commands so nested fixture repositories use their own Git metadata.",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0152",
      "createdAt": "2026-07-15T09:49:04.587Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0010",
      "summary": "Prior decision: Keep 0.7 as an RFC boundary — Current work may define 0.7 interfaces and threat-model constraints, but runtime implementation requires a separately confirmed task after 0.6 pilot evidence.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0153",
      "createdAt": "2026-07-15T09:49:04.587Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0012",
      "summary": "Prior decision: Make automatic context discovery privacy-first — Automatic discovery considers tracked regular files only; untracked paths require explicit addition, symlink escapes are rejected, and canonical records store references, hashes, and curated summaries.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0154",
      "createdAt": "2026-07-15T09:49:04.587Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
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
      "id": "CTX-0155",
      "createdAt": "2026-07-15T09:49:04.587Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0019",
      "summary": "Prior decision: What trace data and CI semantics should sduck verify require? — Bind trace to Git and brief digest",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0156",
      "createdAt": "2026-07-15T09:49:04.587Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0023",
      "summary": "Prior decision: What exact Git-bound trace and sduck verify algorithm should 0.6 use? — Merge-base CI verifier (recommended)",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0157",
      "createdAt": "2026-07-15T09:49:04.587Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "MEMORY",
      "sourceRef": "v2-workflow-is-primary",
      "summary": "Prior decision: Make v2 the single primary documented workflow — Reorganize public documentation, installed agent rules, and v2 next-step guidance around one canonical flow: init → work → context → grill-me → submit → ask/answer → brief/confirm → implement → trace → remember/recall → close.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0158",
      "createdAt": "2026-07-15T09:49:04.587Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0009",
      "summary": "Decision applies to relevant file docs/design/conversational-workflow.md: Authorize only the 0.6 MCP control plane",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "docs/design/conversational-workflow.md"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-0159",
      "createdAt": "2026-07-15T09:49:04.587Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/fixtures/source-envelope/v1/trace-manifest.contract.json",
      "summary": "File evidence: \"kind\": \"trace-manifest\",",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "\"kind\": \"trace-manifest\",",
        "line": 3
      },
      "id": "CTX-0160",
      "createdAt": "2026-07-15T09:49:04.587Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/design/mcp-control-plane-0.6-contract.md",
      "summary": "File evidence: 상태: **CONFIRMED / Phase 0 contract**",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "상태: **CONFIRMED / Phase 0 contract**",
        "line": 3
      },
      "id": "CTX-0161",
      "createdAt": "2026-07-15T09:49:04.587Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/unit/v2-contract-fixtures.test.ts",
      "summary": "File evidence: const briefDigestDir = join(repoRoot, 'tests', 'fixtures', 'brief-digest', 'v1');",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "const briefDigestDir = join(repoRoot, 'tests', 'fixtures', 'brief-digest', 'v1');",
        "line": 10
      },
      "id": "CTX-0162",
      "createdAt": "2026-07-15T09:49:04.587Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/e2e/v2-phase2c-matrix.test.ts",
      "summary": "File evidence: describe('phase 2c v2 localization matrix', () => {",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "describe('phase 2c v2 localization matrix', () => {",
        "line": 10
      },
      "id": "CTX-0163",
      "createdAt": "2026-07-15T09:49:04.587Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/fixtures/source-envelope/v1/decision-envelope.contract.json",
      "summary": "File evidence: \"contractExample\": true,",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "\"contractExample\": true,",
        "line": 4
      },
      "id": "CTX-0164",
      "createdAt": "2026-07-15T09:49:04.587Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/fixtures/source-envelope/v1/receipt-event.contract.json",
      "summary": "File evidence: \"contractExample\": true,",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "\"contractExample\": true,",
        "line": 4
      },
      "id": "CTX-0165",
      "createdAt": "2026-07-15T09:49:04.587Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/fixtures/source-envelope/v1/task-envelope.contract.json",
      "summary": "File evidence: \"contractExample\": true,",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "\"contractExample\": true,",
        "line": 4
      },
      "id": "CTX-0166",
      "createdAt": "2026-07-15T09:49:04.587Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/design/conversational-workflow.md",
      "summary": "File evidence: 상태: HISTORICAL DRAFT — 0.6 확정 계약과 충돌하는 부분은 `docs/design/mcp-control-plane-0.6-contract.md`가 우선한다.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "상태: HISTORICAL DRAFT — 0.6 확정 계약과 충돌하는 부분은 `docs/design/mcp-control-plane-0.6-contract.md`가 우선한다.",
        "line": 3
      },
      "id": "CTX-0167",
      "createdAt": "2026-07-15T09:49:04.588Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/commands/v2/index.ts",
      "summary": "File evidence: import { isV2CommandError, V2CommandError } from './errors.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { isV2CommandError, V2CommandError } from './errors.js';",
        "line": 3
      },
      "id": "CTX-0168",
      "createdAt": "2026-07-15T09:49:04.588Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/e2e/v2-locale-cli.test.ts",
      "summary": "File evidence: import { createAgentCheckboxConfig, renderInitCommandData } from '../../src/commands/init.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { createAgentCheckboxConfig, renderInitCommandData } from '../../src/commands/init.js';",
        "line": 5
      },
      "id": "CTX-0169",
      "createdAt": "2026-07-15T09:49:04.588Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/fixtures/brief-digest/v1/unicode-projection.canonical.json",
      "summary": "File evidence: {\"decisions\":[{\"appliesTo\":[\"questions[].answer\"],\"avoids\":[\"unicode-normalization\"],\"id\":\"DEC-가-0001\",\"kind\":\"EXPLICIT\",\"rationale\":[\"카페 é와 café는 다른 바이트열이다.\",\"emoji ✅도 UTF-8 그대로 해시한다.\"],\"status\":\"CONFIRMED\",\"summary\":\"Approval View V1은 저장",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "{\"decisions\":[{\"appliesTo\":[\"questions[].answer\"],\"avoids\":[\"unicode-normalization\"],\"id\":\"DEC-가-0001\",\"kind\":\"EXPLICIT\",\"rationale\":[\"카페 é와 café는 다른 바이트열이다.\",\"emoji ✅도 UTF-8 그대로 해시한다.\"],\"status\":\"CONFIRMED\",\"summary\":\"Approval View V1은 저장",
        "line": 1
      },
      "id": "CTX-0170",
      "createdAt": "2026-07-15T09:49:04.588Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/fixtures/brief-digest/v1/unicode-projection.source.json",
      "summary": "File evidence: \"id\": \"TASK-unicode-contract\",",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "\"id\": \"TASK-unicode-contract\",",
        "line": 4
      },
      "id": "CTX-0171",
      "createdAt": "2026-07-15T09:49:04.588Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/unit/sdd-core-regression.test.ts",
      "summary": "File evidence: import { runReopenCommand } from '../../src/commands/reopen.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { runReopenCommand } from '../../src/commands/reopen.js';",
        "line": 6
      },
      "id": "CTX-0172",
      "createdAt": "2026-07-15T09:49:04.588Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "DISCOVERY",
      "sourceRef": "AGENTS.md",
      "summary": "File evidence: - Use the CLI for lifecycle changes; do not hand-edit state or cache files.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "- Use the CLI for lifecycle changes; do not hand-edit state or cache files.",
        "line": 12
      },
      "id": "CTX-0173",
      "createdAt": "2026-07-15T09:49:04.588Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "DISCOVERY",
      "sourceRef": "CLAUDE.md",
      "summary": "File evidence: - Use the CLI for lifecycle changes; do not hand-edit state or cache files.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "- Use the CLI for lifecycle changes; do not hand-edit state or cache files.",
        "line": 12
      },
      "id": "CTX-0174",
      "createdAt": "2026-07-15T09:49:04.588Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "DISCOVERY",
      "sourceRef": "README.ko.md",
      "summary": "File evidence: `sduck`는 코딩 에이전트와 개발자가 구현 전에 결정을 맞추도록 돕는 terminal-first decision briefing 도구입니다. 에이전트가 결정, 질문, 근거, 범위를 구조화해 제출하고, 사용자는 brief를 확정한 뒤 구현 결과를 trace로 남기며, 이후 작업에서 과거 결정을 검색해 재사용할 수 있습니다.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "`sduck`는 코딩 에이전트와 개발자가 구현 전에 결정을 맞추도록 돕는 terminal-first decision briefing 도구입니다. 에이전트가 결정, 질문, 근거, 범위를 구조화해 제출하고, 사용자는 brief를 확정한 뒤 구현 결과를 trace로 남기며, 이후 작업에서 과거 결정을 검색해 재사용할 수 있습니다.",
        "line": 5
      },
      "id": "CTX-0175",
      "createdAt": "2026-07-15T09:49:04.588Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "DISCOVERY",
      "sourceRef": "README.md",
      "summary": "File evidence: `sduck` is a terminal-first decision briefing harness for coding agents. It helps a developer and an agent agree on implementation decisions before code changes begin, records the confirmed brief, traces the implementation afterward, and ma",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "`sduck` is a terminal-first decision briefing harness for coding agents. It helps a developer and an agent agree on implementation decisions before code changes begin, records the confirmed brief, traces the implementation afterward, and ma",
        "line": 5
      },
      "id": "CTX-0176",
      "createdAt": "2026-07-15T09:49:04.588Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/commands/abandon.ts",
      "summary": "File evidence: import { runAbandonWorkflow } from '../core/abandon.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { runAbandonWorkflow } from '../core/abandon.js';",
        "line": 1
      },
      "id": "CTX-0177",
      "createdAt": "2026-07-15T09:49:04.588Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/commands/archive.ts",
      "summary": "File evidence: import { renderTable, runCommand, type CommandResult } from './runner.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { renderTable, runCommand, type CommandResult } from './runner.js';",
        "line": 1
      },
      "id": "CTX-0178",
      "createdAt": "2026-07-15T09:49:04.588Z"
    },
    {
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/commands/clean.ts",
      "summary": "File evidence: import { runCommand, type CommandResult } from './runner.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { runCommand, type CommandResult } from './runner.js';",
        "line": 1
      },
      "id": "CTX-0179",
      "createdAt": "2026-07-15T09:49:04.588Z"
    }
  ],
  "briefSnapshots": [
    {
      "id": "BRF-0006",
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "snapshot": {
        "task": {
          "id": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
          "title": "Correct Phase 0 contract fixtures and trace",
          "description": "Correct Phase 0 contract fixtures and trace",
          "status": "CONFIRMED",
          "expectedScope": [
            "Phase 0 contract docs and fixtures",
            "static fixture tests",
            "exact corrective trace"
          ],
          "avoidScope": [
            "source-envelope parser implementation",
            "digest runtime implementation",
            "MCP server implementation",
            "unrelated decision records"
          ],
          "createdAt": "2026-07-15T09:49:04.512Z",
          "updatedAt": "2026-07-15T10:05:47.579Z"
        },
        "decisions": {
          "EXPLICIT": [],
          "INFERRED": [
            {
              "id": "DEC-0026",
              "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
              "title": "Correct Phase 0 fixtures into executable contracts",
              "kind": "INFERRED",
              "status": "CONFIRMED",
              "confidence": 0.7,
              "summary": "Strengthen the digest fixture with out-of-order entities and canonical/source equality; replace permissive envelope examples with explicit contract schemas for source envelopes, confirmation, receipts, traces, verifier output, and MCP tool I/O.",
              "rationale": [
                "Phase 0 review found that current fixture tests do not exercise sorting and accept arbitrary envelope bodies."
              ],
              "appliesTo": [
                "docs/design/mcp-control-plane-0.6-contract.md",
                "tests/fixtures/brief-digest/v1/**",
                "tests/fixtures/source-envelope/v1/**",
                "tests/unit/v2-contract-fixtures.test.ts"
              ],
              "avoids": [
                "Phase 1 source parser behavior changes",
                "MCP runtime implementation"
              ],
              "sourceRefs": [
                ".slim/deepwork/sduck-coding-agent.md"
              ],
              "createdAt": "2026-07-15T09:49:33.516Z",
              "updatedAt": "2026-07-15T10:05:47.579Z"
            },
            {
              "id": "DEC-0027",
              "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
              "title": "Prove legacy parser fallback without implementing envelopes",
              "kind": "INFERRED",
              "status": "CONFIRMED",
              "confidence": 0.7,
              "summary": "The Phase 0 static test must prove the 0.5 parser ignores the envelope body and derives the task only from frontmatter fallback.",
              "rationale": [
                "The current test could pass even if parser behavior changed unexpectedly."
              ],
              "appliesTo": [
                "tests/unit/v2-contract-fixtures.test.ts"
              ],
              "avoids": [
                "loading source-envelope v1 before Phase 1"
              ],
              "sourceRefs": [
                "src/core/v2/source-store.ts"
              ],
              "createdAt": "2026-07-15T09:49:33.516Z",
              "updatedAt": "2026-07-15T10:05:47.579Z"
            },
            {
              "id": "DEC-0028",
              "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
              "title": "Keep exact trace boundaries for corrective work",
              "kind": "INFERRED",
              "status": "CONFIRMED",
              "confidence": 0.7,
              "summary": "The correction trace must map only its precise files; it must not aggregate directories or include abandoned-task records and unrelated workspace artifacts.",
              "rationale": [
                "IMPL-0005 included unrelated untracked records and omitted .prettierignore."
              ],
              "appliesTo": [
                "implementation trace",
                "corrective task scope"
              ],
              "avoids": [
                "broad directory trace entries",
                "unrelated decision exports"
              ],
              "sourceRefs": [
                ".decision/exports/markdown/implementations/IMPL-0005.md"
              ],
              "createdAt": "2026-07-15T09:49:33.516Z",
              "updatedAt": "2026-07-15T10:05:47.579Z"
            }
          ],
          "CARRIED": [],
          "CONFLICT": [],
          "OPEN": []
        },
        "questions": [],
        "evidence": [
          {
            "id": "EVD-0021",
            "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
            "decisionId": null,
            "sourceType": "CODE",
            "sourceRef": "tests/unit/v2-contract-fixtures.test.ts",
            "summary": "Existing static test hashes a canonical fixture but does not assert source/canonical equality or exercise entity sorting.",
            "confidence": 0.95,
            "createdAt": "2026-07-15T09:49:33.516Z"
          },
          {
            "id": "EVD-0022",
            "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
            "decisionId": null,
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/source-store.ts",
            "summary": "Current parser uses fenced source and legacy frontmatter fallback; Phase 0 must preserve this behavior until envelope implementation.",
            "confidence": 0.95,
            "createdAt": "2026-07-15T09:49:33.516Z"
          },
          {
            "id": "EVD-0023",
            "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
            "decisionId": null,
            "sourceType": "IMPLEMENTATION_TRACE",
            "sourceRef": ".decision/exports/markdown/implementations/IMPL-0005.md",
            "summary": "Prior Phase 0 trace aggregates directories and includes unrelated decision records, requiring a narrow corrective trace.",
            "confidence": 0.95,
            "createdAt": "2026-07-15T09:49:33.516Z"
          }
        ],
        "expectedScope": [
          "Phase 0 contract docs and fixtures",
          "static fixture tests",
          "exact corrective trace"
        ],
        "avoidScope": [
          "source-envelope parser implementation",
          "digest runtime implementation",
          "MCP server implementation",
          "unrelated decision records"
        ],
        "openQuestionCount": 0
      },
      "renderedMarkdown": "────────────────────────────────────────\nImplementation Brief\n────────────────────────────────────────\nTask: TASK-20260715-correct-phase-0-contract-fixtures-and-trace\nCorrect Phase 0 contract fixtures and trace\n\nA. Explicit decisions\n  - none\n\nB. Inferred decisions\n[INFERRED] DEC-0026. Correct Phase 0 fixtures into executable contracts\nConfidence: 0.70\nSummary: Strengthen the digest fixture with out-of-order entities and canonical/source equality; replace permissive envelope examples with explicit contract schemas for source envelopes, confirmation, receipts, traces, verifier output, and MCP tool I/O.\nSource refs:\n  - .slim/deepwork/sduck-coding-agent.md\nRationale:\n  - Phase 0 review found that current fixture tests do not exercise sorting and accept arbitrary envelope bodies.\nApplies to:\n  - docs/design/mcp-control-plane-0.6-contract.md\n  - tests/fixtures/brief-digest/v1/**\n  - tests/fixtures/source-envelope/v1/**\n  - tests/unit/v2-contract-fixtures.test.ts\nAvoids:\n  - Phase 1 source parser behavior changes\n  - MCP runtime implementation\n\n[INFERRED] DEC-0027. Prove legacy parser fallback without implementing envelopes\nConfidence: 0.70\nSummary: The Phase 0 static test must prove the 0.5 parser ignores the envelope body and derives the task only from frontmatter fallback.\nSource refs:\n  - src/core/v2/source-store.ts\nRationale:\n  - The current test could pass even if parser behavior changed unexpectedly.\nApplies to:\n  - tests/unit/v2-contract-fixtures.test.ts\nAvoids:\n  - loading source-envelope v1 before Phase 1\n\n[INFERRED] DEC-0028. Keep exact trace boundaries for corrective work\nConfidence: 0.70\nSummary: The correction trace must map only its precise files; it must not aggregate directories or include abandoned-task records and unrelated workspace artifacts.\nSource refs:\n  - .decision/exports/markdown/implementations/IMPL-0005.md\nRationale:\n  - IMPL-0005 included unrelated untracked records and omitted .prettierignore.\nApplies to:\n  - implementation trace\n  - corrective task scope\nAvoids:\n  - broad directory trace entries\n  - unrelated decision exports\n\nC. Carried decisions\n  - none\n\nD. Conflicts\n  - none\n\nE. Open decisions\n  - none\n\nScope expected:\n  - Phase 0 contract docs and fixtures\n  - static fixture tests\n  - exact corrective trace\nScope avoided:\n  - source-envelope parser implementation\n  - digest runtime implementation\n  - MCP server implementation\n  - unrelated decision records\nOpen questions: 0\nEvidence:\n  - [CODE] tests/unit/v2-contract-fixtures.test.ts (0.95): Existing static test hashes a canonical fixture but does not assert source/canonical equality or exercise entity sorting.\n  - [CODE] src/core/v2/source-store.ts (0.95): Current parser uses fenced source and legacy frontmatter fallback; Phase 0 must preserve this behavior until envelope implementation.\n  - [IMPLEMENTATION_TRACE] .decision/exports/markdown/implementations/IMPL-0005.md (0.95): Prior Phase 0 trace aggregates directories and includes unrelated decision records, requiring a narrow corrective trace.\n────────────────────────────────────────",
      "gitBaseline": {
        "head": "4fb70744ee432a5801242673de38551bf9109826",
        "dirtyFileHashes": {
          ".ignore": "d848d497c18118c6142a789e167a989adbc2c2227e371b0164480a6206bab443",
          ".prettierignore": "c0efdf6a8bebcb6f2d5f390eadaad516b16239b1b83914f3005b9efe3f6f0a94",
          "docs/design/conversational-workflow.md": "39393af5444abee5a4146ba56421ec6c39c69856654ec1fd5b5ecae9f81e5809",
          "docs/design/mcp-control-plane-0.6-contract.md": "c2f2aee83c25e135a488d4b49b122bd8a68dc868416e7eec6f4dbece71f8fe86",
          "src/core/v2/doctor.ts": "79ea253f2ac42fc1c932b2c6a41fb787934e5df8081cb98fa5124c6e5bb828d9",
          "src/ui/v2/messages.ts": "10d0fcc3b0e123b57fca81a8527d62547280b74a04850b9b587039d455436517",
          "tests/fixtures/brief-digest/v1/unicode-projection.canonical.json": "d28603306b31895d690eb534a7eee93fab408d12620811d191ba3b3eef71fe37",
          "tests/fixtures/brief-digest/v1/unicode-projection.digest.txt": "a79c946c3e71897f6e4377bd6f093efa8c2f82020dbc56239820611d9d589aee",
          "tests/fixtures/brief-digest/v1/unicode-projection.source.json": "082efb9f1f7778284b9328ad1990524433799d64b6b738f435d90cecbabbe64a",
          "tests/fixtures/source-envelope/v1/decision-envelope.contract.json": "046a714551135bb8f3eec14cda9e69b1f5885d3f3d2103f35297c2e24fd3551a",
          "tests/fixtures/source-envelope/v1/receipt-event.contract.json": "110ff2741ecd0e65b152306eb035448deb20e65883bf32126d8e949dfa3078bc",
          "tests/fixtures/source-envelope/v1/task-envelope.contract.json": "ed0164376a5d05c77a6590948881ca8b969712bf9e550ec1034a38fd9b4f03bb",
          "tests/fixtures/source-envelope/v1/trace-manifest.contract.json": "10b0bdf79b68927864574121505dcd5e1a3edd6f0290082e30f3f69009191bc5",
          "tests/unit/decision-workspace.test.ts": "090255f9a6da0ba5a5248a366832eaf128ffbc0cd7cc8c1284d8c32ca8d098f6",
          "tests/unit/v2-contract-fixtures.test.ts": "e40b1bd2cfbf90a313c3b0655de915ec5d44611c002baa9104aeea7d9525ba30",
          "tests/unit/v2-messages.test.ts": "b31bd9e664b7e68414daca43b52e2e4736df14ec02815b7a553ebd2bfb1491d2"
        }
      },
      "createdAt": "2026-07-15T10:05:47.632Z"
    }
  ],
  "events": [
    {
      "id": "EVT-0088",
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "type": "TASK_CREATED",
      "payload": {
        "description": "Correct Phase 0 contract fixtures and trace",
        "policy": {
          "grillMeRequired": false
        }
      },
      "createdAt": "2026-07-15T09:49:04.513Z"
    },
    {
      "id": "EVT-0089",
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "type": "CONTEXT_INDEXED",
      "payload": {
        "itemCount": 35
      },
      "createdAt": "2026-07-15T09:49:04.588Z"
    },
    {
      "id": "EVT-0090",
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
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
      "createdAt": "2026-07-15T09:49:05.122Z"
    },
    {
      "id": "EVT-0091",
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0026"
      },
      "createdAt": "2026-07-15T09:49:33.516Z"
    },
    {
      "id": "EVT-0092",
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0027"
      },
      "createdAt": "2026-07-15T09:49:33.516Z"
    },
    {
      "id": "EVT-0093",
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0028"
      },
      "createdAt": "2026-07-15T09:49:33.516Z"
    },
    {
      "id": "EVT-0094",
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 3,
        "questions": 0,
        "evidence": 3,
        "expectedScope": [
          "Phase 0 contract docs and fixtures",
          "static fixture tests",
          "exact corrective trace"
        ],
        "avoidScope": [
          "source-envelope parser implementation",
          "digest runtime implementation",
          "MCP server implementation",
          "unrelated decision records"
        ]
      },
      "createdAt": "2026-07-15T09:49:33.517Z"
    },
    {
      "id": "EVT-0095",
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "type": "BRIEF_CONFIRMED",
      "payload": {
        "snapshotId": "BRF-0006"
      },
      "createdAt": "2026-07-15T10:05:47.632Z"
    },
    {
      "id": "EVT-0096",
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "type": "TRACE_CREATED",
      "payload": {
        "traceId": "IMPL-0006",
        "filesChanged": [
          "docs/design/mcp-control-plane-0.6-contract.md",
          "tests/fixtures/brief-digest/v1/unicode-projection.canonical.json",
          "tests/fixtures/brief-digest/v1/unicode-projection.digest.txt",
          "tests/fixtures/brief-digest/v1/unicode-projection.source.json",
          "tests/fixtures/brief-digest/v1/unicode-projection.unsorted-input.json",
          "tests/fixtures/source-envelope/v1/confirmation-snapshot.contract.json",
          "tests/fixtures/source-envelope/v1/decision-envelope.contract.json",
          "tests/fixtures/source-envelope/v1/mcp-tools.contract.json",
          "tests/fixtures/source-envelope/v1/receipt-event.contract.json",
          "tests/fixtures/source-envelope/v1/task-envelope.contract.json",
          "tests/fixtures/source-envelope/v1/trace-manifest.contract.json",
          "tests/fixtures/source-envelope/v1/verifier-result.contract.json",
          "tests/unit/v2-contract-fixtures.test.ts"
        ]
      },
      "createdAt": "2026-07-15T10:12:22.565Z"
    },
    {
      "id": "EVT-0097",
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "type": "EXPORT_WRITTEN",
      "payload": {
        "created": [
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260714-organize-the-complete-workflow-and-update-the-re.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260714-require-a-grill-me-gate-before-new-work-for-all-.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-bump-the-release-version-and-restore-ci-coverage.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-correct-phase-0-contract-fixtures-and-trace.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-design-a-repository-scoped-coding-agent-runtime.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-implement-the-0-6-mcp-control-plane.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-isolate-nested-git-fixture-tests-from-pre-commit.md",
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
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/DECISION_REPORT.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/decision-graph.json"
        ]
      },
      "createdAt": "2026-07-15T10:12:41.217Z"
    },
    {
      "id": "EVT-0098",
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "type": "TRACE_CREATED",
      "payload": {
        "traceId": "IMPL-0007",
        "filesChanged": [
          "docs/design/mcp-control-plane-0.6-contract.md",
          "tests/fixtures/brief-digest/v1/unicode-projection.canonical.json",
          "tests/fixtures/brief-digest/v1/unicode-projection.digest.txt",
          "tests/fixtures/brief-digest/v1/unicode-projection.source.json",
          "tests/fixtures/brief-digest/v1/unicode-projection.unsorted-input.json",
          "tests/fixtures/source-envelope/v1/confirmation-snapshot.contract.json",
          "tests/fixtures/source-envelope/v1/decision-envelope.contract.json",
          "tests/fixtures/source-envelope/v1/mcp-tools.contract.json",
          "tests/fixtures/source-envelope/v1/receipt-event.contract.json",
          "tests/fixtures/source-envelope/v1/task-envelope.contract.json",
          "tests/fixtures/source-envelope/v1/trace-manifest.contract.json",
          "tests/fixtures/source-envelope/v1/verifier-result.contract.json",
          "tests/unit/v2-contract-fixtures.test.ts"
        ]
      },
      "createdAt": "2026-07-15T10:20:42.675Z"
    },
    {
      "id": "EVT-0099",
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "type": "TRACE_CREATED",
      "payload": {
        "traceId": "IMPL-0008",
        "filesChanged": [
          "docs/design/mcp-control-plane-0.6-contract.md",
          "tests/fixtures/brief-digest/v1/unicode-projection.canonical.json",
          "tests/fixtures/brief-digest/v1/unicode-projection.digest.txt",
          "tests/fixtures/brief-digest/v1/unicode-projection.source.json",
          "tests/fixtures/brief-digest/v1/unicode-projection.unsorted-input.json",
          "tests/fixtures/source-envelope/v1/confirmation-snapshot.contract.json",
          "tests/fixtures/source-envelope/v1/decision-envelope.contract.json",
          "tests/fixtures/source-envelope/v1/mcp-tools.contract.json",
          "tests/fixtures/source-envelope/v1/receipt-event.contract.json",
          "tests/fixtures/source-envelope/v1/task-envelope.contract.json",
          "tests/fixtures/source-envelope/v1/trace-manifest.contract.json",
          "tests/fixtures/source-envelope/v1/verifier-result.contract.json",
          "tests/unit/v2-contract-fixtures.test.ts"
        ]
      },
      "createdAt": "2026-07-15T10:27:09.858Z"
    },
    {
      "id": "EVT-0100",
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "type": "EXPORT_WRITTEN",
      "payload": {
        "created": [
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260714-organize-the-complete-workflow-and-update-the-re.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260714-require-a-grill-me-gate-before-new-work-for-all-.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-bump-the-release-version-and-restore-ci-coverage.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-correct-phase-0-contract-fixtures-and-trace.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-design-a-repository-scoped-coding-agent-runtime.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-implement-the-0-6-mcp-control-plane.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-isolate-nested-git-fixture-tests-from-pre-commit.md",
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
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/DECISION_REPORT.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/decision-graph.json"
        ]
      },
      "createdAt": "2026-07-15T10:27:10.147Z"
    },
    {
      "id": "EVT-0101",
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "type": "TRACE_CREATED",
      "payload": {
        "traceId": "IMPL-0009",
        "filesChanged": [
          "docs/design/mcp-control-plane-0.6-contract.md",
          "tests/fixtures/brief-digest/v1/unicode-projection.canonical.json",
          "tests/fixtures/brief-digest/v1/unicode-projection.digest.txt",
          "tests/fixtures/brief-digest/v1/unicode-projection.source.json",
          "tests/fixtures/brief-digest/v1/unicode-projection.unsorted-input.json",
          "tests/fixtures/source-envelope/v1/confirmation-snapshot.contract.json",
          "tests/fixtures/source-envelope/v1/decision-envelope.contract.json",
          "tests/fixtures/source-envelope/v1/mcp-tools.contract.json",
          "tests/fixtures/source-envelope/v1/receipt-event.contract.json",
          "tests/fixtures/source-envelope/v1/task-envelope.contract.json",
          "tests/fixtures/source-envelope/v1/trace-manifest.contract.json",
          "tests/fixtures/source-envelope/v1/verifier-result.contract.json",
          "tests/unit/v2-contract-fixtures.test.ts"
        ]
      },
      "createdAt": "2026-07-15T10:31:27.641Z"
    },
    {
      "id": "EVT-0102",
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "type": "EXPORT_WRITTEN",
      "payload": {
        "created": [
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260714-organize-the-complete-workflow-and-update-the-re.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260714-require-a-grill-me-gate-before-new-work-for-all-.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-bump-the-release-version-and-restore-ci-coverage.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-correct-phase-0-contract-fixtures-and-trace.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-design-a-repository-scoped-coding-agent-runtime.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-implement-the-0-6-mcp-control-plane.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-isolate-nested-git-fixture-tests-from-pre-commit.md",
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
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/DECISION_REPORT.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/decision-graph.json"
        ]
      },
      "createdAt": "2026-07-15T10:31:28.262Z"
    },
    {
      "id": "EVT-0103",
      "taskId": "TASK-20260715-correct-phase-0-contract-fixtures-and-trace",
      "type": "TASK_CLOSED",
      "payload": {},
      "createdAt": "2026-07-15T10:32:28.640Z"
    }
  ]
}
```
