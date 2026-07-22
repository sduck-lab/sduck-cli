---
id: TASK-20260722-configure-risk-based-sduck-workflow-activation
type: task
status: CLOSED
title: Configure risk-based sduck workflow activation
created_at: '2026-07-22T03:45:53.512Z'
updated_at: '2026-07-22T06:55:08.423Z'
---
# TASK-20260722-configure-risk-based-sduck-workflow-activation: Configure risk-based sduck workflow activation

Configure risk-based sduck workflow activation

## Sduck source

```json sduck-source
{
  "task": {
    "id": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
    "title": "Configure risk-based sduck workflow activation",
    "description": "Configure risk-based sduck workflow activation",
    "status": "CLOSED",
    "expectedScope": [
      "src/types/index.ts",
      "src/core/v2/source-store.ts",
      "src/core/v2/store.ts",
      "src/core/v2/rebuild.ts",
      "src/core/v2/task.ts",
      "src/core/v2/cache-bundle.ts",
      "src/cli.ts",
      "src/commands/v2/index.ts",
      "status or brief projection only if recordDepth is not already exposed through Task",
      ".sduck/sduck-assets/agent-rules/core.md",
      "README.md",
      "docs/migration.md",
      "focused v2 lifecycle, source/cache, CLI E2E, and regression tests"
    ],
    "avoidScope": [
      "task-lifecycle gate changes",
      "trace, evaluate, and close behavior changes",
      "LIGHTWEIGHT escalation command",
      "automatic workspace-wide workflow toggles",
      "agent automatic classification behavior before a later stage"
    ],
    "guided": true,
    "createdAt": "2026-07-22T03:45:53.512Z",
    "updatedAt": "2026-07-22T06:55:08.423Z",
    "implementationPlan": [
      "Add a RecordDepth type and optional Task.recordDepth field. New tasks receive an explicit FULL default; legacy or omitted values resolve to FULL without rewriting historical source.",
      "Thread recordDepth through canonical Markdown render, parse, validation, brief snapshots, SQLite schema migration, rebuild insertion, and both cache mappers while preserving event schemas.",
      "Add a validated sduck work --record-depth FULL|LIGHTWEIGHT option and pass it to task creation. Keep guided true and leave task-lifecycle, trace, evaluation, and close gates unchanged for both depths.",
      "Expose and document the stored classification, explicitly stating that LIGHTWEIGHT is behavioral no-op in Stage 1 and will not yet cause agents to choose a lower-ceremony flow.",
      "Add focused compatibility and behavior-preservation tests, then regenerate managed agent instructions and review the generated outputs."
    ],
    "verificationPlan": [
      "Run focused unit tests for task/source/cache compatibility and lifecycle gate preservation, plus the v2 CLI E2E coverage for --record-depth.",
      "Verify Markdown source round-trips recordDepth; legacy Markdown and an SQLite cache without record_depth resolve to FULL.",
      "Verify LIGHTWEIGHT tasks still require the current grill, brief confirmation, trace, evaluation, and close contract in Stage 1.",
      "Run git diff --check and inspect changed files to ensure lifecycle gates, trace/evaluate behavior, workspace mode, hooks, and automatic agent routing were not changed."
    ]
  },
  "questions": [
    {
      "id": "Q-RECORD-DEPTH-ARCHITECTURE",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "decisionId": null,
      "text": "Which long-term record-depth direction should sduck adopt?",
      "recommendedAnswer": "Make first-class per-task FULL or LIGHTWEIGHT classifications, but retain the current full lifecycle until that model is implemented.",
      "rationale": [
        "It preserves the decision ledger and audit trail while addressing unnecessary ceremony.",
        "Instruction-only skipping leaves invisible exceptions, and workspace mode is not a task-routing mechanism."
      ],
      "options": [
        "Target first-class FULL/LIGHTWEIGHT classification; keep full lifecycle until implemented",
        "Retain the full lifecycle for every enabled-workspace change"
      ],
      "answered": true,
      "answer": "Target first-class FULL/LIGHTWEIGHT classification; keep full lifecycle until implemented",
      "createdAt": "2026-07-22T05:41:57.908Z"
    },
    {
      "id": "Q-CLASSIFICATION-ROLLOUT",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "decisionId": null,
      "text": "Should the first implementation be the safe durable classification foundation, or should planning first define and deliver full LIGHTWEIGHT behavior?",
      "recommendedAnswer": "Start with the durable foundation: store and expose FULL/LIGHTWEIGHT, default old and omitted data to FULL, preserve existing gates, then design lightweight behavior in a separate approved stage.",
      "rationale": [
        "It exercises source, cache, migration, and compatibility paths before lifecycle behavior depends on the new field.",
        "A safe lightweight workflow needs separate decisions for Git baseline timing, escalation, and mandatory trace/evaluation semantics."
      ],
      "options": [
        "Stage 1 durable foundation first",
        "Design and deliver full LIGHTWEIGHT behavior in one larger change"
      ],
      "answered": true,
      "answer": "Stage 1 durable foundation first",
      "createdAt": "2026-07-22T05:50:28.923Z"
    }
  ],
  "evidence": [
    {
      "id": "EVD-WORKFLOW-GLOBAL-POLICY",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "decisionId": "DEC-TASK-SCOPED-RECORD-DEPTH",
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/policy.ts",
      "summary": "workflowEnabled is a validated workspace policy written durably under the workspace lock.",
      "confidence": 0.95,
      "createdAt": "2026-07-22T03:49:48.147Z"
    },
    {
      "id": "EVD-WORK-CREATION-GATE",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "decisionId": "DEC-TASK-SCOPED-RECORD-DEPTH",
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/task.ts",
      "summary": "The workflow policy gates new task creation rather than supplying a per-task risk setting.",
      "confidence": 0.95,
      "createdAt": "2026-07-22T03:49:48.147Z"
    },
    {
      "id": "EVD-WORKSPACE-MODE-SEMANTICS",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "decisionId": "DEC-WORKSPACE-MODE-NOT-TASK-ROUTER",
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/policy.ts",
      "summary": "workflowEnabled is a tracked workspace policy that controls new task creation rather than per-task treatment.",
      "confidence": 0.95,
      "createdAt": "2026-07-22T05:41:57.908Z"
    },
    {
      "id": "EVD-ENABLED-SKIP-GAP",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "decisionId": "DEC-WORKSPACE-MODE-NOT-TASK-ROUTER",
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/retrospective.ts",
      "summary": "Retrospective capture is limited to disabled workflow mode, so enabled-mode task skipping is not retrospectively recorded.",
      "confidence": 0.95,
      "createdAt": "2026-07-22T05:41:57.908Z"
    },
    {
      "id": "EVD-0056",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "decisionId": null,
      "sourceType": "USER_ANSWER",
      "sourceRef": "Q-RECORD-DEPTH-ARCHITECTURE",
      "summary": "Target first-class FULL/LIGHTWEIGHT classification; keep full lifecycle until implemented",
      "confidence": 1,
      "createdAt": "2026-07-22T05:43:23.414Z"
    },
    {
      "id": "EVD-CLASSIFICATION-REVIEW",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "decisionId": "DEC-SUPERSEDE-INSTRUCTION-ONLY-TRIAGE",
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/task-lifecycle.ts",
      "summary": "Current lifecycle behavior is a single full workflow and does not provide a per-task record-depth concept.",
      "confidence": 0.95,
      "createdAt": "2026-07-22T05:44:00.965Z"
    },
    {
      "id": "EVD-STAGE-ONE-GATE-ISOLATION",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/task-lifecycle.ts",
      "summary": "Current lifecycle gates are keyed to guided task behavior, so introducing recordDepth without changing those gates keeps existing task semantics stable.",
      "confidence": 0.95,
      "createdAt": "2026-07-22T05:50:28.923Z"
    },
    {
      "id": "EVD-RECORD-DEPTH-STORAGE-PATH",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/source-store.ts",
      "summary": "Task fields already round-trip through canonical Markdown validation and embedded brief snapshots, enabling an additive durable field.",
      "confidence": 0.95,
      "createdAt": "2026-07-22T05:50:28.923Z"
    },
    {
      "id": "EVD-0057",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "decisionId": null,
      "sourceType": "USER_ANSWER",
      "sourceRef": "Q-CLASSIFICATION-ROLLOUT",
      "summary": "Stage 1 durable foundation first",
      "confidence": 1,
      "createdAt": "2026-07-22T06:24:36.245Z"
    },
    {
      "id": "EVD-ADDITIVE-TASK-FIELD-PRECEDENT",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "decisionId": "DEC-STAGE-ONE-DURABLE-RECORD-DEPTH",
      "sourceType": "CODE",
      "sourceRef": "src/types/index.ts",
      "summary": "Task already has optional guided and retrospective fields that establish an additive field threading precedent.",
      "confidence": 0.9,
      "createdAt": "2026-07-22T06:25:58.737Z"
    },
    {
      "id": "EVD-IDEMPOTENT-CACHE-MIGRATION",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "decisionId": "DEC-STAGE-ONE-DURABLE-RECORD-DEPTH",
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/store.ts",
      "summary": "The SQLite cache schema uses idempotent ensureColumn migrations suitable for an additive record_depth column.",
      "confidence": 0.95,
      "createdAt": "2026-07-22T06:25:58.737Z"
    }
  ],
  "contextItems": [
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0014",
      "summary": "Prior decision: Supersede conflicting conversational-workflow proposals — The final 0.6 design marks conversational-workflow sections 4.3 and 5.3 superseded by digest-based local confirmation and canonical-record guard lookup.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0697",
      "createdAt": "2026-07-22T03:45:53.649Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
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
      "id": "CTX-0698",
      "createdAt": "2026-07-22T03:45:53.649Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0011",
      "summary": "Prior decision: Require local digest confirmation by default — MCP may prepare a canonical brief, but default confirmation is interactive local sduck confirm --digest; non-human MCP acknowledgement is explicit policy opt-in with provenance.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0699",
      "createdAt": "2026-07-22T03:45:53.649Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0019",
      "summary": "Prior decision: What trace data and CI semantics should sduck verify require? — Bind trace to Git and brief digest",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0700",
      "createdAt": "2026-07-22T03:45:53.649Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0020",
      "summary": "Prior decision: What exact BriefDigestProjectionV1 and canonical serializer should sduck use? — RFC 8785 projection v1 (recommended)",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0701",
      "createdAt": "2026-07-22T03:45:53.649Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0023",
      "summary": "Prior decision: What exact Git-bound trace and sduck verify algorithm should 0.6 use? — Merge-base CI verifier (recommended)",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0702",
      "createdAt": "2026-07-22T03:45:53.650Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
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
      "id": "CTX-0703",
      "createdAt": "2026-07-22T03:45:53.650Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
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
      "id": "CTX-0704",
      "createdAt": "2026-07-22T03:45:53.650Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
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
      "id": "CTX-0705",
      "createdAt": "2026-07-22T03:45:53.650Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0001",
      "summary": "Prior decision: Release the backward-compatible feature set as 0.5.0 — Bump the npm package from 0.4.0 to 0.5.0 because the completed v2 workflow and locale work adds public capabilities without intended breaking changes.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0706",
      "createdAt": "2026-07-22T03:45:53.650Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
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
      "id": "CTX-0707",
      "createdAt": "2026-07-22T03:45:53.650Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
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
      "id": "CTX-0708",
      "createdAt": "2026-07-22T03:45:53.650Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
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
      "id": "CTX-0709",
      "createdAt": "2026-07-22T03:45:53.650Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0061",
      "summary": "Decision applies to relevant file AGENTS.md: Keep lifecycle commands agent-internal",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "AGENTS.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0710",
      "createdAt": "2026-07-22T03:45:53.651Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0062",
      "summary": "Decision applies to relevant file AGENTS.md: Use a concise plain-language development scenario",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "AGENTS.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0711",
      "createdAt": "2026-07-22T03:45:53.651Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0063",
      "summary": "Decision applies to relevant file AGENTS.md: Extend the shared managed core rule and refresh generated outputs",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "AGENTS.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0712",
      "createdAt": "2026-07-22T03:45:53.651Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
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
      "id": "CTX-0713",
      "createdAt": "2026-07-22T03:45:53.651Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
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
      "id": "CTX-0714",
      "createdAt": "2026-07-22T03:45:53.651Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0-6-cli-foundation",
      "summary": "Decision applies to relevant file docs/design/conversational-workflow.md: Ship 0.6.0 as CLI foundations, not an MCP runtime",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "docs/design/conversational-workflow.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0715",
      "createdAt": "2026-07-22T03:45:53.651Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
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
      "id": "CTX-0716",
      "createdAt": "2026-07-22T03:45:53.651Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
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
      "id": "CTX-0717",
      "createdAt": "2026-07-22T03:45:53.651Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
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
      "id": "CTX-0718",
      "createdAt": "2026-07-22T03:45:53.652Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
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
      "id": "CTX-0719",
      "createdAt": "2026-07-22T03:45:53.652Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
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
      "id": "CTX-0720",
      "createdAt": "2026-07-22T03:45:53.652Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
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
      "id": "CTX-0721",
      "createdAt": "2026-07-22T03:45:53.652Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
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
      "id": "CTX-0722",
      "createdAt": "2026-07-22T03:45:53.652Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
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
      "id": "CTX-0723",
      "createdAt": "2026-07-22T03:45:53.652Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
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
      "id": "CTX-0724",
      "createdAt": "2026-07-22T03:45:53.652Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
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
      "id": "CTX-0725",
      "createdAt": "2026-07-22T03:45:53.652Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
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
      "id": "CTX-0726",
      "createdAt": "2026-07-22T03:45:53.653Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
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
      "id": "CTX-0727",
      "createdAt": "2026-07-22T03:45:53.653Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/design/conversational-workflow.md",
      "summary": "File evidence: # sduck conversational workflow design — historical draft",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "# sduck conversational workflow design — historical draft",
        "line": 1
      },
      "id": "CTX-0728",
      "createdAt": "2026-07-22T03:45:53.653Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "sourceType": "DISCOVERY",
      "sourceRef": ".github/workflows/ci.yml",
      "summary": "File evidence: - name: Configure git identity",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "- name: Configure git identity",
        "line": 22
      },
      "id": "CTX-0729",
      "createdAt": "2026-07-22T03:45:53.653Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
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
      "id": "CTX-0730",
      "createdAt": "2026-07-22T03:45:53.653Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
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
      "id": "CTX-0731",
      "createdAt": "2026-07-22T03:45:53.653Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/cli.ts",
      "summary": "File evidence: runWorkflowDisableCommand,",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "runWorkflowDisableCommand,",
        "line": 46
      },
      "id": "CTX-0732",
      "createdAt": "2026-07-22T03:45:53.653Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "sourceType": "DISCOVERY",
      "sourceRef": ".backup/AGENT.md",
      "summary": "File evidence: <!-- sduck:begin -->",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "<!-- sduck:begin -->",
        "line": 1
      },
      "id": "CTX-0733",
      "createdAt": "2026-07-22T03:45:53.653Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "sourceType": "DISCOVERY",
      "sourceRef": ".backup/CLAUDE.md",
      "summary": "File evidence: <!-- sduck:begin -->",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "<!-- sduck:begin -->",
        "line": 1
      },
      "id": "CTX-0734",
      "createdAt": "2026-07-22T03:45:53.653Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "sourceType": "DISCOVERY",
      "sourceRef": "AGENTS.md",
      "summary": "File evidence: <!-- sduck:begin -->",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "<!-- sduck:begin -->",
        "line": 1
      },
      "id": "CTX-0735",
      "createdAt": "2026-07-22T03:45:53.654Z"
    },
    {
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "sourceType": "DISCOVERY",
      "sourceRef": "CLAUDE.md",
      "summary": "File evidence: <!-- sduck:begin -->",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "<!-- sduck:begin -->",
        "line": 1
      },
      "id": "CTX-0736",
      "createdAt": "2026-07-22T03:45:53.654Z"
    }
  ],
  "briefSnapshots": [
    {
      "id": "BRF-0018",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "snapshot": {
        "task": {
          "id": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
          "title": "Configure risk-based sduck workflow activation",
          "description": "Configure risk-based sduck workflow activation",
          "status": "CONFIRMED",
          "expectedScope": [
            "src/types/index.ts",
            "src/core/v2/source-store.ts",
            "src/core/v2/store.ts",
            "src/core/v2/rebuild.ts",
            "src/core/v2/task.ts",
            "src/core/v2/cache-bundle.ts",
            "src/cli.ts",
            "src/commands/v2/index.ts",
            "status or brief projection only if recordDepth is not already exposed through Task",
            ".sduck/sduck-assets/agent-rules/core.md",
            "README.md",
            "docs/migration.md",
            "focused v2 lifecycle, source/cache, CLI E2E, and regression tests"
          ],
          "avoidScope": [
            "task-lifecycle gate changes",
            "trace, evaluate, and close behavior changes",
            "LIGHTWEIGHT escalation command",
            "automatic workspace-wide workflow toggles",
            "agent automatic classification behavior before a later stage"
          ],
          "guided": true,
          "createdAt": "2026-07-22T03:45:53.512Z",
          "updatedAt": "2026-07-22T06:48:11.316Z",
          "implementationPlan": [
            "Add a RecordDepth type and optional Task.recordDepth field. New tasks receive an explicit FULL default; legacy or omitted values resolve to FULL without rewriting historical source.",
            "Thread recordDepth through canonical Markdown render, parse, validation, brief snapshots, SQLite schema migration, rebuild insertion, and both cache mappers while preserving event schemas.",
            "Add a validated sduck work --record-depth FULL|LIGHTWEIGHT option and pass it to task creation. Keep guided true and leave task-lifecycle, trace, evaluation, and close gates unchanged for both depths.",
            "Expose and document the stored classification, explicitly stating that LIGHTWEIGHT is behavioral no-op in Stage 1 and will not yet cause agents to choose a lower-ceremony flow.",
            "Add focused compatibility and behavior-preservation tests, then regenerate managed agent instructions and review the generated outputs."
          ],
          "verificationPlan": [
            "Run focused unit tests for task/source/cache compatibility and lifecycle gate preservation, plus the v2 CLI E2E coverage for --record-depth.",
            "Verify Markdown source round-trips recordDepth; legacy Markdown and an SQLite cache without record_depth resolve to FULL.",
            "Verify LIGHTWEIGHT tasks still require the current grill, brief confirmation, trace, evaluation, and close contract in Stage 1.",
            "Run git diff --check and inspect changed files to ensure lifecycle gates, trace/evaluate behavior, workspace mode, hooks, and automatic agent routing were not changed."
          ]
        },
        "decisions": {
          "EXPLICIT": [
            {
              "id": "DEC-0065",
              "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
              "title": "Which long-term record-depth direction should sduck adopt?",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Target first-class FULL/LIGHTWEIGHT classification; keep full lifecycle until implemented",
              "rationale": [
                "User answered Q-RECORD-DEPTH-ARCHITECTURE."
              ],
              "appliesTo": [],
              "avoids": [],
              "sourceRefs": [
                "USER_ANSWER:Q-RECORD-DEPTH-ARCHITECTURE",
                "EVD-0056"
              ],
              "createdAt": "2026-07-22T05:43:23.414Z",
              "updatedAt": "2026-07-22T05:43:23.414Z"
            },
            {
              "id": "DEC-0066",
              "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
              "title": "Should the first implementation be the safe durable classification foundation, or should planning first define and deliver full LIGHTWEIGHT behavior?",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Stage 1 durable foundation first",
              "rationale": [
                "User answered Q-CLASSIFICATION-ROLLOUT."
              ],
              "appliesTo": [],
              "avoids": [],
              "sourceRefs": [
                "USER_ANSWER:Q-CLASSIFICATION-ROLLOUT",
                "EVD-0057"
              ],
              "createdAt": "2026-07-22T06:24:36.245Z",
              "updatedAt": "2026-07-22T06:24:36.245Z"
            },
            {
              "id": "DEC-STAGE-ONE-DURABLE-RECORD-DEPTH",
              "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
              "title": "Ship durable record-depth storage before changing lifecycle behavior",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Stage 1 introduces a backward-compatible FULL/LIGHTWEIGHT task field and CLI selection, defaults legacy and omitted data to FULL, and preserves every current lifecycle gate for both depths.",
              "rationale": [
                "The user selected the staged durable-foundation rollout.",
                "Persisting and migrating the classification before gate changes validates data compatibility and prevents a new field from silently weakening historical task semantics."
              ],
              "appliesTo": [
                "src/types/index.ts",
                "src/core/v2/source-store.ts",
                "src/core/v2/store.ts",
                "src/core/v2/rebuild.ts",
                "src/core/v2/task.ts",
                "src/core/v2/cache-bundle.ts",
                "src/cli.ts",
                "src/commands/v2/index.ts",
                "tests/**",
                "README.md",
                "docs/migration.md"
              ],
              "avoids": [
                "src/core/v2/task-lifecycle.ts behavioral gate changes",
                "src/core/v2/trace.ts behavior changes",
                "automatic agent routing"
              ],
              "sourceRefs": [
                "conversation:2026-07-22",
                "DEC-0065",
                "src/core/v2/source-store.ts",
                "src/core/v2/store.ts",
                "src/core/v2/task-lifecycle.ts"
              ],
              "createdAt": "2026-07-22T06:25:58.737Z",
              "updatedAt": "2026-07-22T06:48:11.316Z"
            },
            {
              "id": "DEC-SUPERSEDE-INSTRUCTION-ONLY-TRIAGE",
              "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
              "title": "Replace instruction-only triage with durable task classification",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Supersede the earlier template-only record-depth proposal. The target is a first-class FULL/LIGHTWEIGHT task classification with FULL-by-default semantics; current full lifecycle remains until it exists.",
              "rationale": [
                "The user selected the first-class classification model after comparing strict lifecycle, instruction-only skips, and durable classification.",
                "Instruction-only skips create unrecorded exceptions while workflow mode is enabled."
              ],
              "appliesTo": [
                "src/core/v2/**",
                "src/commands/v2/**",
                ".sduck/sduck-assets/agent-rules/**",
                "tests/**",
                "README.md",
                "docs/migration.md"
              ],
              "avoids": [
                "instruction-only lifecycle bypass",
                "automatic sduck workflow enable or disable invocation"
              ],
              "sourceRefs": [
                "conversation:2026-07-22",
                "DEC-TASK-SCOPED-RECORD-DEPTH",
                "DEC-0065",
                "src/core/v2/retrospective.ts"
              ],
              "createdAt": "2026-07-22T05:44:00.965Z",
              "updatedAt": "2026-07-22T06:48:11.316Z"
            },
            {
              "id": "DEC-TASK-SCOPED-RECORD-DEPTH",
              "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
              "title": "Choose task-scoped record depth without changing workspace mode",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Keep the repository workflow mode unchanged. Agent guidance will select full decision recording only for risky or uncertain work and will not automatically toggle the global workflow setting.",
              "rationale": [
                "The user selected task-scoped record depth over per-task global mode toggling.",
                "workflowEnabled is a workspace-wide tracked setting and task creation is the only gated operation."
              ],
              "appliesTo": [
                ".sduck/sduck-assets/agent-rules/core.md",
                "AGENTS.md",
                "CLAUDE.md"
              ],
              "avoids": [
                "src/**",
                ".decision/policy.json",
                "automatic sduck workflow enable or disable invocation"
              ],
              "sourceRefs": [
                "conversation:2026-07-22",
                "src/core/v2/policy.ts",
                "src/core/v2/task.ts",
                "src/commands/v2/index.ts"
              ],
              "createdAt": "2026-07-22T03:49:48.147Z",
              "updatedAt": "2026-07-22T06:48:11.316Z"
            },
            {
              "id": "DEC-WORKSPACE-MODE-NOT-TASK-ROUTER",
              "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
              "title": "Keep workspace mode separate from task record depth",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Do not automatically toggle the workspace-wide workflow mode for individual tasks. If lower ceremony is supported, it must be a durable per-task record-depth model rather than an unrecorded agent bypass.",
              "rationale": [
                "The user selected task-scoped behavior over persistent workspace toggling.",
                "Workspace mode is tracked and gates task creation, while instruction-only skips create invisible audit exceptions."
              ],
              "appliesTo": [
                "src/core/v2/policy.ts",
                "src/core/v2/task-lifecycle.ts",
                ".sduck/sduck-assets/agent-rules/**"
              ],
              "avoids": [
                "automatic sduck workflow enable or disable invocation",
                "unrecorded enabled-workspace implementation"
              ],
              "sourceRefs": [
                "conversation:2026-07-22",
                "src/core/v2/policy.ts",
                "src/core/v2/retrospective.ts",
                "src/core/v2/task-lifecycle.ts"
              ],
              "createdAt": "2026-07-22T05:41:57.908Z",
              "updatedAt": "2026-07-22T06:48:11.316Z"
            }
          ],
          "INFERRED": [],
          "CARRIED": [],
          "CONFLICT": [],
          "OPEN": []
        },
        "questions": [
          {
            "id": "Q-RECORD-DEPTH-ARCHITECTURE",
            "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
            "decisionId": null,
            "text": "Which long-term record-depth direction should sduck adopt?",
            "recommendedAnswer": "Make first-class per-task FULL or LIGHTWEIGHT classifications, but retain the current full lifecycle until that model is implemented.",
            "rationale": [
              "It preserves the decision ledger and audit trail while addressing unnecessary ceremony.",
              "Instruction-only skipping leaves invisible exceptions, and workspace mode is not a task-routing mechanism."
            ],
            "options": [
              "Target first-class FULL/LIGHTWEIGHT classification; keep full lifecycle until implemented",
              "Retain the full lifecycle for every enabled-workspace change"
            ],
            "answered": true,
            "answer": "Target first-class FULL/LIGHTWEIGHT classification; keep full lifecycle until implemented",
            "createdAt": "2026-07-22T05:41:57.908Z"
          },
          {
            "id": "Q-CLASSIFICATION-ROLLOUT",
            "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
            "decisionId": null,
            "text": "Should the first implementation be the safe durable classification foundation, or should planning first define and deliver full LIGHTWEIGHT behavior?",
            "recommendedAnswer": "Start with the durable foundation: store and expose FULL/LIGHTWEIGHT, default old and omitted data to FULL, preserve existing gates, then design lightweight behavior in a separate approved stage.",
            "rationale": [
              "It exercises source, cache, migration, and compatibility paths before lifecycle behavior depends on the new field.",
              "A safe lightweight workflow needs separate decisions for Git baseline timing, escalation, and mandatory trace/evaluation semantics."
            ],
            "options": [
              "Stage 1 durable foundation first",
              "Design and deliver full LIGHTWEIGHT behavior in one larger change"
            ],
            "answered": true,
            "answer": "Stage 1 durable foundation first",
            "createdAt": "2026-07-22T05:50:28.923Z"
          }
        ],
        "evidence": [
          {
            "id": "EVD-WORKFLOW-GLOBAL-POLICY",
            "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
            "decisionId": "DEC-TASK-SCOPED-RECORD-DEPTH",
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/policy.ts",
            "summary": "workflowEnabled is a validated workspace policy written durably under the workspace lock.",
            "confidence": 0.95,
            "createdAt": "2026-07-22T03:49:48.147Z"
          },
          {
            "id": "EVD-WORK-CREATION-GATE",
            "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
            "decisionId": "DEC-TASK-SCOPED-RECORD-DEPTH",
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/task.ts",
            "summary": "The workflow policy gates new task creation rather than supplying a per-task risk setting.",
            "confidence": 0.95,
            "createdAt": "2026-07-22T03:49:48.147Z"
          },
          {
            "id": "EVD-WORKSPACE-MODE-SEMANTICS",
            "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
            "decisionId": "DEC-WORKSPACE-MODE-NOT-TASK-ROUTER",
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/policy.ts",
            "summary": "workflowEnabled is a tracked workspace policy that controls new task creation rather than per-task treatment.",
            "confidence": 0.95,
            "createdAt": "2026-07-22T05:41:57.908Z"
          },
          {
            "id": "EVD-ENABLED-SKIP-GAP",
            "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
            "decisionId": "DEC-WORKSPACE-MODE-NOT-TASK-ROUTER",
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/retrospective.ts",
            "summary": "Retrospective capture is limited to disabled workflow mode, so enabled-mode task skipping is not retrospectively recorded.",
            "confidence": 0.95,
            "createdAt": "2026-07-22T05:41:57.908Z"
          },
          {
            "id": "EVD-0056",
            "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
            "decisionId": null,
            "sourceType": "USER_ANSWER",
            "sourceRef": "Q-RECORD-DEPTH-ARCHITECTURE",
            "summary": "Target first-class FULL/LIGHTWEIGHT classification; keep full lifecycle until implemented",
            "confidence": 1,
            "createdAt": "2026-07-22T05:43:23.414Z"
          },
          {
            "id": "EVD-CLASSIFICATION-REVIEW",
            "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
            "decisionId": "DEC-SUPERSEDE-INSTRUCTION-ONLY-TRIAGE",
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/task-lifecycle.ts",
            "summary": "Current lifecycle behavior is a single full workflow and does not provide a per-task record-depth concept.",
            "confidence": 0.95,
            "createdAt": "2026-07-22T05:44:00.965Z"
          },
          {
            "id": "EVD-STAGE-ONE-GATE-ISOLATION",
            "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
            "decisionId": null,
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/task-lifecycle.ts",
            "summary": "Current lifecycle gates are keyed to guided task behavior, so introducing recordDepth without changing those gates keeps existing task semantics stable.",
            "confidence": 0.95,
            "createdAt": "2026-07-22T05:50:28.923Z"
          },
          {
            "id": "EVD-RECORD-DEPTH-STORAGE-PATH",
            "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
            "decisionId": null,
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/source-store.ts",
            "summary": "Task fields already round-trip through canonical Markdown validation and embedded brief snapshots, enabling an additive durable field.",
            "confidence": 0.95,
            "createdAt": "2026-07-22T05:50:28.923Z"
          },
          {
            "id": "EVD-0057",
            "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
            "decisionId": null,
            "sourceType": "USER_ANSWER",
            "sourceRef": "Q-CLASSIFICATION-ROLLOUT",
            "summary": "Stage 1 durable foundation first",
            "confidence": 1,
            "createdAt": "2026-07-22T06:24:36.245Z"
          },
          {
            "id": "EVD-ADDITIVE-TASK-FIELD-PRECEDENT",
            "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
            "decisionId": "DEC-STAGE-ONE-DURABLE-RECORD-DEPTH",
            "sourceType": "CODE",
            "sourceRef": "src/types/index.ts",
            "summary": "Task already has optional guided and retrospective fields that establish an additive field threading precedent.",
            "confidence": 0.9,
            "createdAt": "2026-07-22T06:25:58.737Z"
          },
          {
            "id": "EVD-IDEMPOTENT-CACHE-MIGRATION",
            "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
            "decisionId": "DEC-STAGE-ONE-DURABLE-RECORD-DEPTH",
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/store.ts",
            "summary": "The SQLite cache schema uses idempotent ensureColumn migrations suitable for an additive record_depth column.",
            "confidence": 0.95,
            "createdAt": "2026-07-22T06:25:58.737Z"
          }
        ],
        "expectedScope": [
          "src/types/index.ts",
          "src/core/v2/source-store.ts",
          "src/core/v2/store.ts",
          "src/core/v2/rebuild.ts",
          "src/core/v2/task.ts",
          "src/core/v2/cache-bundle.ts",
          "src/cli.ts",
          "src/commands/v2/index.ts",
          "status or brief projection only if recordDepth is not already exposed through Task",
          ".sduck/sduck-assets/agent-rules/core.md",
          "README.md",
          "docs/migration.md",
          "focused v2 lifecycle, source/cache, CLI E2E, and regression tests"
        ],
        "avoidScope": [
          "task-lifecycle gate changes",
          "trace, evaluate, and close behavior changes",
          "LIGHTWEIGHT escalation command",
          "automatic workspace-wide workflow toggles",
          "agent automatic classification behavior before a later stage"
        ],
        "implementationPlan": [
          "Add a RecordDepth type and optional Task.recordDepth field. New tasks receive an explicit FULL default; legacy or omitted values resolve to FULL without rewriting historical source.",
          "Thread recordDepth through canonical Markdown render, parse, validation, brief snapshots, SQLite schema migration, rebuild insertion, and both cache mappers while preserving event schemas.",
          "Add a validated sduck work --record-depth FULL|LIGHTWEIGHT option and pass it to task creation. Keep guided true and leave task-lifecycle, trace, evaluation, and close gates unchanged for both depths.",
          "Expose and document the stored classification, explicitly stating that LIGHTWEIGHT is behavioral no-op in Stage 1 and will not yet cause agents to choose a lower-ceremony flow.",
          "Add focused compatibility and behavior-preservation tests, then regenerate managed agent instructions and review the generated outputs."
        ],
        "verificationPlan": [
          "Run focused unit tests for task/source/cache compatibility and lifecycle gate preservation, plus the v2 CLI E2E coverage for --record-depth.",
          "Verify Markdown source round-trips recordDepth; legacy Markdown and an SQLite cache without record_depth resolve to FULL.",
          "Verify LIGHTWEIGHT tasks still require the current grill, brief confirmation, trace, evaluation, and close contract in Stage 1.",
          "Run git diff --check and inspect changed files to ensure lifecycle gates, trace/evaluate behavior, workspace mode, hooks, and automatic agent routing were not changed."
        ],
        "openQuestionCount": 0
      },
      "renderedMarkdown": "────────────────────────────────────────\nImplementation Brief\n────────────────────────────────────────\nTask: TASK-20260722-configure-risk-based-sduck-workflow-activation\nConfigure risk-based sduck workflow activation\n\nA. Explicit decisions\n[EXPLICIT] DEC-0065. Which long-term record-depth direction should sduck adopt?\nConfidence: 1.00\nSummary: Target first-class FULL/LIGHTWEIGHT classification; keep full lifecycle until implemented\nSource refs:\n  - USER_ANSWER:Q-RECORD-DEPTH-ARCHITECTURE\n  - EVD-0056\nRationale:\n  - User answered Q-RECORD-DEPTH-ARCHITECTURE.\n\n[EXPLICIT] DEC-0066. Should the first implementation be the safe durable classification foundation, or should planning first define and deliver full LIGHTWEIGHT behavior?\nConfidence: 1.00\nSummary: Stage 1 durable foundation first\nSource refs:\n  - USER_ANSWER:Q-CLASSIFICATION-ROLLOUT\n  - EVD-0057\nRationale:\n  - User answered Q-CLASSIFICATION-ROLLOUT.\n\n[EXPLICIT] DEC-STAGE-ONE-DURABLE-RECORD-DEPTH. Ship durable record-depth storage before changing lifecycle behavior\nConfidence: 1.00\nSummary: Stage 1 introduces a backward-compatible FULL/LIGHTWEIGHT task field and CLI selection, defaults legacy and omitted data to FULL, and preserves every current lifecycle gate for both depths.\nSource refs:\n  - conversation:2026-07-22\n  - DEC-0065\n  - src/core/v2/source-store.ts\n  - src/core/v2/store.ts\n  - src/core/v2/task-lifecycle.ts\nRationale:\n  - The user selected the staged durable-foundation rollout.\n  - Persisting and migrating the classification before gate changes validates data compatibility and prevents a new field from silently weakening historical task semantics.\nApplies to:\n  - src/types/index.ts\n  - src/core/v2/source-store.ts\n  - src/core/v2/store.ts\n  - src/core/v2/rebuild.ts\n  - src/core/v2/task.ts\n  - src/core/v2/cache-bundle.ts\n  - src/cli.ts\n  - src/commands/v2/index.ts\n  - tests/**\n  - README.md\n  - docs/migration.md\nAvoids:\n  - src/core/v2/task-lifecycle.ts behavioral gate changes\n  - src/core/v2/trace.ts behavior changes\n  - automatic agent routing\n\n[EXPLICIT] DEC-SUPERSEDE-INSTRUCTION-ONLY-TRIAGE. Replace instruction-only triage with durable task classification\nConfidence: 1.00\nSummary: Supersede the earlier template-only record-depth proposal. The target is a first-class FULL/LIGHTWEIGHT task classification with FULL-by-default semantics; current full lifecycle remains until it exists.\nSource refs:\n  - conversation:2026-07-22\n  - DEC-TASK-SCOPED-RECORD-DEPTH\n  - DEC-0065\n  - src/core/v2/retrospective.ts\nRationale:\n  - The user selected the first-class classification model after comparing strict lifecycle, instruction-only skips, and durable classification.\n  - Instruction-only skips create unrecorded exceptions while workflow mode is enabled.\nApplies to:\n  - src/core/v2/**\n  - src/commands/v2/**\n  - .sduck/sduck-assets/agent-rules/**\n  - tests/**\n  - README.md\n  - docs/migration.md\nAvoids:\n  - instruction-only lifecycle bypass\n  - automatic sduck workflow enable or disable invocation\n\n[EXPLICIT] DEC-TASK-SCOPED-RECORD-DEPTH. Choose task-scoped record depth without changing workspace mode\nConfidence: 1.00\nSummary: Keep the repository workflow mode unchanged. Agent guidance will select full decision recording only for risky or uncertain work and will not automatically toggle the global workflow setting.\nSource refs:\n  - conversation:2026-07-22\n  - src/core/v2/policy.ts\n  - src/core/v2/task.ts\n  - src/commands/v2/index.ts\nRationale:\n  - The user selected task-scoped record depth over per-task global mode toggling.\n  - workflowEnabled is a workspace-wide tracked setting and task creation is the only gated operation.\nApplies to:\n  - .sduck/sduck-assets/agent-rules/core.md\n  - AGENTS.md\n  - CLAUDE.md\nAvoids:\n  - src/**\n  - .decision/policy.json\n  - automatic sduck workflow enable or disable invocation\n\n[EXPLICIT] DEC-WORKSPACE-MODE-NOT-TASK-ROUTER. Keep workspace mode separate from task record depth\nConfidence: 1.00\nSummary: Do not automatically toggle the workspace-wide workflow mode for individual tasks. If lower ceremony is supported, it must be a durable per-task record-depth model rather than an unrecorded agent bypass.\nSource refs:\n  - conversation:2026-07-22\n  - src/core/v2/policy.ts\n  - src/core/v2/retrospective.ts\n  - src/core/v2/task-lifecycle.ts\nRationale:\n  - The user selected task-scoped behavior over persistent workspace toggling.\n  - Workspace mode is tracked and gates task creation, while instruction-only skips create invisible audit exceptions.\nApplies to:\n  - src/core/v2/policy.ts\n  - src/core/v2/task-lifecycle.ts\n  - .sduck/sduck-assets/agent-rules/**\nAvoids:\n  - automatic sduck workflow enable or disable invocation\n  - unrecorded enabled-workspace implementation\n\nB. Inferred decisions\n  - none\n\nC. Carried decisions\n  - none\n\nD. Conflicts\n  - none\n\nE. Open decisions\n  - none\n\nProblem:\n  Configure risk-based sduck workflow activation\nImplementation plan:\n  - Add a RecordDepth type and optional Task.recordDepth field. New tasks receive an explicit FULL default; legacy or omitted values resolve to FULL without rewriting historical source.\n  - Thread recordDepth through canonical Markdown render, parse, validation, brief snapshots, SQLite schema migration, rebuild insertion, and both cache mappers while preserving event schemas.\n  - Add a validated sduck work --record-depth FULL|LIGHTWEIGHT option and pass it to task creation. Keep guided true and leave task-lifecycle, trace, evaluation, and close gates unchanged for both depths.\n  - Expose and document the stored classification, explicitly stating that LIGHTWEIGHT is behavioral no-op in Stage 1 and will not yet cause agents to choose a lower-ceremony flow.\n  - Add focused compatibility and behavior-preservation tests, then regenerate managed agent instructions and review the generated outputs.\nVerification plan:\n  - Run focused unit tests for task/source/cache compatibility and lifecycle gate preservation, plus the v2 CLI E2E coverage for --record-depth.\n  - Verify Markdown source round-trips recordDepth; legacy Markdown and an SQLite cache without record_depth resolve to FULL.\n  - Verify LIGHTWEIGHT tasks still require the current grill, brief confirmation, trace, evaluation, and close contract in Stage 1.\n  - Run git diff --check and inspect changed files to ensure lifecycle gates, trace/evaluate behavior, workspace mode, hooks, and automatic agent routing were not changed.\nScope expected:\n  - src/types/index.ts\n  - src/core/v2/source-store.ts\n  - src/core/v2/store.ts\n  - src/core/v2/rebuild.ts\n  - src/core/v2/task.ts\n  - src/core/v2/cache-bundle.ts\n  - src/cli.ts\n  - src/commands/v2/index.ts\n  - status or brief projection only if recordDepth is not already exposed through Task\n  - .sduck/sduck-assets/agent-rules/core.md\n  - README.md\n  - docs/migration.md\n  - focused v2 lifecycle, source/cache, CLI E2E, and regression tests\nScope avoided:\n  - task-lifecycle gate changes\n  - trace, evaluate, and close behavior changes\n  - LIGHTWEIGHT escalation command\n  - automatic workspace-wide workflow toggles\n  - agent automatic classification behavior before a later stage\nOpen questions: 0\nEvidence:\n  - [CODE] src/core/v2/policy.ts (0.95): workflowEnabled is a validated workspace policy written durably under the workspace lock.\n  - [CODE] src/core/v2/task.ts (0.95): The workflow policy gates new task creation rather than supplying a per-task risk setting.\n  - [CODE] src/core/v2/policy.ts (0.95): workflowEnabled is a tracked workspace policy that controls new task creation rather than per-task treatment.\n  - [CODE] src/core/v2/retrospective.ts (0.95): Retrospective capture is limited to disabled workflow mode, so enabled-mode task skipping is not retrospectively recorded.\n  - [USER_ANSWER] Q-RECORD-DEPTH-ARCHITECTURE (1): Target first-class FULL/LIGHTWEIGHT classification; keep full lifecycle until implemented\n  - [CODE] src/core/v2/task-lifecycle.ts (0.95): Current lifecycle behavior is a single full workflow and does not provide a per-task record-depth concept.\n  - [CODE] src/core/v2/task-lifecycle.ts (0.95): Current lifecycle gates are keyed to guided task behavior, so introducing recordDepth without changing those gates keeps existing task semantics stable.\n  - [CODE] src/core/v2/source-store.ts (0.95): Task fields already round-trip through canonical Markdown validation and embedded brief snapshots, enabling an additive durable field.\n  - [USER_ANSWER] Q-CLASSIFICATION-ROLLOUT (1): Stage 1 durable foundation first\n  - [CODE] src/types/index.ts (0.9): Task already has optional guided and retrospective fields that establish an additive field threading precedent.\n  - [CODE] src/core/v2/store.ts (0.95): The SQLite cache schema uses idempotent ensureColumn migrations suitable for an additive record_depth column.\n────────────────────────────────────────",
      "gitBaseline": {
        "head": "37f83f9ec0ff56d83fdafa0475f91013eadeb06b",
        "dirtyFileHashes": {
          ".ignore": "d848d497c18118c6142a789e167a989adbc2c2227e371b0164480a6206bab443"
        }
      },
      "createdAt": "2026-07-22T06:48:11.375Z"
    }
  ],
  "evaluations": [
    {
      "id": "EVAL-0004",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "traceId": "IMPL-0021",
      "checks": [
        {
          "name": "git diff --check",
          "outcome": "passed"
        },
        {
          "name": "npm run typecheck",
          "outcome": "passed"
        },
        {
          "name": "npx vitest run tests/unit/decision-workspace.test.ts tests/e2e/v2-cli.test.ts",
          "outcome": "passed"
        }
      ],
      "limitations": [
        "Stage 1 stores and exposes recordDepth only; LIGHTWEIGHT lifecycle relaxation, escalation, and automatic agent routing are intentionally deferred."
      ],
      "createdAt": "2026-07-22T06:55:08.013Z"
    }
  ],
  "events": [
    {
      "id": "EVT-0276",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "type": "TASK_CREATED",
      "payload": {
        "description": "Configure risk-based sduck workflow activation",
        "policy": {
          "grillMeRequired": false
        }
      },
      "createdAt": "2026-07-22T03:45:53.512Z"
    },
    {
      "id": "EVT-0277",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "type": "GRILL_STARTED",
      "payload": {
        "automatic": true
      },
      "createdAt": "2026-07-22T03:45:53.512Z"
    },
    {
      "id": "EVT-0278",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "type": "CONTEXT_INDEXED",
      "payload": {
        "itemCount": 40
      },
      "createdAt": "2026-07-22T03:45:53.654Z"
    },
    {
      "id": "EVT-0279",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "type": "GRILL_COMPLETED",
      "payload": {
        "reason": "The user selected task-scoped record depth rather than persistent workspace workflow toggles; risk criteria and override will be encoded in agent guidance.",
        "carried": []
      },
      "createdAt": "2026-07-22T03:48:20.246Z"
    },
    {
      "id": "EVT-0280",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-TASK-SCOPED-RECORD-DEPTH"
      },
      "createdAt": "2026-07-22T03:49:48.148Z"
    },
    {
      "id": "EVT-0281",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 1,
        "questions": 0,
        "evidence": 2,
        "expectedScope": [
          ".sduck/sduck-assets/agent-rules/core.md",
          "generated managed AGENTS.md and CLAUDE.md outputs"
        ],
        "avoidScope": [
          "src/**",
          "tests/**",
          ".decision/policy.json",
          "Git hook implementation"
        ],
        "implementationPlan": [
          "Add a task-triage rule to the canonical agent-rule template that classifies high-risk work as policy-required and allows isolated low-risk work to proceed without creating a v2 decision task.",
          "State that agents must not automatically call the repository-wide workflow enable or disable commands, and must default to the full workflow when uncertain.",
          "Regenerate the managed root agent instructions with the supported sduck command."
        ],
        "verificationPlan": [
          "Inspect the generated instructions to confirm the same triage rule appears in the canonical template and managed outputs.",
          "Run git diff --check and review the changed-file list to ensure no CLI, policy, or hook code changed."
        ]
      },
      "createdAt": "2026-07-22T03:49:48.148Z"
    },
    {
      "id": "EVT-0282",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-WORKSPACE-MODE-NOT-TASK-ROUTER"
      },
      "createdAt": "2026-07-22T05:41:57.909Z"
    },
    {
      "id": "EVT-0283",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 1,
        "questions": 1,
        "evidence": 2,
        "expectedScope": [
          "Target architecture decision only; implementation scope follows after approval"
        ],
        "avoidScope": [
          "instruction-only lifecycle bypass",
          "automatic workspace-wide workflow toggles"
        ],
        "implementationPlan": [
          "Do not modify implementation until the user selects the record-depth architecture.",
          "If lightweight records are selected, design and implement a durable per-task classification before changing agent guidance."
        ],
        "verificationPlan": [
          "Confirm the selected direction preserves a canonical record for every enabled-workspace code-change task.",
          "Before implementation, define migration, lifecycle, trace, evaluation, and regression-test evidence for the selected direction."
        ]
      },
      "createdAt": "2026-07-22T05:41:57.909Z"
    },
    {
      "id": "EVT-0284",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0065"
      },
      "createdAt": "2026-07-22T05:43:23.415Z"
    },
    {
      "id": "EVT-0285",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "type": "QUESTION_ANSWERED",
      "payload": {
        "questionId": "Q-RECORD-DEPTH-ARCHITECTURE",
        "answer": "Target first-class FULL/LIGHTWEIGHT classification; keep full lifecycle until implemented"
      },
      "createdAt": "2026-07-22T05:43:23.415Z"
    },
    {
      "id": "EVT-0286",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-SUPERSEDE-INSTRUCTION-ONLY-TRIAGE"
      },
      "createdAt": "2026-07-22T05:44:00.966Z"
    },
    {
      "id": "EVT-0287",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 1,
        "questions": 0,
        "evidence": 1,
        "expectedScope": [
          "Target architecture decision only; implementation scope follows after approval"
        ],
        "avoidScope": [
          "instruction-only lifecycle bypass",
          "automatic workspace-wide workflow toggles"
        ],
        "implementationPlan": [
          "Do not modify implementation until the user approves a detailed classification-model plan.",
          "Design a backward-compatible FULL/LIGHTWEIGHT task classification that keeps FULL as the default and preserves current workspace mode semantics."
        ],
        "verificationPlan": [
          "Confirm the selected direction preserves a canonical record for every enabled-workspace code-change task.",
          "Before implementation, define migration, lifecycle, trace, evaluation, and regression-test evidence for the selected direction."
        ]
      },
      "createdAt": "2026-07-22T05:44:00.966Z"
    },
    {
      "id": "EVT-0288",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 0,
        "questions": 1,
        "evidence": 2,
        "expectedScope": [
          "Release-scope decision for durable per-task record-depth classification"
        ],
        "avoidScope": [
          "instruction-only lifecycle bypass",
          "automatic workspace-wide workflow toggles",
          "implementation before rollout scope is approved"
        ],
        "implementationPlan": [
          "Select a staged or end-to-end rollout for FULL/LIGHTWEIGHT classification.",
          "For a staged rollout, first make recordDepth durable and backward-compatible while preserving all current gates."
        ],
        "verificationPlan": [
          "Ensure legacy Markdown and SQLite cache data resolve to FULL.",
          "Ensure no current lifecycle gate changes before a dedicated lightweight-behavior design is approved."
        ]
      },
      "createdAt": "2026-07-22T05:50:28.924Z"
    },
    {
      "id": "EVT-0289",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0066"
      },
      "createdAt": "2026-07-22T06:24:36.247Z"
    },
    {
      "id": "EVT-0290",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "type": "QUESTION_ANSWERED",
      "payload": {
        "questionId": "Q-CLASSIFICATION-ROLLOUT",
        "answer": "Stage 1 durable foundation first"
      },
      "createdAt": "2026-07-22T06:24:36.247Z"
    },
    {
      "id": "EVT-0291",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-STAGE-ONE-DURABLE-RECORD-DEPTH"
      },
      "createdAt": "2026-07-22T06:25:58.737Z"
    },
    {
      "id": "EVT-0292",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 1,
        "questions": 0,
        "evidence": 2,
        "expectedScope": [
          "src/types/index.ts",
          "src/core/v2/source-store.ts",
          "src/core/v2/store.ts",
          "src/core/v2/rebuild.ts",
          "src/core/v2/task.ts",
          "src/core/v2/cache-bundle.ts",
          "src/cli.ts",
          "src/commands/v2/index.ts",
          "status or brief projection only if recordDepth is not already exposed through Task",
          ".sduck/sduck-assets/agent-rules/core.md",
          "README.md",
          "docs/migration.md",
          "focused v2 lifecycle, source/cache, CLI E2E, and regression tests"
        ],
        "avoidScope": [
          "task-lifecycle gate changes",
          "trace, evaluate, and close behavior changes",
          "LIGHTWEIGHT escalation command",
          "automatic workspace-wide workflow toggles",
          "agent automatic classification behavior before a later stage"
        ],
        "implementationPlan": [
          "Add a RecordDepth type and optional Task.recordDepth field. New tasks receive an explicit FULL default; legacy or omitted values resolve to FULL without rewriting historical source.",
          "Thread recordDepth through canonical Markdown render, parse, validation, brief snapshots, SQLite schema migration, rebuild insertion, and both cache mappers while preserving event schemas.",
          "Add a validated sduck work --record-depth FULL|LIGHTWEIGHT option and pass it to task creation. Keep guided true and leave task-lifecycle, trace, evaluation, and close gates unchanged for both depths.",
          "Expose and document the stored classification, explicitly stating that LIGHTWEIGHT is behavioral no-op in Stage 1 and will not yet cause agents to choose a lower-ceremony flow.",
          "Add focused compatibility and behavior-preservation tests, then regenerate managed agent instructions and review the generated outputs."
        ],
        "verificationPlan": [
          "Run focused unit tests for task/source/cache compatibility and lifecycle gate preservation, plus the v2 CLI E2E coverage for --record-depth.",
          "Verify Markdown source round-trips recordDepth; legacy Markdown and an SQLite cache without record_depth resolve to FULL.",
          "Verify LIGHTWEIGHT tasks still require the current grill, brief confirmation, trace, evaluation, and close contract in Stage 1.",
          "Run git diff --check and inspect changed files to ensure lifecycle gates, trace/evaluate behavior, workspace mode, hooks, and automatic agent routing were not changed."
        ]
      },
      "createdAt": "2026-07-22T06:25:58.737Z"
    },
    {
      "id": "EVT-0293",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "type": "BRIEF_CONFIRMED",
      "payload": {
        "snapshotId": "BRF-0018"
      },
      "createdAt": "2026-07-22T06:48:11.375Z"
    },
    {
      "id": "EVT-0294",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "type": "TRACE_CREATED",
      "payload": {
        "traceId": "IMPL-0021",
        "filesChanged": [
          "AGENTS.md",
          "CLAUDE.md",
          "README.md",
          "docs/migration.md",
          "src/cli.ts",
          "src/commands/v2/index.ts",
          "src/core/v2/cache-bundle.ts",
          "src/core/v2/rebuild.ts",
          "src/core/v2/source-store.ts",
          "src/core/v2/store.ts",
          "src/core/v2/task.ts",
          "src/types/index.ts",
          "tests/e2e/v2-cli.test.ts",
          "tests/unit/decision-workspace.test.ts"
        ]
      },
      "createdAt": "2026-07-22T06:55:07.836Z"
    },
    {
      "id": "EVT-0295",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "type": "EVALUATION_RECORDED",
      "payload": {
        "evaluationId": "EVAL-0004",
        "traceId": "IMPL-0021"
      },
      "createdAt": "2026-07-22T06:55:08.013Z"
    },
    {
      "id": "EVT-0296",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
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
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo.md",
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
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-MIGRATE-061.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-STAGE-ONE-DURABLE-RECORD-DEPTH.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-SUPERSEDE-INSTRUCTION-ONLY-TRIAGE.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-TASK-SCOPED-RECORD-DEPTH.md",
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
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/DECISION_REPORT.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/decision-graph.json"
        ]
      },
      "createdAt": "2026-07-22T06:55:08.184Z"
    },
    {
      "id": "EVT-0297",
      "taskId": "TASK-20260722-configure-risk-based-sduck-workflow-activation",
      "type": "TASK_CLOSED",
      "payload": {},
      "createdAt": "2026-07-22T06:55:08.424Z"
    }
  ]
}
```
