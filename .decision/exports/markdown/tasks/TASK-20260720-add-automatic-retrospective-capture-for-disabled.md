---
id: TASK-20260720-add-automatic-retrospective-capture-for-disabled
type: task
status: CLOSED
title: Add automatic retrospective capture for disabled workflow
created_at: '2026-07-20T03:14:28.389Z'
updated_at: '2026-07-20T03:41:54.548Z'
---
# TASK-20260720-add-automatic-retrospective-capture-for-disabled: Add automatic retrospective capture for disabled workflow

Add automatic retrospective capture for disabled workflow

## Sduck source

```json sduck-source
{
  "task": {
    "id": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
    "title": "Add automatic retrospective capture for disabled workflow",
    "description": "Add automatic retrospective capture for disabled workflow",
    "status": "CLOSED",
    "expectedScope": [
      "Dedicated retrospective capture command only while workflow is disabled",
      "Local post-commit marker installer and idempotent marker consumption",
      "Bundled agent instructions and retrospective skill update",
      "Unit and end-to-end regression coverage"
    ],
    "avoidScope": [
      "Changing ordinary sduck work behavior",
      "An owned LLM runtime",
      "Network or transcript collection",
      "Generic policy bypass flags"
    ],
    "guided": true,
    "createdAt": "2026-07-20T03:14:28.389Z",
    "updatedAt": "2026-07-20T03:41:54.548Z",
    "implementationPlan": [
      "Add a narrow canonical retrospective capture operation and CLI command guarded by disabled workflow state.",
      "Install a local post-commit hook that writes only commit and parent SHAs to a local marker.",
      "Update agent guidance to consume the marker, invoke capture, and clear it only after success.",
      "Cover normal-work rejection, capture behavior, marker handling, hook installation, and CLI localization."
    ],
    "verificationPlan": [
      "Run focused lifecycle and CLI tests for disabled capture, marker clearing, and ordinary work rejection.",
      "Run the full unit and E2E suites plus typecheck, lint, and formatting checks.",
      "Inspect the diff and verify the hook never invokes an LLM, network, or sduck command."
    ]
  },
  "questions": [],
  "evidence": [],
  "contextItems": [
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0053",
      "summary": "Decision applies to relevant file src/core/v2/policy.ts: Store workflow mode as tracked workspace policy",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/core/v2/policy.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0421",
      "createdAt": "2026-07-20T03:14:28.519Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
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
      "id": "CTX-0422",
      "createdAt": "2026-07-20T03:14:28.519Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
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
      "id": "CTX-0423",
      "createdAt": "2026-07-20T03:14:28.519Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
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
      "id": "CTX-0424",
      "createdAt": "2026-07-20T03:14:28.519Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0012",
      "summary": "Decision applies to relevant file src/core/v2/policy.ts: Make automatic context discovery privacy-first",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/core/v2/policy.ts"
        ],
        "reason": "matched by appliesTo symbol hint",
        "score": 0.85
      },
      "id": "CTX-0425",
      "createdAt": "2026-07-20T03:14:28.519Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0016",
      "summary": "Prior decision: What stale-confirmation revision token should 0.6 use in addition to the brief digest? — Digest only",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0426",
      "createdAt": "2026-07-20T03:14:28.520Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0018",
      "summary": "Prior decision: What source-schema migration policy should apply to 0.6 canonical records? — Versioned additive envelope",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0427",
      "createdAt": "2026-07-20T03:14:28.520Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
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
      "id": "CTX-0428",
      "createdAt": "2026-07-20T03:14:28.520Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0025",
      "summary": "Prior decision: What may refresh_context persist automatically in 0.6? — References and hashes only (recommended)",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0429",
      "createdAt": "2026-07-20T03:14:28.520Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0040",
      "summary": "Prior decision: Start mandatory agent-led grilling when work begins — work automatically starts a grill session and emits context-aware instructions. The agent, not a fixed CLI wizard, generates questions. A reasoned grill completion is required before Brief submission.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0430",
      "createdAt": "2026-07-20T03:14:28.520Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
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
      "id": "CTX-0431",
      "createdAt": "2026-07-20T03:14:28.520Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0048",
      "summary": "Decision applies to relevant file AGENTS.md: Bundle a sduck retrospective decision-capture skill",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "AGENTS.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0432",
      "createdAt": "2026-07-20T03:14:28.520Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0050",
      "summary": "Decision applies to relevant file tests/unit/sdd-core-regression.test.ts: Correct retrospective skill to use the supported evaluation interface",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "tests/unit/sdd-core-regression.test.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0433",
      "createdAt": "2026-07-20T03:14:28.520Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0051",
      "summary": "Prior decision: Require corroboration before retrospective EXPLICIT classification — An active LLM handoff alone is not proof of user intent. Mark a decision EXPLICIT only when a user statement or durable source corroborates it; otherwise use INFERRED or record an OPEN question.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0434",
      "createdAt": "2026-07-20T03:14:28.520Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0003",
      "summary": "Prior decision: Clear commit-hook Git variables before validation commands — Keep lint-staged on the commit index, then clear Git local environment variables before typecheck and test commands so nested fixture repositories use their own Git metadata.",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0435",
      "createdAt": "2026-07-20T03:14:28.520Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
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
      "id": "CTX-0436",
      "createdAt": "2026-07-20T03:14:28.520Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0028",
      "summary": "Prior decision: Keep exact trace boundaries for corrective work — The correction trace must map only its precise files; it must not aggregate directories or include abandoned-task records and unrelated workspace artifacts.",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0437",
      "createdAt": "2026-07-20T03:14:28.520Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0029",
      "summary": "Decision applies to relevant file src/ui/v2/messages.ts: Diagnose every invalid state pointer without over-repairing",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "src/ui/v2/messages.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0438",
      "createdAt": "2026-07-20T03:14:28.521Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0052",
      "summary": "Decision applies to relevant file tests/e2e/v2-locale-cli.test.ts: Widen an observed locale E2E timing budget without changing behavior",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "tests/e2e/v2-locale-cli.test.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0439",
      "createdAt": "2026-07-20T03:14:28.521Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0047",
      "summary": "Decision applies to relevant file README.ko.md: Document the implemented 0.5.0 guided workflow without promising future controls",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "README.ko.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0440",
      "createdAt": "2026-07-20T03:14:28.521Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
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
      "id": "CTX-0441",
      "createdAt": "2026-07-20T03:14:28.521Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
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
      "id": "CTX-0442",
      "createdAt": "2026-07-20T03:14:28.521Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
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
      "id": "CTX-0443",
      "createdAt": "2026-07-20T03:14:28.521Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
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
      "id": "CTX-0444",
      "createdAt": "2026-07-20T03:14:28.521Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
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
      "id": "CTX-0445",
      "createdAt": "2026-07-20T03:14:28.521Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0011",
      "summary": "Decision applies to relevant file src/core/v2/policy.ts: Require local digest confirmation by default",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/core/v2/policy.ts"
        ],
        "reason": "matched by appliesTo symbol hint",
        "score": 0.85
      },
      "id": "CTX-0446",
      "createdAt": "2026-07-20T03:14:28.521Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
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
      "id": "CTX-0447",
      "createdAt": "2026-07-20T03:14:28.521Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
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
      "id": "CTX-0448",
      "createdAt": "2026-07-20T03:14:28.523Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
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
      "id": "CTX-0449",
      "createdAt": "2026-07-20T03:14:28.524Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
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
      "id": "CTX-0450",
      "createdAt": "2026-07-20T03:14:28.524Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
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
      "id": "CTX-0451",
      "createdAt": "2026-07-20T03:14:28.524Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
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
      "id": "CTX-0452",
      "createdAt": "2026-07-20T03:14:28.524Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
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
      "id": "CTX-0453",
      "createdAt": "2026-07-20T03:14:28.524Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/commands/v2/index.ts",
      "summary": "File evidence: import { addContextPath, buildContextIndex, getContextPack } from '../../core/v2/context.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { addContextPath, buildContextIndex, getContextPack } from '../../core/v2/context.js';",
        "line": 7
      },
      "id": "CTX-0454",
      "createdAt": "2026-07-20T03:14:28.524Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/v2/policy.ts",
      "summary": "File evidence: workflowEnabled: boolean;",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "workflowEnabled: boolean;",
        "line": 13
      },
      "id": "CTX-0455",
      "createdAt": "2026-07-20T03:14:28.524Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/ui/v2/messages.ts",
      "summary": "File evidence: contextPackFor: (taskId: string) => string;",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "contextPackFor: (taskId: string) => string;",
        "line": 17
      },
      "id": "CTX-0456",
      "createdAt": "2026-07-20T03:14:28.524Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/e2e/v2-locale-cli.test.ts",
      "summary": "File evidence: it('keeps English as the default for root and v2 Commander surfaces', async () => {",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "it('keeps English as the default for root and v2 Commander surfaces', async () => {",
        "line": 73
      },
      "id": "CTX-0457",
      "createdAt": "2026-07-20T03:14:28.524Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/unit/v2-lifecycle.test.ts",
      "summary": "File evidence: runWorkflowDisableCommand,",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "runWorkflowDisableCommand,",
        "line": 9
      },
      "id": "CTX-0458",
      "createdAt": "2026-07-20T03:14:28.525Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/unit/v2-messages.test.ts",
      "summary": "File evidence: 'WORKFLOW_DISABLED',",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "'WORKFLOW_DISABLED',",
        "line": 40
      },
      "id": "CTX-0459",
      "createdAt": "2026-07-20T03:14:28.525Z"
    },
    {
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "sourceType": "DISCOVERY",
      "sourceRef": ".github/workflows/ci.yml",
      "summary": "File evidence: - name: Format",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "- name: Format",
        "line": 33
      },
      "id": "CTX-0460",
      "createdAt": "2026-07-20T03:14:28.525Z"
    }
  ],
  "briefSnapshots": [
    {
      "id": "BRF-0013",
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "snapshot": {
        "task": {
          "id": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
          "title": "Add automatic retrospective capture for disabled workflow",
          "description": "Add automatic retrospective capture for disabled workflow",
          "status": "CONFIRMED",
          "expectedScope": [
            "Dedicated retrospective capture command only while workflow is disabled",
            "Local post-commit marker installer and idempotent marker consumption",
            "Bundled agent instructions and retrospective skill update",
            "Unit and end-to-end regression coverage"
          ],
          "avoidScope": [
            "Changing ordinary sduck work behavior",
            "An owned LLM runtime",
            "Network or transcript collection",
            "Generic policy bypass flags"
          ],
          "guided": true,
          "createdAt": "2026-07-20T03:14:28.389Z",
          "updatedAt": "2026-07-20T03:17:43.077Z",
          "implementationPlan": [
            "Add a narrow canonical retrospective capture operation and CLI command guarded by disabled workflow state.",
            "Install a local post-commit hook that writes only commit and parent SHAs to a local marker.",
            "Update agent guidance to consume the marker, invoke capture, and clear it only after success.",
            "Cover normal-work rejection, capture behavior, marker handling, hook installation, and CLI localization."
          ],
          "verificationPlan": [
            "Run focused lifecycle and CLI tests for disabled capture, marker clearing, and ordinary work rejection.",
            "Run the full unit and E2E suites plus typecheck, lint, and formatting checks.",
            "Inspect the diff and verify the hook never invokes an LLM, network, or sduck command."
          ]
        },
        "decisions": {
          "EXPLICIT": [
            {
              "id": "DEC-0056",
              "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
              "title": "Capture disabled-workflow decisions retrospectively without another prompt",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "A disabled workflow keeps ordinary guided work blocked but permits a dedicated retrospective capture after a commit. A local post-commit marker is consumed best-effort by the agent rule, records concise commit evidence and classifications, and is removed after success.",
              "rationale": [
                "The user approved the simplified internal-tool behavior.",
                "A dedicated command preserves the normal work gate."
              ],
              "appliesTo": [
                "src/cli.ts",
                "src/commands/v2/index.ts",
                "src/core/v2/policy.ts",
                "src/core/v2/retrospective.ts",
                "src/core/init.ts",
                ".sduck/sduck-assets/agent-rules/core.md",
                ".sduck/sduck-assets/agent-rules/skills/sduck-retrospective-capture/SKILL.md"
              ],
              "avoids": [
                "generic workflow bypasses",
                "LLM execution from Git hooks",
                "transcript storage",
                "additional consent/configuration state"
              ],
              "sourceRefs": [
                "conversation:2026-07-20",
                "src/core/v2/policy.ts",
                "src/core/v2/task.ts"
              ],
              "createdAt": "2026-07-20T03:17:38.169Z",
              "updatedAt": "2026-07-20T03:17:43.077Z"
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
          "Dedicated retrospective capture command only while workflow is disabled",
          "Local post-commit marker installer and idempotent marker consumption",
          "Bundled agent instructions and retrospective skill update",
          "Unit and end-to-end regression coverage"
        ],
        "avoidScope": [
          "Changing ordinary sduck work behavior",
          "An owned LLM runtime",
          "Network or transcript collection",
          "Generic policy bypass flags"
        ],
        "implementationPlan": [
          "Add a narrow canonical retrospective capture operation and CLI command guarded by disabled workflow state.",
          "Install a local post-commit hook that writes only commit and parent SHAs to a local marker.",
          "Update agent guidance to consume the marker, invoke capture, and clear it only after success.",
          "Cover normal-work rejection, capture behavior, marker handling, hook installation, and CLI localization."
        ],
        "verificationPlan": [
          "Run focused lifecycle and CLI tests for disabled capture, marker clearing, and ordinary work rejection.",
          "Run the full unit and E2E suites plus typecheck, lint, and formatting checks.",
          "Inspect the diff and verify the hook never invokes an LLM, network, or sduck command."
        ],
        "openQuestionCount": 0
      },
      "renderedMarkdown": "────────────────────────────────────────\nImplementation Brief\n────────────────────────────────────────\nTask: TASK-20260720-add-automatic-retrospective-capture-for-disabled\nAdd automatic retrospective capture for disabled workflow\n\nA. Explicit decisions\n[EXPLICIT] DEC-0056. Capture disabled-workflow decisions retrospectively without another prompt\nConfidence: 1.00\nSummary: A disabled workflow keeps ordinary guided work blocked but permits a dedicated retrospective capture after a commit. A local post-commit marker is consumed best-effort by the agent rule, records concise commit evidence and classifications, and is removed after success.\nSource refs:\n  - conversation:2026-07-20\n  - src/core/v2/policy.ts\n  - src/core/v2/task.ts\nRationale:\n  - The user approved the simplified internal-tool behavior.\n  - A dedicated command preserves the normal work gate.\nApplies to:\n  - src/cli.ts\n  - src/commands/v2/index.ts\n  - src/core/v2/policy.ts\n  - src/core/v2/retrospective.ts\n  - src/core/init.ts\n  - .sduck/sduck-assets/agent-rules/core.md\n  - .sduck/sduck-assets/agent-rules/skills/sduck-retrospective-capture/SKILL.md\nAvoids:\n  - generic workflow bypasses\n  - LLM execution from Git hooks\n  - transcript storage\n  - additional consent/configuration state\n\nB. Inferred decisions\n  - none\n\nC. Carried decisions\n  - none\n\nD. Conflicts\n  - none\n\nE. Open decisions\n  - none\n\nProblem:\n  Add automatic retrospective capture for disabled workflow\nImplementation plan:\n  - Add a narrow canonical retrospective capture operation and CLI command guarded by disabled workflow state.\n  - Install a local post-commit hook that writes only commit and parent SHAs to a local marker.\n  - Update agent guidance to consume the marker, invoke capture, and clear it only after success.\n  - Cover normal-work rejection, capture behavior, marker handling, hook installation, and CLI localization.\nVerification plan:\n  - Run focused lifecycle and CLI tests for disabled capture, marker clearing, and ordinary work rejection.\n  - Run the full unit and E2E suites plus typecheck, lint, and formatting checks.\n  - Inspect the diff and verify the hook never invokes an LLM, network, or sduck command.\nScope expected:\n  - Dedicated retrospective capture command only while workflow is disabled\n  - Local post-commit marker installer and idempotent marker consumption\n  - Bundled agent instructions and retrospective skill update\n  - Unit and end-to-end regression coverage\nScope avoided:\n  - Changing ordinary sduck work behavior\n  - An owned LLM runtime\n  - Network or transcript collection\n  - Generic policy bypass flags\nOpen questions: 0\nEvidence:\n  - none\n────────────────────────────────────────",
      "gitBaseline": {
        "head": "4fb70744ee432a5801242673de38551bf9109826",
        "dirtyFileHashes": {
          ".ignore": "d848d497c18118c6142a789e167a989adbc2c2227e371b0164480a6206bab443",
          ".prettierignore": "c0efdf6a8bebcb6f2d5f390eadaad516b16239b1b83914f3005b9efe3f6f0a94",
          "AGENTS.md": "d994e93914bb9f76b8a97016f42c7bb2f0e16c69a2f19f5905a060517a1814f1",
          "CLAUDE.md": "6edc056cf4264e38f07dfe44173e6ea57edee77c92add2958f7ab77131439a56",
          "README.ko.md": "13c92126f927bdee02fdaa03c521f14cdcb97d5e8602bd0afacd751c310f7e45",
          "README.md": "1834a07134f315fa47d4496353999e9fa315c3f9eb7bc7f0ccd084e6806fc3bc",
          "docs/design/conversational-workflow.md": "39393af5444abee5a4146ba56421ec6c39c69856654ec1fd5b5ecae9f81e5809",
          "docs/design/mcp-control-plane-0.6-contract.md": "54e436b84bcfffcc61c7639e758e40023431f602f09f3bb6dd78e5902a6dfad1",
          "docs/migration.md": "d41713865c2794d93373851921e1a201fdb59afafec764fcae34b6ce62747afa",
          "src/cli.ts": "5463ac01cc0343d31d25206651b851298b62e9c0371ef3f016fbc5b4e8e0d1a8",
          "src/commands/v2/index.ts": "640f3dd3fbcbce639efd97c823c198c64d6830b3946676b166c738543d86fc0d",
          "src/core/assets.ts": "5eca9ef19e2eba94caba8bbe92ed30e1a6793e553e67f8ca673ff3915c1dd0ba",
          "src/core/init.ts": "377eb6e8459da55b30e8c08aea148ed6336289a1a89a636a960976a5bf914e8d",
          "src/core/v2/brief.ts": "4cd81145bbbbbd3a7e69f370524d9cddfa351ef61aec4f7a8c3e674bef04910c",
          "src/core/v2/cache-bundle.ts": "0def5debf4fa5090ef1747213fbd44471aa3d61a724fffca31bd30e6b1bc8569",
          "src/core/v2/cache.ts": "b8423bfaea681dd0f837b49ed7096b47cd27e85008207421b993a811871edbae",
          "src/core/v2/context.ts": "d305b5c9a66ceeed0f0949a322edfc1bce772e1fbb8a4530c660f41432a8ff9d",
          "src/core/v2/doctor.ts": "1bee99f9177f6afe4da4049aba9e7b0969e7c6538503639cd3eebd571c0bb26d",
          "src/core/v2/draft.ts": "c373222d8b32c71594658e1dad7c518c789fd4c14ba397885772d91b9dbe404b",
          "src/core/v2/errors.ts": "88224183c01a7d256a2b546c3af3db9988ed6de442ea928b6d3e79df7e363ec5",
          "src/core/v2/evaluate.ts": "f56443f1cb102e366fe8ddb1cd27f147a9a568bdc8b336b4cca7580ba641a7fd",
          "src/core/v2/graph.ts": "9ad2cfb846a9e74a2e5bad680506712186ae02188e0729364011b2769ba3029c",
          "src/core/v2/grill.ts": "f3d3ffad0ff3ff7e43b2da5e2e44342762e9c25e0c4729f7aba371f519e952c4",
          "src/core/v2/policy.ts": "28e8166ce3c04bc833678734a3e81251556dfc3cd24dadf168ccf7e494e58820",
          "src/core/v2/rebuild.ts": "9ee85e34eebcf29af9841b64e99a9835e98cc44030355daba4549013a30a32d1",
          "src/core/v2/remember.ts": "56ea2d317f8d3aa942405e5f8c1d635c02de62a981e860d2dcececcdd3785f4e",
          "src/core/v2/source-store.ts": "82e0970e7144613d4af8a297e1b10500a777e6620271840ee187de94960da389",
          "src/core/v2/source-types.ts": "3b035cc4c6554eeb0eecda1e10d6e1d4f0aa9cb095afc4f4de0712e1d2ca3018",
          "src/core/v2/status.ts": "5a4fe43c0c1a4f4ba392ff28f7f0fda8bd26e43364416f5afe39423c3d260fee",
          "src/core/v2/store.ts": "999d44718ce057295920c2ba24151061d487b9d2196946892c6dc92060cda4a8",
          "src/core/v2/task-lifecycle.ts": "368dd1ca9ed0fad5f7b8d2bcfa8484682e806a57f5ca3154e071537cc6efcce1",
          "src/core/v2/task.ts": "26807dbdfc2c98cb39a594a439ccc6c6ff564ec80db68a7d2230ba55043b1c21",
          "src/core/v2/workspace.ts": "ff1e4f8f185f6133e143a7724b6de09dd7b342db34b5c7e855aaca8e16cab1bd",
          "src/types/index.ts": "28819d470ba40415af71c55e3f465d5eab317e9187ae03e4bc9dea683bac1968",
          "src/ui/v2/messages.ts": "3fea15e3187e1b90aab62ffb769647380e94f5900e91a0c3b60f15ecbe6371cf",
          "src/ui/v2/render.ts": "5a91e203b3ce21fa648abc44444c4f7d31dcf3a8bb46ee231ae392cbf8a9a752",
          "tests/e2e/sdd-cli-reachability.test.ts": "3c76a399282daafc5a5bacaa37382df1d380156cbd2bf6a0020730e3fc22d98f",
          "tests/e2e/v2-cli.test.ts": "9395830a6ea2f19f67e20a37bb8d45bb5b149c4c5f6a157e963c556990c38a04",
          "tests/e2e/v2-locale-cli.test.ts": "3507d5e39e4a898866c9cae67c2b4ebd95e87f8fe24da43d6e8291e267228748",
          "tests/e2e/v2-phase2c-matrix.test.ts": "d21d090ac5e68f05faca7ce925e5a55ced6fb2ff9bafffcef6de3cd76ac92b05",
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
          "tests/unit/sdd-core-regression.test.ts": "d4c89bccc48352dc4075081418dd4e287128ec876ed37eb0d291f233dddc5ac2",
          "tests/unit/v2-contract-fixtures.test.ts": "af9b602764822d89578de375ef3c50c86c38a24d20f6c7502ef212a743e396de",
          "tests/unit/v2-lifecycle.test.ts": "80de81d8b7c92f44ef0f810fa44ddae0f67f8a511654473f06e08fbd85b304b4",
          "tests/unit/v2-messages.test.ts": "bc851b10991247ab66b93701ad7f20f8cd632834382374a11145d1b66f3c29b6"
        }
      },
      "createdAt": "2026-07-20T03:17:43.137Z"
    }
  ],
  "events": [
    {
      "id": "EVT-0197",
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "type": "TASK_CREATED",
      "payload": {
        "description": "Add automatic retrospective capture for disabled workflow",
        "policy": {
          "grillMeRequired": false
        }
      },
      "createdAt": "2026-07-20T03:14:28.390Z"
    },
    {
      "id": "EVT-0198",
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "type": "GRILL_STARTED",
      "payload": {
        "automatic": true
      },
      "createdAt": "2026-07-20T03:14:28.390Z"
    },
    {
      "id": "EVT-0199",
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "type": "CONTEXT_INDEXED",
      "payload": {
        "itemCount": 40
      },
      "createdAt": "2026-07-20T03:14:28.525Z"
    },
    {
      "id": "EVT-0200",
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "type": "GRILL_COMPLETED",
      "payload": {
        "reason": "The user approved the simplified internal-tool design: disabled workflow allows only retrospective capture; a hook supplies a local commit marker while agent rules perform best-effort capture.",
        "carried": []
      },
      "createdAt": "2026-07-20T03:14:37.709Z"
    },
    {
      "id": "EVT-0201",
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0056"
      },
      "createdAt": "2026-07-20T03:17:38.170Z"
    },
    {
      "id": "EVT-0202",
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 1,
        "questions": 0,
        "evidence": 0,
        "expectedScope": [
          "Dedicated retrospective capture command only while workflow is disabled",
          "Local post-commit marker installer and idempotent marker consumption",
          "Bundled agent instructions and retrospective skill update",
          "Unit and end-to-end regression coverage"
        ],
        "avoidScope": [
          "Changing ordinary sduck work behavior",
          "An owned LLM runtime",
          "Network or transcript collection",
          "Generic policy bypass flags"
        ],
        "implementationPlan": [
          "Add a narrow canonical retrospective capture operation and CLI command guarded by disabled workflow state.",
          "Install a local post-commit hook that writes only commit and parent SHAs to a local marker.",
          "Update agent guidance to consume the marker, invoke capture, and clear it only after success.",
          "Cover normal-work rejection, capture behavior, marker handling, hook installation, and CLI localization."
        ],
        "verificationPlan": [
          "Run focused lifecycle and CLI tests for disabled capture, marker clearing, and ordinary work rejection.",
          "Run the full unit and E2E suites plus typecheck, lint, and formatting checks.",
          "Inspect the diff and verify the hook never invokes an LLM, network, or sduck command."
        ]
      },
      "createdAt": "2026-07-20T03:17:38.170Z"
    },
    {
      "id": "EVT-0203",
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "type": "BRIEF_CONFIRMED",
      "payload": {
        "snapshotId": "BRF-0013"
      },
      "createdAt": "2026-07-20T03:17:43.137Z"
    },
    {
      "id": "EVT-0204",
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "type": "TRACE_CREATED",
      "payload": {
        "traceId": "IMPL-0016",
        "filesChanged": [
          "src/cli.ts",
          "src/commands/v2/index.ts",
          "src/core/assets.ts",
          "src/core/init.ts",
          "src/core/update.ts",
          "src/core/v2/draft.ts",
          "src/core/v2/rebuild.ts",
          "src/core/v2/retrospective.ts",
          "src/core/v2/source-store.ts",
          "src/core/v2/store.ts",
          "src/core/v2/task.ts",
          "src/types/index.ts",
          "src/ui/v2/messages.ts",
          "tests/e2e/sdd-cli-reachability.test.ts",
          "tests/e2e/v2-phase2c-matrix.test.ts",
          "tests/unit/sdd-core-regression.test.ts",
          "tests/unit/v2-lifecycle.test.ts"
        ]
      },
      "createdAt": "2026-07-20T03:41:53.280Z"
    },
    {
      "id": "EVT-0205",
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "type": "EVALUATION_RECORDED",
      "payload": {
        "evaluationId": "EVAL-0004",
        "traceId": "IMPL-0016"
      },
      "createdAt": "2026-07-20T03:41:53.680Z"
    },
    {
      "id": "EVT-0206",
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
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
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/DECISION_REPORT.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/decision-graph.json"
        ]
      },
      "createdAt": "2026-07-20T03:41:54.100Z"
    },
    {
      "id": "EVT-0207",
      "taskId": "TASK-20260720-add-automatic-retrospective-capture-for-disabled",
      "type": "TASK_CLOSED",
      "payload": {},
      "createdAt": "2026-07-20T03:41:54.550Z"
    }
  ]
}
```
