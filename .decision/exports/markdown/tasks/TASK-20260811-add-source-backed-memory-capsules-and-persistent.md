---
id: TASK-20260811-add-source-backed-memory-capsules-and-persistent
type: task
status: CLOSED
title: Add source-backed Memory Capsules and persistent context deduplication
record_depth: FULL
created_at: '2026-08-11T14:36:46.012Z'
updated_at: '2026-08-11T15:01:02.389Z'
---
# TASK-20260811-add-source-backed-memory-capsules-and-persistent: Add source-backed Memory Capsules and persistent context deduplication

Add source-backed Memory Capsules and persistent context deduplication

## Sduck source

```json sduck-source
{
  "task": {
    "id": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
    "title": "Add source-backed Memory Capsules and persistent context deduplication",
    "description": "Add source-backed Memory Capsules and persistent context deduplication",
    "status": "CLOSED",
    "expectedScope": [
      "Memory Capsule canonical schema, Markdown source documents, SQLite cache projection, validation, and rebuild support",
      "Agent-authored stdin distillation command and missing/stale status command",
      "Capsule-first recall and context retrieval",
      "Persistent context deduplication and automatic-context bound",
      "Unit, E2E, compatibility tests, and public documentation"
    ],
    "avoidScope": [
      "Deleting or cold-archiving raw canonical records",
      "Changing DecisionWorkspace to incremental source writes or partial cache rebuilds",
      "Embedding an LLM or network service",
      "Automatic commit, tag, publish, or release version bump"
    ],
    "guided": true,
    "recordDepth": "FULL",
    "createdAt": "2026-08-11T14:36:46.012Z",
    "updatedAt": "2026-08-11T15:01:02.389Z",
    "implementationPlan": [
      "Add failing contract tests for context idempotency, source-backed capsule validation/upsert, cache rebuild, status, and recall ordering.",
      "Add Memory Capsule types and an independent canonical memories directory with backward-compatible loading.",
      "Project capsules into SQLite and implement deterministic source catalogs, digests, distillation, and status.",
      "Wire memory commands and capsule-first recall/context behavior through CLI and localized rendering.",
      "Document the lifecycle and run formatting, static analysis, unit, E2E, build, and package checks."
    ],
    "verificationPlan": [
      "Run targeted unit and E2E tests while implementing.",
      "Run npm run typecheck, npm run lint, and npm run format:check.",
      "Run the complete unit and E2E suites, npm run build, and npm run package:check.",
      "Record exact outcomes in sduck evaluate and verify the capsule through recall before closing."
    ]
  },
  "questions": [],
  "evidence": [
    {
      "id": "EVD-0075",
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "decisionId": "DEC-CONTEXT-PERSISTENT-UPSERT",
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/context.ts:153",
      "summary": "buildContextIndex slices and deduplicates only the newly generated candidates, then unconditionally appends them to bundle.contextItems.",
      "confidence": 1,
      "createdAt": "2026-08-11T14:37:48.747Z"
    },
    {
      "id": "EVD-0076",
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "decisionId": "DEC-MEMORY-CAPSULE-BOUNDARY",
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/source-store.ts:195",
      "summary": "Canonical v2 records are rendered from SourceBundle into task, decision, and implementation Markdown directories.",
      "confidence": 1,
      "createdAt": "2026-08-11T14:37:48.747Z"
    },
    {
      "id": "EVD-0077",
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "decisionId": "DEC-MEMORY-AGENT-DISTILLATION",
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/remember.ts:23",
      "summary": "remember currently exports source paths and graph artifacts but performs no semantic distillation.",
      "confidence": 1,
      "createdAt": "2026-08-11T14:37:48.747Z"
    },
    {
      "id": "EVD-0078",
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "decisionId": "DEC-MEMORY-RECALL-FIRST",
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/recall.ts:16",
      "summary": "recall currently searches only confirmed decisions and implementation traces with bounded SQL LIKE queries.",
      "confidence": 1,
      "createdAt": "2026-08-11T14:37:48.747Z"
    }
  ],
  "contextItems": [
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0943",
      "createdAt": "2026-08-11T14:36:46.143Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-WIKI-MATERIALIZED-VIEW",
      "summary": "Decision applies to relevant file src/types/index.ts: Make a fixed Markdown Wiki the human-facing materialized view",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/types/index.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0944",
      "createdAt": "2026-08-11T14:36:46.143Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0945",
      "createdAt": "2026-08-11T14:36:46.144Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0001",
      "summary": "Prior decision: Release the backward-compatible feature set as 0.5.0 — Bump the npm package from 0.4.0 to 0.5.0 because the completed v2 workflow and locale work adds public capabilities without intended breaking changes.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0946",
      "createdAt": "2026-08-11T14:36:46.144Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0012",
      "summary": "Prior decision: Make automatic context discovery privacy-first — Automatic discovery considers tracked regular files only; untracked paths require explicit addition, symlink escapes are rejected, and canonical records store references, hashes, and curated summaries.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0947",
      "createdAt": "2026-08-11T14:36:46.144Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0016",
      "summary": "Prior decision: What stale-confirmation revision token should 0.6 use in addition to the brief digest? — Digest only",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0948",
      "createdAt": "2026-08-11T14:36:46.144Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0018",
      "summary": "Prior decision: What source-schema migration policy should apply to 0.6 canonical records? — Versioned additive envelope",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0949",
      "createdAt": "2026-08-11T14:36:46.144Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0053",
      "summary": "Prior decision: Store workflow mode as tracked workspace policy — Add an additive workflow mode to `.decision/policy.json`. Missing legacy policy defaults to enabled for new work; the setting is reviewed and versioned with the project.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0950",
      "createdAt": "2026-08-11T14:36:46.144Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0951",
      "createdAt": "2026-08-11T14:36:46.145Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0952",
      "createdAt": "2026-08-11T14:36:46.145Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0021",
      "summary": "Prior decision: How should 0.6 migrate legacy canonical source without rewriting history unexpectedly? — Explicit atomic migration (recommended)",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0953",
      "createdAt": "2026-08-11T14:36:46.145Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0026",
      "summary": "Decision applies to relevant file tests/fixtures/source-envelope/v1/mcp-tools.contract.json: Correct Phase 0 fixtures into executable contracts",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "tests/fixtures/source-envelope/v1/mcp-tools.contract.json"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-0954",
      "createdAt": "2026-08-11T14:36:46.145Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0955",
      "createdAt": "2026-08-11T14:36:46.145Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0956",
      "createdAt": "2026-08-11T14:36:46.145Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0957",
      "createdAt": "2026-08-11T14:36:46.145Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0958",
      "createdAt": "2026-08-11T14:36:46.146Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "sourceType": "MEMORY",
      "sourceRef": "IMPL-0006",
      "summary": "Prior implementation trace: Detected 13 changed file(s).",
      "metadata": {
        "type": "implementation_trace",
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
        ],
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0959",
      "createdAt": "2026-08-11T14:36:46.146Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "sourceType": "MEMORY",
      "sourceRef": "IMPL-0007",
      "summary": "Prior implementation trace: Detected 13 changed file(s).",
      "metadata": {
        "type": "implementation_trace",
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
        ],
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0960",
      "createdAt": "2026-08-11T14:36:46.146Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0041",
      "summary": "Decision applies to relevant file src/core/v2/context.ts: Reduce grilling through evidence-backed carried decisions",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/core/v2/context.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0961",
      "createdAt": "2026-08-11T14:36:46.146Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0962",
      "createdAt": "2026-08-11T14:36:46.146Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0-6-cli-foundation",
      "summary": "Decision applies to relevant file README.ko.md: Ship 0.6.0 as CLI foundations, not an MCP runtime",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "README.ko.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0963",
      "createdAt": "2026-08-11T14:36:46.146Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0964",
      "createdAt": "2026-08-11T14:36:46.146Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-RELEASE-0-6-2",
      "summary": "Decision applies to relevant file tests/fixtures/source-envelope/v1/mcp-tools.contract.json: Release Stage 1 as a new 0.6.2 package",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "tests/fixtures/source-envelope/v1/mcp-tools.contract.json"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-0965",
      "createdAt": "2026-08-11T14:36:46.147Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0966",
      "createdAt": "2026-08-11T14:36:46.147Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0967",
      "createdAt": "2026-08-11T14:36:46.147Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0968",
      "createdAt": "2026-08-11T14:36:46.147Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0969",
      "createdAt": "2026-08-11T14:36:46.147Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0970",
      "createdAt": "2026-08-11T14:36:46.147Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0971",
      "createdAt": "2026-08-11T14:36:46.147Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0972",
      "createdAt": "2026-08-11T14:36:46.148Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0973",
      "createdAt": "2026-08-11T14:36:46.148Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0974",
      "createdAt": "2026-08-11T14:36:46.148Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0975",
      "createdAt": "2026-08-11T14:36:46.148Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0976",
      "createdAt": "2026-08-11T14:36:46.148Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0977",
      "createdAt": "2026-08-11T14:36:46.148Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0978",
      "createdAt": "2026-08-11T14:36:46.148Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0979",
      "createdAt": "2026-08-11T14:36:46.149Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0980",
      "createdAt": "2026-08-11T14:36:46.149Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0039",
      "summary": "Decision applies to relevant file src/types/index.ts: Unify specification and plan in one confirmed Brief",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/types/index.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0981",
      "createdAt": "2026-08-11T14:36:46.149Z"
    },
    {
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
      "id": "CTX-0982",
      "createdAt": "2026-08-11T14:36:46.149Z"
    }
  ],
  "briefSnapshots": [
    {
      "id": "BRF-0023",
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "snapshot": {
        "task": {
          "id": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
          "title": "Add source-backed Memory Capsules and persistent context deduplication",
          "description": "Add source-backed Memory Capsules and persistent context deduplication",
          "status": "CONFIRMED",
          "expectedScope": [
            "Memory Capsule canonical schema, Markdown source documents, SQLite cache projection, validation, and rebuild support",
            "Agent-authored stdin distillation command and missing/stale status command",
            "Capsule-first recall and context retrieval",
            "Persistent context deduplication and automatic-context bound",
            "Unit, E2E, compatibility tests, and public documentation"
          ],
          "avoidScope": [
            "Deleting or cold-archiving raw canonical records",
            "Changing DecisionWorkspace to incremental source writes or partial cache rebuilds",
            "Embedding an LLM or network service",
            "Automatic commit, tag, publish, or release version bump"
          ],
          "guided": true,
          "recordDepth": "FULL",
          "createdAt": "2026-08-11T14:36:46.012Z",
          "updatedAt": "2026-08-11T14:37:54.718Z",
          "implementationPlan": [
            "Add failing contract tests for context idempotency, source-backed capsule validation/upsert, cache rebuild, status, and recall ordering.",
            "Add Memory Capsule types and an independent canonical memories directory with backward-compatible loading.",
            "Project capsules into SQLite and implement deterministic source catalogs, digests, distillation, and status.",
            "Wire memory commands and capsule-first recall/context behavior through CLI and localized rendering.",
            "Document the lifecycle and run formatting, static analysis, unit, E2E, build, and package checks."
          ],
          "verificationPlan": [
            "Run targeted unit and E2E tests while implementing.",
            "Run npm run typecheck, npm run lint, and npm run format:check.",
            "Run the complete unit and E2E suites, npm run build, and npm run package:check.",
            "Record exact outcomes in sduck evaluate and verify the capsule through recall before closing."
          ]
        },
        "decisions": {
          "EXPLICIT": [
            {
              "id": "DEC-MEMORY-CAPSULE-BOUNDARY",
              "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
              "title": "Store one source-backed Memory Capsule per task",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Add a separate Git-tracked canonical Memory Capsule document per task. Re-distillation updates that stable capsule instead of appending another record, while raw task, decision, evidence, trace, and evaluation records remain intact.",
              "rationale": [
                "The user asked for a structure that keeps accumulated data usable without losing traceability.",
                "A one-per-task upsert gives memory a bounded lifecycle instead of creating another unbounded event stream."
              ],
              "appliesTo": [
                "src/types/index.ts",
                "src/core/v2/source-types.ts",
                "src/core/v2/source-store.ts",
                "src/core/v2/paths.ts",
                "src/core/v2/decision-workspace.ts",
                "src/core/v2/store.ts",
                "src/core/v2/rebuild.ts"
              ],
              "avoids": [
                "Deleting canonical source records",
                "Storing capsules inside growing task documents"
              ],
              "sourceRefs": [
                "user:작업 해줘"
              ],
              "createdAt": "2026-08-11T14:37:48.747Z",
              "updatedAt": "2026-08-11T14:37:48.747Z"
            },
            {
              "id": "DEC-MEMORY-DEFER-COLD-ARCHIVE",
              "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
              "title": "Defer destructive compaction and storage-engine optimization",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "This slice does not delete or cold-archive canonical history and does not change full-bundle workspace rewrites into incremental commits. Those require a separately reviewed migration and recovery contract.",
              "rationale": [
                "The first usable slice can stop duplicate growth and improve retrieval without risking source loss.",
                "Incremental persistence changes the atomicity boundary and deserves independent failure-mode testing."
              ],
              "appliesTo": [
                "src/core/v2/decision-workspace.ts"
              ],
              "avoids": [
                "Raw record deletion",
                "Cold archive migration",
                "Incremental cache rebuild"
              ],
              "sourceRefs": [
                "src/core/v2/decision-workspace.ts"
              ],
              "createdAt": "2026-08-11T14:37:48.747Z",
              "updatedAt": "2026-08-11T14:37:48.747Z"
            }
          ],
          "INFERRED": [
            {
              "id": "DEC-CONTEXT-PERSISTENT-UPSERT",
              "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
              "title": "Make persisted context indexing idempotent",
              "kind": "INFERRED",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Deduplicate persisted context by task, source type, and source reference; preserve the strongest candidate and existing stable ID; cap automatically discovered context at 40 per task; and make repeated explicit file additions idempotent.",
              "rationale": [
                "Current buildContextIndex deduplicates only candidates from one invocation before appending them.",
                "Repeated context runs therefore grow canonical task documents even when no new source exists."
              ],
              "appliesTo": [
                "src/core/v2/context.ts",
                "tests/unit/v2-lifecycle.test.ts"
              ],
              "avoids": [
                "Dropping explicitly requested file context",
                "Reassigning existing context IDs"
              ],
              "sourceRefs": [
                "src/core/v2/context.ts:92",
                "src/core/v2/context.ts:447"
              ],
              "createdAt": "2026-08-11T14:37:48.747Z",
              "updatedAt": "2026-08-11T14:37:48.747Z"
            },
            {
              "id": "DEC-MEMORY-AGENT-DISTILLATION",
              "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
              "title": "Keep semantic distillation agent-authored and CLI-verified",
              "kind": "INFERRED",
              "status": "CONFIRMED",
              "confidence": 0.95,
              "summary": "Expose a stdin-based memory distillation command. The agent supplies concise claims; the CLI validates task ownership, claim-to-source type compatibility, source existence, source status, and a deterministic digest without embedding an LLM.",
              "rationale": [
                "The CLI already records agent decisions but does not contain a model runtime.",
                "Per-claim source references retain auditability and let stale memory be detected deterministically."
              ],
              "appliesTo": [
                "src/core/v2/memory.ts",
                "src/commands/v2/index.ts",
                "src/cli.ts",
                "src/ui/v2/render.ts"
              ],
              "avoids": [
                "Built-in LLM calls",
                "Unverifiable free-form summaries"
              ],
              "sourceRefs": [
                "src/core/v2/remember.ts",
                "src/core/v2/source-store.ts"
              ],
              "createdAt": "2026-08-11T14:37:48.747Z",
              "updatedAt": "2026-08-11T14:37:48.747Z"
            },
            {
              "id": "DEC-MEMORY-RECALL-FIRST",
              "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
              "title": "Search distilled memory before raw history",
              "kind": "INFERRED",
              "status": "CONFIRMED",
              "confidence": 0.95,
              "summary": "Add capsule-first results to recall and a memory status command that reports missing or stale capsules, while retaining bounded decision and trace fallback results for backward compatibility.",
              "rationale": [
                "Distillation only reduces working context if retrieval prefers it.",
                "Status makes maintenance explicit without silently rewriting semantic content."
              ],
              "appliesTo": [
                "src/core/v2/recall.ts",
                "src/core/v2/memory.ts",
                "src/ui/v2/render.ts",
                "src/commands/v2/index.ts",
                "src/cli.ts"
              ],
              "avoids": [
                "Removing existing recall result categories"
              ],
              "sourceRefs": [
                "src/core/v2/recall.ts",
                "src/core/v2/context.ts:240"
              ],
              "createdAt": "2026-08-11T14:37:48.747Z",
              "updatedAt": "2026-08-11T14:37:48.747Z"
            }
          ],
          "CARRIED": [],
          "CONFLICT": [],
          "OPEN": []
        },
        "questions": [],
        "evidence": [
          {
            "id": "EVD-0075",
            "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
            "decisionId": "DEC-CONTEXT-PERSISTENT-UPSERT",
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/context.ts:153",
            "summary": "buildContextIndex slices and deduplicates only the newly generated candidates, then unconditionally appends them to bundle.contextItems.",
            "confidence": 1,
            "createdAt": "2026-08-11T14:37:48.747Z"
          },
          {
            "id": "EVD-0076",
            "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
            "decisionId": "DEC-MEMORY-CAPSULE-BOUNDARY",
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/source-store.ts:195",
            "summary": "Canonical v2 records are rendered from SourceBundle into task, decision, and implementation Markdown directories.",
            "confidence": 1,
            "createdAt": "2026-08-11T14:37:48.747Z"
          },
          {
            "id": "EVD-0077",
            "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
            "decisionId": "DEC-MEMORY-AGENT-DISTILLATION",
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/remember.ts:23",
            "summary": "remember currently exports source paths and graph artifacts but performs no semantic distillation.",
            "confidence": 1,
            "createdAt": "2026-08-11T14:37:48.747Z"
          },
          {
            "id": "EVD-0078",
            "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
            "decisionId": "DEC-MEMORY-RECALL-FIRST",
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/recall.ts:16",
            "summary": "recall currently searches only confirmed decisions and implementation traces with bounded SQL LIKE queries.",
            "confidence": 1,
            "createdAt": "2026-08-11T14:37:48.747Z"
          }
        ],
        "expectedScope": [
          "Memory Capsule canonical schema, Markdown source documents, SQLite cache projection, validation, and rebuild support",
          "Agent-authored stdin distillation command and missing/stale status command",
          "Capsule-first recall and context retrieval",
          "Persistent context deduplication and automatic-context bound",
          "Unit, E2E, compatibility tests, and public documentation"
        ],
        "avoidScope": [
          "Deleting or cold-archiving raw canonical records",
          "Changing DecisionWorkspace to incremental source writes or partial cache rebuilds",
          "Embedding an LLM or network service",
          "Automatic commit, tag, publish, or release version bump"
        ],
        "implementationPlan": [
          "Add failing contract tests for context idempotency, source-backed capsule validation/upsert, cache rebuild, status, and recall ordering.",
          "Add Memory Capsule types and an independent canonical memories directory with backward-compatible loading.",
          "Project capsules into SQLite and implement deterministic source catalogs, digests, distillation, and status.",
          "Wire memory commands and capsule-first recall/context behavior through CLI and localized rendering.",
          "Document the lifecycle and run formatting, static analysis, unit, E2E, build, and package checks."
        ],
        "verificationPlan": [
          "Run targeted unit and E2E tests while implementing.",
          "Run npm run typecheck, npm run lint, and npm run format:check.",
          "Run the complete unit and E2E suites, npm run build, and npm run package:check.",
          "Record exact outcomes in sduck evaluate and verify the capsule through recall before closing."
        ],
        "openQuestionCount": 0
      },
      "renderedMarkdown": "────────────────────────────────────────\nImplementation Brief\n────────────────────────────────────────\nTask: TASK-20260811-add-source-backed-memory-capsules-and-persistent\nAdd source-backed Memory Capsules and persistent context deduplication\n\nA. Explicit decisions\n[EXPLICIT] DEC-MEMORY-CAPSULE-BOUNDARY. Store one source-backed Memory Capsule per task\nConfidence: 1.00\nSummary: Add a separate Git-tracked canonical Memory Capsule document per task. Re-distillation updates that stable capsule instead of appending another record, while raw task, decision, evidence, trace, and evaluation records remain intact.\nSource refs:\n  - user:작업 해줘\nRationale:\n  - The user asked for a structure that keeps accumulated data usable without losing traceability.\n  - A one-per-task upsert gives memory a bounded lifecycle instead of creating another unbounded event stream.\nApplies to:\n  - src/types/index.ts\n  - src/core/v2/source-types.ts\n  - src/core/v2/source-store.ts\n  - src/core/v2/paths.ts\n  - src/core/v2/decision-workspace.ts\n  - src/core/v2/store.ts\n  - src/core/v2/rebuild.ts\nAvoids:\n  - Deleting canonical source records\n  - Storing capsules inside growing task documents\n\n[EXPLICIT] DEC-MEMORY-DEFER-COLD-ARCHIVE. Defer destructive compaction and storage-engine optimization\nConfidence: 1.00\nSummary: This slice does not delete or cold-archive canonical history and does not change full-bundle workspace rewrites into incremental commits. Those require a separately reviewed migration and recovery contract.\nSource refs:\n  - src/core/v2/decision-workspace.ts\nRationale:\n  - The first usable slice can stop duplicate growth and improve retrieval without risking source loss.\n  - Incremental persistence changes the atomicity boundary and deserves independent failure-mode testing.\nApplies to:\n  - src/core/v2/decision-workspace.ts\nAvoids:\n  - Raw record deletion\n  - Cold archive migration\n  - Incremental cache rebuild\n\nB. Inferred decisions\n[INFERRED] DEC-CONTEXT-PERSISTENT-UPSERT. Make persisted context indexing idempotent\nConfidence: 1.00\nSummary: Deduplicate persisted context by task, source type, and source reference; preserve the strongest candidate and existing stable ID; cap automatically discovered context at 40 per task; and make repeated explicit file additions idempotent.\nSource refs:\n  - src/core/v2/context.ts:92\n  - src/core/v2/context.ts:447\nRationale:\n  - Current buildContextIndex deduplicates only candidates from one invocation before appending them.\n  - Repeated context runs therefore grow canonical task documents even when no new source exists.\nApplies to:\n  - src/core/v2/context.ts\n  - tests/unit/v2-lifecycle.test.ts\nAvoids:\n  - Dropping explicitly requested file context\n  - Reassigning existing context IDs\n\n[INFERRED] DEC-MEMORY-AGENT-DISTILLATION. Keep semantic distillation agent-authored and CLI-verified\nConfidence: 0.95\nSummary: Expose a stdin-based memory distillation command. The agent supplies concise claims; the CLI validates task ownership, claim-to-source type compatibility, source existence, source status, and a deterministic digest without embedding an LLM.\nSource refs:\n  - src/core/v2/remember.ts\n  - src/core/v2/source-store.ts\nRationale:\n  - The CLI already records agent decisions but does not contain a model runtime.\n  - Per-claim source references retain auditability and let stale memory be detected deterministically.\nApplies to:\n  - src/core/v2/memory.ts\n  - src/commands/v2/index.ts\n  - src/cli.ts\n  - src/ui/v2/render.ts\nAvoids:\n  - Built-in LLM calls\n  - Unverifiable free-form summaries\n\n[INFERRED] DEC-MEMORY-RECALL-FIRST. Search distilled memory before raw history\nConfidence: 0.95\nSummary: Add capsule-first results to recall and a memory status command that reports missing or stale capsules, while retaining bounded decision and trace fallback results for backward compatibility.\nSource refs:\n  - src/core/v2/recall.ts\n  - src/core/v2/context.ts:240\nRationale:\n  - Distillation only reduces working context if retrieval prefers it.\n  - Status makes maintenance explicit without silently rewriting semantic content.\nApplies to:\n  - src/core/v2/recall.ts\n  - src/core/v2/memory.ts\n  - src/ui/v2/render.ts\n  - src/commands/v2/index.ts\n  - src/cli.ts\nAvoids:\n  - Removing existing recall result categories\n\nC. Carried decisions\n  - none\n\nD. Conflicts\n  - none\n\nE. Open decisions\n  - none\n\nProblem:\n  Add source-backed Memory Capsules and persistent context deduplication\nImplementation plan:\n  - Add failing contract tests for context idempotency, source-backed capsule validation/upsert, cache rebuild, status, and recall ordering.\n  - Add Memory Capsule types and an independent canonical memories directory with backward-compatible loading.\n  - Project capsules into SQLite and implement deterministic source catalogs, digests, distillation, and status.\n  - Wire memory commands and capsule-first recall/context behavior through CLI and localized rendering.\n  - Document the lifecycle and run formatting, static analysis, unit, E2E, build, and package checks.\nVerification plan:\n  - Run targeted unit and E2E tests while implementing.\n  - Run npm run typecheck, npm run lint, and npm run format:check.\n  - Run the complete unit and E2E suites, npm run build, and npm run package:check.\n  - Record exact outcomes in sduck evaluate and verify the capsule through recall before closing.\nScope expected:\n  - Memory Capsule canonical schema, Markdown source documents, SQLite cache projection, validation, and rebuild support\n  - Agent-authored stdin distillation command and missing/stale status command\n  - Capsule-first recall and context retrieval\n  - Persistent context deduplication and automatic-context bound\n  - Unit, E2E, compatibility tests, and public documentation\nScope avoided:\n  - Deleting or cold-archiving raw canonical records\n  - Changing DecisionWorkspace to incremental source writes or partial cache rebuilds\n  - Embedding an LLM or network service\n  - Automatic commit, tag, publish, or release version bump\nOpen questions: 0\nEvidence:\n  - [CODE] src/core/v2/context.ts:153 (1): buildContextIndex slices and deduplicates only the newly generated candidates, then unconditionally appends them to bundle.contextItems.\n  - [CODE] src/core/v2/source-store.ts:195 (1): Canonical v2 records are rendered from SourceBundle into task, decision, and implementation Markdown directories.\n  - [CODE] src/core/v2/remember.ts:23 (1): remember currently exports source paths and graph artifacts but performs no semantic distillation.\n  - [CODE] src/core/v2/recall.ts:16 (1): recall currently searches only confirmed decisions and implementation traces with bounded SQL LIKE queries.\n────────────────────────────────────────",
      "gitBaseline": {
        "head": "6e9641a55dc7ba6a8dd7efe2ab5a87cfa4df646a",
        "dirtyFileHashes": {
          ".ignore": "d848d497c18118c6142a789e167a989adbc2c2227e371b0164480a6206bab443",
          ".omc/project-memory.json": "e8676ae3ad92ee784b6f3efa0653d0f4397d586d658218f5848f9fb52ed6a670",
          ".omc/state/agent-replay-21700872-d3ec-4974-b033-67d97c77ad59.jsonl": "f84d5642c34ffcf35130fc90a754e4f2eda9c84b1874ad2d627ee3c99508cb8a",
          ".omc/state/hud-stdin-cache.json": "61aaa82f6fe531af25bc7de204ea4df1ba27d14fc6fee147d261322c08f8ca41",
          ".omc/state/idle-notif-cooldown.json": "806225fab4e1abc78a5fcef0814b242ec0680a12dd5394a8df3005126e1f27ee",
          ".omc/state/sessions/21700872-d3ec-4974-b033-67d97c77ad59/hud-state.json": "a92a75d32ddd42c98eddec9409bd72b9c236b2427fee727ee977543f3c757965",
          ".omc/state/sessions/21700872-d3ec-4974-b033-67d97c77ad59/last-tool-error-state.json": "b7a0fb5455d8a0764a45ff42b15c749a37d3a09fdecc4473d3c7ed97eb6520c5",
          ".omc/state/sessions/21700872-d3ec-4974-b033-67d97c77ad59/pre-tool-advisory-throttle.json": "b4e9a9681f89cc4e9f4329ee11f0de72256a881017e6dd189b19650fa8bb3b8b",
          ".omc/state/sessions/21700872-d3ec-4974-b033-67d97c77ad59/session-started.json": "a879b0a590eee337ba2aaeedf5ed6bc57295ae55593ab5224359a8cf708d8ade",
          ".omc/state/sessions/21700872-d3ec-4974-b033-67d97c77ad59/subagent-tracking-state.json": "a3de0ed4d1b577c3c662baaad15234defb9adc15be9a28aa82f75ba4aece69cc",
          ".prettierignore": "dba2937b084dc36af5b25e225842e4d3189d28240e0d5f19ccbde7bfcd9a5a9b",
          "AGENTS.md": "2a6c381ba8c2ad1df17de2683c0c15762131e0c5d5efc1657d922458f74390db",
          "CLAUDE.md": "0adbb61a3b891676c44b5f5866f786332084d218aea7a50ec86ec25b77fc9277",
          "README.ko.md": "ed293405357ae39d974a620f3654eeeafb720e5c3fd79ab5f05240f333df5f1d",
          "README.md": "5a1ddbfde9f0214a72508ae6057d926a52a15efad099152f26f9dc1becd67b44",
          "docs/migration.md": "43fd87793d500a9ff61641cdbecbc0219d98f124636be3fd36e7af5422b71689",
          "docs/pilot-evaluation.md": "70d0a6d42377041b0f3da4df2d3c0b380df33b03772c38bd2a7b010469ad13a4",
          "docs/release-0.7.0.md": "4830cb92ed4354964903436efdbb4ed97c62f8aeb949dc8c5baa74f61a78f6b4",
          "docs/use-cases.md": "0184c46f8860913a0d7a8cfa1586b7a9d98f84412290a627bfe5b5bfe0e8e962",
          "package-lock.json": "c2d5af2e5dfa8caa1a4d8f250824d3b740adc75b55e8c015c5c7d897096dd63e",
          "package.json": "0450becb3f6154c6a544d7b83d5d526bddeb9099af72f0a5df0b2314fe6e9bb6",
          "src/cli.ts": "9df1a7225a55bc04e26695f746f6daaf2772be6cf96b7a4e31ed4dcb4f205986",
          "src/commands/v2/index.ts": "5dc9584fe4880d48c2e7d3e2ac467d2f97b85a9b0867f69d2b7e81c2b7806472",
          "src/core/assets.ts": "d088a8ba8ba8378e7b68dc55caa54161756d0de3d85611a3653b6d8a1ab3be60",
          "src/core/init.ts": "c189acea539e036ca094778b442e95a0580f2ba7d56005a38befed21f1824540",
          "src/core/update.ts": "ac13e182be7f94530ba11b5493e2b3d5656d8ad93d43d35575959f17374fe9bf",
          "src/core/v2/policy.ts": "9b81216de2677dc2ce9a8673a782e7f9a731c30c91c72f8358edacf280f29eef",
          "src/core/v2/wiki.ts": "4d6cdeb94bbea68e823d325a6fde6ee6f70d01fbcc7b2ef28ae852c798ca9814",
          "tests/e2e/sdd-cli-reachability.test.ts": "fe61ce6ec5b40007cc8e830045aa2476a5b8f8aefce6b29bc0f1899739c7b5f7",
          "tests/e2e/v2-cli.test.ts": "0f10b6c2ab42503f383e96c9890e7470a1f8fc6ef886ad13bd0b36581e5528c9",
          "tests/e2e/wiki-cli.test.ts": "219df71d33978af06e97e27f32dbafd37ea445bbd084a57c298a59aee9cb7e72",
          "tests/unit/sdd-core-regression.test.ts": "159e20694f4d98395de5ec2be58ca127acd9e2bec3fe32922aaf187b11ab936a",
          "tests/unit/wiki-assets.test.ts": "663fa54c87f522a4687c4d2205b0b85cf3ea027de031a73a5c3f61a8e5d9131d",
          "tests/unit/wiki.test.ts": "727c15ec5176a2daca59c2e438ea7dc36133ce1c25422482626ec0aaaa144e09"
        }
      },
      "createdAt": "2026-08-11T14:37:54.771Z"
    }
  ],
  "evaluations": [
    {
      "id": "EVAL-0009",
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "traceId": "IMPL-0026",
      "checks": [
        {
          "name": "typecheck",
          "outcome": "passed"
        },
        {
          "name": "lint",
          "outcome": "passed"
        },
        {
          "name": "format",
          "outcome": "passed"
        },
        {
          "name": "unit",
          "outcome": "passed (152/152)"
        },
        {
          "name": "e2e",
          "outcome": "passed (33/33; two concurrent-load timeouts were resolved by isolated and full reruns)"
        },
        {
          "name": "build",
          "outcome": "passed"
        },
        {
          "name": "package",
          "outcome": "passed (npm pack --dry-run)"
        }
      ],
      "createdAt": "2026-08-11T15:00:34.499Z"
    }
  ],
  "events": [
    {
      "id": "EVT-0365",
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "type": "TASK_CREATED",
      "payload": {
        "description": "Add source-backed Memory Capsules and persistent context deduplication",
        "policy": {
          "grillMeRequired": false
        }
      },
      "createdAt": "2026-08-11T14:36:46.013Z"
    },
    {
      "id": "EVT-0366",
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "type": "GRILL_STARTED",
      "payload": {
        "automatic": true
      },
      "createdAt": "2026-08-11T14:36:46.013Z"
    },
    {
      "id": "EVT-0367",
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "type": "CONTEXT_INDEXED",
      "payload": {
        "itemCount": 40
      },
      "createdAt": "2026-08-11T14:36:46.149Z"
    },
    {
      "id": "EVT-0368",
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "type": "GRILL_COMPLETED",
      "payload": {
        "reason": "The user approved implementation; code inspection resolved the storage, provenance, bounded-context, compatibility, and verification branches without an open product choice.",
        "carried": []
      },
      "createdAt": "2026-08-11T14:37:12.124Z"
    },
    {
      "id": "EVT-0369",
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-MEMORY-CAPSULE-BOUNDARY"
      },
      "createdAt": "2026-08-11T14:37:48.747Z"
    },
    {
      "id": "EVT-0370",
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-MEMORY-AGENT-DISTILLATION"
      },
      "createdAt": "2026-08-11T14:37:48.747Z"
    },
    {
      "id": "EVT-0371",
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-CONTEXT-PERSISTENT-UPSERT"
      },
      "createdAt": "2026-08-11T14:37:48.747Z"
    },
    {
      "id": "EVT-0372",
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-MEMORY-RECALL-FIRST"
      },
      "createdAt": "2026-08-11T14:37:48.748Z"
    },
    {
      "id": "EVT-0373",
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-MEMORY-DEFER-COLD-ARCHIVE"
      },
      "createdAt": "2026-08-11T14:37:48.748Z"
    },
    {
      "id": "EVT-0374",
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 5,
        "questions": 0,
        "evidence": 4,
        "expectedScope": [
          "Memory Capsule canonical schema, Markdown source documents, SQLite cache projection, validation, and rebuild support",
          "Agent-authored stdin distillation command and missing/stale status command",
          "Capsule-first recall and context retrieval",
          "Persistent context deduplication and automatic-context bound",
          "Unit, E2E, compatibility tests, and public documentation"
        ],
        "avoidScope": [
          "Deleting or cold-archiving raw canonical records",
          "Changing DecisionWorkspace to incremental source writes or partial cache rebuilds",
          "Embedding an LLM or network service",
          "Automatic commit, tag, publish, or release version bump"
        ],
        "implementationPlan": [
          "Add failing contract tests for context idempotency, source-backed capsule validation/upsert, cache rebuild, status, and recall ordering.",
          "Add Memory Capsule types and an independent canonical memories directory with backward-compatible loading.",
          "Project capsules into SQLite and implement deterministic source catalogs, digests, distillation, and status.",
          "Wire memory commands and capsule-first recall/context behavior through CLI and localized rendering.",
          "Document the lifecycle and run formatting, static analysis, unit, E2E, build, and package checks."
        ],
        "verificationPlan": [
          "Run targeted unit and E2E tests while implementing.",
          "Run npm run typecheck, npm run lint, and npm run format:check.",
          "Run the complete unit and E2E suites, npm run build, and npm run package:check.",
          "Record exact outcomes in sduck evaluate and verify the capsule through recall before closing."
        ]
      },
      "createdAt": "2026-08-11T14:37:48.749Z"
    },
    {
      "id": "EVT-0375",
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "type": "BRIEF_CONFIRMED",
      "payload": {
        "snapshotId": "BRF-0023"
      },
      "createdAt": "2026-08-11T14:37:54.771Z"
    },
    {
      "id": "EVT-0376",
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "type": "TRACE_CREATED",
      "payload": {
        "traceId": "IMPL-0026",
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
        ]
      },
      "createdAt": "2026-08-11T15:00:10.439Z"
    },
    {
      "id": "EVT-0377",
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "type": "EVALUATION_RECORDED",
      "payload": {
        "evaluationId": "EVAL-0009",
        "traceId": "IMPL-0026"
      },
      "createdAt": "2026-08-11T15:00:34.500Z"
    },
    {
      "id": "EVT-0378",
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
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
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-CONTEXT-PERSISTENT-UPSERT.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-MEMORY-AGENT-DISTILLATION.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-MEMORY-CAPSULE-BOUNDARY.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-MEMORY-DEFER-COLD-ARCHIVE.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-MEMORY-RECALL-FIRST.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-MIGRATE-061.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-RELEASE-0-6-2.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-RELEASE-READINESS-IS-ARTIFACT-BASED.md",
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
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/memories/MEM-0001.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/DECISION_REPORT.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/decision-graph.json"
        ]
      },
      "createdAt": "2026-08-11T15:00:57.242Z"
    },
    {
      "id": "EVT-0379",
      "taskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
      "type": "TASK_CLOSED",
      "payload": {},
      "createdAt": "2026-08-11T15:01:02.390Z"
    }
  ]
}
```
