---
id: TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl
type: task
status: ABANDONED
title: >-
  Complete the documented sduck 0.6 MCP control plane, validate its packaged CLI behavior, and prepare a local v0.6.0
  release commit and tag without publishing or pushing.
created_at: '2026-07-21T08:29:11.236Z'
updated_at: '2026-07-21T08:39:28.374Z'
---
# TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl: Complete the documented sduck 0.6 MCP control plane, validate its packaged CLI behavior, and prepare a local v0.6.0 release commit and tag without publishing or pushing.

Complete the documented sduck 0.6 MCP control plane, validate its packaged CLI behavior, and prepare a local v0.6.0 release commit and tag without publishing or pushing.

## Sduck source

```json sduck-source
{
  "task": {
    "id": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
    "title": "Complete the documented sduck 0.6 MCP control plane, validate its packaged CLI behavior, and prepare a local v0.6.0 release commit and tag without publishing or pushing.",
    "description": "Complete the documented sduck 0.6 MCP control plane, validate its packaged CLI behavior, and prepare a local v0.6.0 release commit and tag without publishing or pushing.",
    "status": "ABANDONED",
    "expectedScope": [
      "Approved 0.6 product boundary, tests, release documentation, package metadata, and bundled runtime assets"
    ],
    "avoidScope": [
      "Owned coding runtime",
      "npm publish",
      "remote push"
    ],
    "guided": true,
    "createdAt": "2026-07-21T08:29:11.236Z",
    "updatedAt": "2026-07-21T08:39:28.374Z",
    "implementationPlan": [
      "Confirm whether 0.6.0 includes the complete MCP control plane or a CLI-foundation release that explicitly defers MCP runtime work.",
      "Implement the approved boundary in dependency order, including public documentation and tests.",
      "Validate source and packed CLI behavior, then create a local release commit and v0.6.0 tag without publishing or pushing."
    ],
    "verificationPlan": [
      "Targeted unit and CLI e2e coverage for every new public surface",
      "Format, lint, typecheck, full tests, build, package dry-run",
      "For MCP scope: stdio client lifecycle and idempotency, digest, migration, context, and verifier matrices",
      "Release artifact installation smoke and clean Git/tag inspection"
    ]
  },
  "questions": [
    {
      "id": "Q-0-6-boundary",
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "decisionId": null,
      "text": "The documented 0.6 MCP control plane has only Phase 0 contract fixtures today. Should 0.6.0 implement the full MCP control plane (digest, envelopes/migration, idempotency, context refresh, verifier, stdio adapter, and integration smoke) before release, or ship the current CLI foundations as 0.6.0 while explicitly deferring MCP runtime work?",
      "recommendedAnswer": "Implement the full MCP control plane before calling this the 0.6.0 MCP release; a foundation-only release is valid only if its docs explicitly avoid promising MCP support.",
      "rationale": [],
      "options": [
        "Implement the full MCP control plane before 0.6.0 release",
        "Ship a CLI-foundation 0.6.0 and defer MCP runtime"
      ],
      "answered": true,
      "answer": "Ship a CLI-foundation 0.6.0 and defer MCP runtime",
      "createdAt": "2026-07-21T08:32:43.908Z"
    }
  ],
  "evidence": [
    {
      "id": "EVD-0050",
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "decisionId": null,
      "sourceType": "USER_ANSWER",
      "sourceRef": "Q-0-6-boundary",
      "summary": "Ship a CLI-foundation 0.6.0 and defer MCP runtime",
      "confidence": 1,
      "createdAt": "2026-07-21T08:34:34.474Z"
    }
  ],
  "contextItems": [
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
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
      "id": "CTX-0537",
      "createdAt": "2026-07-21T08:29:11.386Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
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
      "id": "CTX-0538",
      "createdAt": "2026-07-21T08:29:11.386Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0030",
      "summary": "Prior decision: Record the break-glass recovery as a normal traced fix — The stale terminal-pointer recovery and its diagnostics are completed under this separately confirmed task with source/test trace coverage.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0539",
      "createdAt": "2026-07-21T08:29:11.386Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0048",
      "summary": "Prior decision: Bundle a sduck retrospective decision-capture skill — Provide an installable sduck-specific skill for work completed outside the normal workflow. It asks the active LLM for a concise handoff, compares that account with an explicit Git diff range, and records evidence-backed decisions retrospectively.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0540",
      "createdAt": "2026-07-21T08:29:11.386Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
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
      "id": "CTX-0541",
      "createdAt": "2026-07-21T08:29:11.387Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0003",
      "summary": "Prior decision: Clear commit-hook Git variables before validation commands — Keep lint-staged on the commit index, then clear Git local environment variables before typecheck and test commands so nested fixture repositories use their own Git metadata.",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0542",
      "createdAt": "2026-07-21T08:29:11.387Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
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
      "id": "CTX-0543",
      "createdAt": "2026-07-21T08:29:11.387Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
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
      "id": "CTX-0544",
      "createdAt": "2026-07-21T08:29:11.387Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
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
      "id": "CTX-0545",
      "createdAt": "2026-07-21T08:29:11.387Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
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
      "id": "CTX-0546",
      "createdAt": "2026-07-21T08:29:11.387Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
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
      "id": "CTX-0547",
      "createdAt": "2026-07-21T08:29:11.388Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "sourceType": "MEMORY",
      "sourceRef": "v2-workflow-is-primary",
      "summary": "Prior decision: Make v2 the single primary documented workflow — Reorganize public documentation, installed agent rules, and v2 next-step guidance around one canonical flow: init → work → context → grill-me → submit → ask/answer → brief/confirm → implement → trace → remember/recall → close.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0548",
      "createdAt": "2026-07-21T08:29:11.388Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0011",
      "summary": "Prior decision: Require local digest confirmation by default — MCP may prepare a canonical brief, but default confirmation is interactive local sduck confirm --digest; non-human MCP acknowledgement is explicit policy opt-in with provenance.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0549",
      "createdAt": "2026-07-21T08:29:11.388Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0019",
      "summary": "Prior decision: What trace data and CI semantics should sduck verify require? — Bind trace to Git and brief digest",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0550",
      "createdAt": "2026-07-21T08:29:11.388Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0020",
      "summary": "Prior decision: What exact BriefDigestProjectionV1 and canonical serializer should sduck use? — RFC 8785 projection v1 (recommended)",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0551",
      "createdAt": "2026-07-21T08:29:11.388Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0023",
      "summary": "Prior decision: What exact Git-bound trace and sduck verify algorithm should 0.6 use? — Merge-base CI verifier (recommended)",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0552",
      "createdAt": "2026-07-21T08:29:11.388Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
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
      "id": "CTX-0553",
      "createdAt": "2026-07-21T08:29:11.388Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
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
      "id": "CTX-0554",
      "createdAt": "2026-07-21T08:29:11.388Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
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
      "id": "CTX-0555",
      "createdAt": "2026-07-21T08:29:11.388Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
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
      "id": "CTX-0556",
      "createdAt": "2026-07-21T08:29:11.389Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
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
      "id": "CTX-0557",
      "createdAt": "2026-07-21T08:29:11.389Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
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
      "id": "CTX-0558",
      "createdAt": "2026-07-21T08:29:11.389Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
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
      "id": "CTX-0559",
      "createdAt": "2026-07-21T08:29:11.389Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
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
      "id": "CTX-0560",
      "createdAt": "2026-07-21T08:29:11.389Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
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
      "id": "CTX-0561",
      "createdAt": "2026-07-21T08:29:11.389Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
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
      "id": "CTX-0562",
      "createdAt": "2026-07-21T08:29:11.389Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0029",
      "summary": "Decision applies to relevant file tests/unit/decision-workspace.test.ts: Diagnose every invalid state pointer without over-repairing",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "tests/unit/decision-workspace.test.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0563",
      "createdAt": "2026-07-21T08:29:11.389Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
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
      "id": "CTX-0564",
      "createdAt": "2026-07-21T08:29:11.389Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0027",
      "summary": "Decision applies to relevant file tests/unit/v2-contract-fixtures.test.ts: Prove legacy parser fallback without implementing envelopes",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "tests/unit/v2-contract-fixtures.test.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0565",
      "createdAt": "2026-07-21T08:29:11.389Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/design/mcp-control-plane-0.6-contract.md",
      "summary": "File evidence: # sduck 0.6 MCP control plane 계약 노트",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "# sduck 0.6 MCP control plane 계약 노트",
        "line": 1
      },
      "id": "CTX-0566",
      "createdAt": "2026-07-21T08:29:11.390Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/e2e/v2-locale-cli.test.ts",
      "summary": "File evidence: import { createAgentCheckboxConfig, renderInitCommandData } from '../../src/commands/init.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { createAgentCheckboxConfig, renderInitCommandData } from '../../src/commands/init.js';",
        "line": 6
      },
      "id": "CTX-0567",
      "createdAt": "2026-07-21T08:29:11.390Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
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
      "id": "CTX-0568",
      "createdAt": "2026-07-21T08:29:11.390Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/commands/init.ts",
      "summary": "File evidence: type InitCommandOptions,",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "type InitCommandOptions,",
        "line": 8
      },
      "id": "CTX-0569",
      "createdAt": "2026-07-21T08:29:11.390Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
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
      "id": "CTX-0570",
      "createdAt": "2026-07-21T08:29:11.392Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/fixtures/source-envelope/v1/mcp-tools.contract.json",
      "summary": "File evidence: \"contract\": \"sduck-mcp-tools/v1\",",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "\"contract\": \"sduck-mcp-tools/v1\",",
        "line": 2
      },
      "id": "CTX-0571",
      "createdAt": "2026-07-21T08:29:11.392Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/design/conversational-workflow.md",
      "summary": "File evidence: # sduck 대화형 워크플로 설계 — MCP 서버 + 게이트 훅",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "# sduck 대화형 워크플로 설계 — MCP 서버 + 게이트 훅",
        "line": 1
      },
      "id": "CTX-0572",
      "createdAt": "2026-07-21T08:29:11.392Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
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
      "id": "CTX-0573",
      "createdAt": "2026-07-21T08:29:11.392Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/unit/v2-contract-fixtures.test.ts",
      "summary": "File evidence: resultSchema: 'sduck-status-result/v1',",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "resultSchema: 'sduck-status-result/v1',",
        "line": 19
      },
      "id": "CTX-0574",
      "createdAt": "2026-07-21T08:29:11.392Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
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
      "id": "CTX-0575",
      "createdAt": "2026-07-21T08:29:11.392Z"
    },
    {
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/cli.ts",
      "summary": "File evidence: import { Command, InvalidArgumentError } from 'commander';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { Command, InvalidArgumentError } from 'commander';",
        "line": 3
      },
      "id": "CTX-0576",
      "createdAt": "2026-07-21T08:29:11.393Z"
    }
  ],
  "briefSnapshots": [],
  "events": [
    {
      "id": "EVT-0225",
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "type": "TASK_CREATED",
      "payload": {
        "description": "Complete the documented sduck 0.6 MCP control plane, validate its packaged CLI behavior, and prepare a local v0.6.0 release commit and tag without publishing or pushing.",
        "policy": {
          "grillMeRequired": false
        }
      },
      "createdAt": "2026-07-21T08:29:11.236Z"
    },
    {
      "id": "EVT-0226",
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "type": "GRILL_STARTED",
      "payload": {
        "automatic": true
      },
      "createdAt": "2026-07-21T08:29:11.236Z"
    },
    {
      "id": "EVT-0227",
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "type": "CONTEXT_INDEXED",
      "payload": {
        "itemCount": 40
      },
      "createdAt": "2026-07-21T08:29:11.393Z"
    },
    {
      "id": "EVT-0228",
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "type": "GRILL_COMPLETED",
      "payload": {
        "reason": "The 0.6 contract, current implementation, packaging, and release gaps were mapped; only the user-facing release boundary between a foundation release and full MCP delivery remains open.",
        "carried": []
      },
      "createdAt": "2026-07-21T08:32:43.526Z"
    },
    {
      "id": "EVT-0229",
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 0,
        "questions": 1,
        "evidence": 0,
        "expectedScope": [
          "Approved 0.6 product boundary, tests, release documentation, package metadata, and bundled runtime assets"
        ],
        "avoidScope": [
          "Owned coding runtime",
          "npm publish",
          "remote push"
        ],
        "implementationPlan": [
          "Confirm whether 0.6.0 includes the complete MCP control plane or a CLI-foundation release that explicitly defers MCP runtime work.",
          "Implement the approved boundary in dependency order, including public documentation and tests.",
          "Validate source and packed CLI behavior, then create a local release commit and v0.6.0 tag without publishing or pushing."
        ],
        "verificationPlan": [
          "Targeted unit and CLI e2e coverage for every new public surface",
          "Format, lint, typecheck, full tests, build, package dry-run",
          "For MCP scope: stdio client lifecycle and idempotency, digest, migration, context, and verifier matrices",
          "Release artifact installation smoke and clean Git/tag inspection"
        ]
      },
      "createdAt": "2026-07-21T08:32:43.909Z"
    },
    {
      "id": "EVT-0230",
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0059"
      },
      "createdAt": "2026-07-21T08:34:34.475Z"
    },
    {
      "id": "EVT-0231",
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "type": "QUESTION_ANSWERED",
      "payload": {
        "questionId": "Q-0-6-boundary",
        "answer": "Ship a CLI-foundation 0.6.0 and defer MCP runtime"
      },
      "createdAt": "2026-07-21T08:34:34.475Z"
    },
    {
      "id": "EVT-0232",
      "taskId": "TASK-20260721-complete-the-documented-sduck-0-6-mcp-control-pl",
      "type": "TASK_ABANDONED",
      "payload": {},
      "createdAt": "2026-07-21T08:39:28.375Z"
    }
  ]
}
```
