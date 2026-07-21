---
id: TASK-20260720-add-retrospective-decision-capture-skill
type: task
status: CLOSED
title: Add retrospective decision capture skill
created_at: '2026-07-20T02:05:06.998Z'
updated_at: '2026-07-20T02:14:23.188Z'
---
# TASK-20260720-add-retrospective-decision-capture-skill: Add retrospective decision capture skill

Add retrospective decision capture skill

## Sduck source

```json sduck-source
{
  "task": {
    "id": "TASK-20260720-add-retrospective-decision-capture-skill",
    "title": "Add retrospective decision capture skill",
    "description": "Add retrospective decision capture skill",
    "status": "CLOSED",
    "expectedScope": [
      "Add an installable retrospective-capture SKILL.md with concise agent instructions and copyable sduck commands.",
      "Register/install the bundled skill and point generated agent rules to it.",
      "Explain active-LLM handoff, Git range selection, evidence classification, privacy boundaries, and post-hoc trace semantics.",
      "Add targeted asset-installation regression coverage if registry behavior changes."
    ],
    "avoidScope": [
      "new capture CLI command",
      "automated transcript collection",
      "LLM provider integration",
      "SQLite schema changes",
      "workflow gate changes"
    ],
    "guided": true,
    "createdAt": "2026-07-20T02:05:06.998Z",
    "updatedAt": "2026-07-20T02:14:23.188Z",
    "implementationPlan": [
      "Map the existing bundled skill asset and generated-rule installation seams.",
      "Add the skill with progressive instructions for handoff, Git evidence, classification, confirmation, trace, and recall.",
      "Register it in the bundled asset list and generated agent-rule references, then update targeted tests."
    ],
    "verificationPlan": [
      "Run targeted asset/init regression tests.",
      "Verify sduck init installs the skill at the documented path.",
      "Review the skill to ensure it never instructs chat-log scraping or unsupported explicit decisions."
    ]
  },
  "questions": [],
  "evidence": [
    {
      "id": "EVD-0042",
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": ".sduck/sduck-assets/agent-rules/skills/sduck-codebase-decisions/SKILL.md",
      "summary": "The existing bundled skill establishes the SKILL.md format and sduck lifecycle guidance.",
      "confidence": 1,
      "createdAt": "2026-07-20T02:06:14.717Z"
    },
    {
      "id": "EVD-0043",
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/core/assets.ts",
      "summary": "Bundled agent skills are registered as init assets.",
      "confidence": 1,
      "createdAt": "2026-07-20T02:06:14.717Z"
    },
    {
      "id": "EVD-0044",
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/cli.ts",
      "summary": "trace supports an explicit base reference for Git-range evidence.",
      "confidence": 1,
      "createdAt": "2026-07-20T02:06:14.717Z"
    }
  ],
  "contextItems": [
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
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
      "id": "CTX-0319",
      "createdAt": "2026-07-20T02:05:07.098Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
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
      "id": "CTX-0320",
      "createdAt": "2026-07-20T02:05:07.098Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0012",
      "summary": "Prior decision: Make automatic context discovery privacy-first — Automatic discovery considers tracked regular files only; untracked paths require explicit addition, symlink escapes are rejected, and canonical records store references, hashes, and curated summaries.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0321",
      "createdAt": "2026-07-20T02:05:07.098Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0016",
      "summary": "Prior decision: What stale-confirmation revision token should 0.6 use in addition to the brief digest? — Digest only",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0322",
      "createdAt": "2026-07-20T02:05:07.098Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0018",
      "summary": "Prior decision: What source-schema migration policy should apply to 0.6 canonical records? — Versioned additive envelope",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0323",
      "createdAt": "2026-07-20T02:05:07.098Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "sourceType": "MEMORY",
      "sourceRef": "global-locale-config-shape",
      "summary": "Prior decision: Use an XDG-compatible global locale configuration — Add `sduck config locale en|ko`, persisting the preference in a user-global XDG-compatible config location with English fallback; preserve it independently of project initialization.",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0324",
      "createdAt": "2026-07-20T02:05:07.099Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0039",
      "summary": "Prior decision: Unify specification and plan in one confirmed Brief — One Brief contains problem, decisions, scope, implementation plan, and verification plan; a single confirm gate authorizes implementation.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0325",
      "createdAt": "2026-07-20T02:05:07.099Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0041",
      "summary": "Prior decision: Reduce grilling through evidence-backed carried decisions — The agent reuses prior decisions only by recording carried decision IDs and rationale. New questions are limited to conflicts, unknowns, or scope and verification changes; no fixed question quota applies.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0326",
      "createdAt": "2026-07-20T02:05:07.099Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
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
      "id": "CTX-0327",
      "createdAt": "2026-07-20T02:05:07.099Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
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
      "id": "CTX-0328",
      "createdAt": "2026-07-20T02:05:07.099Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0045",
      "summary": "Decision applies to relevant file docs/design/mcp-control-plane-0.6-contract.md: Keep queue coordination separate from decision history",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "docs/design/mcp-control-plane-0.6-contract.md"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-0329",
      "createdAt": "2026-07-20T02:05:07.099Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
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
      "id": "CTX-0330",
      "createdAt": "2026-07-20T02:05:07.099Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
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
      "id": "CTX-0331",
      "createdAt": "2026-07-20T02:05:07.099Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
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
      "id": "CTX-0332",
      "createdAt": "2026-07-20T02:05:07.099Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
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
      "id": "CTX-0333",
      "createdAt": "2026-07-20T02:05:07.099Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
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
      "id": "CTX-0334",
      "createdAt": "2026-07-20T02:05:07.099Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
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
      "id": "CTX-0335",
      "createdAt": "2026-07-20T02:05:07.099Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
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
      "id": "CTX-0336",
      "createdAt": "2026-07-20T02:05:07.099Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
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
      "id": "CTX-0337",
      "createdAt": "2026-07-20T02:05:07.099Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
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
      "id": "CTX-0338",
      "createdAt": "2026-07-20T02:05:07.099Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
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
      "id": "CTX-0339",
      "createdAt": "2026-07-20T02:05:07.099Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
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
      "id": "CTX-0340",
      "createdAt": "2026-07-20T02:05:07.100Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/v2/decision-workspace.ts",
      "summary": "File evidence: decisionRoot,",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "decisionRoot,",
        "line": 9
      },
      "id": "CTX-0341",
      "createdAt": "2026-07-20T02:05:07.100Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
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
      "id": "CTX-0342",
      "createdAt": "2026-07-20T02:05:07.100Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
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
      "id": "CTX-0343",
      "createdAt": "2026-07-20T02:05:07.100Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
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
      "id": "CTX-0344",
      "createdAt": "2026-07-20T02:05:07.100Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/v2/decision.ts",
      "summary": "File evidence: import type { Decision, DecisionKind, DecisionStatus, DraftDecision } from '../../types/index.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import type { Decision, DecisionKind, DecisionStatus, DraftDecision } from '../../types/index.js';",
        "line": 6
      },
      "id": "CTX-0345",
      "createdAt": "2026-07-20T02:05:07.100Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/v2/git-diff.ts",
      "summary": "File evidence: '.decision/',",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "'.decision/',",
        "line": 9
      },
      "id": "CTX-0346",
      "createdAt": "2026-07-20T02:05:07.100Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/ui/v2/messages.ts",
      "summary": "File evidence: decisionCreated: string;",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "decisionCreated: string;",
        "line": 45
      },
      "id": "CTX-0347",
      "createdAt": "2026-07-20T02:05:07.100Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/e2e/v2-cli.test.ts",
      "summary": "File evidence: execFileSync('git', ['add', 'tracked.ts'], { cwd: workspace, env: isolatedGitEnv() });",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "execFileSync('git', ['add', 'tracked.ts'], { cwd: workspace, env: isolatedGitEnv() });",
        "line": 61
      },
      "id": "CTX-0348",
      "createdAt": "2026-07-20T02:05:07.100Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/fixtures/source-envelope/v1/decision-envelope.contract.json",
      "summary": "File evidence: \"kind\": \"decision\",",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "\"kind\": \"decision\",",
        "line": 3
      },
      "id": "CTX-0349",
      "createdAt": "2026-07-20T02:05:07.100Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
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
      "id": "CTX-0350",
      "createdAt": "2026-07-20T02:05:07.100Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
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
      "id": "CTX-0351",
      "createdAt": "2026-07-20T02:05:07.100Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
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
      "id": "CTX-0352",
      "createdAt": "2026-07-20T02:05:07.100Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/agents/domain.md",
      "summary": "File evidence: How the engineering skills should consume this repo's domain documentation when exploring the codebase.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "How the engineering skills should consume this repo's domain documentation when exploring the codebase.",
        "line": 3
      },
      "id": "CTX-0353",
      "createdAt": "2026-07-20T02:05:07.100Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/agents/issue-tracker.md",
      "summary": "File evidence: - **Apply / remove labels**: `gh issue edit <number> --add-label \"...\"` / `--remove-label \"...\"`",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "- **Apply / remove labels**: `gh issue edit <number> --add-label \"...\"` / `--remove-label \"...\"`",
        "line": 13
      },
      "id": "CTX-0354",
      "createdAt": "2026-07-20T02:05:07.100Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/design/mcp-control-plane-0.6-contract.md",
      "summary": "File evidence: - `prepare_confirmation`은 read-only이다. 이 도구는 digest projection에서만 렌더링한 **Approval View V1** payload와 `sduck-brief-digest/v1:<sha256>`를 반환한다. 결과 shape는 `{ schema: 'sduck-prepare-confirmation-result/v1', approvalViewVersion: 'Approval View V1",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "- `prepare_confirmation`은 read-only이다. 이 도구는 digest projection에서만 렌더링한 **Approval View V1** payload와 `sduck-brief-digest/v1:<sha256>`를 반환한다. 결과 shape는 `{ schema: 'sduck-prepare-confirmation-result/v1', approvalViewVersion: 'Approval View V1",
        "line": 10
      },
      "id": "CTX-0355",
      "createdAt": "2026-07-20T02:05:07.100Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
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
      "id": "CTX-0356",
      "createdAt": "2026-07-20T02:05:07.100Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
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
      "id": "CTX-0357",
      "createdAt": "2026-07-20T02:05:07.100Z"
    },
    {
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
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
      "id": "CTX-0358",
      "createdAt": "2026-07-20T02:05:07.101Z"
    }
  ],
  "briefSnapshots": [
    {
      "id": "BRF-0010",
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "snapshot": {
        "task": {
          "id": "TASK-20260720-add-retrospective-decision-capture-skill",
          "title": "Add retrospective decision capture skill",
          "description": "Add retrospective decision capture skill",
          "status": "CONFIRMED",
          "expectedScope": [
            "Add an installable retrospective-capture SKILL.md with concise agent instructions and copyable sduck commands.",
            "Register/install the bundled skill and point generated agent rules to it.",
            "Explain active-LLM handoff, Git range selection, evidence classification, privacy boundaries, and post-hoc trace semantics.",
            "Add targeted asset-installation regression coverage if registry behavior changes."
          ],
          "avoidScope": [
            "new capture CLI command",
            "automated transcript collection",
            "LLM provider integration",
            "SQLite schema changes",
            "workflow gate changes"
          ],
          "guided": true,
          "createdAt": "2026-07-20T02:05:06.998Z",
          "updatedAt": "2026-07-20T02:06:15.417Z",
          "implementationPlan": [
            "Map the existing bundled skill asset and generated-rule installation seams.",
            "Add the skill with progressive instructions for handoff, Git evidence, classification, confirmation, trace, and recall.",
            "Register it in the bundled asset list and generated agent-rule references, then update targeted tests."
          ],
          "verificationPlan": [
            "Run targeted asset/init regression tests.",
            "Verify sduck init installs the skill at the documented path.",
            "Review the skill to ensure it never instructs chat-log scraping or unsupported explicit decisions."
          ]
        },
        "decisions": {
          "EXPLICIT": [
            {
              "id": "DEC-0048",
              "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
              "title": "Bundle a sduck retrospective decision-capture skill",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Provide an installable sduck-specific skill for work completed outside the normal workflow. It asks the active LLM for a concise handoff, compares that account with an explicit Git diff range, and records evidence-backed decisions retrospectively.",
              "rationale": [
                "The user wants Git-diff decision capture without requiring transcript upload.",
                "The skill must ask the LLM with conversation context rather than scraping or requesting raw chat logs from the user."
              ],
              "appliesTo": [
                ".sduck/sduck-assets/agent-rules/skills/**",
                "src/core/assets.ts",
                "src/core/init.ts",
                "AGENTS.md",
                "CLAUDE.md"
              ],
              "avoids": [
                "automatic chat-log collection",
                "full transcript storage",
                "new CLI capture command",
                "claiming inferred rationale as explicit"
              ],
              "sourceRefs": [],
              "createdAt": "2026-07-20T02:06:14.717Z",
              "updatedAt": "2026-07-20T02:06:15.417Z"
            },
            {
              "id": "DEC-0049",
              "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
              "title": "Treat LLM handoff and Git evidence differently",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "The skill classifies decisions directly stated in the LLM handoff as EXPLICIT only when corroborated by the user or durable source; patch-only conclusions stay INFERRED with conservative confidence. It asks follow-up questions for unsupported rationale.",
              "rationale": [
                "Git diff establishes what changed, not why.",
                "LLM conversation can be sensitive and may contain unverified assumptions."
              ],
              "appliesTo": [
                ".sduck/sduck-assets/agent-rules/skills/**"
              ],
              "avoids": [
                "unreviewed decision claims",
                "secret or transcript persistence"
              ],
              "sourceRefs": [],
              "createdAt": "2026-07-20T02:06:14.717Z",
              "updatedAt": "2026-07-20T02:06:15.417Z"
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
            "id": "EVD-0042",
            "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
            "decisionId": null,
            "sourceType": "CODE",
            "sourceRef": ".sduck/sduck-assets/agent-rules/skills/sduck-codebase-decisions/SKILL.md",
            "summary": "The existing bundled skill establishes the SKILL.md format and sduck lifecycle guidance.",
            "confidence": 1,
            "createdAt": "2026-07-20T02:06:14.717Z"
          },
          {
            "id": "EVD-0043",
            "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
            "decisionId": null,
            "sourceType": "CODE",
            "sourceRef": "src/core/assets.ts",
            "summary": "Bundled agent skills are registered as init assets.",
            "confidence": 1,
            "createdAt": "2026-07-20T02:06:14.717Z"
          },
          {
            "id": "EVD-0044",
            "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
            "decisionId": null,
            "sourceType": "CODE",
            "sourceRef": "src/cli.ts",
            "summary": "trace supports an explicit base reference for Git-range evidence.",
            "confidence": 1,
            "createdAt": "2026-07-20T02:06:14.717Z"
          }
        ],
        "expectedScope": [
          "Add an installable retrospective-capture SKILL.md with concise agent instructions and copyable sduck commands.",
          "Register/install the bundled skill and point generated agent rules to it.",
          "Explain active-LLM handoff, Git range selection, evidence classification, privacy boundaries, and post-hoc trace semantics.",
          "Add targeted asset-installation regression coverage if registry behavior changes."
        ],
        "avoidScope": [
          "new capture CLI command",
          "automated transcript collection",
          "LLM provider integration",
          "SQLite schema changes",
          "workflow gate changes"
        ],
        "implementationPlan": [
          "Map the existing bundled skill asset and generated-rule installation seams.",
          "Add the skill with progressive instructions for handoff, Git evidence, classification, confirmation, trace, and recall.",
          "Register it in the bundled asset list and generated agent-rule references, then update targeted tests."
        ],
        "verificationPlan": [
          "Run targeted asset/init regression tests.",
          "Verify sduck init installs the skill at the documented path.",
          "Review the skill to ensure it never instructs chat-log scraping or unsupported explicit decisions."
        ],
        "openQuestionCount": 0
      },
      "renderedMarkdown": "────────────────────────────────────────\nImplementation Brief\n────────────────────────────────────────\nTask: TASK-20260720-add-retrospective-decision-capture-skill\nAdd retrospective decision capture skill\n\nA. Explicit decisions\n[EXPLICIT] DEC-0048. Bundle a sduck retrospective decision-capture skill\nConfidence: 1.00\nSummary: Provide an installable sduck-specific skill for work completed outside the normal workflow. It asks the active LLM for a concise handoff, compares that account with an explicit Git diff range, and records evidence-backed decisions retrospectively.\nRationale:\n  - The user wants Git-diff decision capture without requiring transcript upload.\n  - The skill must ask the LLM with conversation context rather than scraping or requesting raw chat logs from the user.\nApplies to:\n  - .sduck/sduck-assets/agent-rules/skills/**\n  - src/core/assets.ts\n  - src/core/init.ts\n  - AGENTS.md\n  - CLAUDE.md\nAvoids:\n  - automatic chat-log collection\n  - full transcript storage\n  - new CLI capture command\n  - claiming inferred rationale as explicit\n\n[EXPLICIT] DEC-0049. Treat LLM handoff and Git evidence differently\nConfidence: 1.00\nSummary: The skill classifies decisions directly stated in the LLM handoff as EXPLICIT only when corroborated by the user or durable source; patch-only conclusions stay INFERRED with conservative confidence. It asks follow-up questions for unsupported rationale.\nRationale:\n  - Git diff establishes what changed, not why.\n  - LLM conversation can be sensitive and may contain unverified assumptions.\nApplies to:\n  - .sduck/sduck-assets/agent-rules/skills/**\nAvoids:\n  - unreviewed decision claims\n  - secret or transcript persistence\n\nB. Inferred decisions\n  - none\n\nC. Carried decisions\n  - none\n\nD. Conflicts\n  - none\n\nE. Open decisions\n  - none\n\nProblem:\n  Add retrospective decision capture skill\nImplementation plan:\n  - Map the existing bundled skill asset and generated-rule installation seams.\n  - Add the skill with progressive instructions for handoff, Git evidence, classification, confirmation, trace, and recall.\n  - Register it in the bundled asset list and generated agent-rule references, then update targeted tests.\nVerification plan:\n  - Run targeted asset/init regression tests.\n  - Verify sduck init installs the skill at the documented path.\n  - Review the skill to ensure it never instructs chat-log scraping or unsupported explicit decisions.\nScope expected:\n  - Add an installable retrospective-capture SKILL.md with concise agent instructions and copyable sduck commands.\n  - Register/install the bundled skill and point generated agent rules to it.\n  - Explain active-LLM handoff, Git range selection, evidence classification, privacy boundaries, and post-hoc trace semantics.\n  - Add targeted asset-installation regression coverage if registry behavior changes.\nScope avoided:\n  - new capture CLI command\n  - automated transcript collection\n  - LLM provider integration\n  - SQLite schema changes\n  - workflow gate changes\nOpen questions: 0\nEvidence:\n  - [CODE] .sduck/sduck-assets/agent-rules/skills/sduck-codebase-decisions/SKILL.md (1): The existing bundled skill establishes the SKILL.md format and sduck lifecycle guidance.\n  - [CODE] src/core/assets.ts (1): Bundled agent skills are registered as init assets.\n  - [CODE] src/cli.ts (1): trace supports an explicit base reference for Git-range evidence.\n────────────────────────────────────────",
      "gitBaseline": {
        "head": "4fb70744ee432a5801242673de38551bf9109826",
        "dirtyFileHashes": {
          ".ignore": "d848d497c18118c6142a789e167a989adbc2c2227e371b0164480a6206bab443",
          ".prettierignore": "c0efdf6a8bebcb6f2d5f390eadaad516b16239b1b83914f3005b9efe3f6f0a94",
          "README.ko.md": "1e7714acd17ce70bf8e3577529dd6899e5c533c8b7b449b59d2a21b3f5d085ba",
          "README.md": "50ccc9279145c8d7687370986daa646697c3c868306ecfe2bce5f7ae8c8b0959",
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
      "createdAt": "2026-07-20T02:06:15.484Z"
    }
  ],
  "events": [
    {
      "id": "EVT-0159",
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "type": "TASK_CREATED",
      "payload": {
        "description": "Add retrospective decision capture skill",
        "policy": {
          "grillMeRequired": false
        }
      },
      "createdAt": "2026-07-20T02:05:06.998Z"
    },
    {
      "id": "EVT-0160",
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "type": "GRILL_STARTED",
      "payload": {
        "automatic": true
      },
      "createdAt": "2026-07-20T02:05:06.999Z"
    },
    {
      "id": "EVT-0161",
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "type": "CONTEXT_INDEXED",
      "payload": {
        "itemCount": 40
      },
      "createdAt": "2026-07-20T02:05:07.101Z"
    },
    {
      "id": "EVT-0162",
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "type": "GRILL_COMPLETED",
      "payload": {
        "reason": "A sduck-specific instruction-only retrospective skill will ask the active LLM for a concise decision handoff, correlate it with an explicitly selected Git range, and record only evidence-backed explicit or inferred decisions without transcript ingestion.",
        "carried": []
      },
      "createdAt": "2026-07-20T02:06:14.331Z"
    },
    {
      "id": "EVT-0163",
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0048"
      },
      "createdAt": "2026-07-20T02:06:14.718Z"
    },
    {
      "id": "EVT-0164",
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0049"
      },
      "createdAt": "2026-07-20T02:06:14.718Z"
    },
    {
      "id": "EVT-0165",
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 2,
        "questions": 0,
        "evidence": 3,
        "expectedScope": [
          "Add an installable retrospective-capture SKILL.md with concise agent instructions and copyable sduck commands.",
          "Register/install the bundled skill and point generated agent rules to it.",
          "Explain active-LLM handoff, Git range selection, evidence classification, privacy boundaries, and post-hoc trace semantics.",
          "Add targeted asset-installation regression coverage if registry behavior changes."
        ],
        "avoidScope": [
          "new capture CLI command",
          "automated transcript collection",
          "LLM provider integration",
          "SQLite schema changes",
          "workflow gate changes"
        ],
        "implementationPlan": [
          "Map the existing bundled skill asset and generated-rule installation seams.",
          "Add the skill with progressive instructions for handoff, Git evidence, classification, confirmation, trace, and recall.",
          "Register it in the bundled asset list and generated agent-rule references, then update targeted tests."
        ],
        "verificationPlan": [
          "Run targeted asset/init regression tests.",
          "Verify sduck init installs the skill at the documented path.",
          "Review the skill to ensure it never instructs chat-log scraping or unsupported explicit decisions."
        ]
      },
      "createdAt": "2026-07-20T02:06:14.718Z"
    },
    {
      "id": "EVT-0166",
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "type": "BRIEF_CONFIRMED",
      "payload": {
        "snapshotId": "BRF-0010"
      },
      "createdAt": "2026-07-20T02:06:15.484Z"
    },
    {
      "id": "EVT-0167",
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "type": "TRACE_CREATED",
      "payload": {
        "traceId": "IMPL-0013",
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
        ]
      },
      "createdAt": "2026-07-20T02:14:00.777Z"
    },
    {
      "id": "EVT-0168",
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "type": "EVALUATION_RECORDED",
      "payload": {
        "evaluationId": "EVAL-0001",
        "traceId": "IMPL-0013"
      },
      "createdAt": "2026-07-20T02:14:18.240Z"
    },
    {
      "id": "EVT-0169",
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
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
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/DECISION_REPORT.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/decision-graph.json"
        ]
      },
      "createdAt": "2026-07-20T02:14:22.815Z"
    },
    {
      "id": "EVT-0170",
      "taskId": "TASK-20260720-add-retrospective-decision-capture-skill",
      "type": "TASK_CLOSED",
      "payload": {},
      "createdAt": "2026-07-20T02:14:23.189Z"
    }
  ]
}
```
