---
id: TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing
type: task
status: CLOSED
title: Harden Memory Capsule retrieval, recovery, parsing, and context refresh
record_depth: FULL
created_at: '2026-08-12T05:06:14.509Z'
updated_at: '2026-08-12T05:32:24.060Z'
---
# TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing: Harden Memory Capsule retrieval, recovery, parsing, and context refresh

Harden Memory Capsule retrieval, recovery, parsing, and context refresh

## Sduck source

```json sduck-source
{
  "task": {
    "id": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
    "title": "Harden Memory Capsule retrieval, recovery, parsing, and context refresh",
    "description": "Harden Memory Capsule retrieval, recovery, parsing, and context refresh",
    "status": "CLOSED",
    "expectedScope": [
      "Source-ID-level capsule suppression in recall and context",
      "Degraded read, stale exclusion, doctor diagnostics and quarantine repair for invalid capsule references",
      "Final canonical source-block parsing and semantic round-trip assertion",
      "Current-snapshot automatic context reconciliation",
      "Explicit --task memory backfill contract",
      "Portable digest ordering, escaped search, Korean reason localization, documentation and regression tests"
    ],
    "avoidScope": [
      "Raw canonical record deletion or cold archive",
      "Auto Wiki behavioral changes",
      "Decision supersede command design",
      "Release version changes, commit, tag, push, or publish"
    ],
    "guided": true,
    "recordDepth": "FULL",
    "createdAt": "2026-08-12T05:06:14.509Z",
    "updatedAt": "2026-08-12T05:32:24.060Z",
    "implementationPlan": [
      "Use vertical RED-GREEN cycles for suppression, degraded recovery, source round-trip, context refresh, and task targeting.",
      "Add the adjacent portability, search, and localization regressions after the blocking paths are green.",
      "Update public and managed-agent documentation to match explicit backfill and stale behavior.",
      "Run targeted checks after each slice, then full static, unit, E2E, build, and package verification."
    ],
    "verificationPlan": [
      "Prove each reproduced failure with a public-interface regression before its fix.",
      "Run typecheck, lint, format check, all unit and E2E tests, build, and package dry-run.",
      "Record trace and evaluation, refresh the task Memory Capsule, verify recall, and close the task."
    ]
  },
  "questions": [],
  "evidence": [
    {
      "id": "EVD-MEMORY-REVIEW-REPRO",
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "decisionId": null,
      "sourceType": "DISCOVERY",
      "sourceRef": "independent temporary-workspace reproduction",
      "summary": "Reproduced task-wide suppression, dangling-reference workspace lockout, source-fence substitution, frozen automatic context, and implicit historical capsule overwrite.",
      "confidence": 0.7,
      "createdAt": "2026-08-12T05:10:34.572Z"
    }
  ],
  "contextItems": [
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-CONTEXT-PERSISTENT-UPSERT",
      "summary": "Decision applies to relevant file src/core/v2/context.ts: Make persisted context indexing idempotent",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "src/core/v2/context.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0983",
      "createdAt": "2026-08-12T05:06:14.678Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-MEMORY-AGENT-DISTILLATION",
      "summary": "Decision applies to relevant file src/commands/v2/index.ts: Keep semantic distillation agent-authored and CLI-verified",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "src/commands/v2/index.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0984",
      "createdAt": "2026-08-12T05:06:14.678Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-MEMORY-CAPSULE-BOUNDARY",
      "summary": "Decision applies to relevant file src/core/v2/rebuild.ts: Store one source-backed Memory Capsule per task",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/core/v2/rebuild.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0985",
      "createdAt": "2026-08-12T05:06:14.678Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-MEMORY-RECALL-FIRST",
      "summary": "Decision applies to relevant file src/commands/v2/index.ts: Search distilled memory before raw history",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "files": [
          "src/commands/v2/index.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0986",
      "createdAt": "2026-08-12T05:06:14.678Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-0987",
      "createdAt": "2026-08-12T05:06:14.679Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-0990",
      "createdAt": "2026-08-12T05:06:14.679Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-0991",
      "createdAt": "2026-08-12T05:06:14.679Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-0992",
      "createdAt": "2026-08-12T05:06:14.679Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-0993",
      "createdAt": "2026-08-12T05:06:14.680Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0042",
      "summary": "Decision applies to relevant file src/core/v2/rebuild.ts: Keep Markdown canonical and project history into rebuildable SQLite graph data",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/core/v2/rebuild.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1003",
      "createdAt": "2026-08-12T05:06:14.681Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-WIKI-AGENT-WORKFLOW",
      "summary": "Decision applies to relevant file src/commands/v2/index.ts: Keep Wiki generation agent-driven and task close non-gating",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/commands/v2/index.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1004",
      "createdAt": "2026-08-12T05:06:14.681Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-1006",
      "createdAt": "2026-08-12T05:06:14.682Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-1007",
      "createdAt": "2026-08-12T05:06:14.682Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-1009",
      "createdAt": "2026-08-12T05:06:14.682Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-1010",
      "createdAt": "2026-08-12T05:06:14.682Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-1011",
      "createdAt": "2026-08-12T05:06:14.682Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-1012",
      "createdAt": "2026-08-12T05:06:14.683Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-1013",
      "createdAt": "2026-08-12T05:06:14.683Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-1014",
      "createdAt": "2026-08-12T05:06:14.683Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-1015",
      "createdAt": "2026-08-12T05:06:14.683Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-1016",
      "createdAt": "2026-08-12T05:06:14.683Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0056",
      "summary": "Decision applies to relevant file src/commands/v2/index.ts: Capture disabled-workflow decisions retrospectively without another prompt",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/commands/v2/index.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1017",
      "createdAt": "2026-08-12T05:06:14.683Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0054",
      "summary": "Decision applies to relevant file src/commands/v2/index.ts: Disable only new work creation and preserve existing records",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/commands/v2/index.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1018",
      "createdAt": "2026-08-12T05:06:14.684Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-1019",
      "createdAt": "2026-08-12T05:06:14.684Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-1020",
      "createdAt": "2026-08-12T05:06:14.684Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-1021",
      "createdAt": "2026-08-12T05:06:14.684Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-1023",
      "createdAt": "2026-08-12T05:06:14.685Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-1024",
      "createdAt": "2026-08-12T05:06:14.685Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-1025",
      "createdAt": "2026-08-12T05:06:14.685Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0044",
      "summary": "Decision applies to relevant file src/core/v2/context.ts: Expose bounded graph visibility in the CLI",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/core/v2/context.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-1026",
      "createdAt": "2026-08-12T05:06:14.685Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-1005",
      "createdAt": "2026-08-12T05:06:14.681Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-RELEASE-0-6-2",
      "summary": "Decision applies to relevant file tests/e2e/v2-memory-cli.test.ts: Release Stage 1 as a new 0.6.2 package",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "tests/e2e/v2-memory-cli.test.ts"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-1008",
      "createdAt": "2026-08-12T05:06:14.682Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0038",
      "summary": "Decision applies to relevant file src/commands/v2/index.ts: Keep sduck CLI-first and defer the MCP control plane",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/commands/v2/index.ts"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-1022",
      "createdAt": "2026-08-12T05:06:14.685Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-1027",
      "createdAt": "2026-08-12T05:06:14.685Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-0988",
      "createdAt": "2026-08-12T05:06:14.679Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0030",
      "summary": "Prior decision: Record the break-glass recovery as a normal traced fix — The stale terminal-pointer recovery and its diagnostics are completed under this separately confirmed task with source/test trace coverage.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0989",
      "createdAt": "2026-08-12T05:06:14.679Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0001",
      "summary": "Prior decision: Release the backward-compatible feature set as 0.5.0 — Bump the npm package from 0.4.0 to 0.5.0 because the completed v2 workflow and locale work adds public capabilities without intended breaking changes.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0994",
      "createdAt": "2026-08-12T05:06:14.680Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-0995",
      "createdAt": "2026-08-12T05:06:14.680Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-0996",
      "createdAt": "2026-08-12T05:06:14.680Z"
    },
    {
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
      "id": "CTX-0997",
      "createdAt": "2026-08-12T05:06:14.680Z"
    }
  ],
  "briefSnapshots": [
    {
      "id": "BRF-0024",
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "snapshot": {
        "task": {
          "id": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
          "title": "Harden Memory Capsule retrieval, recovery, parsing, and context refresh",
          "description": "Harden Memory Capsule retrieval, recovery, parsing, and context refresh",
          "status": "CONFIRMED",
          "expectedScope": [
            "Source-ID-level capsule suppression in recall and context",
            "Degraded read, stale exclusion, doctor diagnostics and quarantine repair for invalid capsule references",
            "Final canonical source-block parsing and semantic round-trip assertion",
            "Current-snapshot automatic context reconciliation",
            "Explicit --task memory backfill contract",
            "Portable digest ordering, escaped search, Korean reason localization, documentation and regression tests"
          ],
          "avoidScope": [
            "Raw canonical record deletion or cold archive",
            "Auto Wiki behavioral changes",
            "Decision supersede command design",
            "Release version changes, commit, tag, push, or publish"
          ],
          "guided": true,
          "recordDepth": "FULL",
          "createdAt": "2026-08-12T05:06:14.509Z",
          "updatedAt": "2026-08-12T05:10:38.645Z",
          "implementationPlan": [
            "Use vertical RED-GREEN cycles for suppression, degraded recovery, source round-trip, context refresh, and task targeting.",
            "Add the adjacent portability, search, and localization regressions after the blocking paths are green.",
            "Update public and managed-agent documentation to match explicit backfill and stale behavior.",
            "Run targeted checks after each slice, then full static, unit, E2E, build, and package verification."
          ],
          "verificationPlan": [
            "Prove each reproduced failure with a public-interface regression before its fix.",
            "Run typecheck, lint, format check, all unit and E2E tests, build, and package dry-run.",
            "Record trace and evaluation, refresh the task Memory Capsule, verify recall, and close the task."
          ]
        },
        "decisions": {
          "EXPLICIT": [
            {
              "id": "DEC-CONTEXT-CURRENT-CANDIDATE-SNAPSHOT",
              "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
              "title": "Reconcile automatic context from the current candidate snapshot",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Each context refresh reuses stable IDs for still-matching candidates, applies current scores and summaries, and removes automatic entries absent from the current candidate set before enforcing the 40-item bound; explicit FILE context remains preserved.",
              "rationale": [
                "Forty obsolete high-score entries currently prevent a newly relevant file from entering context."
              ],
              "appliesTo": [
                "src/core/v2/context.ts"
              ],
              "avoids": [
                "Evicting explicit FILE context"
              ],
              "sourceRefs": [],
              "createdAt": "2026-08-12T05:10:34.572Z",
              "updatedAt": "2026-08-12T05:10:34.572Z"
            },
            {
              "id": "DEC-MEMORY-CITED-SOURCE-SUPPRESSION",
              "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
              "title": "Suppress only raw sources actually cited by a matching capsule",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Recall and context hide only cited Decision and Implementation Trace IDs, never every raw record from the capsule's task.",
              "rationale": [
                "The task-wide filter was independently reproduced hiding an uncited exact-match decision."
              ],
              "appliesTo": [
                "src/core/v2/recall.ts",
                "src/core/v2/context.ts"
              ],
              "avoids": [
                "Task-wide raw-history suppression"
              ],
              "sourceRefs": [],
              "createdAt": "2026-08-12T05:10:34.572Z",
              "updatedAt": "2026-08-12T05:10:34.572Z"
            },
            {
              "id": "DEC-MEMORY-DEGRADED-READ-RECOVERY",
              "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
              "title": "Keep canonical history usable when a capsule reference breaks",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Memory cross-reference failures become stale retrieval state instead of bundle-load failures; stale capsules are excluded from cache retrieval, and doctor reports and quarantines invalid capsule files on explicit repair.",
              "rationale": [
                "Deleting one cited Decision currently blocks status, work, memory status, and leaves doctor unable to repair."
              ],
              "appliesTo": [
                "src/core/v2/source-store.ts",
                "src/core/v2/memory-source.ts",
                "src/core/v2/memory.ts",
                "src/core/v2/rebuild.ts",
                "src/core/v2/doctor.ts"
              ],
              "avoids": [
                "Deleting raw Task, Decision, Evidence, Trace, or Evaluation records",
                "Silently retrieving stale capsules"
              ],
              "sourceRefs": [],
              "createdAt": "2026-08-12T05:10:34.572Z",
              "updatedAt": "2026-08-12T05:10:34.572Z"
            },
            {
              "id": "DEC-MEMORY-EXPLICIT-BACKFILL",
              "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
              "title": "Target the current task by default and make backfill explicit",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "memory distill rejects a payload for a non-current task unless the caller explicitly supplies --task with the same ID; --task permits intentional confirmed/closed-task backfill.",
              "rationale": [
                "A payload typo currently overwrites an unrelated historical capsule while another task is active."
              ],
              "appliesTo": [
                "src/core/v2/memory.ts",
                "src/cli.ts",
                "src/commands/v2/index.ts"
              ],
              "avoids": [
                "Implicit historical task mutation"
              ],
              "sourceRefs": [],
              "createdAt": "2026-08-12T05:10:34.572Z",
              "updatedAt": "2026-08-12T05:10:34.572Z"
            },
            {
              "id": "DEC-SOURCE-CANONICAL-LAST-BLOCK",
              "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
              "title": "Parse and verify the final canonical sduck-source block",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Markdown loaders read the final sduck-source fence emitted at the document tail and DecisionWorkspace verifies semantic round-trip equivalence before commit.",
              "rationale": [
                "A valid example fence in free text currently replaces the validated record without an error."
              ],
              "appliesTo": [
                "src/core/v2/source-store.ts",
                "src/core/v2/decision-workspace.ts"
              ],
              "avoids": [
                "Restricting ordinary prose from documenting source fences"
              ],
              "sourceRefs": [],
              "createdAt": "2026-08-12T05:10:34.572Z",
              "updatedAt": "2026-08-12T05:10:34.572Z"
            }
          ],
          "INFERRED": [
            {
              "id": "DEC-MEMORY-PORTABLE-SEARCH-LOCALE",
              "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
              "title": "Make memory digests, search patterns, and localized reasons portable",
              "kind": "INFERRED",
              "status": "CONFIRMED",
              "confidence": 0.7,
              "summary": "Use code-unit ordering for digests, escape SQL LIKE wildcards, retain two-character Korean tokens, and translate human-readable memory reasons while leaving JSON slugs stable.",
              "rationale": [
                "These adjacent fixes close the review's low-risk portability, query, and localization gaps without changing canonical JSON contracts."
              ],
              "appliesTo": [
                "src/core/v2/memory-source.ts",
                "src/core/v2/memory.ts",
                "src/core/v2/context.ts",
                "src/core/v2/recall.ts",
                "src/ui/v2/messages.ts",
                "src/ui/v2/render.ts"
              ],
              "avoids": [
                "Locale-dependent canonical digests",
                "Changing machine-readable reason slugs"
              ],
              "sourceRefs": [],
              "createdAt": "2026-08-12T05:10:34.572Z",
              "updatedAt": "2026-08-12T05:10:34.572Z"
            }
          ],
          "CARRIED": [],
          "CONFLICT": [],
          "OPEN": []
        },
        "questions": [],
        "evidence": [
          {
            "id": "EVD-MEMORY-REVIEW-REPRO",
            "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
            "decisionId": null,
            "sourceType": "DISCOVERY",
            "sourceRef": "independent temporary-workspace reproduction",
            "summary": "Reproduced task-wide suppression, dangling-reference workspace lockout, source-fence substitution, frozen automatic context, and implicit historical capsule overwrite.",
            "confidence": 0.7,
            "createdAt": "2026-08-12T05:10:34.572Z"
          }
        ],
        "expectedScope": [
          "Source-ID-level capsule suppression in recall and context",
          "Degraded read, stale exclusion, doctor diagnostics and quarantine repair for invalid capsule references",
          "Final canonical source-block parsing and semantic round-trip assertion",
          "Current-snapshot automatic context reconciliation",
          "Explicit --task memory backfill contract",
          "Portable digest ordering, escaped search, Korean reason localization, documentation and regression tests"
        ],
        "avoidScope": [
          "Raw canonical record deletion or cold archive",
          "Auto Wiki behavioral changes",
          "Decision supersede command design",
          "Release version changes, commit, tag, push, or publish"
        ],
        "implementationPlan": [
          "Use vertical RED-GREEN cycles for suppression, degraded recovery, source round-trip, context refresh, and task targeting.",
          "Add the adjacent portability, search, and localization regressions after the blocking paths are green.",
          "Update public and managed-agent documentation to match explicit backfill and stale behavior.",
          "Run targeted checks after each slice, then full static, unit, E2E, build, and package verification."
        ],
        "verificationPlan": [
          "Prove each reproduced failure with a public-interface regression before its fix.",
          "Run typecheck, lint, format check, all unit and E2E tests, build, and package dry-run.",
          "Record trace and evaluation, refresh the task Memory Capsule, verify recall, and close the task."
        ],
        "openQuestionCount": 0
      },
      "renderedMarkdown": "────────────────────────────────────────\nImplementation Brief\n────────────────────────────────────────\nTask: TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing\nHarden Memory Capsule retrieval, recovery, parsing, and context refresh\n\nA. Explicit decisions\n[EXPLICIT] DEC-CONTEXT-CURRENT-CANDIDATE-SNAPSHOT. Reconcile automatic context from the current candidate snapshot\nConfidence: 1.00\nSummary: Each context refresh reuses stable IDs for still-matching candidates, applies current scores and summaries, and removes automatic entries absent from the current candidate set before enforcing the 40-item bound; explicit FILE context remains preserved.\nRationale:\n  - Forty obsolete high-score entries currently prevent a newly relevant file from entering context.\nApplies to:\n  - src/core/v2/context.ts\nAvoids:\n  - Evicting explicit FILE context\n\n[EXPLICIT] DEC-MEMORY-CITED-SOURCE-SUPPRESSION. Suppress only raw sources actually cited by a matching capsule\nConfidence: 1.00\nSummary: Recall and context hide only cited Decision and Implementation Trace IDs, never every raw record from the capsule's task.\nRationale:\n  - The task-wide filter was independently reproduced hiding an uncited exact-match decision.\nApplies to:\n  - src/core/v2/recall.ts\n  - src/core/v2/context.ts\nAvoids:\n  - Task-wide raw-history suppression\n\n[EXPLICIT] DEC-MEMORY-DEGRADED-READ-RECOVERY. Keep canonical history usable when a capsule reference breaks\nConfidence: 1.00\nSummary: Memory cross-reference failures become stale retrieval state instead of bundle-load failures; stale capsules are excluded from cache retrieval, and doctor reports and quarantines invalid capsule files on explicit repair.\nRationale:\n  - Deleting one cited Decision currently blocks status, work, memory status, and leaves doctor unable to repair.\nApplies to:\n  - src/core/v2/source-store.ts\n  - src/core/v2/memory-source.ts\n  - src/core/v2/memory.ts\n  - src/core/v2/rebuild.ts\n  - src/core/v2/doctor.ts\nAvoids:\n  - Deleting raw Task, Decision, Evidence, Trace, or Evaluation records\n  - Silently retrieving stale capsules\n\n[EXPLICIT] DEC-MEMORY-EXPLICIT-BACKFILL. Target the current task by default and make backfill explicit\nConfidence: 1.00\nSummary: memory distill rejects a payload for a non-current task unless the caller explicitly supplies --task with the same ID; --task permits intentional confirmed/closed-task backfill.\nRationale:\n  - A payload typo currently overwrites an unrelated historical capsule while another task is active.\nApplies to:\n  - src/core/v2/memory.ts\n  - src/cli.ts\n  - src/commands/v2/index.ts\nAvoids:\n  - Implicit historical task mutation\n\n[EXPLICIT] DEC-SOURCE-CANONICAL-LAST-BLOCK. Parse and verify the final canonical sduck-source block\nConfidence: 1.00\nSummary: Markdown loaders read the final sduck-source fence emitted at the document tail and DecisionWorkspace verifies semantic round-trip equivalence before commit.\nRationale:\n  - A valid example fence in free text currently replaces the validated record without an error.\nApplies to:\n  - src/core/v2/source-store.ts\n  - src/core/v2/decision-workspace.ts\nAvoids:\n  - Restricting ordinary prose from documenting source fences\n\nB. Inferred decisions\n[INFERRED] DEC-MEMORY-PORTABLE-SEARCH-LOCALE. Make memory digests, search patterns, and localized reasons portable\nConfidence: 0.70\nSummary: Use code-unit ordering for digests, escape SQL LIKE wildcards, retain two-character Korean tokens, and translate human-readable memory reasons while leaving JSON slugs stable.\nRationale:\n  - These adjacent fixes close the review's low-risk portability, query, and localization gaps without changing canonical JSON contracts.\nApplies to:\n  - src/core/v2/memory-source.ts\n  - src/core/v2/memory.ts\n  - src/core/v2/context.ts\n  - src/core/v2/recall.ts\n  - src/ui/v2/messages.ts\n  - src/ui/v2/render.ts\nAvoids:\n  - Locale-dependent canonical digests\n  - Changing machine-readable reason slugs\n\nC. Carried decisions\n  - none\n\nD. Conflicts\n  - none\n\nE. Open decisions\n  - none\n\nProblem:\n  Harden Memory Capsule retrieval, recovery, parsing, and context refresh\nImplementation plan:\n  - Use vertical RED-GREEN cycles for suppression, degraded recovery, source round-trip, context refresh, and task targeting.\n  - Add the adjacent portability, search, and localization regressions after the blocking paths are green.\n  - Update public and managed-agent documentation to match explicit backfill and stale behavior.\n  - Run targeted checks after each slice, then full static, unit, E2E, build, and package verification.\nVerification plan:\n  - Prove each reproduced failure with a public-interface regression before its fix.\n  - Run typecheck, lint, format check, all unit and E2E tests, build, and package dry-run.\n  - Record trace and evaluation, refresh the task Memory Capsule, verify recall, and close the task.\nScope expected:\n  - Source-ID-level capsule suppression in recall and context\n  - Degraded read, stale exclusion, doctor diagnostics and quarantine repair for invalid capsule references\n  - Final canonical source-block parsing and semantic round-trip assertion\n  - Current-snapshot automatic context reconciliation\n  - Explicit --task memory backfill contract\n  - Portable digest ordering, escaped search, Korean reason localization, documentation and regression tests\nScope avoided:\n  - Raw canonical record deletion or cold archive\n  - Auto Wiki behavioral changes\n  - Decision supersede command design\n  - Release version changes, commit, tag, push, or publish\nOpen questions: 0\nEvidence:\n  - [DISCOVERY] independent temporary-workspace reproduction (0.7): Reproduced task-wide suppression, dangling-reference workspace lockout, source-fence substitution, frozen automatic context, and implicit historical capsule overwrite.\n────────────────────────────────────────",
      "gitBaseline": {
        "head": "6e9641a55dc7ba6a8dd7efe2ab5a87cfa4df646a",
        "dirtyFileHashes": {
          ".agents/rules/sduck-core.md": "ad98307e45d036e80ed1799bc439ac12f19eb848141c0e3738251318506cafb1",
          ".claude/hooks/sdd-guard.sh": "4d4a9c79b8d81b80e44aadbcdb1f50291a6bbc630b53d40dcc79115004ccb04c",
          ".claude/settings.json": "cdfbff6247f362f8cdb77adb56a5c031e968ccd86103239402d4f18ee18d932f",
          ".claude/skills/sd-build-wiki.md": "95b44a99aa0213fc7f78ac78cf1054bb6cbf931e4ce2d2781eaa0be3e1d0bf5f",
          ".claude/skills/sd-sync-wiki.md": "0dcb7729780a5923cf61cfb6922a11fffe7f7e0043a0f05dcff48905012b08d6",
          ".claude/skills/sduck-codebase-decisions.md": "9894bdc0f6d82dd62c5d926d339919b2f0eeae9e264f3a9eb10cbdd1da439ca5",
          ".claude/skills/sduck-retrospective-capture.md": "c12ab9252b2f859d6ac8b556322bc02d578570ab726d8995347ad9926f3b7adf",
          ".cursor/rules/sduck-core.mdc": "b6e7bf55ae5a48abd9824fb866eeb95b0d8637aab82dcd2ac23422fde9eecdcb",
          ".ignore": "d848d497c18118c6142a789e167a989adbc2c2227e371b0164480a6206bab443",
          ".omc/project-memory.json": "5df56e66180fa27014b20f7c4ed4a25fbbf82d7c44a5e061200944455f62b68b",
          ".omc/state/agent-replay-21700872-d3ec-4974-b033-67d97c77ad59.jsonl": "59ee0b099e8cee3e41a86cbf7ac293272fec446b3616e139e9142c76518e0d46",
          ".omc/state/hud-stdin-cache.json": "4cc7c0625d26cb9a5a9baefd033dfdba2b6b8cc49419abb71688f02c55e2ee8a",
          ".omc/state/idle-notif-cooldown.json": "b9bcda1c569ebd648732ff4e46741849789a5797265a20e866986aebdbdb4057",
          ".omc/state/sessions/21700872-d3ec-4974-b033-67d97c77ad59/hud-state.json": "a92a75d32ddd42c98eddec9409bd72b9c236b2427fee727ee977543f3c757965",
          ".omc/state/sessions/21700872-d3ec-4974-b033-67d97c77ad59/last-tool-error-state.json": "b7a0fb5455d8a0764a45ff42b15c749a37d3a09fdecc4473d3c7ed97eb6520c5",
          ".omc/state/sessions/21700872-d3ec-4974-b033-67d97c77ad59/pre-tool-advisory-throttle.json": "b92a0d53ab19bef2ce9e95f9836fba642676f2376a61aa6ac9e7ea52facc8217",
          ".omc/state/sessions/21700872-d3ec-4974-b033-67d97c77ad59/session-started.json": "a879b0a590eee337ba2aaeedf5ed6bc57295ae55593ab5224359a8cf708d8ade",
          ".omc/state/sessions/21700872-d3ec-4974-b033-67d97c77ad59/subagent-tracking-state.json": "cb3b4ffdbbd38df4be108ab68f7e98ee500a1626abb9fb2a8f18d21ed5f0698e",
          ".prettierignore": "dba2937b084dc36af5b25e225842e4d3189d28240e0d5f19ccbde7bfcd9a5a9b",
          "AGENTS.md": "e828653ac60cdfdd066edc5bb89218aca28002aa28cada4b4383269c5fe9f056",
          "CLAUDE.md": "ec60d97f67ac4451d566956454993008c84751202f1361ba1b3f1aa110cc0b5e",
          "GEMINI.md": "137ec32ab0ae43700a607e416ccd911c3ef93c58defce5f870f67b383b3aa1a3",
          "README.ko.md": "cbebacc7d35b1120b0f2af6b7d9148da8cd81dcfb8b21f6515bf03e026b3c928",
          "README.md": "b38c01bdc6eeb7ced47bf847fdb1030cd56a78aeac50902c05309d66b68a249f",
          "docs/migration.md": "b1d71f42eaf35b42b2351b0d448ed9f9bacfab83833dd1ef6c05588ad2377a91",
          "docs/pilot-evaluation.md": "70d0a6d42377041b0f3da4df2d3c0b380df33b03772c38bd2a7b010469ad13a4",
          "docs/release-0.7.0.md": "4830cb92ed4354964903436efdbb4ed97c62f8aeb949dc8c5baa74f61a78f6b4",
          "docs/use-cases.md": "823540aaafc3c093abbfcf658bda1cda60800a63a4dfbfe261543d165286ed7f",
          "package-lock.json": "c2d5af2e5dfa8caa1a4d8f250824d3b740adc75b55e8c015c5c7d897096dd63e",
          "package.json": "0450becb3f6154c6a544d7b83d5d526bddeb9099af72f0a5df0b2314fe6e9bb6",
          "src/cli.ts": "67595461d52d2cee05d4e577920a1cf254a79430cbe7de2b72592db092558345",
          "src/commands/v2/index.ts": "f0cd249f1e91e237baf849c0c631c68221e62b1affbd8535f7bd34681e3299a8",
          "src/core/assets.ts": "d088a8ba8ba8378e7b68dc55caa54161756d0de3d85611a3653b6d8a1ab3be60",
          "src/core/init.ts": "c189acea539e036ca094778b442e95a0580f2ba7d56005a38befed21f1824540",
          "src/core/update.ts": "ac13e182be7f94530ba11b5493e2b3d5656d8ad93d43d35575959f17374fe9bf",
          "src/core/v2/cache-bundle.ts": "ad24b8cf76d06747ac9431cfe8552c950058aa8010066e034c438ed886bb197f",
          "src/core/v2/context.ts": "7b778a4df7802a4f77431685abde8b785ff65c23f609e89f8633188a6d8fe478",
          "src/core/v2/decision-workspace.ts": "ebea365771fabaaadd8825feb91f64936ea5d8ddc984d65bbd0ef9bb1369b5d8",
          "src/core/v2/errors.ts": "1d7ed1a7d00672b9d60600ba7ee59c537d5b938721559303eb3217d2961c4a69",
          "src/core/v2/memory-source.ts": "5edc6bc20362861be12e561de87d8e01d708a67d2ba54d4b8f392cc5d47ec03d",
          "src/core/v2/memory.ts": "351cdadc6f10b1ffee5afe9813b83bf06bb65bea669d563b0966becc60ba31f1",
          "src/core/v2/paths.ts": "ffe9af321f568ebc6fde6a821211c8eed33d85a042b7dc4c585df8358d14a6e5",
          "src/core/v2/policy.ts": "9b81216de2677dc2ce9a8673a782e7f9a731c30c91c72f8358edacf280f29eef",
          "src/core/v2/rebuild.ts": "dc28a477b15f14661ee1592dbbc8d9f5c405835ad915061cf89509a7115741c5",
          "src/core/v2/recall.ts": "bc92154797b25e18482525509601e51cca94ec3ebce1d58aaa931d547406efc6",
          "src/core/v2/remember.ts": "a4f02a05d235398c0f628f34a6efa5b76b10c978b05ea9221aa8c41eb06f13c3",
          "src/core/v2/source-store.ts": "32b2643900601e81be1d04fe2780a2c765ce83e38b168ff00c3b9f81fc579662",
          "src/core/v2/source-types.ts": "189f4c0bfe55092d6ecd71ad09067a6b9fedc6834f6ab6690aad525401ff70ea",
          "src/core/v2/store.ts": "793a0ec66f28869395cbb942c1066609839cb06084a1eeefbfd2773f9b73e361",
          "src/core/v2/wiki.ts": "4d6cdeb94bbea68e823d325a6fde6ee6f70d01fbcc7b2ef28ae852c798ca9814",
          "src/core/v2/workspace.ts": "ec5cf22ea032e212a6779153e9cc77c4144199e3348dad12963d720826a1e322",
          "src/types/index.ts": "a21979bb2464b777256684d708cc1e663332367e757b0af69c506d2a1d752a2d",
          "src/ui/v2/messages.ts": "34c278d0cb714cd019dae549dad96bc589b0bc3f73290e0d8311adfa2a5b258c",
          "src/ui/v2/render.ts": "66b69719fd2b9ddcefea343a26f7ddad1c3ecc339182e4058f0b92beac92aec3",
          "tests/e2e/sdd-cli-reachability.test.ts": "5b33e9f746b2d379756ea07b68ffa9243534301c85d9a4a93812c8ed5ebc2033",
          "tests/e2e/v2-cli.test.ts": "0f10b6c2ab42503f383e96c9890e7470a1f8fc6ef886ad13bd0b36581e5528c9",
          "tests/e2e/v2-memory-cli.test.ts": "31abf2fa4731089bf9a4871f6755121bea2e4b82bd5007c1e02211eb82a3ef52",
          "tests/e2e/v2-phase2c-matrix.test.ts": "f13bba9b3a40e82a1763443e9add6cef6b4205d96c0992a37d548a498d00dd74",
          "tests/e2e/wiki-cli.test.ts": "219df71d33978af06e97e27f32dbafd37ea445bbd084a57c298a59aee9cb7e72",
          "tests/unit/decision-workspace.test.ts": "6c9c97a1c7fc75e9c6c2133cdaad7512c7208f0d701532f0f61e7a436de4e472",
          "tests/unit/sdd-core-regression.test.ts": "4cca135f7f841cb1b3ef36b1f139e5d62a668341e4a0517b6dc44dce5bd03d48",
          "tests/unit/v2-memory.test.ts": "81d93f8903ccbbf888bb7af18c7fbf2e6ca5645638046f07761361280f985d54",
          "tests/unit/v2-messages.test.ts": "a4cde37887669158fc8eb088feba699bd00eb93d56a9f81771e65c683de3f7dd",
          "tests/unit/wiki-assets.test.ts": "663fa54c87f522a4687c4d2205b0b85cf3ea027de031a73a5c3f61a8e5d9131d",
          "tests/unit/wiki.test.ts": "727c15ec5176a2daca59c2e438ea7dc36133ce1c25422482626ec0aaaa144e09"
        }
      },
      "createdAt": "2026-08-12T05:10:38.720Z"
    }
  ],
  "evaluations": [
    {
      "id": "EVAL-0010",
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "traceId": "IMPL-0027",
      "checks": [
        {
          "name": "unit",
          "outcome": "160 passed"
        },
        {
          "name": "e2e",
          "outcome": "33 passed"
        },
        {
          "name": "static",
          "outcome": "lint, typecheck, and format passed"
        },
        {
          "name": "build-package",
          "outcome": "build and npm pack dry-run passed"
        }
      ],
      "createdAt": "2026-08-12T05:31:42.299Z"
    }
  ],
  "events": [
    {
      "id": "EVT-0380",
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "type": "TASK_CREATED",
      "payload": {
        "description": "Harden Memory Capsule retrieval, recovery, parsing, and context refresh",
        "policy": {
          "grillMeRequired": false
        }
      },
      "createdAt": "2026-08-12T05:06:14.509Z"
    },
    {
      "id": "EVT-0381",
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "type": "GRILL_STARTED",
      "payload": {
        "automatic": true
      },
      "createdAt": "2026-08-12T05:06:14.510Z"
    },
    {
      "id": "EVT-0382",
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "type": "CONTEXT_INDEXED",
      "payload": {
        "itemCount": 40
      },
      "createdAt": "2026-08-12T05:06:14.689Z"
    },
    {
      "id": "EVT-0383",
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "type": "GRILL_COMPLETED",
      "payload": {
        "reason": "The user approved the review remediation scope; five core failures were reproduced deterministically and the remaining low-risk fixes have explicit behavioral outcomes.",
        "carried": []
      },
      "createdAt": "2026-08-12T05:10:09.152Z"
    },
    {
      "id": "EVT-0384",
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-MEMORY-CITED-SOURCE-SUPPRESSION"
      },
      "createdAt": "2026-08-12T05:10:34.573Z"
    },
    {
      "id": "EVT-0385",
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-MEMORY-DEGRADED-READ-RECOVERY"
      },
      "createdAt": "2026-08-12T05:10:34.573Z"
    },
    {
      "id": "EVT-0386",
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-SOURCE-CANONICAL-LAST-BLOCK"
      },
      "createdAt": "2026-08-12T05:10:34.573Z"
    },
    {
      "id": "EVT-0387",
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-CONTEXT-CURRENT-CANDIDATE-SNAPSHOT"
      },
      "createdAt": "2026-08-12T05:10:34.573Z"
    },
    {
      "id": "EVT-0388",
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-MEMORY-EXPLICIT-BACKFILL"
      },
      "createdAt": "2026-08-12T05:10:34.573Z"
    },
    {
      "id": "EVT-0389",
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-MEMORY-PORTABLE-SEARCH-LOCALE"
      },
      "createdAt": "2026-08-12T05:10:34.573Z"
    },
    {
      "id": "EVT-0390",
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 6,
        "questions": 0,
        "evidence": 1,
        "expectedScope": [
          "Source-ID-level capsule suppression in recall and context",
          "Degraded read, stale exclusion, doctor diagnostics and quarantine repair for invalid capsule references",
          "Final canonical source-block parsing and semantic round-trip assertion",
          "Current-snapshot automatic context reconciliation",
          "Explicit --task memory backfill contract",
          "Portable digest ordering, escaped search, Korean reason localization, documentation and regression tests"
        ],
        "avoidScope": [
          "Raw canonical record deletion or cold archive",
          "Auto Wiki behavioral changes",
          "Decision supersede command design",
          "Release version changes, commit, tag, push, or publish"
        ],
        "implementationPlan": [
          "Use vertical RED-GREEN cycles for suppression, degraded recovery, source round-trip, context refresh, and task targeting.",
          "Add the adjacent portability, search, and localization regressions after the blocking paths are green.",
          "Update public and managed-agent documentation to match explicit backfill and stale behavior.",
          "Run targeted checks after each slice, then full static, unit, E2E, build, and package verification."
        ],
        "verificationPlan": [
          "Prove each reproduced failure with a public-interface regression before its fix.",
          "Run typecheck, lint, format check, all unit and E2E tests, build, and package dry-run.",
          "Record trace and evaluation, refresh the task Memory Capsule, verify recall, and close the task."
        ]
      },
      "createdAt": "2026-08-12T05:10:34.573Z"
    },
    {
      "id": "EVT-0391",
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "type": "BRIEF_CONFIRMED",
      "payload": {
        "snapshotId": "BRF-0024"
      },
      "createdAt": "2026-08-12T05:10:38.720Z"
    },
    {
      "id": "EVT-0392",
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "type": "TRACE_CREATED",
      "payload": {
        "traceId": "IMPL-0027",
        "filesChanged": [
          "AGENTS.md",
          "CLAUDE.md",
          "README.ko.md",
          "README.md",
          "docs/migration.md",
          "docs/use-cases.md",
          "src/cli.ts",
          "src/commands/v2/index.ts",
          "src/core/v2/context.ts",
          "src/core/v2/decision-workspace.ts",
          "src/core/v2/doctor.ts",
          "src/core/v2/errors.ts",
          "src/core/v2/memory-source.ts",
          "src/core/v2/memory.ts",
          "src/core/v2/rebuild.ts",
          "src/core/v2/recall.ts",
          "src/core/v2/retrospective.ts",
          "src/core/v2/search.ts",
          "src/core/v2/source-store.ts",
          "src/ui/v2/messages.ts",
          "src/ui/v2/render.ts",
          "tests/e2e/v2-memory-cli.test.ts",
          "tests/unit/v2-memory.test.ts",
          "tests/unit/v2-messages.test.ts"
        ]
      },
      "createdAt": "2026-08-12T05:31:34.547Z"
    },
    {
      "id": "EVT-0393",
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "type": "EVALUATION_RECORDED",
      "payload": {
        "evaluationId": "EVAL-0010",
        "traceId": "IMPL-0027"
      },
      "createdAt": "2026-08-12T05:31:42.299Z"
    },
    {
      "id": "EVT-0394",
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
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
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing.md",
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
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-CONTEXT-CURRENT-CANDIDATE-SNAPSHOT.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-CONTEXT-PERSISTENT-UPSERT.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-MEMORY-AGENT-DISTILLATION.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-MEMORY-CAPSULE-BOUNDARY.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-MEMORY-CITED-SOURCE-SUPPRESSION.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-MEMORY-DEFER-COLD-ARCHIVE.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-MEMORY-DEGRADED-READ-RECOVERY.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-MEMORY-EXPLICIT-BACKFILL.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-MEMORY-PORTABLE-SEARCH-LOCALE.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-MEMORY-RECALL-FIRST.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-MIGRATE-061.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-RELEASE-0-6-2.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-RELEASE-READINESS-IS-ARTIFACT-BASED.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/decisions/DEC-SOURCE-CANONICAL-LAST-BLOCK.md",
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
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/implementations/IMPL-0027.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/memories/MEM-0001.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/memories/MEM-0002.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/DECISION_REPORT.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/decision-graph.json"
        ]
      },
      "createdAt": "2026-08-12T05:32:15.374Z"
    },
    {
      "id": "EVT-0395",
      "taskId": "TASK-20260812-harden-memory-capsule-retrieval-recovery-parsing",
      "type": "TASK_CLOSED",
      "payload": {},
      "createdAt": "2026-08-12T05:32:24.062Z"
    }
  ]
}
```
