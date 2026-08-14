---
id: TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a
type: task
status: CLOSED
title: >-
  Implement evidence-backed Auto Wiki core, agent assets, documentation, tests, and the 0.7.0 version bump without tag,
  push, or publish
record_depth: FULL
created_at: '2026-08-11T13:32:09.701Z'
updated_at: '2026-08-11T14:14:50.012Z'
---
# TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a: Implement evidence-backed Auto Wiki core, agent assets, documentation, tests, and the 0.7.0 version bump without tag, push, or publish

Implement evidence-backed Auto Wiki core, agent assets, documentation, tests, and the 0.7.0 version bump without tag, push, or publish

## Sduck source

```json sduck-source
{
  "task": {
    "id": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
    "title": "Implement evidence-backed Auto Wiki core, agent assets, documentation, tests, and the 0.7.0 version bump without tag, push, or publish",
    "description": "Implement evidence-backed Auto Wiki core, agent assets, documentation, tests, and the 0.7.0 version bump without tag, push, or publish",
    "status": "CLOSED",
    "expectedScope": [
      "Deterministic Wiki payload/page/manifest schemas and stable five-page rendering under docs/wiki",
      "Generated-section parsing, digest verification, human-owned byte preservation, force-only conflict replacement, and atomic writes",
      "sduck wiki build --stdin, status, sync --stdin [--force], and lint with English/Korean help and messages",
      "Source ID validation and digest/status handling for tasks, decisions, evidence, traces, and evaluations",
      "Trace/relevance/lastSyncedCommit dirty detection, global recent-change cursors, external change reporting, and diff-noise lint",
      "Non-gating close advisory for enabled Wiki state",
      "New-workspace default-on Wiki policy and explicit sduck update migration for existing durable workspaces",
      "sd-build-wiki and sd-sync-wiki bundled skills, Codex rule references, Claude best-effort copies, and package inclusion tests",
      "Public-interface unit/e2e tests covering the full required matrix",
      "README, README.ko, use cases, migration, pilot metrics, command reference, quick start, and 0.7.0 release notes",
      "0.7.0 package, lockfile, bundled asset version, and version assertion updates"
    ],
    "avoidScope": [
      "Project Model or general Claim graph",
      "Project Grill database, persistent decision tree, task hierarchy, vertical-slice task manager, or comprehension digest subsystem",
      "Global user profile, vector database, embeddings, web Wiki server, or periodic LLM execution",
      "sduck-owned LLM runtime or daemon",
      "retrospective hook expansion for Wiki external-commit detection",
      "automatic Wiki commits, Git tags, pushes, GitHub releases, or npm publish",
      "full multi-agent parity, per-update user approval gate, unrelated formatting sweep, or user-owned change reversion"
    ],
    "guided": true,
    "recordDepth": "FULL",
    "createdAt": "2026-08-11T13:32:09.701Z",
    "updatedAt": "2026-08-11T14:14:50.012Z",
    "implementationPlan": [
      "RED→GREEN: specify and implement the payload, fixed page schema, source lookup/digest, stable slug/order, and traversal/source rejection through public Wiki core APIs.",
      "RED→GREEN: specify and implement generated-region rendering/parsing, human-owned preservation, conflict refusal/force, idempotent selective sync, lock concurrency, and atomic no-op behavior.",
      "RED→GREEN: specify and implement manifest status and lint for missing/superseded/stale sources, new trace/decision cursors, relevance-scored external changes, links, fixed layout, and diff noise.",
      "RED→GREEN: expose localized CLI build/status/sync/lint flows and add non-gating close advisories.",
      "RED→GREEN: extend policy initialization and sduck update migration while proving old-policy and absent-policy compatibility.",
      "Add and package the two agent skills, update managed Codex/shared rules, and prove artifact inclusion.",
      "Update English/Korean public docs and all 0.7.0 version sources, then refactor only after green tests."
    ],
    "verificationPlan": [
      "Run focused Wiki unit tests after every vertical red→green slice and focused CLI/migration tests after each public integration.",
      "Run npm run typecheck.",
      "Run npm run lint.",
      "Run npm run format:check.",
      "Run npm run test:unit.",
      "Run npm run test:e2e.",
      "Run npm run build.",
      "Run npm run package:check and inspect the packed file list for both Wiki skills.",
      "Audit git status and diffs to confirm user-owned prior changes remain intact and no tag, push, release, or publish occurred."
    ]
  },
  "questions": [],
  "evidence": [
    {
      "id": "EVD-0068",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "decisionId": "DEC-WIKI-MATERIALIZED-VIEW",
      "sourceType": "USER_ANSWER",
      "sourceRef": "approved Auto Wiki implementation brief, 2026-08-11",
      "summary": "The approved brief defines docs/wiki, five page kinds, canonical .decision backend, and materialized-view semantics.",
      "confidence": 1,
      "createdAt": "2026-08-11T13:38:09.882Z"
    },
    {
      "id": "EVD-0069",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "decisionId": "DEC-WIKI-SECTION-OWNERSHIP",
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/decision-workspace.ts",
      "summary": "DecisionWorkspace provides a shared lock, staging validation, replacement journal, rollback, and unchanged artifact elision.",
      "confidence": 1,
      "createdAt": "2026-08-11T13:38:09.882Z"
    },
    {
      "id": "EVD-0070",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "decisionId": "DEC-WIKI-EVIDENCE-LANGUAGE",
      "sourceType": "USER_ANSWER",
      "sourceRef": "approved Auto Wiki implementation brief, evidence language section",
      "summary": "The brief explicitly distinguishes intent, implementation claim, changed-file tracking, validation report, and semantic-conflict proposal.",
      "confidence": 1,
      "createdAt": "2026-08-11T13:38:09.882Z"
    },
    {
      "id": "EVD-0071",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "decisionId": "DEC-WIKI-DIRTY-STATUS",
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/relevance.ts",
      "summary": "Existing relevance scoring exposes exact path, glob, directory, symbol, graph, and weak-match reasons with deterministic thresholds.",
      "confidence": 1,
      "createdAt": "2026-08-11T13:38:09.882Z"
    },
    {
      "id": "EVD-0072",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "decisionId": "DEC-WIKI-POLICY-MIGRATION",
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/workspace.ts",
      "summary": "initDecisionWorkspace writes default policy only when no durable policy, Markdown source, or cache data already exists.",
      "confidence": 1,
      "createdAt": "2026-08-11T13:38:09.882Z"
    },
    {
      "id": "EVD-0073",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "decisionId": "DEC-WIKI-AGENT-WORKFLOW",
      "sourceType": "CODE",
      "sourceRef": "src/core/assets.ts and src/core/agent-rules.ts",
      "summary": "Bundled agent assets and generated managed rules already provide the installation seam for repository-scoped skills.",
      "confidence": 1,
      "createdAt": "2026-08-11T13:38:09.882Z"
    },
    {
      "id": "EVD-0074",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "decisionId": "DEC-WIKI-RELEASE-070",
      "sourceType": "USER_ANSWER",
      "sourceRef": "approved Auto Wiki implementation brief, version and prohibitions sections",
      "summary": "The user approved a 0.7.0 file/artifact bump and explicitly prohibited tag, push, release creation, publish, and unrelated reformatting.",
      "confidence": 1,
      "createdAt": "2026-08-11T13:38:09.882Z"
    }
  ],
  "contextItems": [
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0009",
      "summary": "Prior decision: Authorize only the 0.6 MCP control plane — This task implements 0.6a–0.6d only; it does not implement a sduck-owned coding runtime.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0903",
      "createdAt": "2026-08-11T13:32:10.327Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0010",
      "summary": "Prior decision: Keep 0.7 as an RFC boundary — Current work may define 0.7 interfaces and threat-model constraints, but runtime implementation requires a separately confirmed task after 0.6 pilot evidence.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0904",
      "createdAt": "2026-08-11T13:32:10.328Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0027",
      "summary": "Prior decision: Prove legacy parser fallback without implementing envelopes — The Phase 0 static test must prove the 0.5 parser ignores the envelope body and derives the task only from frontmatter fallback.",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0905",
      "createdAt": "2026-08-11T13:32:10.328Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0039",
      "summary": "Prior decision: Unify specification and plan in one confirmed Brief — One Brief contains problem, decisions, scope, implementation plan, and verification plan; a single confirm gate authorizes implementation.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0906",
      "createdAt": "2026-08-11T13:32:10.328Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0907",
      "createdAt": "2026-08-11T13:32:10.329Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0908",
      "createdAt": "2026-08-11T13:32:10.329Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0909",
      "createdAt": "2026-08-11T13:32:10.330Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0041",
      "summary": "Prior decision: Reduce grilling through evidence-backed carried decisions — The agent reuses prior decisions only by recording carried decision IDs and rationale. New questions are limited to conflicts, unknowns, or scope and verification changes; no fixed question quota applies.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0910",
      "createdAt": "2026-08-11T13:32:10.330Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0911",
      "createdAt": "2026-08-11T13:32:10.331Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0049",
      "summary": "Prior decision: Treat LLM handoff and Git evidence differently — The skill classifies decisions directly stated in the LLM handoff as EXPLICIT only when corroborated by the user or durable source; patch-only conclusions stay INFERRED with conservative confidence. It asks follow-up questions for unsupported rationale.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0912",
      "createdAt": "2026-08-11T13:32:10.331Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0913",
      "createdAt": "2026-08-11T13:32:10.331Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0914",
      "createdAt": "2026-08-11T13:32:10.332Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0012",
      "summary": "Prior decision: Make automatic context discovery privacy-first — Automatic discovery considers tracked regular files only; untracked paths require explicit addition, symlink escapes are rejected, and canonical records store references, hashes, and curated summaries.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0915",
      "createdAt": "2026-08-11T13:32:10.332Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0025",
      "summary": "Prior decision: What may refresh_context persist automatically in 0.6? — References and hashes only (recommended)",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0916",
      "createdAt": "2026-08-11T13:32:10.333Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0040",
      "summary": "Prior decision: Start mandatory agent-led grilling when work begins — work automatically starts a grill session and emits context-aware instructions. The agent, not a fixed CLI wizard, generates questions. A reasoned grill completion is required before Brief submission.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0917",
      "createdAt": "2026-08-11T13:32:10.334Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0918",
      "createdAt": "2026-08-11T13:32:10.334Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-RELEASE-0-6-2",
      "summary": "Decision applies to relevant file tests/e2e/sdd-cli-reachability.test.ts: Release Stage 1 as a new 0.6.2 package",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "tests/e2e/sdd-cli-reachability.test.ts"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-0919",
      "createdAt": "2026-08-11T13:32:10.334Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0920",
      "createdAt": "2026-08-11T13:32:10.335Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0921",
      "createdAt": "2026-08-11T13:32:10.335Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0922",
      "createdAt": "2026-08-11T13:32:10.335Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0923",
      "createdAt": "2026-08-11T13:32:10.336Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0924",
      "createdAt": "2026-08-11T13:32:10.336Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0925",
      "createdAt": "2026-08-11T13:32:10.336Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0926",
      "createdAt": "2026-08-11T13:32:10.336Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0927",
      "createdAt": "2026-08-11T13:32:10.337Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0928",
      "createdAt": "2026-08-11T13:32:10.337Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0929",
      "createdAt": "2026-08-11T13:32:10.338Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0930",
      "createdAt": "2026-08-11T13:32:10.338Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0931",
      "createdAt": "2026-08-11T13:32:10.339Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0932",
      "createdAt": "2026-08-11T13:32:10.339Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0933",
      "createdAt": "2026-08-11T13:32:10.339Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0934",
      "createdAt": "2026-08-11T13:32:10.339Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0935",
      "createdAt": "2026-08-11T13:32:10.340Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0936",
      "createdAt": "2026-08-11T13:32:10.340Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0937",
      "createdAt": "2026-08-11T13:32:10.340Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0938",
      "createdAt": "2026-08-11T13:32:10.340Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0939",
      "createdAt": "2026-08-11T13:32:10.340Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0940",
      "createdAt": "2026-08-11T13:32:10.340Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0941",
      "createdAt": "2026-08-11T13:32:10.340Z"
    },
    {
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
      "id": "CTX-0942",
      "createdAt": "2026-08-11T13:32:10.341Z"
    }
  ],
  "briefSnapshots": [
    {
      "id": "BRF-0022",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "snapshot": {
        "task": {
          "id": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
          "title": "Implement evidence-backed Auto Wiki core, agent assets, documentation, tests, and the 0.7.0 version bump without tag, push, or publish",
          "description": "Implement evidence-backed Auto Wiki core, agent assets, documentation, tests, and the 0.7.0 version bump without tag, push, or publish",
          "status": "CONFIRMED",
          "expectedScope": [
            "Deterministic Wiki payload/page/manifest schemas and stable five-page rendering under docs/wiki",
            "Generated-section parsing, digest verification, human-owned byte preservation, force-only conflict replacement, and atomic writes",
            "sduck wiki build --stdin, status, sync --stdin [--force], and lint with English/Korean help and messages",
            "Source ID validation and digest/status handling for tasks, decisions, evidence, traces, and evaluations",
            "Trace/relevance/lastSyncedCommit dirty detection, global recent-change cursors, external change reporting, and diff-noise lint",
            "Non-gating close advisory for enabled Wiki state",
            "New-workspace default-on Wiki policy and explicit sduck update migration for existing durable workspaces",
            "sd-build-wiki and sd-sync-wiki bundled skills, Codex rule references, Claude best-effort copies, and package inclusion tests",
            "Public-interface unit/e2e tests covering the full required matrix",
            "README, README.ko, use cases, migration, pilot metrics, command reference, quick start, and 0.7.0 release notes",
            "0.7.0 package, lockfile, bundled asset version, and version assertion updates"
          ],
          "avoidScope": [
            "Project Model or general Claim graph",
            "Project Grill database, persistent decision tree, task hierarchy, vertical-slice task manager, or comprehension digest subsystem",
            "Global user profile, vector database, embeddings, web Wiki server, or periodic LLM execution",
            "sduck-owned LLM runtime or daemon",
            "retrospective hook expansion for Wiki external-commit detection",
            "automatic Wiki commits, Git tags, pushes, GitHub releases, or npm publish",
            "full multi-agent parity, per-update user approval gate, unrelated formatting sweep, or user-owned change reversion"
          ],
          "guided": true,
          "recordDepth": "FULL",
          "createdAt": "2026-08-11T13:32:09.701Z",
          "updatedAt": "2026-08-11T13:38:20.347Z",
          "implementationPlan": [
            "RED→GREEN: specify and implement the payload, fixed page schema, source lookup/digest, stable slug/order, and traversal/source rejection through public Wiki core APIs.",
            "RED→GREEN: specify and implement generated-region rendering/parsing, human-owned preservation, conflict refusal/force, idempotent selective sync, lock concurrency, and atomic no-op behavior.",
            "RED→GREEN: specify and implement manifest status and lint for missing/superseded/stale sources, new trace/decision cursors, relevance-scored external changes, links, fixed layout, and diff noise.",
            "RED→GREEN: expose localized CLI build/status/sync/lint flows and add non-gating close advisories.",
            "RED→GREEN: extend policy initialization and sduck update migration while proving old-policy and absent-policy compatibility.",
            "Add and package the two agent skills, update managed Codex/shared rules, and prove artifact inclusion.",
            "Update English/Korean public docs and all 0.7.0 version sources, then refactor only after green tests."
          ],
          "verificationPlan": [
            "Run focused Wiki unit tests after every vertical red→green slice and focused CLI/migration tests after each public integration.",
            "Run npm run typecheck.",
            "Run npm run lint.",
            "Run npm run format:check.",
            "Run npm run test:unit.",
            "Run npm run test:e2e.",
            "Run npm run build.",
            "Run npm run package:check and inspect the packed file list for both Wiki skills.",
            "Audit git status and diffs to confirm user-owned prior changes remain intact and no tag, push, release, or publish occurred."
          ]
        },
        "decisions": {
          "EXPLICIT": [
            {
              "id": "DEC-WIKI-AGENT-WORKFLOW",
              "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
              "title": "Keep Wiki generation agent-driven and task close non-gating",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Ship sd-build-wiki and sd-sync-wiki agent skills and make managed Codex rules point to their repository paths; the active coding agent creates prose, CLI validates and records it, close reports dirty/stale Wiki state but succeeds, and sync failure leaves stale state visible.",
              "rationale": [
                "The user excludes a sduck-owned LLM runtime, daemon, persistent Project Grill engine, and automatic commits.",
                "Wiki maintenance is advisory and must not become another lifecycle gate."
              ],
              "appliesTo": [
                ".sduck/sduck-assets/agent-rules/**",
                "src/commands/v2/index.ts",
                "src/cli.ts",
                "src/core/v2/task.ts",
                "tests/e2e/**"
              ],
              "avoids": [
                "LLM runtime",
                "daemon",
                "automatic commits",
                "tag",
                "push",
                "publish"
              ],
              "sourceRefs": [],
              "createdAt": "2026-08-11T13:38:09.882Z",
              "updatedAt": "2026-08-11T13:38:20.347Z"
            },
            {
              "id": "DEC-WIKI-DIRTY-STATUS",
              "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
              "title": "Compute Wiki dirtiness only from deterministic evidence",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Status and lint compare referenced source digests, missing or superseded IDs, generated-region digests, observed decision/trace IDs, trace mappings and unmapped decisions, fixed layout, links, and lastSyncedCommit..HEAD file changes scored through existing relevance rules; new decisions or traces always dirty the global recent-changes page.",
              "rationale": [
                "These signals are deterministic and align with the user's allowed automatic-detection claims.",
                "Pages whose source and relevant evidence did not change must not be rewritten."
              ],
              "appliesTo": [
                "src/core/v2/relevance.ts",
                "src/core/v2/git-diff.ts",
                "src/core/v2/wiki*.ts",
                "tests/unit/wiki*.test.ts"
              ],
              "avoids": [
                "LLM semantic conflict presented as CLI validation",
                "retrospective hook reuse for external commit detection",
                "unrelated Wiki page changes"
              ],
              "sourceRefs": [],
              "createdAt": "2026-08-11T13:38:09.882Z",
              "updatedAt": "2026-08-11T13:38:20.347Z"
            },
            {
              "id": "DEC-WIKI-EVIDENCE-LANGUAGE",
              "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
              "title": "Keep intent, implementation claims, changes, and validation reports distinct",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Use typed explanatory blocks with block-level source IDs and visible provenance labels so decision intent, agent-submitted implementation claims, Git/trace change tracking, evaluation-string reports, and agent-proposed semantic conflicts cannot be rendered as the same evidence class.",
              "rationale": [
                "The CLI can validate IDs, trace structure, digests, markers, paths, and links but cannot prove source-code meaning or CI truth.",
                "Block-level provenance is traceable without attaching a citation to every ordinary sentence."
              ],
              "appliesTo": [
                "src/core/v2/wiki*.ts",
                ".sduck/sduck-assets/agent-rules/**",
                "README*.md"
              ],
              "avoids": [
                "claims that sduck verified code semantics",
                "claims that evaluation strings are executable CI evidence",
                "general claim graph"
              ],
              "sourceRefs": [],
              "createdAt": "2026-08-11T13:38:09.882Z",
              "updatedAt": "2026-08-11T13:38:20.347Z"
            },
            {
              "id": "DEC-WIKI-MATERIALIZED-VIEW",
              "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
              "title": "Make a fixed Markdown Wiki the human-facing materialized view",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Store a Git-tracked Wiki under docs/wiki with deterministic Overview, Glossary, Capabilities, Architecture & Flows, and Decisions & Recent Changes pages; keep .decision exports canonical and record page source IDs, source digests, sync commits, and observation cursors in a manifest.",
              "rationale": [
                "The user explicitly separates the human reading surface from the canonical decision backend.",
                "Fixed slugs and section order make output stable and lintable while a manifest carries mutable sync metadata without rewriting human-owned page text."
              ],
              "appliesTo": [
                "src/core/v2/wiki*.ts",
                "docs/wiki/**",
                "src/types/index.ts"
              ],
              "avoids": [
                "canonicalizing docs/wiki as a second source of truth",
                "web wiki server"
              ],
              "sourceRefs": [],
              "createdAt": "2026-08-11T13:38:09.882Z",
              "updatedAt": "2026-08-11T13:38:20.347Z"
            },
            {
              "id": "DEC-WIKI-POLICY-MIGRATION",
              "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
              "title": "Default Wiki on only for new workspaces and migrate durable workspaces explicitly",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Newly initialized workspaces receive enabled Wiki policy; existing durable workspaces with an old or absent policy remain Wiki-disabled until sduck update migrates them while preserving workflow settings, and unrelated commands never create docs/wiki implicitly.",
              "rationale": [
                "The current initializer intentionally does not backfill policy when durable sources or cache rows already exist.",
                "An explicit update migration preserves backward compatibility and avoids surprise files."
              ],
              "appliesTo": [
                "src/core/v2/policy.ts",
                "src/core/v2/workspace.ts",
                "src/core/update.ts",
                "src/commands/update.ts",
                "tests/unit/v2-lifecycle.test.ts"
              ],
              "avoids": [
                "manual policy editing",
                "implicit Wiki file creation in legacy projects"
              ],
              "sourceRefs": [],
              "createdAt": "2026-08-11T13:38:09.882Z",
              "updatedAt": "2026-08-11T13:38:20.347Z"
            },
            {
              "id": "DEC-WIKI-RELEASE-070",
              "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
              "title": "Expose Auto Wiki as the 0.7.0 public surface without releasing it",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Update package and bundled-asset versions, version assertions, English and Korean documentation, command reference, migration and pilot guidance to 0.7.0; validate the packed artifact but do not tag, push, create a release, or publish.",
              "rationale": [
                "Auto Wiki is a new public product surface and therefore warrants the approved minor version bump.",
                "The approved boundary ends at files and package verification."
              ],
              "appliesTo": [
                "package.json",
                "package-lock.json",
                ".sduck/sduck-assets/.sduck-version",
                "tests/**",
                "README.md",
                "README.ko.md",
                "docs/**"
              ],
              "avoids": [
                "CHANGELOG.md without demonstrated need",
                "git tag",
                "git push",
                "GitHub release",
                "npm publish"
              ],
              "sourceRefs": [],
              "createdAt": "2026-08-11T13:38:09.882Z",
              "updatedAt": "2026-08-11T13:38:20.347Z"
            },
            {
              "id": "DEC-WIKI-SECTION-OWNERSHIP",
              "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
              "title": "Protect human edits with generated-section ownership",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Build creates digest-marked generated regions and a human-owned Team Notes area; sync replaces only valid generated regions, preserves every byte outside them, rejects edited generated content unless --force is explicit, and applies all page and manifest changes atomically under the shared workspace lock.",
              "rationale": [
                "The user requires zero automatic loss of human-authored content.",
                "DecisionWorkspace already provides shared locking, staging, full validation, rollback, and unchanged-artifact elision."
              ],
              "appliesTo": [
                "src/core/v2/decision-workspace.ts",
                "src/core/v2/wiki*.ts",
                "tests/unit/wiki*.test.ts"
              ],
              "avoids": [
                "whole-page overwrite during normal sync",
                "manual state or cache edits"
              ],
              "sourceRefs": [],
              "createdAt": "2026-08-11T13:38:09.882Z",
              "updatedAt": "2026-08-11T13:38:20.347Z"
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
            "id": "EVD-0068",
            "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
            "decisionId": "DEC-WIKI-MATERIALIZED-VIEW",
            "sourceType": "USER_ANSWER",
            "sourceRef": "approved Auto Wiki implementation brief, 2026-08-11",
            "summary": "The approved brief defines docs/wiki, five page kinds, canonical .decision backend, and materialized-view semantics.",
            "confidence": 1,
            "createdAt": "2026-08-11T13:38:09.882Z"
          },
          {
            "id": "EVD-0069",
            "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
            "decisionId": "DEC-WIKI-SECTION-OWNERSHIP",
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/decision-workspace.ts",
            "summary": "DecisionWorkspace provides a shared lock, staging validation, replacement journal, rollback, and unchanged artifact elision.",
            "confidence": 1,
            "createdAt": "2026-08-11T13:38:09.882Z"
          },
          {
            "id": "EVD-0070",
            "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
            "decisionId": "DEC-WIKI-EVIDENCE-LANGUAGE",
            "sourceType": "USER_ANSWER",
            "sourceRef": "approved Auto Wiki implementation brief, evidence language section",
            "summary": "The brief explicitly distinguishes intent, implementation claim, changed-file tracking, validation report, and semantic-conflict proposal.",
            "confidence": 1,
            "createdAt": "2026-08-11T13:38:09.882Z"
          },
          {
            "id": "EVD-0071",
            "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
            "decisionId": "DEC-WIKI-DIRTY-STATUS",
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/relevance.ts",
            "summary": "Existing relevance scoring exposes exact path, glob, directory, symbol, graph, and weak-match reasons with deterministic thresholds.",
            "confidence": 1,
            "createdAt": "2026-08-11T13:38:09.882Z"
          },
          {
            "id": "EVD-0072",
            "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
            "decisionId": "DEC-WIKI-POLICY-MIGRATION",
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/workspace.ts",
            "summary": "initDecisionWorkspace writes default policy only when no durable policy, Markdown source, or cache data already exists.",
            "confidence": 1,
            "createdAt": "2026-08-11T13:38:09.882Z"
          },
          {
            "id": "EVD-0073",
            "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
            "decisionId": "DEC-WIKI-AGENT-WORKFLOW",
            "sourceType": "CODE",
            "sourceRef": "src/core/assets.ts and src/core/agent-rules.ts",
            "summary": "Bundled agent assets and generated managed rules already provide the installation seam for repository-scoped skills.",
            "confidence": 1,
            "createdAt": "2026-08-11T13:38:09.882Z"
          },
          {
            "id": "EVD-0074",
            "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
            "decisionId": "DEC-WIKI-RELEASE-070",
            "sourceType": "USER_ANSWER",
            "sourceRef": "approved Auto Wiki implementation brief, version and prohibitions sections",
            "summary": "The user approved a 0.7.0 file/artifact bump and explicitly prohibited tag, push, release creation, publish, and unrelated reformatting.",
            "confidence": 1,
            "createdAt": "2026-08-11T13:38:09.882Z"
          }
        ],
        "expectedScope": [
          "Deterministic Wiki payload/page/manifest schemas and stable five-page rendering under docs/wiki",
          "Generated-section parsing, digest verification, human-owned byte preservation, force-only conflict replacement, and atomic writes",
          "sduck wiki build --stdin, status, sync --stdin [--force], and lint with English/Korean help and messages",
          "Source ID validation and digest/status handling for tasks, decisions, evidence, traces, and evaluations",
          "Trace/relevance/lastSyncedCommit dirty detection, global recent-change cursors, external change reporting, and diff-noise lint",
          "Non-gating close advisory for enabled Wiki state",
          "New-workspace default-on Wiki policy and explicit sduck update migration for existing durable workspaces",
          "sd-build-wiki and sd-sync-wiki bundled skills, Codex rule references, Claude best-effort copies, and package inclusion tests",
          "Public-interface unit/e2e tests covering the full required matrix",
          "README, README.ko, use cases, migration, pilot metrics, command reference, quick start, and 0.7.0 release notes",
          "0.7.0 package, lockfile, bundled asset version, and version assertion updates"
        ],
        "avoidScope": [
          "Project Model or general Claim graph",
          "Project Grill database, persistent decision tree, task hierarchy, vertical-slice task manager, or comprehension digest subsystem",
          "Global user profile, vector database, embeddings, web Wiki server, or periodic LLM execution",
          "sduck-owned LLM runtime or daemon",
          "retrospective hook expansion for Wiki external-commit detection",
          "automatic Wiki commits, Git tags, pushes, GitHub releases, or npm publish",
          "full multi-agent parity, per-update user approval gate, unrelated formatting sweep, or user-owned change reversion"
        ],
        "implementationPlan": [
          "RED→GREEN: specify and implement the payload, fixed page schema, source lookup/digest, stable slug/order, and traversal/source rejection through public Wiki core APIs.",
          "RED→GREEN: specify and implement generated-region rendering/parsing, human-owned preservation, conflict refusal/force, idempotent selective sync, lock concurrency, and atomic no-op behavior.",
          "RED→GREEN: specify and implement manifest status and lint for missing/superseded/stale sources, new trace/decision cursors, relevance-scored external changes, links, fixed layout, and diff noise.",
          "RED→GREEN: expose localized CLI build/status/sync/lint flows and add non-gating close advisories.",
          "RED→GREEN: extend policy initialization and sduck update migration while proving old-policy and absent-policy compatibility.",
          "Add and package the two agent skills, update managed Codex/shared rules, and prove artifact inclusion.",
          "Update English/Korean public docs and all 0.7.0 version sources, then refactor only after green tests."
        ],
        "verificationPlan": [
          "Run focused Wiki unit tests after every vertical red→green slice and focused CLI/migration tests after each public integration.",
          "Run npm run typecheck.",
          "Run npm run lint.",
          "Run npm run format:check.",
          "Run npm run test:unit.",
          "Run npm run test:e2e.",
          "Run npm run build.",
          "Run npm run package:check and inspect the packed file list for both Wiki skills.",
          "Audit git status and diffs to confirm user-owned prior changes remain intact and no tag, push, release, or publish occurred."
        ],
        "openQuestionCount": 0
      },
      "renderedMarkdown": "────────────────────────────────────────\nImplementation Brief\n────────────────────────────────────────\nTask: TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a\nImplement evidence-backed Auto Wiki core, agent assets, documentation, tests, and the 0.7.0 version bump without tag, push, or publish\n\nA. Explicit decisions\n[EXPLICIT] DEC-WIKI-AGENT-WORKFLOW. Keep Wiki generation agent-driven and task close non-gating\nConfidence: 1.00\nSummary: Ship sd-build-wiki and sd-sync-wiki agent skills and make managed Codex rules point to their repository paths; the active coding agent creates prose, CLI validates and records it, close reports dirty/stale Wiki state but succeeds, and sync failure leaves stale state visible.\nRationale:\n  - The user excludes a sduck-owned LLM runtime, daemon, persistent Project Grill engine, and automatic commits.\n  - Wiki maintenance is advisory and must not become another lifecycle gate.\nApplies to:\n  - .sduck/sduck-assets/agent-rules/**\n  - src/commands/v2/index.ts\n  - src/cli.ts\n  - src/core/v2/task.ts\n  - tests/e2e/**\nAvoids:\n  - LLM runtime\n  - daemon\n  - automatic commits\n  - tag\n  - push\n  - publish\n\n[EXPLICIT] DEC-WIKI-DIRTY-STATUS. Compute Wiki dirtiness only from deterministic evidence\nConfidence: 1.00\nSummary: Status and lint compare referenced source digests, missing or superseded IDs, generated-region digests, observed decision/trace IDs, trace mappings and unmapped decisions, fixed layout, links, and lastSyncedCommit..HEAD file changes scored through existing relevance rules; new decisions or traces always dirty the global recent-changes page.\nRationale:\n  - These signals are deterministic and align with the user's allowed automatic-detection claims.\n  - Pages whose source and relevant evidence did not change must not be rewritten.\nApplies to:\n  - src/core/v2/relevance.ts\n  - src/core/v2/git-diff.ts\n  - src/core/v2/wiki*.ts\n  - tests/unit/wiki*.test.ts\nAvoids:\n  - LLM semantic conflict presented as CLI validation\n  - retrospective hook reuse for external commit detection\n  - unrelated Wiki page changes\n\n[EXPLICIT] DEC-WIKI-EVIDENCE-LANGUAGE. Keep intent, implementation claims, changes, and validation reports distinct\nConfidence: 1.00\nSummary: Use typed explanatory blocks with block-level source IDs and visible provenance labels so decision intent, agent-submitted implementation claims, Git/trace change tracking, evaluation-string reports, and agent-proposed semantic conflicts cannot be rendered as the same evidence class.\nRationale:\n  - The CLI can validate IDs, trace structure, digests, markers, paths, and links but cannot prove source-code meaning or CI truth.\n  - Block-level provenance is traceable without attaching a citation to every ordinary sentence.\nApplies to:\n  - src/core/v2/wiki*.ts\n  - .sduck/sduck-assets/agent-rules/**\n  - README*.md\nAvoids:\n  - claims that sduck verified code semantics\n  - claims that evaluation strings are executable CI evidence\n  - general claim graph\n\n[EXPLICIT] DEC-WIKI-MATERIALIZED-VIEW. Make a fixed Markdown Wiki the human-facing materialized view\nConfidence: 1.00\nSummary: Store a Git-tracked Wiki under docs/wiki with deterministic Overview, Glossary, Capabilities, Architecture & Flows, and Decisions & Recent Changes pages; keep .decision exports canonical and record page source IDs, source digests, sync commits, and observation cursors in a manifest.\nRationale:\n  - The user explicitly separates the human reading surface from the canonical decision backend.\n  - Fixed slugs and section order make output stable and lintable while a manifest carries mutable sync metadata without rewriting human-owned page text.\nApplies to:\n  - src/core/v2/wiki*.ts\n  - docs/wiki/**\n  - src/types/index.ts\nAvoids:\n  - canonicalizing docs/wiki as a second source of truth\n  - web wiki server\n\n[EXPLICIT] DEC-WIKI-POLICY-MIGRATION. Default Wiki on only for new workspaces and migrate durable workspaces explicitly\nConfidence: 1.00\nSummary: Newly initialized workspaces receive enabled Wiki policy; existing durable workspaces with an old or absent policy remain Wiki-disabled until sduck update migrates them while preserving workflow settings, and unrelated commands never create docs/wiki implicitly.\nRationale:\n  - The current initializer intentionally does not backfill policy when durable sources or cache rows already exist.\n  - An explicit update migration preserves backward compatibility and avoids surprise files.\nApplies to:\n  - src/core/v2/policy.ts\n  - src/core/v2/workspace.ts\n  - src/core/update.ts\n  - src/commands/update.ts\n  - tests/unit/v2-lifecycle.test.ts\nAvoids:\n  - manual policy editing\n  - implicit Wiki file creation in legacy projects\n\n[EXPLICIT] DEC-WIKI-RELEASE-070. Expose Auto Wiki as the 0.7.0 public surface without releasing it\nConfidence: 1.00\nSummary: Update package and bundled-asset versions, version assertions, English and Korean documentation, command reference, migration and pilot guidance to 0.7.0; validate the packed artifact but do not tag, push, create a release, or publish.\nRationale:\n  - Auto Wiki is a new public product surface and therefore warrants the approved minor version bump.\n  - The approved boundary ends at files and package verification.\nApplies to:\n  - package.json\n  - package-lock.json\n  - .sduck/sduck-assets/.sduck-version\n  - tests/**\n  - README.md\n  - README.ko.md\n  - docs/**\nAvoids:\n  - CHANGELOG.md without demonstrated need\n  - git tag\n  - git push\n  - GitHub release\n  - npm publish\n\n[EXPLICIT] DEC-WIKI-SECTION-OWNERSHIP. Protect human edits with generated-section ownership\nConfidence: 1.00\nSummary: Build creates digest-marked generated regions and a human-owned Team Notes area; sync replaces only valid generated regions, preserves every byte outside them, rejects edited generated content unless --force is explicit, and applies all page and manifest changes atomically under the shared workspace lock.\nRationale:\n  - The user requires zero automatic loss of human-authored content.\n  - DecisionWorkspace already provides shared locking, staging, full validation, rollback, and unchanged-artifact elision.\nApplies to:\n  - src/core/v2/decision-workspace.ts\n  - src/core/v2/wiki*.ts\n  - tests/unit/wiki*.test.ts\nAvoids:\n  - whole-page overwrite during normal sync\n  - manual state or cache edits\n\nB. Inferred decisions\n  - none\n\nC. Carried decisions\n  - none\n\nD. Conflicts\n  - none\n\nE. Open decisions\n  - none\n\nProblem:\n  Implement evidence-backed Auto Wiki core, agent assets, documentation, tests, and the 0.7.0 version bump without tag, push, or publish\nImplementation plan:\n  - RED→GREEN: specify and implement the payload, fixed page schema, source lookup/digest, stable slug/order, and traversal/source rejection through public Wiki core APIs.\n  - RED→GREEN: specify and implement generated-region rendering/parsing, human-owned preservation, conflict refusal/force, idempotent selective sync, lock concurrency, and atomic no-op behavior.\n  - RED→GREEN: specify and implement manifest status and lint for missing/superseded/stale sources, new trace/decision cursors, relevance-scored external changes, links, fixed layout, and diff noise.\n  - RED→GREEN: expose localized CLI build/status/sync/lint flows and add non-gating close advisories.\n  - RED→GREEN: extend policy initialization and sduck update migration while proving old-policy and absent-policy compatibility.\n  - Add and package the two agent skills, update managed Codex/shared rules, and prove artifact inclusion.\n  - Update English/Korean public docs and all 0.7.0 version sources, then refactor only after green tests.\nVerification plan:\n  - Run focused Wiki unit tests after every vertical red→green slice and focused CLI/migration tests after each public integration.\n  - Run npm run typecheck.\n  - Run npm run lint.\n  - Run npm run format:check.\n  - Run npm run test:unit.\n  - Run npm run test:e2e.\n  - Run npm run build.\n  - Run npm run package:check and inspect the packed file list for both Wiki skills.\n  - Audit git status and diffs to confirm user-owned prior changes remain intact and no tag, push, release, or publish occurred.\nScope expected:\n  - Deterministic Wiki payload/page/manifest schemas and stable five-page rendering under docs/wiki\n  - Generated-section parsing, digest verification, human-owned byte preservation, force-only conflict replacement, and atomic writes\n  - sduck wiki build --stdin, status, sync --stdin [--force], and lint with English/Korean help and messages\n  - Source ID validation and digest/status handling for tasks, decisions, evidence, traces, and evaluations\n  - Trace/relevance/lastSyncedCommit dirty detection, global recent-change cursors, external change reporting, and diff-noise lint\n  - Non-gating close advisory for enabled Wiki state\n  - New-workspace default-on Wiki policy and explicit sduck update migration for existing durable workspaces\n  - sd-build-wiki and sd-sync-wiki bundled skills, Codex rule references, Claude best-effort copies, and package inclusion tests\n  - Public-interface unit/e2e tests covering the full required matrix\n  - README, README.ko, use cases, migration, pilot metrics, command reference, quick start, and 0.7.0 release notes\n  - 0.7.0 package, lockfile, bundled asset version, and version assertion updates\nScope avoided:\n  - Project Model or general Claim graph\n  - Project Grill database, persistent decision tree, task hierarchy, vertical-slice task manager, or comprehension digest subsystem\n  - Global user profile, vector database, embeddings, web Wiki server, or periodic LLM execution\n  - sduck-owned LLM runtime or daemon\n  - retrospective hook expansion for Wiki external-commit detection\n  - automatic Wiki commits, Git tags, pushes, GitHub releases, or npm publish\n  - full multi-agent parity, per-update user approval gate, unrelated formatting sweep, or user-owned change reversion\nOpen questions: 0\nEvidence:\n  - [USER_ANSWER] approved Auto Wiki implementation brief, 2026-08-11 (1): The approved brief defines docs/wiki, five page kinds, canonical .decision backend, and materialized-view semantics.\n  - [CODE] src/core/v2/decision-workspace.ts (1): DecisionWorkspace provides a shared lock, staging validation, replacement journal, rollback, and unchanged artifact elision.\n  - [USER_ANSWER] approved Auto Wiki implementation brief, evidence language section (1): The brief explicitly distinguishes intent, implementation claim, changed-file tracking, validation report, and semantic-conflict proposal.\n  - [CODE] src/core/v2/relevance.ts (1): Existing relevance scoring exposes exact path, glob, directory, symbol, graph, and weak-match reasons with deterministic thresholds.\n  - [CODE] src/core/v2/workspace.ts (1): initDecisionWorkspace writes default policy only when no durable policy, Markdown source, or cache data already exists.\n  - [CODE] src/core/assets.ts and src/core/agent-rules.ts (1): Bundled agent assets and generated managed rules already provide the installation seam for repository-scoped skills.\n  - [USER_ANSWER] approved Auto Wiki implementation brief, version and prohibitions sections (1): The user approved a 0.7.0 file/artifact bump and explicitly prohibited tag, push, release creation, publish, and unrelated reformatting.\n────────────────────────────────────────",
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
          ".omc/state/sessions/21700872-d3ec-4974-b033-67d97c77ad59/subagent-tracking-state.json": "a3de0ed4d1b577c3c662baaad15234defb9adc15be9a28aa82f75ba4aece69cc"
        }
      },
      "createdAt": "2026-08-11T13:38:20.401Z"
    }
  ],
  "evaluations": [
    {
      "id": "EVAL-0008",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "traceId": "IMPL-0025",
      "checks": [
        {
          "name": "npm run typecheck",
          "outcome": "passed"
        },
        {
          "name": "npm run lint",
          "outcome": "passed"
        },
        {
          "name": "npm run format:check",
          "outcome": "passed"
        },
        {
          "name": "npm run test:unit",
          "outcome": "passed (147 tests)"
        },
        {
          "name": "npm run test:e2e",
          "outcome": "passed (31 tests)"
        },
        {
          "name": "npm run build",
          "outcome": "passed"
        },
        {
          "name": "npm run package:check",
          "outcome": "passed (0.7.0, 29 files, both Wiki skills included)"
        },
        {
          "name": "built CLI smoke",
          "outcome": "passed (0.7.0 and wiki help)"
        },
        {
          "name": "release-state audit",
          "outcome": "passed (no new tag, push, release, or publish performed)"
        }
      ],
      "limitations": [
        "skill-creator quick_validate.py could not run because PyYAML is unavailable; equivalent allowed-key, name, and description validation passed with the project's js-yaml dependency."
      ],
      "createdAt": "2026-08-11T14:14:35.146Z"
    }
  ],
  "events": [
    {
      "id": "EVT-0348",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "type": "TASK_CREATED",
      "payload": {
        "description": "Implement evidence-backed Auto Wiki core, agent assets, documentation, tests, and the 0.7.0 version bump without tag, push, or publish",
        "policy": {
          "grillMeRequired": false
        }
      },
      "createdAt": "2026-08-11T13:32:09.701Z"
    },
    {
      "id": "EVT-0349",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "type": "GRILL_STARTED",
      "payload": {
        "automatic": true
      },
      "createdAt": "2026-08-11T13:32:09.701Z"
    },
    {
      "id": "EVT-0350",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "type": "CONTEXT_INDEXED",
      "payload": {
        "itemCount": 40
      },
      "createdAt": "2026-08-11T13:32:10.341Z"
    },
    {
      "id": "EVT-0351",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "type": "GRILL_COMPLETED",
      "payload": {
        "reason": "The user supplied and approved the complete first-release scope, exclusions, evidence language, test matrix, migration behavior, and release boundary. Repository inspection confirmed reusable DecisionWorkspace locking/atomic staging, source bundle IDs, trace/evaluation records, relevance scoring, policy initialization, update migration, localization, and bundled asset seams; no unresolved product choice remains.",
        "carried": []
      },
      "createdAt": "2026-08-11T13:37:12.422Z"
    },
    {
      "id": "EVT-0352",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-WIKI-MATERIALIZED-VIEW"
      },
      "createdAt": "2026-08-11T13:38:09.882Z"
    },
    {
      "id": "EVT-0353",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-WIKI-SECTION-OWNERSHIP"
      },
      "createdAt": "2026-08-11T13:38:09.883Z"
    },
    {
      "id": "EVT-0354",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-WIKI-EVIDENCE-LANGUAGE"
      },
      "createdAt": "2026-08-11T13:38:09.883Z"
    },
    {
      "id": "EVT-0355",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-WIKI-DIRTY-STATUS"
      },
      "createdAt": "2026-08-11T13:38:09.883Z"
    },
    {
      "id": "EVT-0356",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-WIKI-POLICY-MIGRATION"
      },
      "createdAt": "2026-08-11T13:38:09.883Z"
    },
    {
      "id": "EVT-0357",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-WIKI-AGENT-WORKFLOW"
      },
      "createdAt": "2026-08-11T13:38:09.883Z"
    },
    {
      "id": "EVT-0358",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-WIKI-RELEASE-070"
      },
      "createdAt": "2026-08-11T13:38:09.883Z"
    },
    {
      "id": "EVT-0359",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 7,
        "questions": 0,
        "evidence": 7,
        "expectedScope": [
          "Deterministic Wiki payload/page/manifest schemas and stable five-page rendering under docs/wiki",
          "Generated-section parsing, digest verification, human-owned byte preservation, force-only conflict replacement, and atomic writes",
          "sduck wiki build --stdin, status, sync --stdin [--force], and lint with English/Korean help and messages",
          "Source ID validation and digest/status handling for tasks, decisions, evidence, traces, and evaluations",
          "Trace/relevance/lastSyncedCommit dirty detection, global recent-change cursors, external change reporting, and diff-noise lint",
          "Non-gating close advisory for enabled Wiki state",
          "New-workspace default-on Wiki policy and explicit sduck update migration for existing durable workspaces",
          "sd-build-wiki and sd-sync-wiki bundled skills, Codex rule references, Claude best-effort copies, and package inclusion tests",
          "Public-interface unit/e2e tests covering the full required matrix",
          "README, README.ko, use cases, migration, pilot metrics, command reference, quick start, and 0.7.0 release notes",
          "0.7.0 package, lockfile, bundled asset version, and version assertion updates"
        ],
        "avoidScope": [
          "Project Model or general Claim graph",
          "Project Grill database, persistent decision tree, task hierarchy, vertical-slice task manager, or comprehension digest subsystem",
          "Global user profile, vector database, embeddings, web Wiki server, or periodic LLM execution",
          "sduck-owned LLM runtime or daemon",
          "retrospective hook expansion for Wiki external-commit detection",
          "automatic Wiki commits, Git tags, pushes, GitHub releases, or npm publish",
          "full multi-agent parity, per-update user approval gate, unrelated formatting sweep, or user-owned change reversion"
        ],
        "implementationPlan": [
          "RED→GREEN: specify and implement the payload, fixed page schema, source lookup/digest, stable slug/order, and traversal/source rejection through public Wiki core APIs.",
          "RED→GREEN: specify and implement generated-region rendering/parsing, human-owned preservation, conflict refusal/force, idempotent selective sync, lock concurrency, and atomic no-op behavior.",
          "RED→GREEN: specify and implement manifest status and lint for missing/superseded/stale sources, new trace/decision cursors, relevance-scored external changes, links, fixed layout, and diff noise.",
          "RED→GREEN: expose localized CLI build/status/sync/lint flows and add non-gating close advisories.",
          "RED→GREEN: extend policy initialization and sduck update migration while proving old-policy and absent-policy compatibility.",
          "Add and package the two agent skills, update managed Codex/shared rules, and prove artifact inclusion.",
          "Update English/Korean public docs and all 0.7.0 version sources, then refactor only after green tests."
        ],
        "verificationPlan": [
          "Run focused Wiki unit tests after every vertical red→green slice and focused CLI/migration tests after each public integration.",
          "Run npm run typecheck.",
          "Run npm run lint.",
          "Run npm run format:check.",
          "Run npm run test:unit.",
          "Run npm run test:e2e.",
          "Run npm run build.",
          "Run npm run package:check and inspect the packed file list for both Wiki skills.",
          "Audit git status and diffs to confirm user-owned prior changes remain intact and no tag, push, release, or publish occurred."
        ]
      },
      "createdAt": "2026-08-11T13:38:09.883Z"
    },
    {
      "id": "EVT-0360",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "type": "BRIEF_CONFIRMED",
      "payload": {
        "snapshotId": "BRF-0022"
      },
      "createdAt": "2026-08-11T13:38:20.401Z"
    },
    {
      "id": "EVT-0361",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "type": "TRACE_CREATED",
      "payload": {
        "traceId": "IMPL-0025",
        "filesChanged": [
          ".prettierignore",
          "AGENTS.md",
          "CLAUDE.md",
          "README.ko.md",
          "README.md",
          "docs/migration.md",
          "docs/pilot-evaluation.md",
          "docs/release-0.7.0.md",
          "docs/use-cases.md",
          "package-lock.json",
          "package.json",
          "src/cli.ts",
          "src/commands/v2/index.ts",
          "src/core/assets.ts",
          "src/core/init.ts",
          "src/core/update.ts",
          "src/core/v2/policy.ts",
          "src/core/v2/wiki.ts",
          "tests/e2e/sdd-cli-reachability.test.ts",
          "tests/e2e/v2-cli.test.ts",
          "tests/e2e/wiki-cli.test.ts",
          "tests/unit/sdd-core-regression.test.ts",
          "tests/unit/wiki-assets.test.ts",
          "tests/unit/wiki.test.ts"
        ]
      },
      "createdAt": "2026-08-11T14:14:17.301Z"
    },
    {
      "id": "EVT-0362",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "type": "EVALUATION_RECORDED",
      "payload": {
        "evaluationId": "EVAL-0008",
        "traceId": "IMPL-0025"
      },
      "createdAt": "2026-08-11T14:14:35.147Z"
    },
    {
      "id": "EVT-0363",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
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
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/DECISION_REPORT.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/decision-graph.json"
        ]
      },
      "createdAt": "2026-08-11T14:14:40.055Z"
    },
    {
      "id": "EVT-0364",
      "taskId": "TASK-20260811-implement-evidence-backed-auto-wiki-core-agent-a",
      "type": "TASK_CLOSED",
      "payload": {},
      "createdAt": "2026-08-11T14:14:50.013Z"
    }
  ]
}
```
