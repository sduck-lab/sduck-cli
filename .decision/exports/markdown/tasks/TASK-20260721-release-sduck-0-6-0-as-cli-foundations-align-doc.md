---
id: TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc
type: task
status: CLOSED
title: >-
  Release sduck 0.6.0 as CLI foundations: align documentation and bundled rules, make retrospective hooks safe, update
  metadata and tests, validate the packed CLI, then create a local tag without publishing or pushing.
created_at: '2026-07-21T08:39:28.749Z'
updated_at: '2026-07-21T09:41:03.254Z'
---
# TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc: Release sduck 0.6.0 as CLI foundations: align documentation and bundled rules, make retrospective hooks safe, update metadata and tests, validate the packed CLI, then create a local tag without publishing or pushing.

Release sduck 0.6.0 as CLI foundations: align documentation and bundled rules, make retrospective hooks safe, update metadata and tests, validate the packed CLI, then create a local tag without publishing or pushing.

## Sduck source

```json sduck-source
{
  "task": {
    "id": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
    "title": "Release sduck 0.6.0 as CLI foundations: align documentation and bundled rules, make retrospective hooks safe, update metadata and tests, validate the packed CLI, then create a local tag without publishing or pushing.",
    "description": "Release sduck 0.6.0 as CLI foundations: align documentation and bundled rules, make retrospective hooks safe, update metadata and tests, validate the packed CLI, then create a local tag without publishing or pushing.",
    "status": "CLOSED",
    "expectedScope": [
      "CLI-only 0.6.0 metadata, documentation, bundled assets, workflow/hook behavior, tests, canonical decision exports, and release evidence"
    ],
    "avoidScope": [
      "MCP SDK or runtime",
      "npm publish",
      "git push"
    ],
    "guided": true,
    "createdAt": "2026-07-21T08:39:28.749Z",
    "updatedAt": "2026-07-21T09:41:03.254Z",
    "implementationPlan": [
      "Record and document the CLI-foundation boundary: ship supported CLI workflow features and repository-only Phase 0 fixtures; explicitly defer MCP runtime/control-plane features.",
      "Correct design documents, README files, migration guidance, and bundled agent rules to describe the real guided flow and deferred MCP scope.",
      "Implement the safe managed retrospective-hook state machine: absent-path install only while disabled; preserve existing file/non-file hooks including force; retained managed hooks no-op while enabled; pending marker blocks enable; disable warns but succeeds when automation is unavailable.",
      "Bump package/lockfile metadata to 0.6.0 and add exact-version plus deferred-command coverage.",
      "Run source and packed-artifact validation; trace, remember, close, stage the explicit approved inventory, commit, and create local v0.6.0 without publishing or pushing."
    ],
    "verificationPlan": [
      "Focused unit/e2e tests for bundled rules, the full managed-hook lifecycle, exact version, and unknown deferred commands",
      "npm run format:check; npm run lint; npm run typecheck; npm run test:coverage; npm run test:e2e; npm run build; npm run package:check",
      "Install a real tarball in an external temporary Git repository; assert 0.6.0 version, expected/unknown routes, engine/package contents/dependencies, usable bundled assets, and preserved existing hooks",
      "Audit staged inventory and compare tag, package, lockfile, and packed CLI versions"
    ]
  },
  "questions": [
    {
      "id": "Q-retrospective-hook-contract",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "decisionId": null,
      "text": "Should 0.6.0 use the safe managed retrospective-hook contract: disable installs only at an absent hook path; init/update install only while disabled; every existing file/non-file hook is preserved even with --force; re-enabled hooks no-op; enable fails while a marker is pending; and disable succeeds with a warning when user hooks prevent automation?",
      "recommendedAnswer": "Yes — adopt the safe managed-hook contract and cover its full lifecycle with tests.",
      "rationale": [],
      "options": [
        "Yes — adopt the safe managed-hook contract",
        "No — use manual-only retrospective capture and do not manage hooks"
      ],
      "answered": true,
      "answer": "Yes — adopt the safe managed-hook contract",
      "createdAt": "2026-07-21T08:42:16.153Z"
    }
  ],
  "evidence": [
    {
      "id": "EVD-0051",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "decisionId": null,
      "sourceType": "USER_ANSWER",
      "sourceRef": "Q-retrospective-hook-contract",
      "summary": "Yes — adopt the safe managed-hook contract",
      "confidence": 1,
      "createdAt": "2026-07-21T08:47:37.323Z"
    },
    {
      "id": "EVD-0-6-cli-choice",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "decisionId": "DEC-0-6-cli-foundation",
      "sourceType": "USER_ANSWER",
      "sourceRef": "conversation: user stated MCP features will not be used and CLI-only release is desired",
      "summary": "User selected CLI-only 0.6.0 scope.",
      "confidence": 1,
      "createdAt": "2026-07-21T08:47:37.727Z"
    },
    {
      "id": "EVD-0-6-hook-choice",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "decisionId": "DEC-0-6-safe-retrospective-hook",
      "sourceType": "USER_ANSWER",
      "sourceRef": "Q-retrospective-hook-contract option 1",
      "summary": "User selected the recommended safe managed-hook contract.",
      "confidence": 1,
      "createdAt": "2026-07-21T08:47:37.727Z"
    },
    {
      "id": "EVD-0-6-hook-review",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "decisionId": "DEC-0-6-safe-retrospective-hook",
      "sourceType": "DISCOVERY",
      "sourceRef": ".slim/deepwork/sduck-0-6-release.md",
      "summary": "Architecture review identified destructive hook replacement and mode inconsistency as release blockers.",
      "confidence": 0.9,
      "createdAt": "2026-07-21T08:47:37.727Z"
    },
    {
      "id": "EVD-0-6-hook-code",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "decisionId": "DEC-0-6-safe-retrospective-hook",
      "sourceType": "CODE",
      "sourceRef": "src/core/init.ts; src/core/v2/retrospective.ts",
      "summary": "Current hook installation and marker behavior require the safe state-machine correction.",
      "confidence": 0.9,
      "createdAt": "2026-07-21T08:47:37.727Z"
    }
  ],
  "contextItems": [
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0577",
      "createdAt": "2026-07-21T08:39:28.888Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0578",
      "createdAt": "2026-07-21T08:39:28.888Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0579",
      "createdAt": "2026-07-21T08:39:28.888Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0011",
      "summary": "Prior decision: Require local digest confirmation by default — MCP may prepare a canonical brief, but default confirmation is interactive local sduck confirm --digest; non-human MCP acknowledgement is explicit policy opt-in with provenance.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0580",
      "createdAt": "2026-07-21T08:39:28.888Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0019",
      "summary": "Prior decision: What trace data and CI semantics should sduck verify require? — Bind trace to Git and brief digest",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0581",
      "createdAt": "2026-07-21T08:39:28.888Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0020",
      "summary": "Prior decision: What exact BriefDigestProjectionV1 and canonical serializer should sduck use? — RFC 8785 projection v1 (recommended)",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0582",
      "createdAt": "2026-07-21T08:39:28.889Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0023",
      "summary": "Prior decision: What exact Git-bound trace and sduck verify algorithm should 0.6 use? — Merge-base CI verifier (recommended)",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0583",
      "createdAt": "2026-07-21T08:39:28.889Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0584",
      "createdAt": "2026-07-21T08:39:28.889Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0585",
      "createdAt": "2026-07-21T08:39:28.889Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0586",
      "createdAt": "2026-07-21T08:39:28.889Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0040",
      "summary": "Prior decision: Start mandatory agent-led grilling when work begins — work automatically starts a grill session and emits context-aware instructions. The agent, not a fixed CLI wizard, generates questions. A reasoned grill completion is required before Brief submission.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0587",
      "createdAt": "2026-07-21T08:39:28.889Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0043",
      "summary": "Prior decision: Record evaluation separately from implementation trace and gate close — trace records changed files and decision mapping. evaluate records validation checks, outcomes, and limitations; close requires both an evaluation record and the existing confirmed workflow. The CLI records evidence and does not execute arbitrary checks.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0588",
      "createdAt": "2026-07-21T08:39:28.889Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0589",
      "createdAt": "2026-07-21T08:39:28.889Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0590",
      "createdAt": "2026-07-21T08:39:28.890Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0591",
      "createdAt": "2026-07-21T08:39:28.890Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0592",
      "createdAt": "2026-07-21T08:39:28.890Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "sourceType": "MEMORY",
      "sourceRef": "IMPL-0014",
      "summary": "Prior implementation trace: Detected 2 changed file(s).",
      "metadata": {
        "type": "implementation_trace",
        "filesChanged": [
          "tests/e2e/v2-locale-cli.test.ts",
          "tests/unit/sdd-core-regression.test.ts"
        ],
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0593",
      "createdAt": "2026-07-21T08:39:28.890Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "sourceType": "MEMORY",
      "sourceRef": "english-default-korean-v2-locale",
      "summary": "Prior decision: Default to English and offer a global Korean v2 locale — Use English as the default for CLI output and documentation, publish a Korean README, and provide a user-global locale preference for Korean v2 CLI output; v1 is not localized or redesigned.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0594",
      "createdAt": "2026-07-21T08:39:28.890Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0595",
      "createdAt": "2026-07-21T08:39:28.890Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0596",
      "createdAt": "2026-07-21T08:39:28.890Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0597",
      "createdAt": "2026-07-21T08:39:28.890Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0598",
      "createdAt": "2026-07-21T08:39:28.890Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0599",
      "createdAt": "2026-07-21T08:39:28.890Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0600",
      "createdAt": "2026-07-21T08:39:28.891Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0601",
      "createdAt": "2026-07-21T08:39:28.891Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0026",
      "summary": "Decision applies to relevant file tests/unit/v2-contract-fixtures.test.ts: Correct Phase 0 fixtures into executable contracts",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "tests/unit/v2-contract-fixtures.test.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0602",
      "createdAt": "2026-07-21T08:39:28.891Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0603",
      "createdAt": "2026-07-21T08:39:28.891Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0604",
      "createdAt": "2026-07-21T08:39:28.891Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0605",
      "createdAt": "2026-07-21T08:39:28.891Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0606",
      "createdAt": "2026-07-21T08:39:28.891Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0607",
      "createdAt": "2026-07-21T08:39:28.891Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0608",
      "createdAt": "2026-07-21T08:39:28.891Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/update.ts",
      "summary": "File evidence: listAgentRuleTargets,",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "listAgentRuleTargets,",
        "line": 6
      },
      "id": "CTX-0609",
      "createdAt": "2026-07-21T08:39:28.892Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0610",
      "createdAt": "2026-07-21T08:39:28.892Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0611",
      "createdAt": "2026-07-21T08:39:28.892Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0612",
      "createdAt": "2026-07-21T08:39:28.892Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0613",
      "createdAt": "2026-07-21T08:39:28.892Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/commands/init.ts",
      "summary": "File evidence: import { SUPPORTED_AGENTS, type SupportedAgentId } from '../core/agent-rules.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { SUPPORTED_AGENTS, type SupportedAgentId } from '../core/agent-rules.js';",
        "line": 4
      },
      "id": "CTX-0614",
      "createdAt": "2026-07-21T08:39:28.892Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0615",
      "createdAt": "2026-07-21T08:39:28.892Z"
    },
    {
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
      "id": "CTX-0616",
      "createdAt": "2026-07-21T08:39:28.892Z"
    }
  ],
  "briefSnapshots": [
    {
      "id": "BRF-0015",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "snapshot": {
        "task": {
          "id": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
          "title": "Release sduck 0.6.0 as CLI foundations: align documentation and bundled rules, make retrospective hooks safe, update metadata and tests, validate the packed CLI, then create a local tag without publishing or pushing.",
          "description": "Release sduck 0.6.0 as CLI foundations: align documentation and bundled rules, make retrospective hooks safe, update metadata and tests, validate the packed CLI, then create a local tag without publishing or pushing.",
          "status": "CONFIRMED",
          "expectedScope": [
            "CLI-only 0.6.0 metadata, documentation, bundled assets, workflow/hook behavior, tests, canonical decision exports, and release evidence"
          ],
          "avoidScope": [
            "MCP SDK or runtime",
            "npm publish",
            "git push"
          ],
          "guided": true,
          "createdAt": "2026-07-21T08:39:28.749Z",
          "updatedAt": "2026-07-21T08:48:43.444Z",
          "implementationPlan": [
            "Record and document the CLI-foundation boundary: ship supported CLI workflow features and repository-only Phase 0 fixtures; explicitly defer MCP runtime/control-plane features.",
            "Correct design documents, README files, migration guidance, and bundled agent rules to describe the real guided flow and deferred MCP scope.",
            "Implement the safe managed retrospective-hook state machine: absent-path install only while disabled; preserve existing file/non-file hooks including force; retained managed hooks no-op while enabled; pending marker blocks enable; disable warns but succeeds when automation is unavailable.",
            "Bump package/lockfile metadata to 0.6.0 and add exact-version plus deferred-command coverage.",
            "Run source and packed-artifact validation; trace, remember, close, stage the explicit approved inventory, commit, and create local v0.6.0 without publishing or pushing."
          ],
          "verificationPlan": [
            "Focused unit/e2e tests for bundled rules, the full managed-hook lifecycle, exact version, and unknown deferred commands",
            "npm run format:check; npm run lint; npm run typecheck; npm run test:coverage; npm run test:e2e; npm run build; npm run package:check",
            "Install a real tarball in an external temporary Git repository; assert 0.6.0 version, expected/unknown routes, engine/package contents/dependencies, usable bundled assets, and preserved existing hooks",
            "Audit staged inventory and compare tag, package, lockfile, and packed CLI versions"
          ]
        },
        "decisions": {
          "EXPLICIT": [
            {
              "id": "DEC-0-6-cli-foundation",
              "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
              "title": "Ship 0.6.0 as CLI foundations, not an MCP runtime",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "The user will use the CLI only. 0.6.0 ships supported CLI foundations and repository-only Phase 0 fixtures while every MCP runtime/control-plane surface remains deferred.",
              "rationale": [],
              "appliesTo": [
                "README.md",
                "README.ko.md",
                "docs/design/mcp-control-plane-0.6-contract.md",
                "docs/design/conversational-workflow.md",
                "src/cli.ts",
                "package.json"
              ],
              "avoids": [],
              "sourceRefs": [],
              "createdAt": "2026-07-21T08:39:55.739Z",
              "updatedAt": "2026-07-21T08:39:55.739Z"
            },
            {
              "id": "DEC-0-6-safe-retrospective-hook",
              "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
              "title": "Use a safe managed retrospective-hook state machine",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "0.6.0 installs automation only when safe, never overwrites existing hooks, leaves managed hooks inert while enabled, blocks enable with pending markers, and warns rather than failing disable when user hooks prevent automation.",
              "rationale": [],
              "appliesTo": [
                "src/core/init.ts",
                "src/commands/v2/index.ts",
                "src/core/v2/retrospective.ts",
                ".sduck/sduck-assets/agent-rules/hooks/sduck-retrospective-post-commit.sh",
                "tests"
              ],
              "avoids": [],
              "sourceRefs": [],
              "createdAt": "2026-07-21T08:47:37.727Z",
              "updatedAt": "2026-07-21T08:47:37.727Z"
            },
            {
              "id": "DEC-0060",
              "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
              "title": "Should 0.6.0 use the safe managed retrospective-hook contract: disable installs only at an absent hook path; init/update install only while disabled; every existing file/non-file hook is preserved even with --force; re-enabled hooks no-op; enable fails while a marker is pending; and disable succeeds with a warning when user hooks prevent automation?",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Yes — adopt the safe managed-hook contract",
              "rationale": [
                "User answered Q-retrospective-hook-contract."
              ],
              "appliesTo": [],
              "avoids": [],
              "sourceRefs": [
                "USER_ANSWER:Q-retrospective-hook-contract",
                "EVD-0051"
              ],
              "createdAt": "2026-07-21T08:47:37.323Z",
              "updatedAt": "2026-07-21T08:47:37.323Z"
            }
          ],
          "INFERRED": [
            {
              "id": "DEC-0-6-release-evidence",
              "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
              "title": "Prove the CLI release from a packed artifact",
              "kind": "INFERRED",
              "status": "CONFIRMED",
              "confidence": 0.7,
              "summary": "Release confidence requires source checks plus an installed tarball smoke that observes exact version, bundled assets, supported CLI routes, deferred routes, and Git-hook safety.",
              "rationale": [],
              "appliesTo": [
                "package.json",
                "package-lock.json",
                "tests",
                "README.md"
              ],
              "avoids": [],
              "sourceRefs": [],
              "createdAt": "2026-07-21T08:39:55.739Z",
              "updatedAt": "2026-07-21T08:39:55.739Z"
            },
            {
              "id": "DEC-0-6-release-safety",
              "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
              "title": "Make packaged workflow guidance and retrospective hooks release-safe",
              "kind": "INFERRED",
              "status": "CONFIRMED",
              "confidence": 0.7,
              "summary": "Bundled rules must match the guided CLI lifecycle, and retrospective integration must not overwrite user hooks or create unusable enabled-mode markers.",
              "rationale": [],
              "appliesTo": [
                ".sduck/sduck-assets/agent-rules",
                "src/core/init.ts",
                "src/commands/v2/index.ts",
                "src/core/v2/retrospective.ts",
                "tests"
              ],
              "avoids": [],
              "sourceRefs": [],
              "createdAt": "2026-07-21T08:39:55.739Z",
              "updatedAt": "2026-07-21T08:39:55.739Z"
            }
          ],
          "CARRIED": [],
          "CONFLICT": [],
          "OPEN": []
        },
        "questions": [
          {
            "id": "Q-retrospective-hook-contract",
            "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
            "decisionId": null,
            "text": "Should 0.6.0 use the safe managed retrospective-hook contract: disable installs only at an absent hook path; init/update install only while disabled; every existing file/non-file hook is preserved even with --force; re-enabled hooks no-op; enable fails while a marker is pending; and disable succeeds with a warning when user hooks prevent automation?",
            "recommendedAnswer": "Yes — adopt the safe managed-hook contract and cover its full lifecycle with tests.",
            "rationale": [],
            "options": [
              "Yes — adopt the safe managed-hook contract",
              "No — use manual-only retrospective capture and do not manage hooks"
            ],
            "answered": true,
            "answer": "Yes — adopt the safe managed-hook contract",
            "createdAt": "2026-07-21T08:42:16.153Z"
          }
        ],
        "evidence": [
          {
            "id": "EVD-0051",
            "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
            "decisionId": null,
            "sourceType": "USER_ANSWER",
            "sourceRef": "Q-retrospective-hook-contract",
            "summary": "Yes — adopt the safe managed-hook contract",
            "confidence": 1,
            "createdAt": "2026-07-21T08:47:37.323Z"
          },
          {
            "id": "EVD-0-6-cli-choice",
            "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
            "decisionId": "DEC-0-6-cli-foundation",
            "sourceType": "USER_ANSWER",
            "sourceRef": "conversation: user stated MCP features will not be used and CLI-only release is desired",
            "summary": "User selected CLI-only 0.6.0 scope.",
            "confidence": 1,
            "createdAt": "2026-07-21T08:47:37.727Z"
          },
          {
            "id": "EVD-0-6-hook-choice",
            "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
            "decisionId": "DEC-0-6-safe-retrospective-hook",
            "sourceType": "USER_ANSWER",
            "sourceRef": "Q-retrospective-hook-contract option 1",
            "summary": "User selected the recommended safe managed-hook contract.",
            "confidence": 1,
            "createdAt": "2026-07-21T08:47:37.727Z"
          },
          {
            "id": "EVD-0-6-hook-review",
            "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
            "decisionId": "DEC-0-6-safe-retrospective-hook",
            "sourceType": "DISCOVERY",
            "sourceRef": ".slim/deepwork/sduck-0-6-release.md",
            "summary": "Architecture review identified destructive hook replacement and mode inconsistency as release blockers.",
            "confidence": 0.9,
            "createdAt": "2026-07-21T08:47:37.727Z"
          },
          {
            "id": "EVD-0-6-hook-code",
            "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
            "decisionId": "DEC-0-6-safe-retrospective-hook",
            "sourceType": "CODE",
            "sourceRef": "src/core/init.ts; src/core/v2/retrospective.ts",
            "summary": "Current hook installation and marker behavior require the safe state-machine correction.",
            "confidence": 0.9,
            "createdAt": "2026-07-21T08:47:37.727Z"
          }
        ],
        "expectedScope": [
          "CLI-only 0.6.0 metadata, documentation, bundled assets, workflow/hook behavior, tests, canonical decision exports, and release evidence"
        ],
        "avoidScope": [
          "MCP SDK or runtime",
          "npm publish",
          "git push"
        ],
        "implementationPlan": [
          "Record and document the CLI-foundation boundary: ship supported CLI workflow features and repository-only Phase 0 fixtures; explicitly defer MCP runtime/control-plane features.",
          "Correct design documents, README files, migration guidance, and bundled agent rules to describe the real guided flow and deferred MCP scope.",
          "Implement the safe managed retrospective-hook state machine: absent-path install only while disabled; preserve existing file/non-file hooks including force; retained managed hooks no-op while enabled; pending marker blocks enable; disable warns but succeeds when automation is unavailable.",
          "Bump package/lockfile metadata to 0.6.0 and add exact-version plus deferred-command coverage.",
          "Run source and packed-artifact validation; trace, remember, close, stage the explicit approved inventory, commit, and create local v0.6.0 without publishing or pushing."
        ],
        "verificationPlan": [
          "Focused unit/e2e tests for bundled rules, the full managed-hook lifecycle, exact version, and unknown deferred commands",
          "npm run format:check; npm run lint; npm run typecheck; npm run test:coverage; npm run test:e2e; npm run build; npm run package:check",
          "Install a real tarball in an external temporary Git repository; assert 0.6.0 version, expected/unknown routes, engine/package contents/dependencies, usable bundled assets, and preserved existing hooks",
          "Audit staged inventory and compare tag, package, lockfile, and packed CLI versions"
        ],
        "openQuestionCount": 0
      },
      "renderedMarkdown": "────────────────────────────────────────\nImplementation Brief\n────────────────────────────────────────\nTask: TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc\nRelease sduck 0.6.0 as CLI foundations: align documentation and bundled rules, make retrospective hooks safe, update metadata and tests, validate the packed CLI, then create a local tag without publishing or pushing.\n\nA. Explicit decisions\n[EXPLICIT] DEC-0-6-cli-foundation. Ship 0.6.0 as CLI foundations, not an MCP runtime\nConfidence: 1.00\nSummary: The user will use the CLI only. 0.6.0 ships supported CLI foundations and repository-only Phase 0 fixtures while every MCP runtime/control-plane surface remains deferred.\nApplies to:\n  - README.md\n  - README.ko.md\n  - docs/design/mcp-control-plane-0.6-contract.md\n  - docs/design/conversational-workflow.md\n  - src/cli.ts\n  - package.json\n\n[EXPLICIT] DEC-0-6-safe-retrospective-hook. Use a safe managed retrospective-hook state machine\nConfidence: 1.00\nSummary: 0.6.0 installs automation only when safe, never overwrites existing hooks, leaves managed hooks inert while enabled, blocks enable with pending markers, and warns rather than failing disable when user hooks prevent automation.\nApplies to:\n  - src/core/init.ts\n  - src/commands/v2/index.ts\n  - src/core/v2/retrospective.ts\n  - .sduck/sduck-assets/agent-rules/hooks/sduck-retrospective-post-commit.sh\n  - tests\n\n[EXPLICIT] DEC-0060. Should 0.6.0 use the safe managed retrospective-hook contract: disable installs only at an absent hook path; init/update install only while disabled; every existing file/non-file hook is preserved even with --force; re-enabled hooks no-op; enable fails while a marker is pending; and disable succeeds with a warning when user hooks prevent automation?\nConfidence: 1.00\nSummary: Yes — adopt the safe managed-hook contract\nSource refs:\n  - USER_ANSWER:Q-retrospective-hook-contract\n  - EVD-0051\nRationale:\n  - User answered Q-retrospective-hook-contract.\n\nB. Inferred decisions\n[INFERRED] DEC-0-6-release-evidence. Prove the CLI release from a packed artifact\nConfidence: 0.70\nSummary: Release confidence requires source checks plus an installed tarball smoke that observes exact version, bundled assets, supported CLI routes, deferred routes, and Git-hook safety.\nApplies to:\n  - package.json\n  - package-lock.json\n  - tests\n  - README.md\n\n[INFERRED] DEC-0-6-release-safety. Make packaged workflow guidance and retrospective hooks release-safe\nConfidence: 0.70\nSummary: Bundled rules must match the guided CLI lifecycle, and retrospective integration must not overwrite user hooks or create unusable enabled-mode markers.\nApplies to:\n  - .sduck/sduck-assets/agent-rules\n  - src/core/init.ts\n  - src/commands/v2/index.ts\n  - src/core/v2/retrospective.ts\n  - tests\n\nC. Carried decisions\n  - none\n\nD. Conflicts\n  - none\n\nE. Open decisions\n  - none\n\nProblem:\n  Release sduck 0.6.0 as CLI foundations: align documentation and bundled rules, make retrospective hooks safe, update metadata and tests, validate the packed CLI, then create a local tag without publishing or pushing.\nImplementation plan:\n  - Record and document the CLI-foundation boundary: ship supported CLI workflow features and repository-only Phase 0 fixtures; explicitly defer MCP runtime/control-plane features.\n  - Correct design documents, README files, migration guidance, and bundled agent rules to describe the real guided flow and deferred MCP scope.\n  - Implement the safe managed retrospective-hook state machine: absent-path install only while disabled; preserve existing file/non-file hooks including force; retained managed hooks no-op while enabled; pending marker blocks enable; disable warns but succeeds when automation is unavailable.\n  - Bump package/lockfile metadata to 0.6.0 and add exact-version plus deferred-command coverage.\n  - Run source and packed-artifact validation; trace, remember, close, stage the explicit approved inventory, commit, and create local v0.6.0 without publishing or pushing.\nVerification plan:\n  - Focused unit/e2e tests for bundled rules, the full managed-hook lifecycle, exact version, and unknown deferred commands\n  - npm run format:check; npm run lint; npm run typecheck; npm run test:coverage; npm run test:e2e; npm run build; npm run package:check\n  - Install a real tarball in an external temporary Git repository; assert 0.6.0 version, expected/unknown routes, engine/package contents/dependencies, usable bundled assets, and preserved existing hooks\n  - Audit staged inventory and compare tag, package, lockfile, and packed CLI versions\nScope expected:\n  - CLI-only 0.6.0 metadata, documentation, bundled assets, workflow/hook behavior, tests, canonical decision exports, and release evidence\nScope avoided:\n  - MCP SDK or runtime\n  - npm publish\n  - git push\nOpen questions: 0\nEvidence:\n  - [USER_ANSWER] Q-retrospective-hook-contract (1): Yes — adopt the safe managed-hook contract\n  - [USER_ANSWER] conversation: user stated MCP features will not be used and CLI-only release is desired (1): User selected CLI-only 0.6.0 scope.\n  - [USER_ANSWER] Q-retrospective-hook-contract option 1 (1): User selected the recommended safe managed-hook contract.\n  - [DISCOVERY] .slim/deepwork/sduck-0-6-release.md (0.9): Architecture review identified destructive hook replacement and mode inconsistency as release blockers.\n  - [CODE] src/core/init.ts; src/core/v2/retrospective.ts (0.9): Current hook installation and marker behavior require the safe state-machine correction.\n────────────────────────────────────────",
      "gitBaseline": {
        "head": "4fb70744ee432a5801242673de38551bf9109826",
        "dirtyFileHashes": {
          ".ignore": "d848d497c18118c6142a789e167a989adbc2c2227e371b0164480a6206bab443",
          ".prettierignore": "c0efdf6a8bebcb6f2d5f390eadaad516b16239b1b83914f3005b9efe3f6f0a94",
          "AGENTS.md": "d994e93914bb9f76b8a97016f42c7bb2f0e16c69a2f19f5905a060517a1814f1",
          "CLAUDE.md": "6edc056cf4264e38f07dfe44173e6ea57edee77c92add2958f7ab77131439a56",
          "README.ko.md": "ba1b7664d399e589345c6416a206ad39614c0e24aea42fbb430823d791ae32ac",
          "README.md": "6a197c93f681d20bc8aba5539cfa5be641efc5a2a051c269eec5f0eb33cee9bf",
          "docs/design/conversational-workflow.md": "39393af5444abee5a4146ba56421ec6c39c69856654ec1fd5b5ecae9f81e5809",
          "docs/design/mcp-control-plane-0.6-contract.md": "54e436b84bcfffcc61c7639e758e40023431f602f09f3bb6dd78e5902a6dfad1",
          "docs/migration.md": "d41713865c2794d93373851921e1a201fdb59afafec764fcae34b6ce62747afa",
          "src/cli.ts": "4a7e59aca1923d45aa5662d6dc2de6964824c07b4955c37fd51fadc7dbbbe158",
          "src/commands/v2/index.ts": "74caf6b56511596cb0731b0285ac446fc5ca903e95ea95e23d65d06dc701dccc",
          "src/core/assets.ts": "61c1ceae800de3dd40a2464bca90ad34ab93a257aab7962225e7f38969e8c35c",
          "src/core/init.ts": "44cb672d5c28bda1b37eb2ac273f1045266e4293d640dc4f7b40686d61c0fb35",
          "src/core/update.ts": "c39ee30f0edd82615bf0ec7a3a013b0f57af6c729457799e9682e4ab567eec60",
          "src/core/v2/brief.ts": "4cd81145bbbbbd3a7e69f370524d9cddfa351ef61aec4f7a8c3e674bef04910c",
          "src/core/v2/cache-bundle.ts": "0def5debf4fa5090ef1747213fbd44471aa3d61a724fffca31bd30e6b1bc8569",
          "src/core/v2/cache.ts": "b8423bfaea681dd0f837b49ed7096b47cd27e85008207421b993a811871edbae",
          "src/core/v2/context.ts": "d305b5c9a66ceeed0f0949a322edfc1bce772e1fbb8a4530c660f41432a8ff9d",
          "src/core/v2/doctor.ts": "1bee99f9177f6afe4da4049aba9e7b0969e7c6538503639cd3eebd571c0bb26d",
          "src/core/v2/draft.ts": "e0eaf93c497798bc42f4764d7ffe4952b3c4acbe8a42c1346ed143f6d39ac603",
          "src/core/v2/errors.ts": "88224183c01a7d256a2b546c3af3db9988ed6de442ea928b6d3e79df7e363ec5",
          "src/core/v2/evaluate.ts": "f56443f1cb102e366fe8ddb1cd27f147a9a568bdc8b336b4cca7580ba641a7fd",
          "src/core/v2/graph.ts": "9ad2cfb846a9e74a2e5bad680506712186ae02188e0729364011b2769ba3029c",
          "src/core/v2/grill.ts": "f3d3ffad0ff3ff7e43b2da5e2e44342762e9c25e0c4729f7aba371f519e952c4",
          "src/core/v2/policy.ts": "28e8166ce3c04bc833678734a3e81251556dfc3cd24dadf168ccf7e494e58820",
          "src/core/v2/rebuild.ts": "9a448a956c8761541ee2fb342765fc283ad1d79812305cf36e76ae6cafea6f25",
          "src/core/v2/remember.ts": "56ea2d317f8d3aa942405e5f8c1d635c02de62a981e860d2dcececcdd3785f4e",
          "src/core/v2/retrospective.ts": "1c55ae6610657ba8816dd504983dadf2d6b1fae4d3c1db3c2e5995cd248b3ac8",
          "src/core/v2/source-store.ts": "608ce1a4ef2d556040fea1e5578f20e9d392161d45b4312494945ae9eb79572c",
          "src/core/v2/source-types.ts": "3b035cc4c6554eeb0eecda1e10d6e1d4f0aa9cb095afc4f4de0712e1d2ca3018",
          "src/core/v2/status.ts": "5a4fe43c0c1a4f4ba392ff28f7f0fda8bd26e43364416f5afe39423c3d260fee",
          "src/core/v2/store.ts": "25ea93e52ede4f0eb8fe174065f4cf82520179a5e77de2909c631b9deb6304ee",
          "src/core/v2/task-lifecycle.ts": "368dd1ca9ed0fad5f7b8d2bcfa8484682e806a57f5ca3154e071537cc6efcce1",
          "src/core/v2/task.ts": "4fce921ba570d9030e651287ab95e9c35777a9a525d6d5f900af11bcb0441e93",
          "src/core/v2/workspace.ts": "ff1e4f8f185f6133e143a7724b6de09dd7b342db34b5c7e855aaca8e16cab1bd",
          "src/types/index.ts": "1b19019ae66f797e57881d57e29fc382ec65b740d8992b2abe0468cb612d6ee6",
          "src/ui/v2/messages.ts": "72a2dd6fad060303d1f0d86358afb870eff959ad50c43afbe23955c76862d9ec",
          "src/ui/v2/render.ts": "5a91e203b3ce21fa648abc44444c4f7d31dcf3a8bb46ee231ae392cbf8a9a752",
          "tests/e2e/sdd-cli-reachability.test.ts": "c88d74519333a9506cf6a0a1dd619099c4d4b89f0ff050751130ae9940e91d65",
          "tests/e2e/v2-cli.test.ts": "9395830a6ea2f19f67e20a37bb8d45bb5b149c4c5f6a157e963c556990c38a04",
          "tests/e2e/v2-locale-cli.test.ts": "3507d5e39e4a898866c9cae67c2b4ebd95e87f8fe24da43d6e8291e267228748",
          "tests/e2e/v2-phase2c-matrix.test.ts": "ca81349ca03da6dae8915e6fedbeb6f818ecf074849f0cece0fb85c45736936b",
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
          "tests/unit/sdd-core-regression.test.ts": "a3a85a778e1624946d903949f0de86830b82981ae082d3f9a2013a884708e6ad",
          "tests/unit/v2-contract-fixtures.test.ts": "af9b602764822d89578de375ef3c50c86c38a24d20f6c7502ef212a743e396de",
          "tests/unit/v2-lifecycle.test.ts": "67feffd42771c2cf1a8917c12a21d8cf5174d22afcb32838c4dde4c4584b1393",
          "tests/unit/v2-messages.test.ts": "bc851b10991247ab66b93701ad7f20f8cd632834382374a11145d1b66f3c29b6"
        }
      },
      "createdAt": "2026-07-21T08:48:43.516Z"
    }
  ],
  "evaluations": [
    {
      "id": "EVAL-0001",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "traceId": "IMPL-0018",
      "checks": [
        {
          "name": "format",
          "outcome": "passed"
        },
        {
          "name": "lint",
          "outcome": "passed"
        },
        {
          "name": "typecheck",
          "outcome": "passed"
        },
        {
          "name": "unit-coverage",
          "outcome": "passed (15 files, 122 tests)"
        },
        {
          "name": "e2e",
          "outcome": "passed (4 files, 27 tests)"
        },
        {
          "name": "build",
          "outcome": "passed"
        },
        {
          "name": "package-check",
          "outcome": "passed"
        },
        {
          "name": "tarball-smoke",
          "outcome": "passed"
        }
      ],
      "limitations": [
        "DEC-0060 is the recorded answer for the safe-hook question and has no appliesTo mapping; its behavior is covered by DEC-0-6-safe-retrospective-hook."
      ],
      "createdAt": "2026-07-21T09:40:54.730Z"
    }
  ],
  "events": [
    {
      "id": "EVT-0233",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "type": "TASK_CREATED",
      "payload": {
        "description": "Release sduck 0.6.0 as CLI foundations: align documentation and bundled rules, make retrospective hooks safe, update metadata and tests, validate the packed CLI, then create a local tag without publishing or pushing.",
        "policy": {
          "grillMeRequired": false
        }
      },
      "createdAt": "2026-07-21T08:39:28.749Z"
    },
    {
      "id": "EVT-0234",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "type": "GRILL_STARTED",
      "payload": {
        "automatic": true
      },
      "createdAt": "2026-07-21T08:39:28.749Z"
    },
    {
      "id": "EVT-0235",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "type": "CONTEXT_INDEXED",
      "payload": {
        "itemCount": 40
      },
      "createdAt": "2026-07-21T08:39:28.892Z"
    },
    {
      "id": "EVT-0236",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "type": "GRILL_COMPLETED",
      "payload": {
        "reason": "The user explicitly selected a CLI-only 0.6.0 release; the mapped design, package evidence, and architecture review resolve the remaining delivery decisions.",
        "carried": []
      },
      "createdAt": "2026-07-21T08:39:55.391Z"
    },
    {
      "id": "EVT-0237",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0-6-cli-foundation"
      },
      "createdAt": "2026-07-21T08:39:55.740Z"
    },
    {
      "id": "EVT-0238",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0-6-release-safety"
      },
      "createdAt": "2026-07-21T08:39:55.740Z"
    },
    {
      "id": "EVT-0239",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0-6-release-evidence"
      },
      "createdAt": "2026-07-21T08:39:55.740Z"
    },
    {
      "id": "EVT-0240",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 3,
        "questions": 0,
        "evidence": 0,
        "expectedScope": [
          "CLI-only 0.6.0 metadata, documentation, bundled assets, workflow/hook behavior, tests, canonical decision exports, and release evidence"
        ],
        "avoidScope": [
          "MCP SDK or runtime",
          "sduck mcp",
          "source-envelope runtime parsing",
          "confirm --digest",
          "idempotency receipts",
          "refresh context",
          "sduck verify",
          "npm publish",
          "git push",
          "owned coding runtime"
        ],
        "implementationPlan": [
          "Record and document the CLI-foundation boundary: ship supported CLI workflow features and repository-only Phase 0 fixtures; explicitly defer MCP runtime/control-plane features.",
          "Correct the MCP design documents, README files, migration guide, and bundled agent rules so they describe the real guided flow and do not promise MCP runtime support.",
          "Make retrospective hook integration non-destructive and mode-consistent; cover enabled, disabled, and existing-hook behavior.",
          "Bump package/lockfile release metadata to 0.6.0; add exact-version and deferred-command coverage.",
          "Run source and packed-artifact validation; trace, remember, close, stage the explicit approved inventory, commit, and create a local v0.6.0 tag without publishing or pushing."
        ],
        "verificationPlan": [
          "Focused unit and e2e tests for bundled rules, retrospective hooks, exact version, and absent deferred commands",
          "npm run format:check; npm run lint; npm run typecheck; npm run test:coverage; npm run test:e2e; npm run build; npm run package:check",
          "Install a real tarball in an external temporary Git repository; assert 0.6.0 version, expected/absent help routes, usable bundled assets, and preserved existing hooks",
          "Audit staged inventory and compare tag, package, lockfile, and packed CLI versions"
        ]
      },
      "createdAt": "2026-07-21T08:39:55.740Z"
    },
    {
      "id": "EVT-0241",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 0,
        "questions": 1,
        "evidence": 0,
        "expectedScope": [
          "CLI-only 0.6.0 metadata, documentation, bundled assets, workflow/hook behavior, tests, canonical decision exports, and release evidence"
        ],
        "avoidScope": [
          "MCP SDK or runtime",
          "npm publish",
          "git push"
        ],
        "implementationPlan": [],
        "verificationPlan": []
      },
      "createdAt": "2026-07-21T08:42:16.154Z"
    },
    {
      "id": "EVT-0242",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0060"
      },
      "createdAt": "2026-07-21T08:47:37.324Z"
    },
    {
      "id": "EVT-0243",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "type": "QUESTION_ANSWERED",
      "payload": {
        "questionId": "Q-retrospective-hook-contract",
        "answer": "Yes — adopt the safe managed-hook contract"
      },
      "createdAt": "2026-07-21T08:47:37.324Z"
    },
    {
      "id": "EVT-0244",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0-6-safe-retrospective-hook"
      },
      "createdAt": "2026-07-21T08:47:37.728Z"
    },
    {
      "id": "EVT-0245",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 1,
        "questions": 0,
        "evidence": 4,
        "expectedScope": [
          "CLI-only 0.6.0 metadata, documentation, bundled assets, workflow/hook behavior, tests, canonical decision exports, and release evidence"
        ],
        "avoidScope": [
          "MCP SDK or runtime",
          "npm publish",
          "git push"
        ],
        "implementationPlan": [
          "Record and document the CLI-foundation boundary: ship supported CLI workflow features and repository-only Phase 0 fixtures; explicitly defer MCP runtime/control-plane features.",
          "Correct design documents, README files, migration guidance, and bundled agent rules to describe the real guided flow and deferred MCP scope.",
          "Implement the safe managed retrospective-hook state machine: absent-path install only while disabled; preserve existing file/non-file hooks including force; retained managed hooks no-op while enabled; pending marker blocks enable; disable warns but succeeds when automation is unavailable.",
          "Bump package/lockfile metadata to 0.6.0 and add exact-version plus deferred-command coverage.",
          "Run source and packed-artifact validation; trace, remember, close, stage the explicit approved inventory, commit, and create local v0.6.0 without publishing or pushing."
        ],
        "verificationPlan": [
          "Focused unit/e2e tests for bundled rules, the full managed-hook lifecycle, exact version, and unknown deferred commands",
          "npm run format:check; npm run lint; npm run typecheck; npm run test:coverage; npm run test:e2e; npm run build; npm run package:check",
          "Install a real tarball in an external temporary Git repository; assert 0.6.0 version, expected/unknown routes, engine/package contents/dependencies, usable bundled assets, and preserved existing hooks",
          "Audit staged inventory and compare tag, package, lockfile, and packed CLI versions"
        ]
      },
      "createdAt": "2026-07-21T08:47:37.728Z"
    },
    {
      "id": "EVT-0246",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "type": "BRIEF_CONFIRMED",
      "payload": {
        "snapshotId": "BRF-0015"
      },
      "createdAt": "2026-07-21T08:48:43.516Z"
    },
    {
      "id": "EVT-0247",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "type": "TRACE_CREATED",
      "payload": {
        "traceId": "IMPL-0018",
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
        ]
      },
      "createdAt": "2026-07-21T09:40:41.494Z"
    },
    {
      "id": "EVT-0248",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "type": "EVALUATION_RECORDED",
      "payload": {
        "evaluationId": "EVAL-0001",
        "traceId": "IMPL-0018"
      },
      "createdAt": "2026-07-21T09:40:54.731Z"
    },
    {
      "id": "EVT-0249",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
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
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/DECISION_REPORT.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/decision-graph.json"
        ]
      },
      "createdAt": "2026-07-21T09:41:02.568Z"
    },
    {
      "id": "EVT-0250",
      "taskId": "TASK-20260721-release-sduck-0-6-0-as-cli-foundations-align-doc",
      "type": "TASK_CLOSED",
      "payload": {},
      "createdAt": "2026-07-21T09:41:03.256Z"
    }
  ]
}
```
