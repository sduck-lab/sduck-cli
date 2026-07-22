---
id: TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo
type: task
status: CLOSED
title: 'Release 0.6.1: clarify agent-internal CLI workflow and user-facing development scenario'
created_at: '2026-07-22T01:12:32.530Z'
updated_at: '2026-07-22T01:29:39.391Z'
---
# TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo: Release 0.6.1: clarify agent-internal CLI workflow and user-facing development scenario

Release 0.6.1: clarify agent-internal CLI workflow and user-facing development scenario

## Sduck source

```json sduck-source
{
  "task": {
    "id": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
    "title": "Release 0.6.1: clarify agent-internal CLI workflow and user-facing development scenario",
    "description": "Release 0.6.1: clarify agent-internal CLI workflow and user-facing development scenario",
    "status": "CLOSED",
    "expectedScope": [
      ".sduck/sduck-assets/agent-rules/core.md",
      "AGENTS.md and CLAUDE.md regenerated from managed templates",
      "README.md and README.ko.md UX clarification",
      "package.json, package-lock.json, and .sduck/sduck-assets/.sduck-version bumped to 0.6.1",
      "Tests covering rule text, update/install outputs, README wording, and package contents"
    ],
    "avoidScope": [
      "v2 workflow semantic changes",
      "MCP runtime or new commands",
      "Release-critical package metadata removed in 0.6.0",
      ".ignore",
      "npm publish"
    ],
    "guided": true,
    "createdAt": "2026-07-22T01:12:32.530Z",
    "updatedAt": "2026-07-22T01:29:39.391Z",
    "implementationPlan": [
      "Add the user-facing interaction model to the shared managed core rule, making lifecycle commands internal by default.",
      "Regenerate AGENTS.md and CLAUDE.md from the managed templates and align their rendered content.",
      "Add concise matching public UX clarification in both README locales.",
      "Bump all requested release version files to 0.6.1 and extend focused regression tests.",
      "Run release checks and inspect packed artifact contents."
    ],
    "verificationPlan": [
      "npm run format:check",
      "npm run lint",
      "npm run typecheck",
      "npm run test:coverage",
      "npm run test:e2e",
      "npm run build",
      "npm run package:check",
      "npm run audit:prod",
      "Inspect packed package for version 0.6.1, managed assets including .sduck-version, and exclusion of .ignore"
    ]
  },
  "questions": [],
  "evidence": [
    {
      "id": "EVD-0052",
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "decisionId": null,
      "sourceType": "USER_ANSWER",
      "sourceRef": "User release brief",
      "summary": "Explicitly requires agent-internal lifecycle commands, plain-language scenario and approval, 0.6.1 version bumps, validation, and no .ignore.",
      "confidence": 1,
      "createdAt": "2026-07-22T01:18:07.497Z"
    },
    {
      "id": "EVD-0053",
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/core/agent-rules.ts:170-199",
      "summary": "The renderer concatenates core.md into every installed rule and produces wrapped root files.",
      "confidence": 1,
      "createdAt": "2026-07-22T01:18:07.497Z"
    },
    {
      "id": "EVD-0054",
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/core/assets.ts:30-42",
      "summary": "Managed agent-rule assets are shipped with the package.",
      "confidence": 1,
      "createdAt": "2026-07-22T01:18:07.497Z"
    },
    {
      "id": "EVD-0055",
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "tests/unit/sdd-core-regression.test.ts:295-537",
      "summary": "Existing regression coverage verifies template content, update refresh, generated files, and README wording.",
      "confidence": 0.9,
      "createdAt": "2026-07-22T01:18:07.497Z"
    }
  ],
  "contextItems": [
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0617",
      "createdAt": "2026-07-22T01:12:32.667Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0618",
      "createdAt": "2026-07-22T01:12:32.667Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0619",
      "createdAt": "2026-07-22T01:12:32.667Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0620",
      "createdAt": "2026-07-22T01:12:32.667Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0621",
      "createdAt": "2026-07-22T01:12:32.667Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0622",
      "createdAt": "2026-07-22T01:12:32.667Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0040",
      "summary": "Prior decision: Start mandatory agent-led grilling when work begins — work automatically starts a grill session and emits context-aware instructions. The agent, not a fixed CLI wizard, generates questions. A reasoned grill completion is required before Brief submission.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0623",
      "createdAt": "2026-07-22T01:12:32.667Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0041",
      "summary": "Prior decision: Reduce grilling through evidence-backed carried decisions — The agent reuses prior decisions only by recording carried decision IDs and rationale. New questions are limited to conflicts, unknowns, or scope and verification changes; no fixed question quota applies.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0624",
      "createdAt": "2026-07-22T01:12:32.668Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0042",
      "summary": "Prior decision: Keep Markdown canonical and project history into rebuildable SQLite graph data — Git-mergeable Markdown remains canonical. SQLite remains a worktree-local rebuildable cache and graph projection that accelerates context and bounded relationship queries but is not required for agent judgment.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0625",
      "createdAt": "2026-07-22T01:12:32.668Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0626",
      "createdAt": "2026-07-22T01:12:32.668Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0627",
      "createdAt": "2026-07-22T01:12:32.668Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0628",
      "createdAt": "2026-07-22T01:12:32.668Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0629",
      "createdAt": "2026-07-22T01:12:32.668Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0630",
      "createdAt": "2026-07-22T01:12:32.668Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0631",
      "createdAt": "2026-07-22T01:12:32.669Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0632",
      "createdAt": "2026-07-22T01:12:32.669Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0633",
      "createdAt": "2026-07-22T01:12:32.669Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0634",
      "createdAt": "2026-07-22T01:12:32.669Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0635",
      "createdAt": "2026-07-22T01:12:32.669Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0636",
      "createdAt": "2026-07-22T01:12:32.669Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0637",
      "createdAt": "2026-07-22T01:12:32.669Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0638",
      "createdAt": "2026-07-22T01:12:32.669Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0639",
      "createdAt": "2026-07-22T01:12:32.669Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0640",
      "createdAt": "2026-07-22T01:12:32.669Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0641",
      "createdAt": "2026-07-22T01:12:32.670Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0642",
      "createdAt": "2026-07-22T01:12:32.670Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0643",
      "createdAt": "2026-07-22T01:12:32.670Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0644",
      "createdAt": "2026-07-22T01:12:32.670Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0645",
      "createdAt": "2026-07-22T01:12:32.670Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "sourceType": "DISCOVERY",
      "sourceRef": "AGENTS.md",
      "summary": "File evidence: Selected agents: Codex",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "Selected agents: Codex",
        "line": 5
      },
      "id": "CTX-0646",
      "createdAt": "2026-07-22T01:12:32.670Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0647",
      "createdAt": "2026-07-22T01:12:32.670Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "sourceType": "DISCOVERY",
      "sourceRef": ".backup/AGENT.md",
      "summary": "File evidence: Selected agents: Codex, OpenCode",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "Selected agents: Codex, OpenCode",
        "line": 5
      },
      "id": "CTX-0648",
      "createdAt": "2026-07-22T01:12:32.670Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0649",
      "createdAt": "2026-07-22T01:12:32.670Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0650",
      "createdAt": "2026-07-22T01:12:32.670Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0651",
      "createdAt": "2026-07-22T01:12:32.670Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "sourceType": "DISCOVERY",
      "sourceRef": ".backup/CLAUDE.md",
      "summary": "File evidence: Selected agents: Claude Code",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "Selected agents: Claude Code",
        "line": 5
      },
      "id": "CTX-0652",
      "createdAt": "2026-07-22T01:12:32.671Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/design/mcp-control-plane-0.6-contract.md",
      "summary": "File evidence: Release lane: **0.6.0 CLI foundations**",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "Release lane: **0.6.0 CLI foundations**",
        "line": 4
      },
      "id": "CTX-0653",
      "createdAt": "2026-07-22T01:12:32.671Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0654",
      "createdAt": "2026-07-22T01:12:32.671Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0655",
      "createdAt": "2026-07-22T01:12:32.671Z"
    },
    {
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
      "id": "CTX-0656",
      "createdAt": "2026-07-22T01:12:32.671Z"
    }
  ],
  "briefSnapshots": [
    {
      "id": "BRF-0016",
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "snapshot": {
        "task": {
          "id": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
          "title": "Release 0.6.1: clarify agent-internal CLI workflow and user-facing development scenario",
          "description": "Release 0.6.1: clarify agent-internal CLI workflow and user-facing development scenario",
          "status": "CONFIRMED",
          "expectedScope": [
            ".sduck/sduck-assets/agent-rules/core.md",
            "AGENTS.md and CLAUDE.md regenerated from managed templates",
            "README.md and README.ko.md UX clarification",
            "package.json, package-lock.json, and .sduck/sduck-assets/.sduck-version bumped to 0.6.1",
            "Tests covering rule text, update/install outputs, README wording, and package contents"
          ],
          "avoidScope": [
            "v2 workflow semantic changes",
            "MCP runtime or new commands",
            "Release-critical package metadata removed in 0.6.0",
            ".ignore",
            "npm publish"
          ],
          "guided": true,
          "createdAt": "2026-07-22T01:12:32.530Z",
          "updatedAt": "2026-07-22T01:18:07.756Z",
          "implementationPlan": [
            "Add the user-facing interaction model to the shared managed core rule, making lifecycle commands internal by default.",
            "Regenerate AGENTS.md and CLAUDE.md from the managed templates and align their rendered content.",
            "Add concise matching public UX clarification in both README locales.",
            "Bump all requested release version files to 0.6.1 and extend focused regression tests.",
            "Run release checks and inspect packed artifact contents."
          ],
          "verificationPlan": [
            "npm run format:check",
            "npm run lint",
            "npm run typecheck",
            "npm run test:coverage",
            "npm run test:e2e",
            "npm run build",
            "npm run package:check",
            "npm run audit:prod",
            "Inspect packed package for version 0.6.1, managed assets including .sduck-version, and exclusion of .ignore"
          ]
        },
        "decisions": {
          "EXPLICIT": [
            {
              "id": "DEC-0061",
              "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
              "title": "Keep lifecycle commands agent-internal",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Coding agents run sduck lifecycle commands internally and do not ask non-developer users to execute them during normal development unless command-level details are explicitly requested.",
              "rationale": [
                "User release brief defines this product UX."
              ],
              "appliesTo": [
                ".sduck/sduck-assets/agent-rules/core.md",
                "AGENTS.md",
                "CLAUDE.md"
              ],
              "avoids": [
                "New CLI commands",
                "Changes to v2 lifecycle semantics"
              ],
              "sourceRefs": [
                "User request: High-level intent; Phase 4"
              ],
              "createdAt": "2026-07-22T01:18:07.497Z",
              "updatedAt": "2026-07-22T01:18:07.756Z"
            },
            {
              "id": "DEC-0062",
              "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
              "title": "Use a concise plain-language development scenario",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Before implementation, agents restate the request, inspect context internally, ask only blocking questions with a recommendation, present change boundaries, key decision, and verification plan, then ask for plain-language approval and report results.",
              "rationale": [
                "User supplied the required interaction sequence and example approval wording."
              ],
              "appliesTo": [
                ".sduck/sduck-assets/agent-rules/core.md",
                "AGENTS.md",
                "CLAUDE.md"
              ],
              "avoids": [
                "Raw lifecycle command sequences in ordinary user-facing messages"
              ],
              "sourceRefs": [
                "User request: Draft intent; Phase 4"
              ],
              "createdAt": "2026-07-22T01:18:07.497Z",
              "updatedAt": "2026-07-22T01:18:07.756Z"
            }
          ],
          "INFERRED": [
            {
              "id": "DEC-0063",
              "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
              "title": "Extend the shared managed core rule and refresh generated outputs",
              "kind": "INFERRED",
              "status": "CONFIRMED",
              "confidence": 0.7,
              "summary": "core.md is the shared source concatenated into every installed agent rule; updating it and regenerating committed AGENTS.md and CLAUDE.md provides consistent coverage without needless agent-specific duplication.",
              "rationale": [
                "Agent rule renderer appends core.md to every target; AGENTS.md and CLAUDE.md are committed generated outputs."
              ],
              "appliesTo": [
                ".sduck/sduck-assets/agent-rules/core.md",
                "AGENTS.md",
                "CLAUDE.md",
                "tests/unit/sdd-core-regression.test.ts",
                "tests/e2e/sdd-cli-reachability.test.ts"
              ],
              "avoids": [],
              "sourceRefs": [
                "src/core/agent-rules.ts:170-199",
                "src/core/init.ts:831-879",
                "Explorer report"
              ],
              "createdAt": "2026-07-22T01:18:07.497Z",
              "updatedAt": "2026-07-22T01:18:07.756Z"
            },
            {
              "id": "DEC-0064",
              "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
              "title": "Clarify the public documentation in both README locales",
              "kind": "INFERRED",
              "status": "CONFIRMED",
              "confidence": 0.7,
              "summary": "Add a short user-facing UX clarification to README.md and README.ko.md because the current English wording is scattered and does not plainly distinguish agent-internal commands from conversational user interaction.",
              "rationale": [
                "Existing documentation is implicit and English/Korean coverage differs."
              ],
              "appliesTo": [
                "README.md",
                "README.ko.md"
              ],
              "avoids": [],
              "sourceRefs": [
                "README.md:12,100,107-108,131,323",
                "README.ko.md:12,148,324",
                "Explorer report"
              ],
              "createdAt": "2026-07-22T01:18:07.497Z",
              "updatedAt": "2026-07-22T01:18:07.756Z"
            }
          ],
          "CARRIED": [],
          "CONFLICT": [],
          "OPEN": []
        },
        "questions": [],
        "evidence": [
          {
            "id": "EVD-0052",
            "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
            "decisionId": null,
            "sourceType": "USER_ANSWER",
            "sourceRef": "User release brief",
            "summary": "Explicitly requires agent-internal lifecycle commands, plain-language scenario and approval, 0.6.1 version bumps, validation, and no .ignore.",
            "confidence": 1,
            "createdAt": "2026-07-22T01:18:07.497Z"
          },
          {
            "id": "EVD-0053",
            "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
            "decisionId": null,
            "sourceType": "CODE",
            "sourceRef": "src/core/agent-rules.ts:170-199",
            "summary": "The renderer concatenates core.md into every installed rule and produces wrapped root files.",
            "confidence": 1,
            "createdAt": "2026-07-22T01:18:07.497Z"
          },
          {
            "id": "EVD-0054",
            "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
            "decisionId": null,
            "sourceType": "CODE",
            "sourceRef": "src/core/assets.ts:30-42",
            "summary": "Managed agent-rule assets are shipped with the package.",
            "confidence": 1,
            "createdAt": "2026-07-22T01:18:07.497Z"
          },
          {
            "id": "EVD-0055",
            "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
            "decisionId": null,
            "sourceType": "CODE",
            "sourceRef": "tests/unit/sdd-core-regression.test.ts:295-537",
            "summary": "Existing regression coverage verifies template content, update refresh, generated files, and README wording.",
            "confidence": 0.9,
            "createdAt": "2026-07-22T01:18:07.497Z"
          }
        ],
        "expectedScope": [
          ".sduck/sduck-assets/agent-rules/core.md",
          "AGENTS.md and CLAUDE.md regenerated from managed templates",
          "README.md and README.ko.md UX clarification",
          "package.json, package-lock.json, and .sduck/sduck-assets/.sduck-version bumped to 0.6.1",
          "Tests covering rule text, update/install outputs, README wording, and package contents"
        ],
        "avoidScope": [
          "v2 workflow semantic changes",
          "MCP runtime or new commands",
          "Release-critical package metadata removed in 0.6.0",
          ".ignore",
          "npm publish"
        ],
        "implementationPlan": [
          "Add the user-facing interaction model to the shared managed core rule, making lifecycle commands internal by default.",
          "Regenerate AGENTS.md and CLAUDE.md from the managed templates and align their rendered content.",
          "Add concise matching public UX clarification in both README locales.",
          "Bump all requested release version files to 0.6.1 and extend focused regression tests.",
          "Run release checks and inspect packed artifact contents."
        ],
        "verificationPlan": [
          "npm run format:check",
          "npm run lint",
          "npm run typecheck",
          "npm run test:coverage",
          "npm run test:e2e",
          "npm run build",
          "npm run package:check",
          "npm run audit:prod",
          "Inspect packed package for version 0.6.1, managed assets including .sduck-version, and exclusion of .ignore"
        ],
        "openQuestionCount": 0
      },
      "renderedMarkdown": "────────────────────────────────────────\nImplementation Brief\n────────────────────────────────────────\nTask: TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo\nRelease 0.6.1: clarify agent-internal CLI workflow and user-facing development scenario\n\nA. Explicit decisions\n[EXPLICIT] DEC-0061. Keep lifecycle commands agent-internal\nConfidence: 1.00\nSummary: Coding agents run sduck lifecycle commands internally and do not ask non-developer users to execute them during normal development unless command-level details are explicitly requested.\nSource refs:\n  - User request: High-level intent; Phase 4\nRationale:\n  - User release brief defines this product UX.\nApplies to:\n  - .sduck/sduck-assets/agent-rules/core.md\n  - AGENTS.md\n  - CLAUDE.md\nAvoids:\n  - New CLI commands\n  - Changes to v2 lifecycle semantics\n\n[EXPLICIT] DEC-0062. Use a concise plain-language development scenario\nConfidence: 1.00\nSummary: Before implementation, agents restate the request, inspect context internally, ask only blocking questions with a recommendation, present change boundaries, key decision, and verification plan, then ask for plain-language approval and report results.\nSource refs:\n  - User request: Draft intent; Phase 4\nRationale:\n  - User supplied the required interaction sequence and example approval wording.\nApplies to:\n  - .sduck/sduck-assets/agent-rules/core.md\n  - AGENTS.md\n  - CLAUDE.md\nAvoids:\n  - Raw lifecycle command sequences in ordinary user-facing messages\n\nB. Inferred decisions\n[INFERRED] DEC-0063. Extend the shared managed core rule and refresh generated outputs\nConfidence: 0.70\nSummary: core.md is the shared source concatenated into every installed agent rule; updating it and regenerating committed AGENTS.md and CLAUDE.md provides consistent coverage without needless agent-specific duplication.\nSource refs:\n  - src/core/agent-rules.ts:170-199\n  - src/core/init.ts:831-879\n  - Explorer report\nRationale:\n  - Agent rule renderer appends core.md to every target; AGENTS.md and CLAUDE.md are committed generated outputs.\nApplies to:\n  - .sduck/sduck-assets/agent-rules/core.md\n  - AGENTS.md\n  - CLAUDE.md\n  - tests/unit/sdd-core-regression.test.ts\n  - tests/e2e/sdd-cli-reachability.test.ts\n\n[INFERRED] DEC-0064. Clarify the public documentation in both README locales\nConfidence: 0.70\nSummary: Add a short user-facing UX clarification to README.md and README.ko.md because the current English wording is scattered and does not plainly distinguish agent-internal commands from conversational user interaction.\nSource refs:\n  - README.md:12,100,107-108,131,323\n  - README.ko.md:12,148,324\n  - Explorer report\nRationale:\n  - Existing documentation is implicit and English/Korean coverage differs.\nApplies to:\n  - README.md\n  - README.ko.md\n\nC. Carried decisions\n  - none\n\nD. Conflicts\n  - none\n\nE. Open decisions\n  - none\n\nProblem:\n  Release 0.6.1: clarify agent-internal CLI workflow and user-facing development scenario\nImplementation plan:\n  - Add the user-facing interaction model to the shared managed core rule, making lifecycle commands internal by default.\n  - Regenerate AGENTS.md and CLAUDE.md from the managed templates and align their rendered content.\n  - Add concise matching public UX clarification in both README locales.\n  - Bump all requested release version files to 0.6.1 and extend focused regression tests.\n  - Run release checks and inspect packed artifact contents.\nVerification plan:\n  - npm run format:check\n  - npm run lint\n  - npm run typecheck\n  - npm run test:coverage\n  - npm run test:e2e\n  - npm run build\n  - npm run package:check\n  - npm run audit:prod\n  - Inspect packed package for version 0.6.1, managed assets including .sduck-version, and exclusion of .ignore\nScope expected:\n  - .sduck/sduck-assets/agent-rules/core.md\n  - AGENTS.md and CLAUDE.md regenerated from managed templates\n  - README.md and README.ko.md UX clarification\n  - package.json, package-lock.json, and .sduck/sduck-assets/.sduck-version bumped to 0.6.1\n  - Tests covering rule text, update/install outputs, README wording, and package contents\nScope avoided:\n  - v2 workflow semantic changes\n  - MCP runtime or new commands\n  - Release-critical package metadata removed in 0.6.0\n  - .ignore\n  - npm publish\nOpen questions: 0\nEvidence:\n  - [USER_ANSWER] User release brief (1): Explicitly requires agent-internal lifecycle commands, plain-language scenario and approval, 0.6.1 version bumps, validation, and no .ignore.\n  - [CODE] src/core/agent-rules.ts:170-199 (1): The renderer concatenates core.md into every installed rule and produces wrapped root files.\n  - [CODE] src/core/assets.ts:30-42 (1): Managed agent-rule assets are shipped with the package.\n  - [CODE] tests/unit/sdd-core-regression.test.ts:295-537 (0.9): Existing regression coverage verifies template content, update refresh, generated files, and README wording.\n────────────────────────────────────────",
      "gitBaseline": {
        "head": "397af3f9811e35f329dd00a2fac2583c9c6c0e40",
        "dirtyFileHashes": {
          ".ignore": "d848d497c18118c6142a789e167a989adbc2c2227e371b0164480a6206bab443"
        }
      },
      "createdAt": "2026-07-22T01:18:07.805Z"
    }
  ],
  "evaluations": [
    {
      "id": "EVAL-0002",
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "traceId": "IMPL-0019",
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
          "outcome": "passed"
        },
        {
          "name": "e2e",
          "outcome": "passed"
        },
        {
          "name": "build",
          "outcome": "passed"
        },
        {
          "name": "package",
          "outcome": "passed"
        },
        {
          "name": "audit-prod",
          "outcome": "passed"
        },
        {
          "name": "package-assets",
          "outcome": "passed"
        }
      ],
      "createdAt": "2026-07-22T01:29:39.033Z"
    }
  ],
  "events": [
    {
      "id": "EVT-0251",
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "type": "TASK_CREATED",
      "payload": {
        "description": "Release 0.6.1: clarify agent-internal CLI workflow and user-facing development scenario",
        "policy": {
          "grillMeRequired": false
        }
      },
      "createdAt": "2026-07-22T01:12:32.530Z"
    },
    {
      "id": "EVT-0252",
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "type": "GRILL_STARTED",
      "payload": {
        "automatic": true
      },
      "createdAt": "2026-07-22T01:12:32.530Z"
    },
    {
      "id": "EVT-0253",
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "type": "CONTEXT_INDEXED",
      "payload": {
        "itemCount": 40
      },
      "createdAt": "2026-07-22T01:12:32.671Z"
    },
    {
      "id": "EVT-0254",
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "type": "GRILL_COMPLETED",
      "payload": {
        "reason": "0.6.1 scope is limited to clarifying that sduck commands are agent-internal and user communication should be plain-language scenario, brief, approval, implementation, verification",
        "carried": []
      },
      "createdAt": "2026-07-22T01:12:48.226Z"
    },
    {
      "id": "EVT-0255",
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0061"
      },
      "createdAt": "2026-07-22T01:18:07.498Z"
    },
    {
      "id": "EVT-0256",
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0062"
      },
      "createdAt": "2026-07-22T01:18:07.498Z"
    },
    {
      "id": "EVT-0257",
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0063"
      },
      "createdAt": "2026-07-22T01:18:07.498Z"
    },
    {
      "id": "EVT-0258",
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0064"
      },
      "createdAt": "2026-07-22T01:18:07.498Z"
    },
    {
      "id": "EVT-0259",
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 4,
        "questions": 0,
        "evidence": 4,
        "expectedScope": [
          ".sduck/sduck-assets/agent-rules/core.md",
          "AGENTS.md and CLAUDE.md regenerated from managed templates",
          "README.md and README.ko.md UX clarification",
          "package.json, package-lock.json, and .sduck/sduck-assets/.sduck-version bumped to 0.6.1",
          "Tests covering rule text, update/install outputs, README wording, and package contents"
        ],
        "avoidScope": [
          "v2 workflow semantic changes",
          "MCP runtime or new commands",
          "Release-critical package metadata removed in 0.6.0",
          ".ignore",
          "npm publish"
        ],
        "implementationPlan": [
          "Add the user-facing interaction model to the shared managed core rule, making lifecycle commands internal by default.",
          "Regenerate AGENTS.md and CLAUDE.md from the managed templates and align their rendered content.",
          "Add concise matching public UX clarification in both README locales.",
          "Bump all requested release version files to 0.6.1 and extend focused regression tests.",
          "Run release checks and inspect packed artifact contents."
        ],
        "verificationPlan": [
          "npm run format:check",
          "npm run lint",
          "npm run typecheck",
          "npm run test:coverage",
          "npm run test:e2e",
          "npm run build",
          "npm run package:check",
          "npm run audit:prod",
          "Inspect packed package for version 0.6.1, managed assets including .sduck-version, and exclusion of .ignore"
        ]
      },
      "createdAt": "2026-07-22T01:18:07.499Z"
    },
    {
      "id": "EVT-0260",
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "type": "BRIEF_CONFIRMED",
      "payload": {
        "snapshotId": "BRF-0016"
      },
      "createdAt": "2026-07-22T01:18:07.805Z"
    },
    {
      "id": "EVT-0261",
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "type": "TRACE_CREATED",
      "payload": {
        "traceId": "IMPL-0019",
        "filesChanged": [
          "AGENTS.md",
          "CLAUDE.md",
          "README.ko.md",
          "README.md",
          "package-lock.json",
          "package.json",
          "src/core/agent-rules.ts",
          "tests/e2e/sdd-cli-reachability.test.ts",
          "tests/e2e/v2-cli.test.ts",
          "tests/unit/sdd-core-regression.test.ts"
        ]
      },
      "createdAt": "2026-07-22T01:28:41.089Z"
    },
    {
      "id": "EVT-0262",
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "type": "EVALUATION_RECORDED",
      "payload": {
        "evaluationId": "EVAL-0002",
        "traceId": "IMPL-0019"
      },
      "createdAt": "2026-07-22T01:29:39.033Z"
    },
    {
      "id": "EVT-0263",
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
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
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/DECISION_REPORT.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/decision-graph.json"
        ]
      },
      "createdAt": "2026-07-22T01:29:39.187Z"
    },
    {
      "id": "EVT-0264",
      "taskId": "TASK-20260722-release-0-6-1-clarify-agent-internal-cli-workflo",
      "type": "TASK_CLOSED",
      "payload": {},
      "createdAt": "2026-07-22T01:29:39.391Z"
    }
  ]
}
```
