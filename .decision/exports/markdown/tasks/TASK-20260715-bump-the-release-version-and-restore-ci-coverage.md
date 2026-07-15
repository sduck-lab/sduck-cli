---
id: TASK-20260715-bump-the-release-version-and-restore-ci-coverage
type: task
status: CLOSED
title: Bump the release version and restore CI coverage compliance
created_at: '2026-07-15T00:39:56.417Z'
updated_at: '2026-07-15T00:48:47.975Z'
---
# TASK-20260715-bump-the-release-version-and-restore-ci-coverage: Bump the release version and restore CI coverage compliance

Bump the release version and restore CI coverage compliance

## Sduck source

```json sduck-source
{
  "task": {
    "id": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
    "title": "Bump the release version and restore CI coverage compliance",
    "description": "Bump the release version and restore CI coverage compliance",
    "status": "CLOSED",
    "expectedScope": [
      "Bump package metadata and lockfile to 0.5.0",
      "Restore the existing CI coverage threshold through tests or coverage measurement",
      "Run the release-equivalent verification suite"
    ],
    "avoidScope": [
      "npm publish",
      "Lowering coverage thresholds",
      "Unrelated refactors"
    ],
    "createdAt": "2026-07-15T00:39:56.417Z",
    "updatedAt": "2026-07-15T00:48:47.975Z"
  },
  "questions": [],
  "evidence": [
    {
      "id": "EVD-0001",
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "decisionId": null,
      "sourceType": "DISCOVERY",
      "sourceRef": "npm run test:coverage",
      "summary": "Current unit-only coverage fails the global function threshold at 68.01% versus 75%.",
      "confidence": 1,
      "createdAt": "2026-07-15T00:40:55.794Z"
    },
    {
      "id": "EVD-0002",
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "decisionId": null,
      "sourceType": "DISCOVERY",
      "sourceRef": "npm view @sduck/sduck-cli version dist-tags --json",
      "summary": "The published latest version is 0.4.0, matching package.json.",
      "confidence": 1,
      "createdAt": "2026-07-15T00:40:55.794Z"
    }
  ],
  "contextItems": [
    {
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "sourceType": "MEMORY",
      "sourceRef": "english-default-korean-v2-locale",
      "summary": "Prior decision: Default to English and offer a global Korean v2 locale — Use English as the default for CLI output and documentation, publish a Korean README, and provide a user-global locale preference for Korean v2 CLI output; v1 is not localized or redesigned.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0043",
      "createdAt": "2026-07-15T00:39:56.492Z"
    },
    {
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "sourceType": "MEMORY",
      "sourceRef": "global-locale-config-shape",
      "summary": "Prior decision: Use an XDG-compatible global locale configuration — Add `sduck config locale en|ko`, persisting the preference in a user-global XDG-compatible config location with English fallback; preserve it independently of project initialization.",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0044",
      "createdAt": "2026-07-15T00:39:56.492Z"
    },
    {
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "sourceType": "MEMORY",
      "sourceRef": "v2-workflow-is-primary",
      "summary": "Prior decision: Make v2 the single primary documented workflow — Reorganize public documentation, installed agent rules, and v2 next-step guidance around one canonical flow: init → work → context → grill-me → submit → ask/answer → brief/confirm → implement → trace → remember/recall → close.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0045",
      "createdAt": "2026-07-15T00:39:56.492Z"
    },
    {
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
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
      "id": "CTX-0046",
      "createdAt": "2026-07-15T00:39:56.492Z"
    },
    {
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
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
      "id": "CTX-0047",
      "createdAt": "2026-07-15T00:39:56.492Z"
    },
    {
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "sourceType": "DISCOVERY",
      "sourceRef": ".github/workflows/ci.yml",
      "summary": "File evidence: node-version: '22.13'",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "node-version: '22.13'",
        "line": 19
      },
      "id": "CTX-0048",
      "createdAt": "2026-07-15T00:39:56.492Z"
    },
    {
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/commands/fast-track.ts",
      "summary": "File evidence: type FastTrackCommandInput,",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "type FastTrackCommandInput,",
        "line": 7
      },
      "id": "CTX-0049",
      "createdAt": "2026-07-15T00:39:56.492Z"
    },
    {
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/commands/update.ts",
      "summary": "File evidence: export interface CommandResult {",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "export interface CommandResult {",
        "line": 3
      },
      "id": "CTX-0050",
      "createdAt": "2026-07-15T00:39:56.492Z"
    },
    {
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
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
      "id": "CTX-0051",
      "createdAt": "2026-07-15T00:39:56.492Z"
    },
    {
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/abandon.ts",
      "summary": "File evidence: import { abandonMeta, patchTaskMeta } from './task-meta.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { abandonMeta, patchTaskMeta } from './task-meta.js';",
        "line": 10
      },
      "id": "CTX-0052",
      "createdAt": "2026-07-15T00:39:56.492Z"
    },
    {
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/command-metadata.ts",
      "summary": "File evidence: export const CLI_VERSION = packageMetadata.version;",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "export const CLI_VERSION = packageMetadata.version;",
        "line": 5
      },
      "id": "CTX-0053",
      "createdAt": "2026-07-15T00:39:56.492Z"
    },
    {
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/version-file.ts",
      "summary": "File evidence: import { CLI_VERSION } from './command-metadata.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { CLI_VERSION } from './command-metadata.js';",
        "line": 4
      },
      "id": "CTX-0054",
      "createdAt": "2026-07-15T00:39:56.492Z"
    },
    {
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "sourceType": "DISCOVERY",
      "sourceRef": "package.json",
      "summary": "File evidence: \"version\": \"0.4.0\",",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "\"version\": \"0.4.0\",",
        "line": 3
      },
      "id": "CTX-0055",
      "createdAt": "2026-07-15T00:39:56.492Z"
    },
    {
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "sourceType": "DISCOVERY",
      "sourceRef": "README.ko.md",
      "summary": "File evidence: - 한국어 CLI는 v2/root/config surface에만 적용됩니다. v1/legacy SDD compatibility command는 영어로 유지됩니다.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "- 한국어 CLI는 v2/root/config surface에만 적용됩니다. v1/legacy SDD compatibility command는 영어로 유지됩니다.",
        "line": 37
      },
      "id": "CTX-0056",
      "createdAt": "2026-07-15T00:39:56.492Z"
    },
    {
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
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
      "id": "CTX-0057",
      "createdAt": "2026-07-15T00:39:56.492Z"
    },
    {
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
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
      "id": "CTX-0058",
      "createdAt": "2026-07-15T00:39:56.492Z"
    },
    {
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
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
      "id": "CTX-0059",
      "createdAt": "2026-07-15T00:39:56.492Z"
    },
    {
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
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
      "id": "CTX-0060",
      "createdAt": "2026-07-15T00:39:56.492Z"
    },
    {
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
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
      "id": "CTX-0061",
      "createdAt": "2026-07-15T00:39:56.492Z"
    },
    {
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/commands/done.ts",
      "summary": "File evidence: type DoneCommandInput,",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "type DoneCommandInput,",
        "line": 5
      },
      "id": "CTX-0062",
      "createdAt": "2026-07-15T00:39:56.492Z"
    },
    {
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/commands/implement.ts",
      "summary": "File evidence: import { runCommand, type CommandResult } from './runner.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { runCommand, type CommandResult } from './runner.js';",
        "line": 1
      },
      "id": "CTX-0063",
      "createdAt": "2026-07-15T00:39:56.492Z"
    },
    {
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
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
      "id": "CTX-0064",
      "createdAt": "2026-07-15T00:39:56.492Z"
    },
    {
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/commands/plan-approve.ts",
      "summary": "File evidence: loadPlanApprovalCandidates,",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "loadPlanApprovalCandidates,",
        "line": 6
      },
      "id": "CTX-0065",
      "createdAt": "2026-07-15T00:39:56.492Z"
    },
    {
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/commands/reopen.ts",
      "summary": "File evidence: import { runCommand, type CommandResult } from './runner.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { runCommand, type CommandResult } from './runner.js';",
        "line": 1
      },
      "id": "CTX-0066",
      "createdAt": "2026-07-15T00:39:56.492Z"
    },
    {
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/commands/review.ts",
      "summary": "File evidence: import { runCommand, type CommandResult } from './runner.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { runCommand, type CommandResult } from './runner.js';",
        "line": 1
      },
      "id": "CTX-0067",
      "createdAt": "2026-07-15T00:39:56.492Z"
    }
  ],
  "briefSnapshots": [
    {
      "id": "BRF-0003",
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "snapshot": {
        "task": {
          "id": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
          "title": "Bump the release version and restore CI coverage compliance",
          "description": "Bump the release version and restore CI coverage compliance",
          "status": "CONFIRMED",
          "expectedScope": [
            "Bump package metadata and lockfile to 0.5.0",
            "Restore the existing CI coverage threshold through tests or coverage measurement",
            "Run the release-equivalent verification suite"
          ],
          "avoidScope": [
            "npm publish",
            "Lowering coverage thresholds",
            "Unrelated refactors"
          ],
          "createdAt": "2026-07-15T00:39:56.417Z",
          "updatedAt": "2026-07-15T00:40:56.604Z"
        },
        "decisions": {
          "EXPLICIT": [
            {
              "id": "DEC-0001",
              "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
              "title": "Release the backward-compatible feature set as 0.5.0",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Bump the npm package from 0.4.0 to 0.5.0 because the completed v2 workflow and locale work adds public capabilities without intended breaking changes.",
              "rationale": [
                "npm latest already publishes 0.4.0, so it cannot be republished.",
                "The release adds v2 workflow gates and a global locale feature while preserving legacy command behavior."
              ],
              "appliesTo": [
                "package.json",
                "package-lock.json",
                "README.md",
                "README.ko.md"
              ],
              "avoids": [
                "Publishing to npm during this task",
                "Breaking legacy SDD command compatibility"
              ],
              "sourceRefs": [
                "package.json:3",
                "README.md",
                "README.ko.md"
              ],
              "createdAt": "2026-07-15T00:40:55.794Z",
              "updatedAt": "2026-07-15T00:40:56.604Z"
            },
            {
              "id": "DEC-0002",
              "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
              "title": "Restore coverage through executable coverage, not a lower bar",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Keep all existing global coverage thresholds and make the CI coverage command exercise sufficient behavior through durable tests or coverage configuration.",
              "rationale": [
                "CI requires 75% function coverage and the current unit-only coverage run measures 68.01%.",
                "Lowering the threshold would hide the release-validation regression instead of repairing it."
              ],
              "appliesTo": [
                "package.json",
                "vitest.config.ts",
                "tests/**/*.test.ts"
              ],
              "avoids": [
                "Reducing coverage thresholds",
                "Production behavior changes solely for coverage"
              ],
              "sourceRefs": [
                "vitest.config.ts:10-15",
                "package.json:36",
                ".github/workflows/ci.yml:39-43"
              ],
              "createdAt": "2026-07-15T00:40:55.794Z",
              "updatedAt": "2026-07-15T00:40:56.604Z"
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
            "id": "EVD-0001",
            "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
            "decisionId": null,
            "sourceType": "DISCOVERY",
            "sourceRef": "npm run test:coverage",
            "summary": "Current unit-only coverage fails the global function threshold at 68.01% versus 75%.",
            "confidence": 1,
            "createdAt": "2026-07-15T00:40:55.794Z"
          },
          {
            "id": "EVD-0002",
            "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
            "decisionId": null,
            "sourceType": "DISCOVERY",
            "sourceRef": "npm view @sduck/sduck-cli version dist-tags --json",
            "summary": "The published latest version is 0.4.0, matching package.json.",
            "confidence": 1,
            "createdAt": "2026-07-15T00:40:55.794Z"
          }
        ],
        "expectedScope": [
          "Bump package metadata and lockfile to 0.5.0",
          "Restore the existing CI coverage threshold through tests or coverage measurement",
          "Run the release-equivalent verification suite"
        ],
        "avoidScope": [
          "npm publish",
          "Lowering coverage thresholds",
          "Unrelated refactors"
        ],
        "openQuestionCount": 0
      },
      "renderedMarkdown": "────────────────────────────────────────\nImplementation Brief\n────────────────────────────────────────\nTask: TASK-20260715-bump-the-release-version-and-restore-ci-coverage\nBump the release version and restore CI coverage compliance\n\nA. Explicit decisions\n[EXPLICIT] DEC-0001. Release the backward-compatible feature set as 0.5.0\nConfidence: 1.00\nSummary: Bump the npm package from 0.4.0 to 0.5.0 because the completed v2 workflow and locale work adds public capabilities without intended breaking changes.\nSource refs:\n  - package.json:3\n  - README.md\n  - README.ko.md\nRationale:\n  - npm latest already publishes 0.4.0, so it cannot be republished.\n  - The release adds v2 workflow gates and a global locale feature while preserving legacy command behavior.\nApplies to:\n  - package.json\n  - package-lock.json\n  - README.md\n  - README.ko.md\nAvoids:\n  - Publishing to npm during this task\n  - Breaking legacy SDD command compatibility\n\n[EXPLICIT] DEC-0002. Restore coverage through executable coverage, not a lower bar\nConfidence: 1.00\nSummary: Keep all existing global coverage thresholds and make the CI coverage command exercise sufficient behavior through durable tests or coverage configuration.\nSource refs:\n  - vitest.config.ts:10-15\n  - package.json:36\n  - .github/workflows/ci.yml:39-43\nRationale:\n  - CI requires 75% function coverage and the current unit-only coverage run measures 68.01%.\n  - Lowering the threshold would hide the release-validation regression instead of repairing it.\nApplies to:\n  - package.json\n  - vitest.config.ts\n  - tests/**/*.test.ts\nAvoids:\n  - Reducing coverage thresholds\n  - Production behavior changes solely for coverage\n\nB. Inferred decisions\n  - none\n\nC. Carried decisions\n  - none\n\nD. Conflicts\n  - none\n\nE. Open decisions\n  - none\n\nScope expected:\n  - Bump package metadata and lockfile to 0.5.0\n  - Restore the existing CI coverage threshold through tests or coverage measurement\n  - Run the release-equivalent verification suite\nScope avoided:\n  - npm publish\n  - Lowering coverage thresholds\n  - Unrelated refactors\nOpen questions: 0\nEvidence:\n  - [DISCOVERY] npm run test:coverage (1): Current unit-only coverage fails the global function threshold at 68.01% versus 75%.\n  - [DISCOVERY] npm view @sduck/sduck-cli version dist-tags --json (1): The published latest version is 0.4.0, matching package.json.\n────────────────────────────────────────",
      "gitBaseline": {
        "head": "d4d1a51a4ce818830a8fcff7b7c7c9081862bbf5",
        "dirtyFileHashes": {
          ".backup/AGENT.md": "37c54542ece7bfa258d8d08f4eed86a9f37e0c4ad2dffe8038795e7df8a46081",
          ".backup/CLAUDE.md": "f949e48cd6c40d6e31695780887e699794c1ac2006d013daaee8784422600c37",
          ".gitignore": "733ec8952c4eea1a114c63e525d50bfabac5d343fe092483b222bd1bbbdef70e",
          ".ignore": "d848d497c18118c6142a789e167a989adbc2c2227e371b0164480a6206bab443",
          "README.ko.md": "ef71d67251a5ff603237cc8ec982010128ee26356ddc9b97f968af7f867eb3da",
          "README.md": "9e6d478ddf78c540c46a0080621d84617bfb9aac3889a25300135a9ba3da3c90",
          "docs/agents/domain.md": "8bb57ba14539963b15c023ba02a71261fa2066924f150824abc15238260c4422",
          "docs/agents/triage-labels.md": "3d0c0a601b9f2c93786030e3c70c1d583df03d32644d09b6893844e03f6cf935",
          "docs/migration.md": "a50ebdbfd415e5c000828105c2c1a2f417faa53569b1c21ad9d5c60454125bb2",
          "docs/pilot-evaluation.md": "2092268736d3fe665ff632d0d4b22ad968cb753cb2de4310101cdf2010ebe0c0",
          "docs/use-cases.md": "3811256491dd8a9a296e7eec45cd1d11f83205d9c26953dae2008717e0bf8ed8",
          "src/cli.ts": "1c43dac3f9d63cd685fbfdc054a0c20c879d8728083722eb634f7c34f4944835",
          "src/commands/init.ts": "4e5290c5f38c61dda46ab663537c50ea86b4c02e7772ccffea888a4a6c1f3a19",
          "src/commands/v2/errors.ts": "ef54b50020b364a8f11b3054ab69d577675d690122b62b43faab05f6e948159e",
          "src/commands/v2/index.ts": "780685c23fbd6c00151ac8dcf50ea733fb458ec518403afd87e23fa6aa4e0fb5",
          "src/config/global-config.ts": "e621b54cdf47dad81c58752ac1f40cfa42bc021d808820f3d45a303d84e4007c",
          "src/core/agent-rules.ts": "823ee9ce3445124aede9b53ec7be3aa9d771b18323a7d3a46a5230060abbdedc",
          "src/core/init.ts": "1d57b8545e31a91c49aa2b359200cdd8d3efd7c53990c085cfbd77126e068c7e",
          "src/core/v2/brief.ts": "42fbfa931e6c1187aa9bccf9ace86c3381e98a7156cc9a2e5cc4f99ca5168d04",
          "src/core/v2/context.ts": "0704f4e1e8e4c086efa68fe60b51e2b972b73bf77365648fce938465e50fd111",
          "src/core/v2/decision-workspace.ts": "3cbfb83cf13d6c8817b05705450c1f58f26d76eee599c5c015738c7d882ddc66",
          "src/core/v2/decision.ts": "4112340c09927870bbf84ab11f00f6aa6869f8f48201b152f78153ffbbc2da6d",
          "src/core/v2/doctor.ts": "01e8dd466bd413a8db31100f95aa8399eb6bcbfca6b02ea11e125587296debc3",
          "src/core/v2/draft.ts": "c7622873972a559f1cf624bbd51a16aa88e9de607803f1b98bcf9b5f264aa1dc",
          "src/core/v2/errors.ts": "de4f6569264ef56391db3cee6508247f4680cee04223d86fd1da2a47716d747e",
          "src/core/v2/evidence.ts": "c80e5c73ea15280148e7310a6936754f10578f4d3a40d76b3a33922879b4bf18",
          "src/core/v2/grill.ts": "27d285270d99b323e5e2eabb635662f10d86dca26a1f4c032dddfad2cdac2cc4",
          "src/core/v2/paths.ts": "4d5f1bc737b0f8ef45ca8834d31bab58a852090bd34a80d32773144f990b6af4",
          "src/core/v2/policy.ts": "701a671554144943d760a54c1abf666fcf96808d298b34d5e17d07331236a361",
          "src/core/v2/question.ts": "292a9f95c86619f5e822136fb4f9cdf1ec49e864ac42730c66f28456047b0855",
          "src/core/v2/rebuild.ts": "3d6506dfbd63ae33edd5003371feedff3a4ce7b475eb834af0ac0bdf0abc98ff",
          "src/core/v2/remember.ts": "476698f4f3f4dd0882b107ab745e2133a3d8e0df5f1e94b515121a56902b604c",
          "src/core/v2/source-store.ts": "7b0a9a38c78919a76ff58c9b970ed80ae421d7fb49a196c6d97a3a75a55e70f1",
          "src/core/v2/state.ts": "f858f2611e836dd826f797179fc4ada01a9f35e2cca6d3a66d37bc073686ab41",
          "src/core/v2/status.ts": "f57a1a2cfcb8451cf501951029d171c95d51e88ea443c9d4b978f886da6c7831",
          "src/core/v2/store.ts": "d5e2f6aabc4eca8ccbcf148597cb359853a4f85ca4bc7ebc7381548e87d6760d",
          "src/core/v2/task-lifecycle.ts": "dc9c0ab31e2c1d634ec5fbe21a9ce1943384e8c642e0f4699e1f665a68a4777b",
          "src/core/v2/task.ts": "711b434d6f53f6c24328202f1282508baf416c3171812490b5a2e9f807c500df",
          "src/core/v2/trace.ts": "cc2838873cddc9b179672375cf1cf647f26b8d0e41c872e88d3e62e4c1d5ae89",
          "src/core/v2/workspace-lock.ts": "b52b0029707feff4edb488f5c0be11e44121284622a5eebb98fa0301c6687e46",
          "src/core/v2/workspace.ts": "8044616d9a1783694e0d27781eb7ddfe116c736630cab4a0d5b9d30033460a81",
          "src/types/index.ts": "71545660b3d1b2c6f4625e5406016776a9de2fe8ed089df96bbf0667a9ad9edb",
          "src/ui/v2/messages.ts": "e9104975bbab9f33d1bef423bab68d89dd08841fef698c590cd13b56465b5f00",
          "src/ui/v2/prompts.ts": "29d02bcfc5843e65d1ca42b3ea99746a29859121b68d47e81e23b9bf0b64a43f",
          "src/ui/v2/render.ts": "a1ad86ed5414b67005a5d2d424fca03c5b22553895cfc55a3eb63d5b3f39526f",
          "tests/e2e/sdd-cli-reachability.test.ts": "277f2b3fd7d7879d79b684724f24a9c523073a0c2f94b9e57869b5b9f0fdde96",
          "tests/e2e/v2-cli.test.ts": "7d2a528436c5196ba82b1aae20fd4eab3ba2fdc85147a074ed3c4be9becb3abe",
          "tests/e2e/v2-locale-cli.test.ts": "3b9e11b2d85da05b672d63d534ca31cbecab2089416ad4a86c41dae552e335ba",
          "tests/e2e/v2-phase2c-matrix.test.ts": "f8005bba17a7517d2795cc248c3db131506c0fef19cb9fe60b20850ba8c7c8e2",
          "tests/helpers/run-cli.ts": "6022f8ed1e4764a2b1c2f06d23618656d979776cdc4f9c0188038e1241a242d1",
          "tests/unit/decision-workspace.test.ts": "b3b4c8f7d79cd17586f0234cd1774f31c69523f3dae38a4d8fb8fdbae59c48ce",
          "tests/unit/global-config.test.ts": "0a5d372e0c2594d6015b3cb1293c49d45622487926e9477c1aef82a9c613afca",
          "tests/unit/sdd-core-regression.test.ts": "be413a1f58d6e7c593214d71219a6f64d7f1522d42c7f4692e7baaded86b0b2d",
          "tests/unit/v2-core.test.ts": "d07798f7a2610872bd30244dcf40a26fcdfe464c76ec1af411d4e88098b7e78e",
          "tests/unit/v2-lifecycle.test.ts": "e550fcdd633d208fc0fe248045bf5edf054d8e636d4c22a5a039b4ae0988212f",
          "tests/unit/v2-messages.test.ts": "f64f0ef597e0de2ea66b52ed85f031c1893bb572defe0f481564fbc7b272a393"
        }
      },
      "createdAt": "2026-07-15T00:40:56.666Z"
    }
  ],
  "events": [
    {
      "id": "EVT-0021",
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "type": "TASK_CREATED",
      "payload": {
        "description": "Bump the release version and restore CI coverage compliance",
        "policy": {
          "grillMeRequired": false
        }
      },
      "createdAt": "2026-07-15T00:39:56.417Z"
    },
    {
      "id": "EVT-0022",
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "type": "CONTEXT_INDEXED",
      "payload": {
        "itemCount": 25
      },
      "createdAt": "2026-07-15T00:39:56.492Z"
    },
    {
      "id": "EVT-0023",
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
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
      "createdAt": "2026-07-15T00:39:57.554Z"
    },
    {
      "id": "EVT-0024",
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0001"
      },
      "createdAt": "2026-07-15T00:40:55.795Z"
    },
    {
      "id": "EVT-0025",
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0002"
      },
      "createdAt": "2026-07-15T00:40:55.795Z"
    },
    {
      "id": "EVT-0026",
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 2,
        "questions": 0,
        "evidence": 2,
        "expectedScope": [
          "Bump package metadata and lockfile to 0.5.0",
          "Restore the existing CI coverage threshold through tests or coverage measurement",
          "Run the release-equivalent verification suite"
        ],
        "avoidScope": [
          "npm publish",
          "Lowering coverage thresholds",
          "Unrelated refactors"
        ]
      },
      "createdAt": "2026-07-15T00:40:55.795Z"
    },
    {
      "id": "EVT-0027",
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "type": "BRIEF_CONFIRMED",
      "payload": {
        "snapshotId": "BRF-0003"
      },
      "createdAt": "2026-07-15T00:40:56.666Z"
    },
    {
      "id": "EVT-0028",
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "type": "TRACE_CREATED",
      "payload": {
        "traceId": "IMPL-0003",
        "filesChanged": [
          "package-lock.json",
          "package.json",
          "tests/unit/v2-messages.test.ts"
        ]
      },
      "createdAt": "2026-07-15T00:48:47.364Z"
    },
    {
      "id": "EVT-0029",
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "type": "EXPORT_WRITTEN",
      "payload": {
        "created": [
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260714-organize-the-complete-workflow-and-update-the-re.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260714-require-a-grill-me-gate-before-new-work-for-all-.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-bump-the-release-version-and-restore-ci-coverage.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0001.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-0002.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/english-default-korean-v2-locale.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/global-locale-config-shape.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/preserve-existing-workspaces.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/require-grill-before-brief.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/v2-workflow-is-primary.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0001.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0002.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0003.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/DECISION_REPORT.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/decision-graph.json"
        ]
      },
      "createdAt": "2026-07-15T00:48:47.673Z"
    },
    {
      "id": "EVT-0030",
      "taskId": "TASK-20260715-bump-the-release-version-and-restore-ci-coverage",
      "type": "TASK_CLOSED",
      "payload": {},
      "createdAt": "2026-07-15T00:48:47.976Z"
    }
  ]
}
```
