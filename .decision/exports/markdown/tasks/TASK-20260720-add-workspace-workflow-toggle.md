---
id: TASK-20260720-add-workspace-workflow-toggle
type: task
status: CLOSED
title: Add workspace workflow toggle
created_at: '2026-07-20T02:25:11.799Z'
updated_at: '2026-07-20T02:52:21.034Z'
---
# TASK-20260720-add-workspace-workflow-toggle: Add workspace workflow toggle

Add workspace workflow toggle

## Sduck source

```json sduck-source
{
  "task": {
    "id": "TASK-20260720-add-workspace-workflow-toggle",
    "title": "Add workspace workflow toggle",
    "description": "Add workspace workflow toggle",
    "status": "CLOSED",
    "expectedScope": [
      "Add additive tracked workflow mode policy with backward-compatible default.",
      "Add enable, disable, and status CLI commands with EN/KO output and typed errors.",
      "Block only new work while disabled and refuse policy change with a current non-terminal task.",
      "Update README workflow documentation and targeted unit/E2E/locale coverage."
    ],
    "avoidScope": [
      "global configuration",
      "per-task bypass",
      "task record conversion/deletion",
      "retrospective capture changes"
    ],
    "guided": true,
    "createdAt": "2026-07-20T02:25:11.799Z",
    "updatedAt": "2026-07-20T02:52:21.034Z",
    "implementationPlan": [
      "Map policy, task creation, lifecycle, CLI, and locale seams.",
      "Implement mode read/write and command guards while preserving legacy policy/task behavior.",
      "Add documentation and regression coverage for toggling, active-task refusal, and disabled-work rejection."
    ],
    "verificationPlan": [
      "Run focused policy/CLI/locale tests.",
      "Run full test suite, typecheck, lint, and format check.",
      "Manually verify enable/disable/status help and disabled work error."
    ]
  },
  "questions": [],
  "evidence": [
    {
      "id": "EVD-0047",
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/policy.ts",
      "summary": "Current workspace policy already governs grill requirements.",
      "confidence": 1,
      "createdAt": "2026-07-20T02:25:48.090Z"
    },
    {
      "id": "EVD-0048",
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/task.ts",
      "summary": "Task creation owns guided task markers and current task state.",
      "confidence": 1,
      "createdAt": "2026-07-20T02:25:48.090Z"
    }
  ],
  "contextItems": [
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
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
      "id": "CTX-0381",
      "createdAt": "2026-07-20T02:25:11.918Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
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
      "id": "CTX-0382",
      "createdAt": "2026-07-20T02:25:11.918Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0012",
      "summary": "Prior decision: Make automatic context discovery privacy-first — Automatic discovery considers tracked regular files only; untracked paths require explicit addition, symlink escapes are rejected, and canonical records store references, hashes, and curated summaries.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0383",
      "createdAt": "2026-07-20T02:25:11.919Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0016",
      "summary": "Prior decision: What stale-confirmation revision token should 0.6 use in addition to the brief digest? — Digest only",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0384",
      "createdAt": "2026-07-20T02:25:11.919Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0018",
      "summary": "Prior decision: What source-schema migration policy should apply to 0.6 canonical records? — Versioned additive envelope",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0385",
      "createdAt": "2026-07-20T02:25:11.919Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "sourceType": "MEMORY",
      "sourceRef": "global-locale-config-shape",
      "summary": "Prior decision: Use an XDG-compatible global locale configuration — Add `sduck config locale en|ko`, persisting the preference in a user-global XDG-compatible config location with English fallback; preserve it independently of project initialization.",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0386",
      "createdAt": "2026-07-20T02:25:11.919Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
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
      "id": "CTX-0387",
      "createdAt": "2026-07-20T02:25:11.919Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0028",
      "summary": "Prior decision: Keep exact trace boundaries for corrective work — The correction trace must map only its precise files; it must not aggregate directories or include abandoned-task records and unrelated workspace artifacts.",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0388",
      "createdAt": "2026-07-20T02:25:11.919Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
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
      "id": "CTX-0389",
      "createdAt": "2026-07-20T02:25:11.919Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
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
      "id": "CTX-0390",
      "createdAt": "2026-07-20T02:25:11.919Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "sourceType": "MEMORY",
      "sourceRef": "IMPL-0010",
      "summary": "Prior implementation trace: Detected 4 changed file(s).",
      "metadata": {
        "type": "implementation_trace",
        "filesChanged": [
          "src/core/v2/doctor.ts",
          "src/ui/v2/messages.ts",
          "tests/unit/decision-workspace.test.ts",
          "tests/unit/v2-messages.test.ts"
        ],
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0391",
      "createdAt": "2026-07-20T02:25:11.919Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
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
      "id": "CTX-0392",
      "createdAt": "2026-07-20T02:25:11.919Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
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
      "id": "CTX-0393",
      "createdAt": "2026-07-20T02:25:11.919Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
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
      "id": "CTX-0394",
      "createdAt": "2026-07-20T02:25:11.919Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
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
      "id": "CTX-0395",
      "createdAt": "2026-07-20T02:25:11.920Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
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
      "id": "CTX-0396",
      "createdAt": "2026-07-20T02:25:11.920Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
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
      "id": "CTX-0397",
      "createdAt": "2026-07-20T02:25:11.920Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
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
      "id": "CTX-0398",
      "createdAt": "2026-07-20T02:25:11.920Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
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
      "id": "CTX-0399",
      "createdAt": "2026-07-20T02:25:11.920Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
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
      "id": "CTX-0400",
      "createdAt": "2026-07-20T02:25:11.920Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
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
      "id": "CTX-0401",
      "createdAt": "2026-07-20T02:25:11.920Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
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
      "id": "CTX-0402",
      "createdAt": "2026-07-20T02:25:11.920Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0002",
      "summary": "Decision applies to relevant file tests/e2e/v2-cli.test.ts: Restore coverage through executable coverage, not a lower bar",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "tests/e2e/v2-cli.test.ts"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-0403",
      "createdAt": "2026-07-20T02:25:11.920Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/v2/decision-workspace.ts",
      "summary": "File evidence: import { withDecisionWorkspaceLock } from './workspace-lock.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { withDecisionWorkspaceLock } from './workspace-lock.js';",
        "line": 24
      },
      "id": "CTX-0404",
      "createdAt": "2026-07-20T02:25:11.920Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/workspace.ts",
      "summary": "File evidence: import { readFile, readdir } from 'node:fs/promises';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { readFile, readdir } from 'node:fs/promises';",
        "line": 1
      },
      "id": "CTX-0405",
      "createdAt": "2026-07-20T02:25:11.920Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/ui/v2/messages.ts",
      "summary": "File evidence: workflow: {",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "workflow: {",
        "line": 128
      },
      "id": "CTX-0406",
      "createdAt": "2026-07-20T02:25:11.920Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/unit/decision-workspace.test.ts",
      "summary": "File evidence: DecisionWorkspace,",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "DecisionWorkspace,",
        "line": 8
      },
      "id": "CTX-0407",
      "createdAt": "2026-07-20T02:25:11.920Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/design/conversational-workflow.md",
      "summary": "File evidence: - **동시성**: 모든 mutation은 `DecisionWorkspace.mutate()` → `withDecisionWorkspaceLock` 직렬화. 장수명 MCP 프로세스 + CLI 동시 실행 안전. 상태는 매 호출 디스크에서 읽으므로 서버는 stateless.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "- **동시성**: 모든 mutation은 `DecisionWorkspace.mutate()` → `withDecisionWorkspaceLock` 직렬화. 장수명 MCP 프로세스 + CLI 동시 실행 안전. 상태는 매 호출 디스크에서 읽으므로 서버는 stateless.",
        "line": 30
      },
      "id": "CTX-0408",
      "createdAt": "2026-07-20T02:25:11.920Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
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
      "id": "CTX-0409",
      "createdAt": "2026-07-20T02:25:11.921Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
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
      "id": "CTX-0410",
      "createdAt": "2026-07-20T02:25:11.921Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/use-cases.md",
      "summary": "File evidence: 1. 개발자가 작업을 시작한다: `sduck work \"add payment retry support\"`",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "1. 개발자가 작업을 시작한다: `sduck work \"add payment retry support\"`",
        "line": 17
      },
      "id": "CTX-0411",
      "createdAt": "2026-07-20T02:25:11.921Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
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
      "id": "CTX-0412",
      "createdAt": "2026-07-20T02:25:11.921Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
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
      "id": "CTX-0413",
      "createdAt": "2026-07-20T02:25:11.921Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/cli.ts",
      "summary": "File evidence: runContextAddCommand,",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "runContextAddCommand,",
        "line": 30
      },
      "id": "CTX-0414",
      "createdAt": "2026-07-20T02:25:11.921Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
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
      "id": "CTX-0415",
      "createdAt": "2026-07-20T02:25:11.921Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/done.ts",
      "summary": "File evidence: import type { WorkspaceTaskSummary } from './workspace.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import type { WorkspaceTaskSummary } from './workspace.js';",
        "line": 12
      },
      "id": "CTX-0416",
      "createdAt": "2026-07-20T02:25:11.921Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/v2/workspace-lock.ts",
      "summary": "File evidence: export function withDecisionWorkspaceLock<T>(projectRoot: string, operation: () => T): T {",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "export function withDecisionWorkspaceLock<T>(projectRoot: string, operation: () => T): T {",
        "line": 10
      },
      "id": "CTX-0417",
      "createdAt": "2026-07-20T02:25:11.921Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/v2/workspace.ts",
      "summary": "File evidence: export interface InitWorkspaceResult {",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "export interface InitWorkspaceResult {",
        "line": 16
      },
      "id": "CTX-0418",
      "createdAt": "2026-07-20T02:25:11.921Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/e2e/v2-cli.test.ts",
      "summary": "File evidence: import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';",
        "line": 8
      },
      "id": "CTX-0419",
      "createdAt": "2026-07-20T02:25:11.921Z"
    },
    {
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/e2e/v2-phase2c-matrix.test.ts",
      "summary": "File evidence: import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';",
        "line": 8
      },
      "id": "CTX-0420",
      "createdAt": "2026-07-20T02:25:11.921Z"
    }
  ],
  "briefSnapshots": [
    {
      "id": "BRF-0012",
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "snapshot": {
        "task": {
          "id": "TASK-20260720-add-workspace-workflow-toggle",
          "title": "Add workspace workflow toggle",
          "description": "Add workspace workflow toggle",
          "status": "CONFIRMED",
          "expectedScope": [
            "Add additive tracked workflow mode policy with backward-compatible default.",
            "Add enable, disable, and status CLI commands with EN/KO output and typed errors.",
            "Block only new work while disabled and refuse policy change with a current non-terminal task.",
            "Update README workflow documentation and targeted unit/E2E/locale coverage."
          ],
          "avoidScope": [
            "global configuration",
            "per-task bypass",
            "task record conversion/deletion",
            "retrospective capture changes"
          ],
          "guided": true,
          "createdAt": "2026-07-20T02:25:11.799Z",
          "updatedAt": "2026-07-20T02:25:48.525Z",
          "implementationPlan": [
            "Map policy, task creation, lifecycle, CLI, and locale seams.",
            "Implement mode read/write and command guards while preserving legacy policy/task behavior.",
            "Add documentation and regression coverage for toggling, active-task refusal, and disabled-work rejection."
          ],
          "verificationPlan": [
            "Run focused policy/CLI/locale tests.",
            "Run full test suite, typecheck, lint, and format check.",
            "Manually verify enable/disable/status help and disabled work error."
          ]
        },
        "decisions": {
          "EXPLICIT": [
            {
              "id": "DEC-0053",
              "taskId": "TASK-20260720-add-workspace-workflow-toggle",
              "title": "Store workflow mode as tracked workspace policy",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Add an additive workflow mode to `.decision/policy.json`. Missing legacy policy defaults to enabled for new work; the setting is reviewed and versioned with the project.",
              "rationale": [
                "Users need a durable on/off choice that applies to the workspace rather than a global machine preference."
              ],
              "appliesTo": [
                "src/core/v2/policy.ts",
                "src/core/v2/workspace.ts",
                "src/core/v2/task.ts"
              ],
              "avoids": [
                "global user setting",
                "untracked state"
              ],
              "sourceRefs": [],
              "createdAt": "2026-07-20T02:25:48.090Z",
              "updatedAt": "2026-07-20T02:25:48.525Z"
            },
            {
              "id": "DEC-0054",
              "taskId": "TASK-20260720-add-workspace-workflow-toggle",
              "title": "Disable only new work creation and preserve existing records",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "workflow disable rejects new sduck work creation but keeps read-only commands available and never rewrites or relaxes existing task gates. It refuses while any current non-terminal task is active; users must close or abandon first.",
              "rationale": [
                "Turning off workflow must not silently discard approval or trace history."
              ],
              "appliesTo": [
                "src/cli.ts",
                "src/commands/v2/index.ts",
                "src/core/v2/task.ts",
                "src/core/v2/task-lifecycle.ts"
              ],
              "avoids": [
                "per-task gate bypass",
                "record deletion",
                "active task mutation"
              ],
              "sourceRefs": [],
              "createdAt": "2026-07-20T02:25:48.090Z",
              "updatedAt": "2026-07-20T02:25:48.525Z"
            },
            {
              "id": "DEC-0055",
              "taskId": "TASK-20260720-add-workspace-workflow-toggle",
              "title": "Provide explicit workspace workflow commands",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Expose `sduck workflow status`, `sduck workflow enable`, and `sduck workflow disable`; localize text and document the mode. Enable resumes guided creation for later work only.",
              "rationale": [
                "A visible CLI surface makes the mode auditable and reversible."
              ],
              "appliesTo": [
                "src/cli.ts",
                "src/commands/v2/index.ts",
                "src/ui/v2/messages.ts",
                "README.md",
                "README.ko.md"
              ],
              "avoids": [
                "implicit mode switching"
              ],
              "sourceRefs": [],
              "createdAt": "2026-07-20T02:25:48.090Z",
              "updatedAt": "2026-07-20T02:25:48.525Z"
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
            "id": "EVD-0047",
            "taskId": "TASK-20260720-add-workspace-workflow-toggle",
            "decisionId": null,
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/policy.ts",
            "summary": "Current workspace policy already governs grill requirements.",
            "confidence": 1,
            "createdAt": "2026-07-20T02:25:48.090Z"
          },
          {
            "id": "EVD-0048",
            "taskId": "TASK-20260720-add-workspace-workflow-toggle",
            "decisionId": null,
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/task.ts",
            "summary": "Task creation owns guided task markers and current task state.",
            "confidence": 1,
            "createdAt": "2026-07-20T02:25:48.090Z"
          }
        ],
        "expectedScope": [
          "Add additive tracked workflow mode policy with backward-compatible default.",
          "Add enable, disable, and status CLI commands with EN/KO output and typed errors.",
          "Block only new work while disabled and refuse policy change with a current non-terminal task.",
          "Update README workflow documentation and targeted unit/E2E/locale coverage."
        ],
        "avoidScope": [
          "global configuration",
          "per-task bypass",
          "task record conversion/deletion",
          "retrospective capture changes"
        ],
        "implementationPlan": [
          "Map policy, task creation, lifecycle, CLI, and locale seams.",
          "Implement mode read/write and command guards while preserving legacy policy/task behavior.",
          "Add documentation and regression coverage for toggling, active-task refusal, and disabled-work rejection."
        ],
        "verificationPlan": [
          "Run focused policy/CLI/locale tests.",
          "Run full test suite, typecheck, lint, and format check.",
          "Manually verify enable/disable/status help and disabled work error."
        ],
        "openQuestionCount": 0
      },
      "renderedMarkdown": "────────────────────────────────────────\nImplementation Brief\n────────────────────────────────────────\nTask: TASK-20260720-add-workspace-workflow-toggle\nAdd workspace workflow toggle\n\nA. Explicit decisions\n[EXPLICIT] DEC-0053. Store workflow mode as tracked workspace policy\nConfidence: 1.00\nSummary: Add an additive workflow mode to `.decision/policy.json`. Missing legacy policy defaults to enabled for new work; the setting is reviewed and versioned with the project.\nRationale:\n  - Users need a durable on/off choice that applies to the workspace rather than a global machine preference.\nApplies to:\n  - src/core/v2/policy.ts\n  - src/core/v2/workspace.ts\n  - src/core/v2/task.ts\nAvoids:\n  - global user setting\n  - untracked state\n\n[EXPLICIT] DEC-0054. Disable only new work creation and preserve existing records\nConfidence: 1.00\nSummary: workflow disable rejects new sduck work creation but keeps read-only commands available and never rewrites or relaxes existing task gates. It refuses while any current non-terminal task is active; users must close or abandon first.\nRationale:\n  - Turning off workflow must not silently discard approval or trace history.\nApplies to:\n  - src/cli.ts\n  - src/commands/v2/index.ts\n  - src/core/v2/task.ts\n  - src/core/v2/task-lifecycle.ts\nAvoids:\n  - per-task gate bypass\n  - record deletion\n  - active task mutation\n\n[EXPLICIT] DEC-0055. Provide explicit workspace workflow commands\nConfidence: 1.00\nSummary: Expose `sduck workflow status`, `sduck workflow enable`, and `sduck workflow disable`; localize text and document the mode. Enable resumes guided creation for later work only.\nRationale:\n  - A visible CLI surface makes the mode auditable and reversible.\nApplies to:\n  - src/cli.ts\n  - src/commands/v2/index.ts\n  - src/ui/v2/messages.ts\n  - README.md\n  - README.ko.md\nAvoids:\n  - implicit mode switching\n\nB. Inferred decisions\n  - none\n\nC. Carried decisions\n  - none\n\nD. Conflicts\n  - none\n\nE. Open decisions\n  - none\n\nProblem:\n  Add workspace workflow toggle\nImplementation plan:\n  - Map policy, task creation, lifecycle, CLI, and locale seams.\n  - Implement mode read/write and command guards while preserving legacy policy/task behavior.\n  - Add documentation and regression coverage for toggling, active-task refusal, and disabled-work rejection.\nVerification plan:\n  - Run focused policy/CLI/locale tests.\n  - Run full test suite, typecheck, lint, and format check.\n  - Manually verify enable/disable/status help and disabled work error.\nScope expected:\n  - Add additive tracked workflow mode policy with backward-compatible default.\n  - Add enable, disable, and status CLI commands with EN/KO output and typed errors.\n  - Block only new work while disabled and refuse policy change with a current non-terminal task.\n  - Update README workflow documentation and targeted unit/E2E/locale coverage.\nScope avoided:\n  - global configuration\n  - per-task bypass\n  - task record conversion/deletion\n  - retrospective capture changes\nOpen questions: 0\nEvidence:\n  - [CODE] src/core/v2/policy.ts (1): Current workspace policy already governs grill requirements.\n  - [CODE] src/core/v2/task.ts (1): Task creation owns guided task markers and current task state.\n────────────────────────────────────────",
      "gitBaseline": {
        "head": "4fb70744ee432a5801242673de38551bf9109826",
        "dirtyFileHashes": {
          ".ignore": "d848d497c18118c6142a789e167a989adbc2c2227e371b0164480a6206bab443",
          ".prettierignore": "c0efdf6a8bebcb6f2d5f390eadaad516b16239b1b83914f3005b9efe3f6f0a94",
          "AGENTS.md": "d994e93914bb9f76b8a97016f42c7bb2f0e16c69a2f19f5905a060517a1814f1",
          "CLAUDE.md": "6edc056cf4264e38f07dfe44173e6ea57edee77c92add2958f7ab77131439a56",
          "README.ko.md": "1e7714acd17ce70bf8e3577529dd6899e5c533c8b7b449b59d2a21b3f5d085ba",
          "README.md": "50ccc9279145c8d7687370986daa646697c3c868306ecfe2bce5f7ae8c8b0959",
          "docs/design/conversational-workflow.md": "39393af5444abee5a4146ba56421ec6c39c69856654ec1fd5b5ecae9f81e5809",
          "docs/design/mcp-control-plane-0.6-contract.md": "54e436b84bcfffcc61c7639e758e40023431f602f09f3bb6dd78e5902a6dfad1",
          "src/cli.ts": "4d6c4c3a60e05c8497978a30c78686263bee8e654268e2ca7edf8ea719a80fd7",
          "src/commands/v2/index.ts": "ab1b35f610cd69737e7673219d9bac5ff5f53f3297b3e8fe806f9dab43a6eed7",
          "src/core/assets.ts": "5eca9ef19e2eba94caba8bbe92ed30e1a6793e553e67f8ca673ff3915c1dd0ba",
          "src/core/init.ts": "377eb6e8459da55b30e8c08aea148ed6336289a1a89a636a960976a5bf914e8d",
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
          "tests/e2e/sdd-cli-reachability.test.ts": "3c76a399282daafc5a5bacaa37382df1d380156cbd2bf6a0020730e3fc22d98f",
          "tests/e2e/v2-cli.test.ts": "9395830a6ea2f19f67e20a37bb8d45bb5b149c4c5f6a157e963c556990c38a04",
          "tests/e2e/v2-locale-cli.test.ts": "486768e3722a8ac5f735a43ae52b08ee2de9f90ee252a8936ac66d9f8e83b750",
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
          "tests/unit/sdd-core-regression.test.ts": "d4c89bccc48352dc4075081418dd4e287128ec876ed37eb0d291f233dddc5ac2",
          "tests/unit/v2-contract-fixtures.test.ts": "af9b602764822d89578de375ef3c50c86c38a24d20f6c7502ef212a743e396de",
          "tests/unit/v2-lifecycle.test.ts": "8db8733496048ff2c2f58728de5f770ed3fa916156c1451a5be260ce4ff2b618",
          "tests/unit/v2-messages.test.ts": "d17e92613d455c9c6149d5f161cc2c38aa7e848167b8ed72356c8f1843cf892b"
        }
      },
      "createdAt": "2026-07-20T02:25:48.593Z"
    }
  ],
  "events": [
    {
      "id": "EVT-0184",
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "type": "TASK_CREATED",
      "payload": {
        "description": "Add workspace workflow toggle",
        "policy": {
          "grillMeRequired": false
        }
      },
      "createdAt": "2026-07-20T02:25:11.800Z"
    },
    {
      "id": "EVT-0185",
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "type": "GRILL_STARTED",
      "payload": {
        "automatic": true
      },
      "createdAt": "2026-07-20T02:25:11.800Z"
    },
    {
      "id": "EVT-0186",
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "type": "CONTEXT_INDEXED",
      "payload": {
        "itemCount": 40
      },
      "createdAt": "2026-07-20T02:25:11.921Z"
    },
    {
      "id": "EVT-0187",
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "type": "GRILL_COMPLETED",
      "payload": {
        "reason": "Workspace-level enable or disable is sufficient: it blocks only new work creation, preserves active and historical records, and requires the current task to be closed or abandoned before changing the policy.",
        "carried": []
      },
      "createdAt": "2026-07-20T02:25:47.671Z"
    },
    {
      "id": "EVT-0188",
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0053"
      },
      "createdAt": "2026-07-20T02:25:48.091Z"
    },
    {
      "id": "EVT-0189",
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0054"
      },
      "createdAt": "2026-07-20T02:25:48.091Z"
    },
    {
      "id": "EVT-0190",
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0055"
      },
      "createdAt": "2026-07-20T02:25:48.091Z"
    },
    {
      "id": "EVT-0191",
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 3,
        "questions": 0,
        "evidence": 2,
        "expectedScope": [
          "Add additive tracked workflow mode policy with backward-compatible default.",
          "Add enable, disable, and status CLI commands with EN/KO output and typed errors.",
          "Block only new work while disabled and refuse policy change with a current non-terminal task.",
          "Update README workflow documentation and targeted unit/E2E/locale coverage."
        ],
        "avoidScope": [
          "global configuration",
          "per-task bypass",
          "task record conversion/deletion",
          "retrospective capture changes"
        ],
        "implementationPlan": [
          "Map policy, task creation, lifecycle, CLI, and locale seams.",
          "Implement mode read/write and command guards while preserving legacy policy/task behavior.",
          "Add documentation and regression coverage for toggling, active-task refusal, and disabled-work rejection."
        ],
        "verificationPlan": [
          "Run focused policy/CLI/locale tests.",
          "Run full test suite, typecheck, lint, and format check.",
          "Manually verify enable/disable/status help and disabled work error."
        ]
      },
      "createdAt": "2026-07-20T02:25:48.091Z"
    },
    {
      "id": "EVT-0192",
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "type": "BRIEF_CONFIRMED",
      "payload": {
        "snapshotId": "BRF-0012"
      },
      "createdAt": "2026-07-20T02:25:48.593Z"
    },
    {
      "id": "EVT-0193",
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "type": "TRACE_CREATED",
      "payload": {
        "traceId": "IMPL-0015",
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
        ]
      },
      "createdAt": "2026-07-20T02:52:19.955Z"
    },
    {
      "id": "EVT-0194",
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "type": "EVALUATION_RECORDED",
      "payload": {
        "evaluationId": "EVAL-0003",
        "traceId": "IMPL-0015"
      },
      "createdAt": "2026-07-20T02:52:20.316Z"
    },
    {
      "id": "EVT-0195",
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
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
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/DECISION_REPORT.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/decision-graph.json"
        ]
      },
      "createdAt": "2026-07-20T02:52:20.696Z"
    },
    {
      "id": "EVT-0196",
      "taskId": "TASK-20260720-add-workspace-workflow-toggle",
      "type": "TASK_CLOSED",
      "payload": {},
      "createdAt": "2026-07-20T02:52:21.034Z"
    }
  ]
}
```
