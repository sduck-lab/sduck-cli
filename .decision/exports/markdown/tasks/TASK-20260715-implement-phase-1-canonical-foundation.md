---
id: TASK-20260715-implement-phase-1-canonical-foundation
type: task
status: ABANDONED
title: Implement Phase 1 canonical foundation
created_at: '2026-07-15T10:46:10.328Z'
updated_at: '2026-07-16T06:05:05.255Z'
---
# TASK-20260715-implement-phase-1-canonical-foundation: Implement Phase 1 canonical foundation

Implement Phase 1 canonical foundation

## Sduck source

```json sduck-source
{
  "task": {
    "id": "TASK-20260715-implement-phase-1-canonical-foundation",
    "title": "Implement Phase 1 canonical foundation",
    "description": "Implement Phase 1 canonical foundation",
    "status": "ABANDONED",
    "expectedScope": [
      "canonical source envelope parse/render/migration",
      "RFC 8785 digest and approval view",
      "local confirm --digest provenance",
      "typed core operations and draft split",
      "unit/e2e compatibility tests",
      "CLI/docs updates"
    ],
    "avoidScope": [
      "idempotency receipts and ULIDs",
      "privacy context behavior",
      "Git-bound verifier",
      "MCP server",
      "runtime agent implementation"
    ],
    "createdAt": "2026-07-15T10:46:10.328Z",
    "updatedAt": "2026-07-16T06:05:05.255Z"
  },
  "questions": [
    {
      "id": "Q-0012",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "decisionId": null,
      "text": "What projection timing and snapshot compatibility invariant should digest confirmation use?",
      "recommendedAnswer": "prepareConfirmation hashes a prospective confirmed projection that maps active DRAFT decisions to CONFIRMED; confirmPreparedBrief regenerates the identical projection under lock, compares its digest, then transitions lifecycle. Existing snapshots retain their diagnostic fields but are marked legacy-unbound with no invented digest/provenance.",
      "rationale": [
        "Decision status is digest-bound but current confirmation promotes status before snapshotting.",
        "Migration must not fabricate approval evidence for history."
      ],
      "options": [
        "Prospective confirmed projection plus legacy-unbound snapshots (recommended)",
        "Digest pre-confirm DRAFT statuses",
        "Another invariant"
      ],
      "answered": true,
      "answer": "Prospective confirmed projection plus legacy-unbound snapshots (recommended)",
      "createdAt": "2026-07-15T10:54:58.159Z"
    },
    {
      "id": "Q-0013",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "decisionId": null,
      "text": "What exact local CLI approval flow should Phase 1 implement?",
      "recommendedAnswer": "sduck prepare-confirmation [--json] returns Approval View V1 plus digest; migrated workspaces reject confirm without --digest; sduck confirm --digest requires a TTY, renders the same Approval View, and asks a final local confirmation. Non-TTY fails with CONFIRMATION_TTY_REQUIRED.",
      "rationale": [
        "A local operator must see the exact digest-bound view.",
        "MCP confirmation is deliberately deferred."
      ],
      "options": [
        "TTY prepare/confirm flow (recommended)",
        "Allow non-TTY confirmation",
        "Another CLI flow"
      ],
      "answered": true,
      "answer": "TTY prepare/confirm flow (recommended)",
      "createdAt": "2026-07-15T10:54:58.159Z"
    },
    {
      "id": "Q-0014",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "decisionId": null,
      "text": "What envelope authority and migration invariant should Phase 1 enforce?",
      "recommendedAnswer": "Envelope JSON is canonical authority; envelope ID/kind/status must match filename/frontmatter/directory metadata; unknown schema or revision fails closed. A dedicated migration operation is idempotent and atomic, blocks normal mutations on every legacy/mixed workspace, and rolls back source/cache/state byte-equivalently on failure.",
      "rationale": [
        "Duplicated Markdown metadata otherwise creates ambiguous identity and source-of-truth rules.",
        "Caller-controlled gate bypass would defeat the absolute migration rule."
      ],
      "options": [
        "Strict envelope authority and atomic migration (recommended)",
        "Envelope wins despite metadata mismatch",
        "Another migration invariant"
      ],
      "answered": true,
      "answer": "Strict envelope authority and atomic migration (recommended)",
      "createdAt": "2026-07-15T10:54:58.159Z"
    },
    {
      "id": "Q-0015",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "decisionId": null,
      "text": "What typed Phase 1 operation boundary should callers use?",
      "recommendedAnswer": "Expose applyDraft(projectRoot, draft), prepareConfirmation(projectRoot, taskId?), and confirmPreparedBrief(projectRoot, { taskId, expectedDigest, provenance }); submitDraft(string) remains parse/validate/apply compatibility. Operations throw typed domain errors; adapters localize/map them. No mutation identity or receipts are accepted until Phase 2.",
      "rationale": [
        "MCP needs typed composition without Commander coupling.",
        "Including Phase 2 identity now would prematurely widen the contract."
      ],
      "options": [
        "Typed Phase 1 operations without receipts (recommended)",
        "Keep string-only core APIs",
        "Another operation boundary"
      ],
      "answered": false,
      "answer": null,
      "createdAt": "2026-07-15T10:54:58.159Z"
    }
  ],
  "evidence": [
    {
      "id": "EVD-0027",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/source-store.ts",
      "summary": "Current parser renders only legacy sduck-source documents and writeSourceBundle rewrites the full source bundle.",
      "confidence": 0.95,
      "createdAt": "2026-07-15T10:51:56.079Z"
    },
    {
      "id": "EVD-0028",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/decision-workspace.ts",
      "summary": "All canonical mutations pass through DecisionWorkspace.mutate, providing the correct absolute legacy gate seam.",
      "confidence": 0.95,
      "createdAt": "2026-07-15T10:51:56.079Z"
    },
    {
      "id": "EVD-0029",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/brief.ts",
      "summary": "Current confirmation has no expected digest or provenance input.",
      "confidence": 0.95,
      "createdAt": "2026-07-15T10:51:56.079Z"
    },
    {
      "id": "EVD-0030",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/draft.ts",
      "summary": "Current submitDraft combines parsing, validation, and mutation in a string-only API.",
      "confidence": 0.95,
      "createdAt": "2026-07-15T10:51:56.079Z"
    },
    {
      "id": "EVD-0031",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "decisionId": null,
      "sourceType": "DECISION_DOC",
      "sourceRef": "docs/design/mcp-control-plane-0.6-contract.md",
      "summary": "Confirmed Phase 1 contract fixes envelope migration, digest confirmation, approval view, and typed operation boundaries.",
      "confidence": 1,
      "createdAt": "2026-07-15T10:51:56.079Z"
    },
    {
      "id": "EVD-0032",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "decisionId": null,
      "sourceType": "USER_ANSWER",
      "sourceRef": "Q-0012",
      "summary": "Prospective confirmed projection plus legacy-unbound snapshots (recommended)",
      "confidence": 1,
      "createdAt": "2026-07-15T12:00:31.750Z"
    },
    {
      "id": "EVD-0033",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "decisionId": null,
      "sourceType": "USER_ANSWER",
      "sourceRef": "Q-0013",
      "summary": "TTY prepare/confirm flow (recommended)",
      "confidence": 1,
      "createdAt": "2026-07-15T12:31:19.103Z"
    },
    {
      "id": "EVD-0034",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "decisionId": null,
      "sourceType": "USER_ANSWER",
      "sourceRef": "Q-0014",
      "summary": "Strict envelope authority and atomic migration (recommended)",
      "confidence": 1,
      "createdAt": "2026-07-16T01:00:42.392Z"
    }
  ],
  "contextItems": [
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
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
      "id": "CTX-0208",
      "createdAt": "2026-07-15T10:46:10.407Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0009",
      "summary": "Decision applies to relevant file docs/design/conversational-workflow.md: Authorize only the 0.6 MCP control plane",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "docs/design/conversational-workflow.md"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-0209",
      "createdAt": "2026-07-15T10:46:10.407Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0010",
      "summary": "Prior decision: Keep 0.7 as an RFC boundary — Current work may define 0.7 interfaces and threat-model constraints, but runtime implementation requires a separately confirmed task after 0.6 pilot evidence.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0210",
      "createdAt": "2026-07-15T10:46:10.407Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
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
      "id": "CTX-0211",
      "createdAt": "2026-07-15T10:46:10.407Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "MEMORY",
      "sourceRef": "v2-workflow-is-primary",
      "summary": "Prior decision: Make v2 the single primary documented workflow — Reorganize public documentation, installed agent rules, and v2 next-step guidance around one canonical flow: init → work → context → grill-me → submit → ask/answer → brief/confirm → implement → trace → remember/recall → close.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0212",
      "createdAt": "2026-07-15T10:46:10.407Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
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
      "id": "CTX-0213",
      "createdAt": "2026-07-15T10:46:10.407Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
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
      "id": "CTX-0214",
      "createdAt": "2026-07-15T10:46:10.407Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
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
      "id": "CTX-0215",
      "createdAt": "2026-07-15T10:46:10.408Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0011",
      "summary": "Prior decision: Require local digest confirmation by default — MCP may prepare a canonical brief, but default confirmation is interactive local sduck confirm --digest; non-human MCP acknowledgement is explicit policy opt-in with provenance.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0216",
      "createdAt": "2026-07-15T10:46:10.408Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0012",
      "summary": "Decision applies to relevant file src/core/v2/context.ts: Make automatic context discovery privacy-first",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "src/core/v2/context.ts"
        ],
        "reason": "matched by appliesTo exact path",
        "score": 1
      },
      "id": "CTX-0217",
      "createdAt": "2026-07-15T10:46:10.408Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
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
      "id": "CTX-0218",
      "createdAt": "2026-07-15T10:46:10.408Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0015",
      "summary": "Prior decision: Which exact versioned projection and digest contract should bind confirmation? — Use canonical JSON v1 plus SHA-256",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0219",
      "createdAt": "2026-07-15T10:46:10.408Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0017",
      "summary": "Prior decision: What canonical idempotency receipt contract should all 0.6 mutations use? — Canonical receipt events",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0220",
      "createdAt": "2026-07-15T10:46:10.408Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
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
      "id": "CTX-0221",
      "createdAt": "2026-07-15T10:46:10.408Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
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
      "id": "CTX-0222",
      "createdAt": "2026-07-15T10:46:10.408Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "MEMORY",
      "sourceRef": "IMPL-0008",
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
      "id": "CTX-0223",
      "createdAt": "2026-07-15T10:46:10.408Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "MEMORY",
      "sourceRef": "IMPL-0009",
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
      "id": "CTX-0224",
      "createdAt": "2026-07-15T10:46:10.408Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
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
      "id": "CTX-0225",
      "createdAt": "2026-07-15T10:46:10.408Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0002",
      "summary": "Decision applies to relevant file tests/e2e/v2-locale-cli.test.ts: Restore coverage through executable coverage, not a lower bar",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "tests/e2e/v2-locale-cli.test.ts"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-0226",
      "createdAt": "2026-07-15T10:46:10.408Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/e2e/v2-phase2c-matrix.test.ts",
      "summary": "File evidence: describe('phase 2c v2 localization matrix', () => {",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "describe('phase 2c v2 localization matrix', () => {",
        "line": 10
      },
      "id": "CTX-0227",
      "createdAt": "2026-07-15T10:46:10.408Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/design/mcp-control-plane-0.6-contract.md",
      "summary": "File evidence: 상태: **CONFIRMED / Phase 0 contract**",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "상태: **CONFIRMED / Phase 0 contract**",
        "line": 3
      },
      "id": "CTX-0228",
      "createdAt": "2026-07-15T10:46:10.408Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/design/conversational-workflow.md",
      "summary": "File evidence: 기록 매체를 CLI JSON 파이프에서 **에이전트 대화**로 옮긴다. 사용자는 평소처럼 에이전트와 대화하고, 결정·질문·답변·확정·트레이스는 MCP 툴 호출의 부산물로 canonical Markdown에 쌓인다. 기존 계약은 유지한다:",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "기록 매체를 CLI JSON 파이프에서 **에이전트 대화**로 옮긴다. 사용자는 평소처럼 에이전트와 대화하고, 결정·질문·답변·확정·트레이스는 MCP 툴 호출의 부산물로 canonical Markdown에 쌓인다. 기존 계약은 유지한다:",
        "line": 9
      },
      "id": "CTX-0229",
      "createdAt": "2026-07-15T10:46:10.408Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/commands/implement.ts",
      "summary": "File evidence: import { formatImplementOutput, resolveImplementContext } from '../core/implement.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { formatImplementOutput, resolveImplementContext } from '../core/implement.js';",
        "line": 2
      },
      "id": "CTX-0230",
      "createdAt": "2026-07-15T10:46:10.408Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/implement.ts",
      "summary": "File evidence: export interface ImplementContext {",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "export interface ImplementContext {",
        "line": 10
      },
      "id": "CTX-0231",
      "createdAt": "2026-07-15T10:46:10.408Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/e2e/v2-locale-cli.test.ts",
      "summary": "File evidence: workspace = await createTempWorkspace('v2-locale-phase2b-');",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "workspace = await createTempWorkspace('v2-locale-phase2b-');",
        "line": 207
      },
      "id": "CTX-0232",
      "createdAt": "2026-07-15T10:46:10.408Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/unit/sdd-core-regression.test.ts",
      "summary": "File evidence: 'implementation quality',",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "'implementation quality',",
        "line": 23
      },
      "id": "CTX-0233",
      "createdAt": "2026-07-15T10:46:10.408Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "DISCOVERY",
      "sourceRef": "AGENTS.md",
      "summary": "File evidence: 1. Run `sduck status` and `sduck context` before implementation.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "1. Run `sduck status` and `sduck context` before implementation.",
        "line": 27
      },
      "id": "CTX-0234",
      "createdAt": "2026-07-15T10:46:10.408Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "DISCOVERY",
      "sourceRef": "CLAUDE.md",
      "summary": "File evidence: 1. Run `sduck status` and `sduck context` before implementation.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "1. Run `sduck status` and `sduck context` before implementation.",
        "line": 21
      },
      "id": "CTX-0235",
      "createdAt": "2026-07-15T10:46:10.408Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/migration.md",
      "summary": "File evidence: ## Canonical source and local cache",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "## Canonical source and local cache",
        "line": 3
      },
      "id": "CTX-0236",
      "createdAt": "2026-07-15T10:46:10.408Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/use-cases.md",
      "summary": "File evidence: - `sduck config locale en|ko`는 user-global v2 표시 설정이며 JSON output과 canonical Markdown artifact를 바꾸지 않는다. Legacy SDD command output은 영어로 유지된다.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "- `sduck config locale en|ko`는 user-global v2 표시 설정이며 JSON output과 canonical Markdown artifact를 바꾸지 않는다. Legacy SDD command output은 영어로 유지된다.",
        "line": 31
      },
      "id": "CTX-0237",
      "createdAt": "2026-07-15T10:46:10.408Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "DISCOVERY",
      "sourceRef": "README.ko.md",
      "summary": "File evidence: - locale은 tracked project file, `.decision/policy.json`, canonical Markdown export, JSON output, 설치되는 agent-rule template을 바꾸지 않습니다.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "- locale은 tracked project file, `.decision/policy.json`, canonical Markdown export, JSON output, 설치되는 agent-rule template을 바꾸지 않습니다.",
        "line": 36
      },
      "id": "CTX-0238",
      "createdAt": "2026-07-15T10:46:10.409Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
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
      "id": "CTX-0239",
      "createdAt": "2026-07-15T10:46:10.409Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/v2/context.ts",
      "summary": "File evidence: const canonicalTask = bundle.tasks.find((item) => item.id === task.id);",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "const canonicalTask = bundle.tasks.find((item) => item.id === task.id);",
        "line": 95
      },
      "id": "CTX-0240",
      "createdAt": "2026-07-15T10:46:10.409Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/v2/decision-workspace.ts",
      "summary": "File evidence: sourceImplementationsDir,",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "sourceImplementationsDir,",
        "line": 11
      },
      "id": "CTX-0241",
      "createdAt": "2026-07-15T10:46:10.409Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/ui/v2/messages.ts",
      "summary": "File evidence: implementationTraces: string;",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "implementationTraces: string;",
        "line": 84
      },
      "id": "CTX-0242",
      "createdAt": "2026-07-15T10:46:10.409Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/fixtures/brief-digest/v1/unicode-projection.canonical.json",
      "summary": "Path appears relevant to: Implement Phase 1 canonical foundation",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false
      },
      "id": "CTX-0243",
      "createdAt": "2026-07-15T10:46:10.409Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/fixtures/source-envelope/v1/decision-envelope.contract.json",
      "summary": "File evidence: \"runtimeSupport\": \"phase-1\",",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "\"runtimeSupport\": \"phase-1\",",
        "line": 4
      },
      "id": "CTX-0244",
      "createdAt": "2026-07-15T10:46:10.409Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/fixtures/source-envelope/v1/task-envelope.contract.json",
      "summary": "File evidence: \"runtimeSupport\": \"phase-1\",",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "\"runtimeSupport\": \"phase-1\",",
        "line": 4
      },
      "id": "CTX-0245",
      "createdAt": "2026-07-15T10:46:10.409Z"
    },
    {
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/unit/v2-contract-fixtures.test.ts",
      "summary": "File evidence: function canonicalize(value: unknown): string {",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "function canonicalize(value: unknown): string {",
        "line": 117
      },
      "id": "CTX-0246",
      "createdAt": "2026-07-15T10:46:10.409Z"
    }
  ],
  "briefSnapshots": [],
  "events": [
    {
      "id": "EVT-0114",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "type": "TASK_CREATED",
      "payload": {
        "description": "Implement Phase 1 canonical foundation",
        "policy": {
          "grillMeRequired": false
        }
      },
      "createdAt": "2026-07-15T10:46:10.329Z"
    },
    {
      "id": "EVT-0115",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "type": "CONTEXT_INDEXED",
      "payload": {
        "itemCount": 39
      },
      "createdAt": "2026-07-15T10:46:10.409Z"
    },
    {
      "id": "EVT-0116",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
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
      "createdAt": "2026-07-15T10:46:10.957Z"
    },
    {
      "id": "EVT-0117",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0031"
      },
      "createdAt": "2026-07-15T10:51:56.080Z"
    },
    {
      "id": "EVT-0118",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0032"
      },
      "createdAt": "2026-07-15T10:51:56.080Z"
    },
    {
      "id": "EVT-0119",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0033"
      },
      "createdAt": "2026-07-15T10:51:56.080Z"
    },
    {
      "id": "EVT-0120",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0034"
      },
      "createdAt": "2026-07-15T10:51:56.080Z"
    },
    {
      "id": "EVT-0121",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 4,
        "questions": 0,
        "evidence": 5,
        "expectedScope": [
          "canonical source envelope parse/render/migration",
          "RFC 8785 digest and approval view",
          "local confirm --digest provenance",
          "typed core operations and draft split",
          "unit/e2e compatibility tests",
          "CLI/docs updates"
        ],
        "avoidScope": [
          "idempotency receipts and ULIDs",
          "privacy context behavior",
          "Git-bound verifier",
          "MCP server",
          "runtime agent implementation"
        ]
      },
      "createdAt": "2026-07-15T10:51:56.080Z"
    },
    {
      "id": "EVT-0122",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 0,
        "questions": 4,
        "evidence": 0,
        "expectedScope": [
          "canonical source envelope parse/render/migration",
          "RFC 8785 digest and approval view",
          "local confirm --digest provenance",
          "typed core operations and draft split",
          "unit/e2e compatibility tests",
          "CLI/docs updates"
        ],
        "avoidScope": [
          "idempotency receipts and ULIDs",
          "privacy context behavior",
          "Git-bound verifier",
          "MCP server",
          "runtime agent implementation"
        ]
      },
      "createdAt": "2026-07-15T10:54:58.160Z"
    },
    {
      "id": "EVT-0123",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0035"
      },
      "createdAt": "2026-07-15T12:00:31.751Z"
    },
    {
      "id": "EVT-0124",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "type": "QUESTION_ANSWERED",
      "payload": {
        "questionId": "Q-0012",
        "answer": "Prospective confirmed projection plus legacy-unbound snapshots (recommended)"
      },
      "createdAt": "2026-07-15T12:00:31.751Z"
    },
    {
      "id": "EVT-0125",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0036"
      },
      "createdAt": "2026-07-15T12:31:19.104Z"
    },
    {
      "id": "EVT-0126",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "type": "QUESTION_ANSWERED",
      "payload": {
        "questionId": "Q-0013",
        "answer": "TTY prepare/confirm flow (recommended)"
      },
      "createdAt": "2026-07-15T12:31:19.104Z"
    },
    {
      "id": "EVT-0127",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0037"
      },
      "createdAt": "2026-07-16T01:00:42.393Z"
    },
    {
      "id": "EVT-0128",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "type": "QUESTION_ANSWERED",
      "payload": {
        "questionId": "Q-0014",
        "answer": "Strict envelope authority and atomic migration (recommended)"
      },
      "createdAt": "2026-07-16T01:00:42.393Z"
    },
    {
      "id": "EVT-0129",
      "taskId": "TASK-20260715-implement-phase-1-canonical-foundation",
      "type": "TASK_ABANDONED",
      "payload": {},
      "createdAt": "2026-07-16T06:05:05.255Z"
    }
  ]
}
```
