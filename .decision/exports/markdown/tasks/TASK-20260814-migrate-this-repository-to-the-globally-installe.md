---
id: TASK-20260814-migrate-this-repository-to-the-globally-installe
type: task
status: BRIEF_READY
title: Migrate this repository to the globally installed sduck CLI 0.7.0 workspace assets and policy
record_depth: FULL
created_at: '2026-08-14T08:13:13.091Z'
updated_at: '2026-08-14T08:14:45.780Z'
---
# TASK-20260814-migrate-this-repository-to-the-globally-installe: Migrate this repository to the globally installed sduck CLI 0.7.0 workspace assets and policy

Migrate this repository to the globally installed sduck CLI 0.7.0 workspace assets and policy

## Sduck source

```json sduck-source
{
  "task": {
    "id": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
    "title": "Migrate this repository to the globally installed sduck CLI 0.7.0 workspace assets and policy",
    "description": "Migrate this repository to the globally installed sduck CLI 0.7.0 workspace assets and policy",
    "status": "BRIEF_READY",
    "expectedScope": [
      "Verify the global and repository-managed sduck versions are 0.7.0 and the decision workspace is healthy",
      "Run sduck update through the CLI-only migration path",
      "Create .decision/policy.json with legacy-compatible workflow/grill settings and the enabled docs/wiki policy",
      "Preserve all canonical task, decision, trace, evaluation, and memory records",
      "Run sduck rebuild, doctor, update dry-run, Wiki status, and Git diff checks after migration",
      "Record the migration lifecycle, commit only the policy and canonical migration records, and push main after validation"
    ],
    "avoidScope": [
      "Hand-editing decision state, cache, or policy files",
      "Creating or force-syncing docs/wiki during this migration",
      "Changing application source, package metadata, dependencies, or release tags",
      "Backfilling historical memory capsules",
      "Committing .omc or ignored local/generated state",
      "Force pushes, tag replacement, npm publishing, or GitHub Release creation"
    ],
    "guided": true,
    "recordDepth": "FULL",
    "createdAt": "2026-08-14T08:13:13.091Z",
    "updatedAt": "2026-08-14T08:14:45.780Z",
    "implementationPlan": [
      "Run sduck update once from the repository root so the installed 0.7.0 CLI performs the atomic policy migration and safe hook check.",
      "Inspect the generated policy and verify no source or existing canonical-history files were unexpectedly rewritten.",
      "Run rebuild and post-migration health/status checks, then record trace, evaluation, memory, recall, and close before one scoped commit and main push."
    ],
    "verificationPlan": [
      "sduck --version and npm list --global @sduck/sduck-cli --depth=0 report 0.7.0",
      "sduck doctor reports a healthy decision workspace before and after migration",
      "sduck update --dry-run reports the migration pending before implementation and already up to date afterward",
      ".decision/policy.json preserves legacy-compatible requireGrillMe/workflowEnabled values and enables wiki at docs/wiki",
      "sduck rebuild succeeds and sduck wiki status reports the enabled policy without creating docs/wiki",
      "git diff --check and changed-file review show only the policy and canonical migration records",
      "Commit hooks and matching GitHub Actions CI pass before handoff"
    ]
  },
  "questions": [],
  "evidence": [
    {
      "id": "EVD-MIGRATE-070-USER",
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "decisionId": "DEC-MIGRATE-070-CLI-POLICY",
      "sourceType": "USER_ANSWER",
      "sourceRef": "Current conversation, 2026-08-14",
      "summary": "The user requested installing the new sduck globally and converting this repository to it.",
      "confidence": 0.7,
      "createdAt": "2026-08-14T08:14:45.780Z"
    },
    {
      "id": "EVD-MIGRATE-070-UPDATE",
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "decisionId": "DEC-MIGRATE-070-CLI-POLICY",
      "sourceType": "CODE",
      "sourceRef": "src/core/update.ts",
      "summary": "At matching CLI and asset version, update installs a safe hook if possible and atomically migrates only the missing Wiki policy.",
      "confidence": 0.7,
      "createdAt": "2026-08-14T08:14:45.780Z"
    },
    {
      "id": "EVD-MIGRATE-070-POLICY",
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "decisionId": "DEC-MIGRATE-070-CLI-POLICY",
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/policy.ts",
      "summary": "A workspace without policy receives legacy-compatible requireGrillMe false and workflowEnabled true plus enabled docs/wiki policy.",
      "confidence": 0.7,
      "createdAt": "2026-08-14T08:14:45.780Z"
    },
    {
      "id": "EVD-MIGRATE-070-DOCS",
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "decisionId": "DEC-MIGRATE-070-CLI-POLICY",
      "sourceType": "DECISION_DOC",
      "sourceRef": "docs/migration.md",
      "summary": "The documented 0.7.0 migration uses sduck update, preserves canonical records, and does not create docs/wiki automatically.",
      "confidence": 0.7,
      "createdAt": "2026-08-14T08:14:45.780Z"
    }
  ],
  "contextItems": [
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-RELEASE-0-7-0-CONTENTS",
      "summary": "Decision applies to relevant file AGENTS.md: Commit the completed release payload and canonical records",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "AGENTS.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1071",
      "createdAt": "2026-08-14T08:13:13.469Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "sourceType": "MEMORY",
      "sourceRef": "MEM-0003",
      "summary": "Memory capsule: sduck CLI 0.7.0 release — Released @sduck/sduck-cli 0.7.0 through origin/main, the annotated v0.7.0 tag, and npm latest after local package validation and a fully green GitHub Actions run.",
      "metadata": {
        "type": "memory_capsule",
        "sourceTaskId": "TASK-20260814-release-push-and-publish-the-latest-sduck-cli-ve",
        "topics": [
          "sduck-0.7.0",
          "release",
          "npm",
          "git-tag",
          "ci"
        ],
        "reason": "matched by recall result",
        "score": 1
      },
      "id": "CTX-1072",
      "createdAt": "2026-08-14T08:13:13.469Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "sourceType": "MEMORY",
      "sourceRef": "MEM-0002",
      "summary": "Memory capsule: Memory Capsule retrieval and recovery hardening — Memory retrieval now folds only capsule-cited raw records, stale or orphaned capsules cannot block canonical work, canonical Markdown round-trips embedded source-fence prose, automatic context reflects current candidates, and backfill, digest, search, and Korean presentation contracts are explicit and portable.",
      "metadata": {
        "type": "memory_capsule",
        "sourceTaskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
        "topics": [
          "memory-capsules",
          "recall",
          "doctor-repair",
          "canonical-markdown",
          "context-refresh",
          "localization"
        ],
        "reason": "matched by recall result",
        "score": 1
      },
      "id": "CTX-1073",
      "createdAt": "2026-08-14T08:13:13.470Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "sourceType": "MEMORY",
      "sourceRef": "MEM-0001",
      "summary": "Memory capsule: Source-backed bounded memory — Store one stable, provenance-checked Memory Capsule per task; prefer capsules during retrieval; and keep automatically discovered context idempotent and bounded while preserving raw canonical records.",
      "metadata": {
        "type": "memory_capsule",
        "sourceTaskId": "TASK-20260811-add-source-backed-memory-capsules-and-persistent",
        "topics": [
          "memory",
          "context",
          "recall",
          "provenance"
        ],
        "reason": "matched by recall result",
        "score": 1
      },
      "id": "CTX-1074",
      "createdAt": "2026-08-14T08:13:13.470Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0-6-cli-foundation",
      "summary": "Decision applies to relevant file docs/design/mcp-control-plane-0.6-contract.md: Ship 0.6.0 as CLI foundations, not an MCP runtime",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "docs/design/mcp-control-plane-0.6-contract.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1080",
      "createdAt": "2026-08-14T08:13:13.471Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
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
      "id": "CTX-1081",
      "createdAt": "2026-08-14T08:13:13.471Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
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
      "id": "CTX-1082",
      "createdAt": "2026-08-14T08:13:13.472Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
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
      "id": "CTX-1085",
      "createdAt": "2026-08-14T08:13:13.472Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0-6-release-safety",
      "summary": "Decision applies to relevant file src/core/init.ts: Make packaged workflow guidance and retrospective hooks release-safe",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "src/core/init.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1086",
      "createdAt": "2026-08-14T08:13:13.472Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0-6-safe-retrospective-hook",
      "summary": "Decision applies to relevant file src/core/init.ts: Use a safe managed retrospective-hook state machine",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/core/init.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1087",
      "createdAt": "2026-08-14T08:13:13.473Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-MEMORY-EXPLICIT-BACKFILL",
      "summary": "Decision applies to relevant file src/cli.ts: Target the current task by default and make backfill explicit",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/cli.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1089",
      "createdAt": "2026-08-14T08:13:13.473Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-MEMORY-AGENT-DISTILLATION",
      "summary": "Decision applies to relevant file src/cli.ts: Keep semantic distillation agent-authored and CLI-verified",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "src/cli.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1090",
      "createdAt": "2026-08-14T08:13:13.473Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-MEMORY-RECALL-FIRST",
      "summary": "Decision applies to relevant file src/cli.ts: Search distilled memory before raw history",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "src/cli.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1091",
      "createdAt": "2026-08-14T08:13:13.473Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-WIKI-RELEASE-070",
      "summary": "Decision applies to relevant file README.md: Expose Auto Wiki as the 0.7.0 public surface without releasing it",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "README.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1094",
      "createdAt": "2026-08-14T08:13:13.474Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
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
      "id": "CTX-1097",
      "createdAt": "2026-08-14T08:13:13.482Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
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
      "id": "CTX-1098",
      "createdAt": "2026-08-14T08:13:13.483Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
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
      "id": "CTX-1099",
      "createdAt": "2026-08-14T08:13:13.483Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
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
      "id": "CTX-1100",
      "createdAt": "2026-08-14T08:13:13.483Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
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
      "id": "CTX-1101",
      "createdAt": "2026-08-14T08:13:13.484Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0064",
      "summary": "Decision applies to relevant file README.md: Clarify the public documentation in both README locales",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "README.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1102",
      "createdAt": "2026-08-14T08:13:13.484Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0057",
      "summary": "Decision applies to relevant file README.md: Document disabled-workflow automatic retrospective capture",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "README.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1103",
      "createdAt": "2026-08-14T08:13:13.485Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
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
      "id": "CTX-1104",
      "createdAt": "2026-08-14T08:13:13.485Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
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
      "id": "CTX-1105",
      "createdAt": "2026-08-14T08:13:13.486Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0055",
      "summary": "Decision applies to relevant file README.md: Provide explicit workspace workflow commands",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "README.md"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1106",
      "createdAt": "2026-08-14T08:13:13.486Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
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
      "id": "CTX-1107",
      "createdAt": "2026-08-14T08:13:13.487Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
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
      "id": "CTX-1108",
      "createdAt": "2026-08-14T08:13:13.487Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
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
      "id": "CTX-1109",
      "createdAt": "2026-08-14T08:13:13.487Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-WIKI-DIRTY-STATUS",
      "summary": "Decision applies to relevant file tests/unit/wiki.test.ts: Compute Wiki dirtiness only from deterministic evidence",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "tests/unit/wiki.test.ts"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-1092",
      "createdAt": "2026-08-14T08:13:13.474Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-WIKI-EVIDENCE-LANGUAGE",
      "summary": "Decision applies to relevant file README.md: Keep intent, implementation claims, changes, and validation reports distinct",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "README.md"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-1093",
      "createdAt": "2026-08-14T08:13:13.474Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-WIKI-SECTION-OWNERSHIP",
      "summary": "Decision applies to relevant file tests/unit/wiki.test.ts: Protect human edits with generated-section ownership",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "tests/unit/wiki.test.ts"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-1095",
      "createdAt": "2026-08-14T08:13:13.481Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
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
      "id": "CTX-1096",
      "createdAt": "2026-08-14T08:13:13.482Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0021",
      "summary": "Prior decision: How should 0.6 migrate legacy canonical source without rewriting history unexpectedly? — Explicit atomic migration (recommended)",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1075",
      "createdAt": "2026-08-14T08:13:13.470Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-WIKI-POLICY-MIGRATION",
      "summary": "Prior decision: Default Wiki on only for new workspaces and migrate durable workspaces explicitly — Newly initialized workspaces receive enabled Wiki policy; existing durable workspaces with an old or absent policy remain Wiki-disabled until sduck update migrates them while preserving workflow settings, and unrelated commands never create docs/wiki implicitly.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1076",
      "createdAt": "2026-08-14T08:13:13.470Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0009",
      "summary": "Prior decision: Authorize only the 0.6 MCP control plane — This task implements 0.6a–0.6d only; it does not implement a sduck-owned coding runtime.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1077",
      "createdAt": "2026-08-14T08:13:13.471Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0030",
      "summary": "Prior decision: Record the break-glass recovery as a normal traced fix — The stale terminal-pointer recovery and its diagnostics are completed under this separately confirmed task with source/test trace coverage.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1078",
      "createdAt": "2026-08-14T08:13:13.471Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0046",
      "summary": "Prior decision: Defer convenience submission commands until the workflow gates are stable — Preserve submit stdin compatibility in this task. Direct decide and question convenience commands are a later ergonomics task if agent-generated drafts remain a demonstrated friction point.",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1079",
      "createdAt": "2026-08-14T08:13:13.471Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
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
      "id": "CTX-1083",
      "createdAt": "2026-08-14T08:13:13.472Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
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
      "id": "CTX-1084",
      "createdAt": "2026-08-14T08:13:13.472Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0001",
      "summary": "Prior decision: Release the backward-compatible feature set as 0.5.0 — Bump the npm package from 0.4.0 to 0.5.0 because the completed v2 workflow and locale work adds public capabilities without intended breaking changes.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-1088",
      "createdAt": "2026-08-14T08:13:13.473Z"
    },
    {
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "sourceType": "DISCOVERY",
      "sourceRef": ".agents/rules/sduck-core.md",
      "summary": "File evidence: Use v2 `.decision` briefing as the default workflow. Legacy SDD gates apply only when `current_work_id` is non-null.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "Use v2 `.decision` briefing as the default workflow. Legacy SDD gates apply only when `current_work_id` is non-null.",
        "line": 1
      },
      "id": "CTX-1110",
      "createdAt": "2026-08-14T08:13:13.488Z"
    }
  ],
  "briefSnapshots": [],
  "events": [
    {
      "id": "EVT-0413",
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "type": "TASK_CREATED",
      "payload": {
        "description": "Migrate this repository to the globally installed sduck CLI 0.7.0 workspace assets and policy",
        "policy": {
          "grillMeRequired": false
        }
      },
      "createdAt": "2026-08-14T08:13:13.092Z"
    },
    {
      "id": "EVT-0414",
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "type": "GRILL_STARTED",
      "payload": {
        "automatic": true
      },
      "createdAt": "2026-08-14T08:13:13.092Z"
    },
    {
      "id": "EVT-0415",
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "type": "CONTEXT_INDEXED",
      "payload": {
        "itemCount": 40
      },
      "createdAt": "2026-08-14T08:13:13.498Z"
    },
    {
      "id": "EVT-0416",
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "type": "GRILL_COMPLETED",
      "payload": {
        "reason": "The user explicitly requested the 0.7.0 migration, and code, migration documentation, doctor, and update dry-run show one bounded change: create the durable Wiki policy through sduck update while preserving existing records and avoiding automatic Wiki generation.",
        "carried": []
      },
      "createdAt": "2026-08-14T08:14:45.115Z"
    },
    {
      "id": "EVT-0417",
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-MIGRATE-070-CLI-POLICY"
      },
      "createdAt": "2026-08-14T08:14:45.781Z"
    },
    {
      "id": "EVT-0418",
      "taskId": "TASK-20260814-migrate-this-repository-to-the-globally-installe",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 1,
        "questions": 0,
        "evidence": 4,
        "expectedScope": [
          "Verify the global and repository-managed sduck versions are 0.7.0 and the decision workspace is healthy",
          "Run sduck update through the CLI-only migration path",
          "Create .decision/policy.json with legacy-compatible workflow/grill settings and the enabled docs/wiki policy",
          "Preserve all canonical task, decision, trace, evaluation, and memory records",
          "Run sduck rebuild, doctor, update dry-run, Wiki status, and Git diff checks after migration",
          "Record the migration lifecycle, commit only the policy and canonical migration records, and push main after validation"
        ],
        "avoidScope": [
          "Hand-editing decision state, cache, or policy files",
          "Creating or force-syncing docs/wiki during this migration",
          "Changing application source, package metadata, dependencies, or release tags",
          "Backfilling historical memory capsules",
          "Committing .omc or ignored local/generated state",
          "Force pushes, tag replacement, npm publishing, or GitHub Release creation"
        ],
        "implementationPlan": [
          "Run sduck update once from the repository root so the installed 0.7.0 CLI performs the atomic policy migration and safe hook check.",
          "Inspect the generated policy and verify no source or existing canonical-history files were unexpectedly rewritten.",
          "Run rebuild and post-migration health/status checks, then record trace, evaluation, memory, recall, and close before one scoped commit and main push."
        ],
        "verificationPlan": [
          "sduck --version and npm list --global @sduck/sduck-cli --depth=0 report 0.7.0",
          "sduck doctor reports a healthy decision workspace before and after migration",
          "sduck update --dry-run reports the migration pending before implementation and already up to date afterward",
          ".decision/policy.json preserves legacy-compatible requireGrillMe/workflowEnabled values and enables wiki at docs/wiki",
          "sduck rebuild succeeds and sduck wiki status reports the enabled policy without creating docs/wiki",
          "git diff --check and changed-file review show only the policy and canonical migration records",
          "Commit hooks and matching GitHub Actions CI pass before handoff"
        ]
      },
      "createdAt": "2026-08-14T08:14:45.781Z"
    }
  ]
}
```
