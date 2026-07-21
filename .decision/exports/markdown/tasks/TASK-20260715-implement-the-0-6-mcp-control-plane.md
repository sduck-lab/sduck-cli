---
id: TASK-20260715-implement-the-0-6-mcp-control-plane
type: task
status: CLOSED
title: Implement the 0.6 MCP control plane
created_at: '2026-07-15T06:56:44.449Z'
updated_at: '2026-07-15T09:28:13.810Z'
---
# TASK-20260715-implement-the-0-6-mcp-control-plane: Implement the 0.6 MCP control plane

Implement the 0.6 MCP control plane

## Sduck source

```json sduck-source
{
  "task": {
    "id": "TASK-20260715-implement-the-0-6-mcp-control-plane",
    "title": "Implement the 0.6 MCP control plane",
    "description": "Implement the 0.6 MCP control plane",
    "status": "CLOSED",
    "expectedScope": [
      "0.6a canonical schema, typed operations, digest, provenance, and idempotency",
      "0.6b privacy-safe context and sduck verify",
      "0.6c stdio MCP adapter and protocol E2E",
      "0.6d optional advisory integration, docs supersession, and release smoke checks",
      "0.7 RFC interfaces and threat model only"
    ],
    "avoidScope": [
      "0.7 agent or execution implementation",
      "remote execution",
      "messaging/scheduling",
      "general personal-agent capabilities",
      "security claims based on hooks or MCP permission dialogs"
    ],
    "createdAt": "2026-07-15T06:56:44.449Z",
    "updatedAt": "2026-07-15T09:28:13.810Z"
  },
  "questions": [
    {
      "id": "Q-0001",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "text": "Which exact versioned projection and digest contract should bind confirmation?",
      "recommendedAnswer": "Use sduck-brief-digest/v1 canonical UTF-8 JSON with stable key/entity order and SHA-256; include approval-relevant decisions, answers, evidence, and scope; exclude rendering and timestamps.",
      "rationale": [
        "Rendered Markdown changes for presentation-only reasons.",
        "A versioned projection makes evolution explicit."
      ],
      "options": [
        "Use canonical JSON v1 plus SHA-256",
        "Use another digest contract"
      ],
      "answered": true,
      "answer": "Use canonical JSON v1 plus SHA-256",
      "createdAt": "2026-07-15T06:58:44.026Z"
    },
    {
      "id": "Q-0002",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "text": "What stale-confirmation revision token should 0.6 use in addition to the brief digest?",
      "recommendedAnswer": "Use the brief digest as the sole optimistic revision token; retain event IDs only as provenance.",
      "rationale": [
        "A complete digest already binds every approval-relevant change."
      ],
      "options": [
        "Digest only",
        "Digest plus last event ID",
        "Another revision model"
      ],
      "answered": true,
      "answer": "Digest only",
      "createdAt": "2026-07-15T06:58:44.026Z"
    },
    {
      "id": "Q-0003",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "text": "What canonical idempotency receipt contract should all 0.6 mutations use?",
      "recommendedAnswer": "Persist a successful-operation receipt event containing clientId, clientRequestId, operation, request hash, task ID, and result entity references; changed payload returns IDEMPOTENCY_CONFLICT.",
      "rationale": [
        "MCP clients retry after lost responses.",
        "SQLite-only receipts do not survive rebuild."
      ],
      "options": [
        "Canonical receipt events",
        "Cache-only receipts",
        "Another receipt model"
      ],
      "answered": true,
      "answer": "Canonical receipt events",
      "createdAt": "2026-07-15T06:58:44.026Z"
    },
    {
      "id": "Q-0004",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "text": "What source-schema migration policy should apply to 0.6 canonical records?",
      "recommendedAnswer": "Add a versioned source envelope; accept old records, write latest additive schema, reject future schemas safely, and require explicit doctor migration for destructive changes.",
      "rationale": [
        "Canonical Markdown must remain portable across CLI versions."
      ],
      "options": [
        "Versioned additive envelope",
        "Implicit optional fields only",
        "Another migration policy"
      ],
      "answered": true,
      "answer": "Versioned additive envelope",
      "createdAt": "2026-07-15T06:58:44.026Z"
    },
    {
      "id": "Q-0005",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "text": "What trace data and CI semantics should sduck verify require?",
      "recommendedAnswer": "Trace brief digest, merge-base baseline, target tree or commit, per-file status and content hash; verify coverage with defined rename, deletion, binary, shallow-clone, JSON, and exit-code behavior.",
      "rationale": [
        "Path-only traces cannot prove correspondence to the current PR diff."
      ],
      "options": [
        "Bind trace to Git and brief digest",
        "Keep path-only traces",
        "Another verifier contract"
      ],
      "answered": true,
      "answer": "Bind trace to Git and brief digest",
      "createdAt": "2026-07-15T06:58:44.026Z"
    },
    {
      "id": "Q-0006",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "text": "What exact BriefDigestProjectionV1 and canonical serializer should sduck use?",
      "recommendedAnswer": "Use a versioned projection serialized with RFC 8785 JSON Canonicalization Scheme then SHA-256. Include task ID/title/description and scope; decisions sorted by ID with ID, kind, status, title, summary, rationale, appliesTo and avoids; questions sorted by ID with text and normalized answer; evidence sorted by ID with source type/ref/summary; exclude timestamps, rendering, generated snapshot IDs, and confidence. Preserve declared order inside rationale/scope arrays. Publish a fixed Unicode test vector.",
      "rationale": [
        "The current wording leaves serialization and approval-relevant fields ambiguous.",
        "RFC 8785 provides a portable canonical JSON contract."
      ],
      "options": [
        "RFC 8785 projection v1 (recommended)",
        "Project-specific stable serializer",
        "Another digest contract"
      ],
      "answered": true,
      "answer": "RFC 8785 projection v1 (recommended)",
      "createdAt": "2026-07-15T07:52:35.849Z"
    },
    {
      "id": "Q-0007",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "text": "How should 0.6 migrate legacy canonical source without rewriting history unexpectedly?",
      "recommendedAnswer": "Read both legacy and envelope records; require explicit atomic doctor migration before any mutation that needs envelope fields; preserve legacy records for read-only operations; write a clear migration diff and never silently rewrite untouched history.",
      "rationale": [
        "Current full-bundle rendering could otherwise churn every tracked source document on the first mutation."
      ],
      "options": [
        "Explicit atomic migration (recommended)",
        "Automatic workspace migration",
        "Dirty-document mixed migration",
        "Another migration behavior"
      ],
      "answered": true,
      "answer": "Explicit atomic migration (recommended)",
      "createdAt": "2026-07-15T07:52:35.849Z"
    },
    {
      "id": "Q-0008",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "text": "What exact idempotency and protocol entity-ID algorithm should 0.6 use?",
      "recommendedAnswer": "Inside the workspace lock, first look up identity (clientId, clientRequestId, operation) and canonical request hash. Same hash returns stored entity refs even after terminal status; changed hash returns IDEMPOTENCY_CONFLICT; only successful commits record receipts. CLI calls without identity retain legacy semantics. Protocol-created entities use prefixed ULIDs while legacy sequential IDs remain readable.",
      "rationale": [
        "The receipt decision needs lookup, retention, retry, and collision rules.",
        "Sequential maxima collide across independent branches."
      ],
      "options": [
        "Canonical receipts plus prefixed ULIDs (recommended)",
        "Canonical receipts plus UUIDv7",
        "Keep sequential entity IDs",
        "Another algorithm"
      ],
      "answered": true,
      "answer": "Canonical receipts plus prefixed ULIDs (recommended)",
      "createdAt": "2026-07-15T07:52:35.849Z"
    },
    {
      "id": "Q-0009",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "text": "What exact Git-bound trace and sduck verify algorithm should 0.6 use?",
      "recommendedAnswer": "In CI, resolve merge-base(base, HEAD), require clean HEAD mode, and compare base...HEAD name-status changes with trace manifests bound to the confirmed brief digest. Each manifest stores base commit, trace HEAD, per-file status, old path for rename, and SHA-256 content hash or null for deletion. Multiple matching task traces may cover the union; unmatched changes fail. Emit stable JSON and documented exit codes; fail closed on shallow history unless base is fetchable.",
      "rationale": [
        "Stored fields alone do not define whether a current PR is covered by a trace."
      ],
      "options": [
        "Merge-base CI verifier (recommended)",
        "Direct base diff verifier",
        "Another verifier algorithm"
      ],
      "answered": true,
      "answer": "Merge-base CI verifier (recommended)",
      "createdAt": "2026-07-15T07:52:35.849Z"
    },
    {
      "id": "Q-0010",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "text": "Should 0.6 expose a state-changing MCP confirm operation?",
      "recommendedAnswer": "No. Expose read-only prepare_confirmation only; default state change is interactive local sduck confirm --digest. Defer MCP acknowledgement confirmation until a client-independent interaction mechanism exists.",
      "rationale": [
        "The default policy requires local operator acknowledgement and MCP prompts are not a trustworthy approval boundary."
      ],
      "options": [
        "Omit MCP confirm in 0.6 (recommended)",
        "Add opt-in MCP acknowledgement",
        "Another surface"
      ],
      "answered": true,
      "answer": "Omit MCP confirm in 0.6 (recommended)",
      "createdAt": "2026-07-15T07:52:35.849Z"
    },
    {
      "id": "Q-0011",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "text": "What may refresh_context persist automatically in 0.6?",
      "recommendedAnswer": "refresh_context is an idempotent mutation that stores only tracked-file path, repository-relative range or metadata, and SHA-256 content hash within configured bounds. It writes no automatic summaries or excerpts; explicit record/add_context submits curated summaries and untracked references.",
      "rationale": [
        "A tool cannot create a trustworthy curated summary without an explicit actor submission.",
        "Separating references from model-facing summaries limits data exposure."
      ],
      "options": [
        "References and hashes only (recommended)",
        "Automatic curated summaries",
        "Another persistence policy"
      ],
      "answered": true,
      "answer": "References and hashes only (recommended)",
      "createdAt": "2026-07-15T07:52:35.849Z"
    }
  ],
  "evidence": [
    {
      "id": "EVD-0004",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/task-lifecycle.ts",
      "summary": "Confirmation blocks unanswered questions and OPEN or CONFLICT decisions, so unresolved architecture must be represented in canonical task data.",
      "confidence": 0.95,
      "createdAt": "2026-07-15T06:58:56.974Z"
    },
    {
      "id": "EVD-0005",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/draft.ts",
      "summary": "Draft submission appends new entities and has no amendment or supersession operation.",
      "confidence": 0.95,
      "createdAt": "2026-07-15T06:58:56.974Z"
    },
    {
      "id": "EVD-0006",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/brief.ts",
      "summary": "Current confirmation accepts no expected digest or structured provenance.",
      "confidence": 0.95,
      "createdAt": "2026-07-15T06:58:56.974Z"
    },
    {
      "id": "EVD-0007",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/trace.ts",
      "summary": "Current traces do not bind file mappings to a target Git tree or confirmation digest.",
      "confidence": 0.95,
      "createdAt": "2026-07-15T06:58:56.974Z"
    },
    {
      "id": "EVD-0008",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/context.ts",
      "summary": "Current indexing samples tracked and untracked files and persists content excerpts, requiring privacy changes before MCP context exposure.",
      "confidence": 0.95,
      "createdAt": "2026-07-15T06:58:56.974Z"
    },
    {
      "id": "EVD-0009",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "sourceType": "DECISION_DOC",
      "sourceRef": "docs/design/conversational-workflow.md",
      "summary": "Sections 4.3 and 5.3 conflict with the reviewed digest-confirmation and canonical-record guard direction.",
      "confidence": 0.95,
      "createdAt": "2026-07-15T06:58:56.974Z"
    },
    {
      "id": "EVD-0010",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "sourceType": "USER_ANSWER",
      "sourceRef": "Q-0001",
      "summary": "Use canonical JSON v1 plus SHA-256",
      "confidence": 1,
      "createdAt": "2026-07-15T07:13:24.635Z"
    },
    {
      "id": "EVD-0011",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "sourceType": "USER_ANSWER",
      "sourceRef": "Q-0002",
      "summary": "Digest only",
      "confidence": 1,
      "createdAt": "2026-07-15T07:14:05.559Z"
    },
    {
      "id": "EVD-0012",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "sourceType": "USER_ANSWER",
      "sourceRef": "Q-0003",
      "summary": "Canonical receipt events",
      "confidence": 1,
      "createdAt": "2026-07-15T07:14:38.914Z"
    },
    {
      "id": "EVD-0013",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "sourceType": "USER_ANSWER",
      "sourceRef": "Q-0004",
      "summary": "Versioned additive envelope",
      "confidence": 1,
      "createdAt": "2026-07-15T07:15:59.909Z"
    },
    {
      "id": "EVD-0014",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "sourceType": "USER_ANSWER",
      "sourceRef": "Q-0005",
      "summary": "Bind trace to Git and brief digest",
      "confidence": 1,
      "createdAt": "2026-07-15T07:48:37.885Z"
    },
    {
      "id": "EVD-0015",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "sourceType": "USER_ANSWER",
      "sourceRef": "Q-0006",
      "summary": "RFC 8785 projection v1 (recommended)",
      "confidence": 1,
      "createdAt": "2026-07-15T08:09:36.381Z"
    },
    {
      "id": "EVD-0016",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "sourceType": "USER_ANSWER",
      "sourceRef": "Q-0007",
      "summary": "Explicit atomic migration (recommended)",
      "confidence": 1,
      "createdAt": "2026-07-15T08:10:13.862Z"
    },
    {
      "id": "EVD-0017",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "sourceType": "USER_ANSWER",
      "sourceRef": "Q-0008",
      "summary": "Canonical receipts plus prefixed ULIDs (recommended)",
      "confidence": 1,
      "createdAt": "2026-07-15T08:10:48.663Z"
    },
    {
      "id": "EVD-0018",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "sourceType": "USER_ANSWER",
      "sourceRef": "Q-0009",
      "summary": "Merge-base CI verifier (recommended)",
      "confidence": 1,
      "createdAt": "2026-07-15T08:19:09.350Z"
    },
    {
      "id": "EVD-0019",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "sourceType": "USER_ANSWER",
      "sourceRef": "Q-0010",
      "summary": "Omit MCP confirm in 0.6 (recommended)",
      "confidence": 1,
      "createdAt": "2026-07-15T08:20:10.645Z"
    },
    {
      "id": "EVD-0020",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "decisionId": null,
      "sourceType": "USER_ANSWER",
      "sourceRef": "Q-0011",
      "summary": "References and hashes only (recommended)",
      "confidence": 1,
      "createdAt": "2026-07-15T09:07:26.906Z"
    }
  ],
  "contextItems": [
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "sourceType": "MEMORY",
      "sourceRef": "v2-workflow-is-primary",
      "summary": "Prior decision: Make v2 the single primary documented workflow — Reorganize public documentation, installed agent rules, and v2 next-step guidance around one canonical flow: init → work → context → grill-me → submit → ask/answer → brief/confirm → implement → trace → remember/recall → close.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0119",
      "createdAt": "2026-07-15T06:56:44.518Z"
    },
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
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
      "id": "CTX-0120",
      "createdAt": "2026-07-15T06:56:44.519Z"
    },
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
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
      "id": "CTX-0121",
      "createdAt": "2026-07-15T06:56:44.519Z"
    },
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0003",
      "summary": "Prior decision: Clear commit-hook Git variables before validation commands — Keep lint-staged on the commit index, then clear Git local environment variables before typecheck and test commands so nested fixture repositories use their own Git metadata.",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0122",
      "createdAt": "2026-07-15T06:56:44.519Z"
    },
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "sourceType": "MEMORY",
      "sourceRef": "english-default-korean-v2-locale",
      "summary": "Prior decision: Default to English and offer a global Korean v2 locale — Use English as the default for CLI output and documentation, publish a Korean README, and provide a user-global locale preference for Korean v2 CLI output; v1 is not localized or redesigned.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0123",
      "createdAt": "2026-07-15T06:56:44.519Z"
    },
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "sourceType": "MEMORY",
      "sourceRef": "global-locale-config-shape",
      "summary": "Prior decision: Use an XDG-compatible global locale configuration — Add `sduck config locale en|ko`, persisting the preference in a user-global XDG-compatible config location with English fallback; preserve it independently of project initialization.",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0124",
      "createdAt": "2026-07-15T06:56:44.519Z"
    },
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
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
      "id": "CTX-0125",
      "createdAt": "2026-07-15T06:56:44.519Z"
    },
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
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
      "id": "CTX-0126",
      "createdAt": "2026-07-15T06:56:44.519Z"
    },
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/unit/v2-core.test.ts",
      "summary": "File evidence: expect(contextPack.grillMePrompt).toContain('Interview the user relentlessly');",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "expect(contextPack.grillMePrompt).toContain('Interview the user relentlessly');",
        "line": 70
      },
      "id": "CTX-0127",
      "createdAt": "2026-07-15T06:56:44.519Z"
    },
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "sourceType": "DISCOVERY",
      "sourceRef": ".backup/AGENT.md",
      "summary": "File evidence: - Follow the repository SDD workflow exactly.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "- Follow the repository SDD workflow exactly.",
        "line": 22
      },
      "id": "CTX-0128",
      "createdAt": "2026-07-15T06:56:44.519Z"
    },
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "sourceType": "DISCOVERY",
      "sourceRef": ".backup/CLAUDE.md",
      "summary": "File evidence: - Follow the repository SDD workflow exactly.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "- Follow the repository SDD workflow exactly.",
        "line": 9
      },
      "id": "CTX-0129",
      "createdAt": "2026-07-15T06:56:44.519Z"
    },
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
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
      "id": "CTX-0130",
      "createdAt": "2026-07-15T06:56:44.519Z"
    },
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
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
      "id": "CTX-0131",
      "createdAt": "2026-07-15T06:56:44.519Z"
    },
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/agents/triage-labels.md",
      "summary": "File evidence: Use the repository's issue labels directly. Do not infer labels from an external skill pack or older agent vocabulary.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "Use the repository's issue labels directly. Do not infer labels from an external skill pack or older agent vocabulary.",
        "line": 3
      },
      "id": "CTX-0132",
      "createdAt": "2026-07-15T06:56:44.519Z"
    },
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
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
      "id": "CTX-0133",
      "createdAt": "2026-07-15T06:56:44.519Z"
    },
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
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
      "id": "CTX-0134",
      "createdAt": "2026-07-15T06:56:44.519Z"
    },
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "sourceType": "DISCOVERY",
      "sourceRef": "README.ko.md",
      "summary": "File evidence: 여기서 “구현”은 `sduck confirm` 이후의 개발 활동을 뜻합니다. legacy `sduck implement` 명령을 실행하라는 의미가 아닙니다.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "여기서 “구현”은 `sduck confirm` 이후의 개발 활동을 뜻합니다. legacy `sduck implement` 명령을 실행하라는 의미가 아닙니다.",
        "line": 80
      },
      "id": "CTX-0135",
      "createdAt": "2026-07-15T06:56:44.519Z"
    },
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
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
      "id": "CTX-0136",
      "createdAt": "2026-07-15T06:56:44.519Z"
    },
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/cli.ts",
      "summary": "File evidence: import { runImplementCommand } from './commands/implement.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { runImplementCommand } from './commands/implement.js';",
        "line": 10
      },
      "id": "CTX-0137",
      "createdAt": "2026-07-15T06:56:44.519Z"
    },
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/v2/cache-bundle.ts",
      "summary": "File evidence: ImplementationTrace,",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "ImplementationTrace,",
        "line": 10
      },
      "id": "CTX-0138",
      "createdAt": "2026-07-15T06:56:44.519Z"
    },
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/v2/git-diff.ts",
      "summary": "File evidence: const NON_IMPLEMENTATION_PREFIXES = [",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "const NON_IMPLEMENTATION_PREFIXES = [",
        "line": 8
      },
      "id": "CTX-0139",
      "createdAt": "2026-07-15T06:56:44.519Z"
    },
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
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
      "id": "CTX-0140",
      "createdAt": "2026-07-15T06:56:44.519Z"
    },
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/e2e/v2-cli.test.ts",
      "summary": "File evidence: expect(context.stdout).toContain('Interview the user relentlessly');",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "expect(context.stdout).toContain('Interview the user relentlessly');",
        "line": 83
      },
      "id": "CTX-0141",
      "createdAt": "2026-07-15T06:56:44.519Z"
    },
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/e2e/v2-locale-cli.test.ts",
      "summary": "File evidence: it('persists locale across processes outside the workspace and localizes v2 help/status', async () => {",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "it('persists locale across processes outside the workspace and localizes v2 help/status', async () => {",
        "line": 22
      },
      "id": "CTX-0142",
      "createdAt": "2026-07-15T06:56:44.519Z"
    },
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/e2e/v2-phase2c-matrix.test.ts",
      "summary": "File evidence: { args: ['init'], en: 'Initialize the v2', ko: '초기화합니다' },",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "{ args: ['init'], en: 'Initialize the v2', ko: '초기화합니다' },",
        "line": 28
      },
      "id": "CTX-0143",
      "createdAt": "2026-07-15T06:56:44.519Z"
    },
    {
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
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
      "id": "CTX-0144",
      "createdAt": "2026-07-15T06:56:44.519Z"
    }
  ],
  "briefSnapshots": [
    {
      "id": "BRF-0005",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "snapshot": {
        "task": {
          "id": "TASK-20260715-implement-the-0-6-mcp-control-plane",
          "title": "Implement the 0.6 MCP control plane",
          "description": "Implement the 0.6 MCP control plane",
          "status": "CONFIRMED",
          "expectedScope": [
            "0.6a canonical schema, typed operations, digest, provenance, and idempotency",
            "0.6b privacy-safe context and sduck verify",
            "0.6c stdio MCP adapter and protocol E2E",
            "0.6d optional advisory integration, docs supersession, and release smoke checks",
            "0.7 RFC interfaces and threat model only"
          ],
          "avoidScope": [
            "0.7 agent or execution implementation",
            "remote execution",
            "messaging/scheduling",
            "general personal-agent capabilities",
            "security claims based on hooks or MCP permission dialogs"
          ],
          "createdAt": "2026-07-15T06:56:44.449Z",
          "updatedAt": "2026-07-15T09:18:26.414Z"
        },
        "decisions": {
          "EXPLICIT": [
            {
              "id": "DEC-0009",
              "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
              "title": "Authorize only the 0.6 MCP control plane",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "This task implements 0.6a–0.6d only; it does not implement a sduck-owned coding runtime.",
              "rationale": [
                "The prior task mixed unresolved 0.7 runtime architecture with 0.6 implementation authorization."
              ],
              "appliesTo": [
                "src/core/v2/**",
                "src/mcp/**",
                "src/commands/**",
                "src/cli.ts",
                "tests/**",
                "docs/**"
              ],
              "avoids": [
                "src/agent/** implementation",
                "src/execution/** implementation",
                "model-provider integration"
              ],
              "sourceRefs": [
                ".slim/deepwork/sduck-coding-agent.md"
              ],
              "createdAt": "2026-07-15T06:58:44.026Z",
              "updatedAt": "2026-07-15T09:18:26.414Z"
            },
            {
              "id": "DEC-0010",
              "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
              "title": "Keep 0.7 as an RFC boundary",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Current work may define 0.7 interfaces and threat-model constraints, but runtime implementation requires a separately confirmed task after 0.6 pilot evidence.",
              "rationale": [
                "Provider and execution-backend choices remain consequential and unvalidated."
              ],
              "appliesTo": [
                "0.7 RFC documentation"
              ],
              "avoids": [
                "runtime implementation authorization"
              ],
              "sourceRefs": [
                ".slim/deepwork/sduck-coding-agent.md"
              ],
              "createdAt": "2026-07-15T06:58:44.026Z",
              "updatedAt": "2026-07-15T09:18:26.414Z"
            },
            {
              "id": "DEC-0011",
              "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
              "title": "Require local digest confirmation by default",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "MCP may prepare a canonical brief, but default confirmation is interactive local sduck confirm --digest; non-human MCP acknowledgement is explicit policy opt-in with provenance.",
              "rationale": [
                "MCP annotations and client permission dialogs do not prove human review."
              ],
              "appliesTo": [
                "confirmation operation",
                "policy",
                "MCP tools",
                "CI verifier"
              ],
              "avoids": [
                "treating client permission prompts as human-approval proof"
              ],
              "sourceRefs": [
                "docs/design/conversational-workflow.md",
                ".slim/deepwork/sduck-coding-agent.md"
              ],
              "createdAt": "2026-07-15T06:58:44.026Z",
              "updatedAt": "2026-07-15T09:18:26.414Z"
            },
            {
              "id": "DEC-0012",
              "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
              "title": "Make automatic context discovery privacy-first",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Automatic discovery considers tracked regular files only; untracked paths require explicit addition, symlink escapes are rejected, and canonical records store references, hashes, and curated summaries.",
              "rationale": [
                "Current discovery recorded noisy IDE and archived paths.",
                "MCP responses may expose context to a model."
              ],
              "appliesTo": [
                "src/core/v2/context.ts",
                "policy",
                "MCP context tools"
              ],
              "avoids": [
                "automatic sampling of untracked or external symlink content"
              ],
              "sourceRefs": [
                "src/core/v2/context.ts"
              ],
              "createdAt": "2026-07-15T06:58:44.026Z",
              "updatedAt": "2026-07-15T09:18:26.414Z"
            },
            {
              "id": "DEC-0013",
              "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
              "title": "Separate context reads from refresh mutations",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "get_context is read-only; refresh_context is a separately named idempotent mutation. Task creation does not include expensive indexing.",
              "rationale": [
                "Read-only MCP annotations must match behavior.",
                "Scanning under writer lock creates partial-operation and contention risks."
              ],
              "appliesTo": [
                "core operations",
                "MCP tools",
                "context indexing"
              ],
              "avoids": [
                "read tools that mutate canonical context"
              ],
              "sourceRefs": [
                "src/core/v2/context.ts",
                "src/core/v2/decision-workspace.ts"
              ],
              "createdAt": "2026-07-15T06:58:44.026Z",
              "updatedAt": "2026-07-15T09:18:26.414Z"
            },
            {
              "id": "DEC-0014",
              "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
              "title": "Supersede conflicting conversational-workflow proposals",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "The final 0.6 design marks conversational-workflow sections 4.3 and 5.3 superseded by digest-based local confirmation and canonical-record guard lookup.",
              "rationale": [
                "The prior proposal treats a client permission prompt as approval and caches status in ignored state, both rejected by review."
              ],
              "appliesTo": [
                "docs/design/conversational-workflow.md",
                "decision references"
              ],
              "avoids": [
                "ambiguous recall of conflicting designs"
              ],
              "sourceRefs": [
                "docs/design/conversational-workflow.md",
                ".slim/deepwork/sduck-coding-agent.md"
              ],
              "createdAt": "2026-07-15T06:58:44.026Z",
              "updatedAt": "2026-07-15T09:18:26.414Z"
            },
            {
              "id": "DEC-0015",
              "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
              "title": "Which exact versioned projection and digest contract should bind confirmation?",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Use canonical JSON v1 plus SHA-256",
              "rationale": [
                "User answered Q-0001."
              ],
              "appliesTo": [],
              "avoids": [],
              "sourceRefs": [
                "USER_ANSWER:Q-0001",
                "EVD-0010"
              ],
              "createdAt": "2026-07-15T07:13:24.635Z",
              "updatedAt": "2026-07-15T07:13:24.635Z"
            },
            {
              "id": "DEC-0016",
              "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
              "title": "What stale-confirmation revision token should 0.6 use in addition to the brief digest?",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Digest only",
              "rationale": [
                "User answered Q-0002."
              ],
              "appliesTo": [],
              "avoids": [],
              "sourceRefs": [
                "USER_ANSWER:Q-0002",
                "EVD-0011"
              ],
              "createdAt": "2026-07-15T07:14:05.559Z",
              "updatedAt": "2026-07-15T07:14:05.559Z"
            },
            {
              "id": "DEC-0017",
              "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
              "title": "What canonical idempotency receipt contract should all 0.6 mutations use?",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Canonical receipt events",
              "rationale": [
                "User answered Q-0003."
              ],
              "appliesTo": [],
              "avoids": [],
              "sourceRefs": [
                "USER_ANSWER:Q-0003",
                "EVD-0012"
              ],
              "createdAt": "2026-07-15T07:14:38.914Z",
              "updatedAt": "2026-07-15T07:14:38.914Z"
            },
            {
              "id": "DEC-0018",
              "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
              "title": "What source-schema migration policy should apply to 0.6 canonical records?",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Versioned additive envelope",
              "rationale": [
                "User answered Q-0004."
              ],
              "appliesTo": [],
              "avoids": [],
              "sourceRefs": [
                "USER_ANSWER:Q-0004",
                "EVD-0013"
              ],
              "createdAt": "2026-07-15T07:15:59.909Z",
              "updatedAt": "2026-07-15T07:15:59.909Z"
            },
            {
              "id": "DEC-0019",
              "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
              "title": "What trace data and CI semantics should sduck verify require?",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Bind trace to Git and brief digest",
              "rationale": [
                "User answered Q-0005."
              ],
              "appliesTo": [],
              "avoids": [],
              "sourceRefs": [
                "USER_ANSWER:Q-0005",
                "EVD-0014"
              ],
              "createdAt": "2026-07-15T07:48:37.885Z",
              "updatedAt": "2026-07-15T07:48:37.885Z"
            },
            {
              "id": "DEC-0020",
              "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
              "title": "What exact BriefDigestProjectionV1 and canonical serializer should sduck use?",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "RFC 8785 projection v1 (recommended)",
              "rationale": [
                "User answered Q-0006."
              ],
              "appliesTo": [],
              "avoids": [],
              "sourceRefs": [
                "USER_ANSWER:Q-0006",
                "EVD-0015"
              ],
              "createdAt": "2026-07-15T08:09:36.381Z",
              "updatedAt": "2026-07-15T08:09:36.381Z"
            },
            {
              "id": "DEC-0021",
              "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
              "title": "How should 0.6 migrate legacy canonical source without rewriting history unexpectedly?",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Explicit atomic migration (recommended)",
              "rationale": [
                "User answered Q-0007."
              ],
              "appliesTo": [],
              "avoids": [],
              "sourceRefs": [
                "USER_ANSWER:Q-0007",
                "EVD-0016"
              ],
              "createdAt": "2026-07-15T08:10:13.862Z",
              "updatedAt": "2026-07-15T08:10:13.862Z"
            },
            {
              "id": "DEC-0022",
              "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
              "title": "What exact idempotency and protocol entity-ID algorithm should 0.6 use?",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Canonical receipts plus prefixed ULIDs (recommended)",
              "rationale": [
                "User answered Q-0008."
              ],
              "appliesTo": [],
              "avoids": [],
              "sourceRefs": [
                "USER_ANSWER:Q-0008",
                "EVD-0017"
              ],
              "createdAt": "2026-07-15T08:10:48.663Z",
              "updatedAt": "2026-07-15T08:10:48.663Z"
            },
            {
              "id": "DEC-0023",
              "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
              "title": "What exact Git-bound trace and sduck verify algorithm should 0.6 use?",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Merge-base CI verifier (recommended)",
              "rationale": [
                "User answered Q-0009."
              ],
              "appliesTo": [],
              "avoids": [],
              "sourceRefs": [
                "USER_ANSWER:Q-0009",
                "EVD-0018"
              ],
              "createdAt": "2026-07-15T08:19:09.350Z",
              "updatedAt": "2026-07-15T08:19:09.350Z"
            },
            {
              "id": "DEC-0024",
              "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
              "title": "Should 0.6 expose a state-changing MCP confirm operation?",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "Omit MCP confirm in 0.6 (recommended)",
              "rationale": [
                "User answered Q-0010."
              ],
              "appliesTo": [],
              "avoids": [],
              "sourceRefs": [
                "USER_ANSWER:Q-0010",
                "EVD-0019"
              ],
              "createdAt": "2026-07-15T08:20:10.645Z",
              "updatedAt": "2026-07-15T08:20:10.645Z"
            },
            {
              "id": "DEC-0025",
              "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
              "title": "What may refresh_context persist automatically in 0.6?",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "References and hashes only (recommended)",
              "rationale": [
                "User answered Q-0011."
              ],
              "appliesTo": [],
              "avoids": [],
              "sourceRefs": [
                "USER_ANSWER:Q-0011",
                "EVD-0020"
              ],
              "createdAt": "2026-07-15T09:07:26.906Z",
              "updatedAt": "2026-07-15T09:07:26.906Z"
            }
          ],
          "INFERRED": [],
          "CARRIED": [],
          "CONFLICT": [],
          "OPEN": []
        },
        "questions": [
          {
            "id": "Q-0001",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "text": "Which exact versioned projection and digest contract should bind confirmation?",
            "recommendedAnswer": "Use sduck-brief-digest/v1 canonical UTF-8 JSON with stable key/entity order and SHA-256; include approval-relevant decisions, answers, evidence, and scope; exclude rendering and timestamps.",
            "rationale": [
              "Rendered Markdown changes for presentation-only reasons.",
              "A versioned projection makes evolution explicit."
            ],
            "options": [
              "Use canonical JSON v1 plus SHA-256",
              "Use another digest contract"
            ],
            "answered": true,
            "answer": "Use canonical JSON v1 plus SHA-256",
            "createdAt": "2026-07-15T06:58:44.026Z"
          },
          {
            "id": "Q-0002",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "text": "What stale-confirmation revision token should 0.6 use in addition to the brief digest?",
            "recommendedAnswer": "Use the brief digest as the sole optimistic revision token; retain event IDs only as provenance.",
            "rationale": [
              "A complete digest already binds every approval-relevant change."
            ],
            "options": [
              "Digest only",
              "Digest plus last event ID",
              "Another revision model"
            ],
            "answered": true,
            "answer": "Digest only",
            "createdAt": "2026-07-15T06:58:44.026Z"
          },
          {
            "id": "Q-0003",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "text": "What canonical idempotency receipt contract should all 0.6 mutations use?",
            "recommendedAnswer": "Persist a successful-operation receipt event containing clientId, clientRequestId, operation, request hash, task ID, and result entity references; changed payload returns IDEMPOTENCY_CONFLICT.",
            "rationale": [
              "MCP clients retry after lost responses.",
              "SQLite-only receipts do not survive rebuild."
            ],
            "options": [
              "Canonical receipt events",
              "Cache-only receipts",
              "Another receipt model"
            ],
            "answered": true,
            "answer": "Canonical receipt events",
            "createdAt": "2026-07-15T06:58:44.026Z"
          },
          {
            "id": "Q-0004",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "text": "What source-schema migration policy should apply to 0.6 canonical records?",
            "recommendedAnswer": "Add a versioned source envelope; accept old records, write latest additive schema, reject future schemas safely, and require explicit doctor migration for destructive changes.",
            "rationale": [
              "Canonical Markdown must remain portable across CLI versions."
            ],
            "options": [
              "Versioned additive envelope",
              "Implicit optional fields only",
              "Another migration policy"
            ],
            "answered": true,
            "answer": "Versioned additive envelope",
            "createdAt": "2026-07-15T06:58:44.026Z"
          },
          {
            "id": "Q-0005",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "text": "What trace data and CI semantics should sduck verify require?",
            "recommendedAnswer": "Trace brief digest, merge-base baseline, target tree or commit, per-file status and content hash; verify coverage with defined rename, deletion, binary, shallow-clone, JSON, and exit-code behavior.",
            "rationale": [
              "Path-only traces cannot prove correspondence to the current PR diff."
            ],
            "options": [
              "Bind trace to Git and brief digest",
              "Keep path-only traces",
              "Another verifier contract"
            ],
            "answered": true,
            "answer": "Bind trace to Git and brief digest",
            "createdAt": "2026-07-15T06:58:44.026Z"
          },
          {
            "id": "Q-0006",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "text": "What exact BriefDigestProjectionV1 and canonical serializer should sduck use?",
            "recommendedAnswer": "Use a versioned projection serialized with RFC 8785 JSON Canonicalization Scheme then SHA-256. Include task ID/title/description and scope; decisions sorted by ID with ID, kind, status, title, summary, rationale, appliesTo and avoids; questions sorted by ID with text and normalized answer; evidence sorted by ID with source type/ref/summary; exclude timestamps, rendering, generated snapshot IDs, and confidence. Preserve declared order inside rationale/scope arrays. Publish a fixed Unicode test vector.",
            "rationale": [
              "The current wording leaves serialization and approval-relevant fields ambiguous.",
              "RFC 8785 provides a portable canonical JSON contract."
            ],
            "options": [
              "RFC 8785 projection v1 (recommended)",
              "Project-specific stable serializer",
              "Another digest contract"
            ],
            "answered": true,
            "answer": "RFC 8785 projection v1 (recommended)",
            "createdAt": "2026-07-15T07:52:35.849Z"
          },
          {
            "id": "Q-0007",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "text": "How should 0.6 migrate legacy canonical source without rewriting history unexpectedly?",
            "recommendedAnswer": "Read both legacy and envelope records; require explicit atomic doctor migration before any mutation that needs envelope fields; preserve legacy records for read-only operations; write a clear migration diff and never silently rewrite untouched history.",
            "rationale": [
              "Current full-bundle rendering could otherwise churn every tracked source document on the first mutation."
            ],
            "options": [
              "Explicit atomic migration (recommended)",
              "Automatic workspace migration",
              "Dirty-document mixed migration",
              "Another migration behavior"
            ],
            "answered": true,
            "answer": "Explicit atomic migration (recommended)",
            "createdAt": "2026-07-15T07:52:35.849Z"
          },
          {
            "id": "Q-0008",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "text": "What exact idempotency and protocol entity-ID algorithm should 0.6 use?",
            "recommendedAnswer": "Inside the workspace lock, first look up identity (clientId, clientRequestId, operation) and canonical request hash. Same hash returns stored entity refs even after terminal status; changed hash returns IDEMPOTENCY_CONFLICT; only successful commits record receipts. CLI calls without identity retain legacy semantics. Protocol-created entities use prefixed ULIDs while legacy sequential IDs remain readable.",
            "rationale": [
              "The receipt decision needs lookup, retention, retry, and collision rules.",
              "Sequential maxima collide across independent branches."
            ],
            "options": [
              "Canonical receipts plus prefixed ULIDs (recommended)",
              "Canonical receipts plus UUIDv7",
              "Keep sequential entity IDs",
              "Another algorithm"
            ],
            "answered": true,
            "answer": "Canonical receipts plus prefixed ULIDs (recommended)",
            "createdAt": "2026-07-15T07:52:35.849Z"
          },
          {
            "id": "Q-0009",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "text": "What exact Git-bound trace and sduck verify algorithm should 0.6 use?",
            "recommendedAnswer": "In CI, resolve merge-base(base, HEAD), require clean HEAD mode, and compare base...HEAD name-status changes with trace manifests bound to the confirmed brief digest. Each manifest stores base commit, trace HEAD, per-file status, old path for rename, and SHA-256 content hash or null for deletion. Multiple matching task traces may cover the union; unmatched changes fail. Emit stable JSON and documented exit codes; fail closed on shallow history unless base is fetchable.",
            "rationale": [
              "Stored fields alone do not define whether a current PR is covered by a trace."
            ],
            "options": [
              "Merge-base CI verifier (recommended)",
              "Direct base diff verifier",
              "Another verifier algorithm"
            ],
            "answered": true,
            "answer": "Merge-base CI verifier (recommended)",
            "createdAt": "2026-07-15T07:52:35.849Z"
          },
          {
            "id": "Q-0010",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "text": "Should 0.6 expose a state-changing MCP confirm operation?",
            "recommendedAnswer": "No. Expose read-only prepare_confirmation only; default state change is interactive local sduck confirm --digest. Defer MCP acknowledgement confirmation until a client-independent interaction mechanism exists.",
            "rationale": [
              "The default policy requires local operator acknowledgement and MCP prompts are not a trustworthy approval boundary."
            ],
            "options": [
              "Omit MCP confirm in 0.6 (recommended)",
              "Add opt-in MCP acknowledgement",
              "Another surface"
            ],
            "answered": true,
            "answer": "Omit MCP confirm in 0.6 (recommended)",
            "createdAt": "2026-07-15T07:52:35.849Z"
          },
          {
            "id": "Q-0011",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "text": "What may refresh_context persist automatically in 0.6?",
            "recommendedAnswer": "refresh_context is an idempotent mutation that stores only tracked-file path, repository-relative range or metadata, and SHA-256 content hash within configured bounds. It writes no automatic summaries or excerpts; explicit record/add_context submits curated summaries and untracked references.",
            "rationale": [
              "A tool cannot create a trustworthy curated summary without an explicit actor submission.",
              "Separating references from model-facing summaries limits data exposure."
            ],
            "options": [
              "References and hashes only (recommended)",
              "Automatic curated summaries",
              "Another persistence policy"
            ],
            "answered": true,
            "answer": "References and hashes only (recommended)",
            "createdAt": "2026-07-15T07:52:35.849Z"
          }
        ],
        "evidence": [
          {
            "id": "EVD-0004",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/task-lifecycle.ts",
            "summary": "Confirmation blocks unanswered questions and OPEN or CONFLICT decisions, so unresolved architecture must be represented in canonical task data.",
            "confidence": 0.95,
            "createdAt": "2026-07-15T06:58:56.974Z"
          },
          {
            "id": "EVD-0005",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/draft.ts",
            "summary": "Draft submission appends new entities and has no amendment or supersession operation.",
            "confidence": 0.95,
            "createdAt": "2026-07-15T06:58:56.974Z"
          },
          {
            "id": "EVD-0006",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/brief.ts",
            "summary": "Current confirmation accepts no expected digest or structured provenance.",
            "confidence": 0.95,
            "createdAt": "2026-07-15T06:58:56.974Z"
          },
          {
            "id": "EVD-0007",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/trace.ts",
            "summary": "Current traces do not bind file mappings to a target Git tree or confirmation digest.",
            "confidence": 0.95,
            "createdAt": "2026-07-15T06:58:56.974Z"
          },
          {
            "id": "EVD-0008",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/context.ts",
            "summary": "Current indexing samples tracked and untracked files and persists content excerpts, requiring privacy changes before MCP context exposure.",
            "confidence": 0.95,
            "createdAt": "2026-07-15T06:58:56.974Z"
          },
          {
            "id": "EVD-0009",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "sourceType": "DECISION_DOC",
            "sourceRef": "docs/design/conversational-workflow.md",
            "summary": "Sections 4.3 and 5.3 conflict with the reviewed digest-confirmation and canonical-record guard direction.",
            "confidence": 0.95,
            "createdAt": "2026-07-15T06:58:56.974Z"
          },
          {
            "id": "EVD-0010",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "sourceType": "USER_ANSWER",
            "sourceRef": "Q-0001",
            "summary": "Use canonical JSON v1 plus SHA-256",
            "confidence": 1,
            "createdAt": "2026-07-15T07:13:24.635Z"
          },
          {
            "id": "EVD-0011",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "sourceType": "USER_ANSWER",
            "sourceRef": "Q-0002",
            "summary": "Digest only",
            "confidence": 1,
            "createdAt": "2026-07-15T07:14:05.559Z"
          },
          {
            "id": "EVD-0012",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "sourceType": "USER_ANSWER",
            "sourceRef": "Q-0003",
            "summary": "Canonical receipt events",
            "confidence": 1,
            "createdAt": "2026-07-15T07:14:38.914Z"
          },
          {
            "id": "EVD-0013",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "sourceType": "USER_ANSWER",
            "sourceRef": "Q-0004",
            "summary": "Versioned additive envelope",
            "confidence": 1,
            "createdAt": "2026-07-15T07:15:59.909Z"
          },
          {
            "id": "EVD-0014",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "sourceType": "USER_ANSWER",
            "sourceRef": "Q-0005",
            "summary": "Bind trace to Git and brief digest",
            "confidence": 1,
            "createdAt": "2026-07-15T07:48:37.885Z"
          },
          {
            "id": "EVD-0015",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "sourceType": "USER_ANSWER",
            "sourceRef": "Q-0006",
            "summary": "RFC 8785 projection v1 (recommended)",
            "confidence": 1,
            "createdAt": "2026-07-15T08:09:36.381Z"
          },
          {
            "id": "EVD-0016",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "sourceType": "USER_ANSWER",
            "sourceRef": "Q-0007",
            "summary": "Explicit atomic migration (recommended)",
            "confidence": 1,
            "createdAt": "2026-07-15T08:10:13.862Z"
          },
          {
            "id": "EVD-0017",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "sourceType": "USER_ANSWER",
            "sourceRef": "Q-0008",
            "summary": "Canonical receipts plus prefixed ULIDs (recommended)",
            "confidence": 1,
            "createdAt": "2026-07-15T08:10:48.663Z"
          },
          {
            "id": "EVD-0018",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "sourceType": "USER_ANSWER",
            "sourceRef": "Q-0009",
            "summary": "Merge-base CI verifier (recommended)",
            "confidence": 1,
            "createdAt": "2026-07-15T08:19:09.350Z"
          },
          {
            "id": "EVD-0019",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "sourceType": "USER_ANSWER",
            "sourceRef": "Q-0010",
            "summary": "Omit MCP confirm in 0.6 (recommended)",
            "confidence": 1,
            "createdAt": "2026-07-15T08:20:10.645Z"
          },
          {
            "id": "EVD-0020",
            "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
            "decisionId": null,
            "sourceType": "USER_ANSWER",
            "sourceRef": "Q-0011",
            "summary": "References and hashes only (recommended)",
            "confidence": 1,
            "createdAt": "2026-07-15T09:07:26.906Z"
          }
        ],
        "expectedScope": [
          "0.6a canonical schema, typed operations, digest, provenance, and idempotency",
          "0.6b privacy-safe context and sduck verify",
          "0.6c stdio MCP adapter and protocol E2E",
          "0.6d optional advisory integration, docs supersession, and release smoke checks",
          "0.7 RFC interfaces and threat model only"
        ],
        "avoidScope": [
          "0.7 agent or execution implementation",
          "remote execution",
          "messaging/scheduling",
          "general personal-agent capabilities",
          "security claims based on hooks or MCP permission dialogs"
        ],
        "openQuestionCount": 0
      },
      "renderedMarkdown": "────────────────────────────────────────\nImplementation Brief\n────────────────────────────────────────\nTask: TASK-20260715-implement-the-0-6-mcp-control-plane\nImplement the 0.6 MCP control plane\n\nA. Explicit decisions\n[EXPLICIT] DEC-0009. Authorize only the 0.6 MCP control plane\nConfidence: 1.00\nSummary: This task implements 0.6a–0.6d only; it does not implement a sduck-owned coding runtime.\nSource refs:\n  - .slim/deepwork/sduck-coding-agent.md\nRationale:\n  - The prior task mixed unresolved 0.7 runtime architecture with 0.6 implementation authorization.\nApplies to:\n  - src/core/v2/**\n  - src/mcp/**\n  - src/commands/**\n  - src/cli.ts\n  - tests/**\n  - docs/**\nAvoids:\n  - src/agent/** implementation\n  - src/execution/** implementation\n  - model-provider integration\n\n[EXPLICIT] DEC-0010. Keep 0.7 as an RFC boundary\nConfidence: 1.00\nSummary: Current work may define 0.7 interfaces and threat-model constraints, but runtime implementation requires a separately confirmed task after 0.6 pilot evidence.\nSource refs:\n  - .slim/deepwork/sduck-coding-agent.md\nRationale:\n  - Provider and execution-backend choices remain consequential and unvalidated.\nApplies to:\n  - 0.7 RFC documentation\nAvoids:\n  - runtime implementation authorization\n\n[EXPLICIT] DEC-0011. Require local digest confirmation by default\nConfidence: 1.00\nSummary: MCP may prepare a canonical brief, but default confirmation is interactive local sduck confirm --digest; non-human MCP acknowledgement is explicit policy opt-in with provenance.\nSource refs:\n  - docs/design/conversational-workflow.md\n  - .slim/deepwork/sduck-coding-agent.md\nRationale:\n  - MCP annotations and client permission dialogs do not prove human review.\nApplies to:\n  - confirmation operation\n  - policy\n  - MCP tools\n  - CI verifier\nAvoids:\n  - treating client permission prompts as human-approval proof\n\n[EXPLICIT] DEC-0012. Make automatic context discovery privacy-first\nConfidence: 1.00\nSummary: Automatic discovery considers tracked regular files only; untracked paths require explicit addition, symlink escapes are rejected, and canonical records store references, hashes, and curated summaries.\nSource refs:\n  - src/core/v2/context.ts\nRationale:\n  - Current discovery recorded noisy IDE and archived paths.\n  - MCP responses may expose context to a model.\nApplies to:\n  - src/core/v2/context.ts\n  - policy\n  - MCP context tools\nAvoids:\n  - automatic sampling of untracked or external symlink content\n\n[EXPLICIT] DEC-0013. Separate context reads from refresh mutations\nConfidence: 1.00\nSummary: get_context is read-only; refresh_context is a separately named idempotent mutation. Task creation does not include expensive indexing.\nSource refs:\n  - src/core/v2/context.ts\n  - src/core/v2/decision-workspace.ts\nRationale:\n  - Read-only MCP annotations must match behavior.\n  - Scanning under writer lock creates partial-operation and contention risks.\nApplies to:\n  - core operations\n  - MCP tools\n  - context indexing\nAvoids:\n  - read tools that mutate canonical context\n\n[EXPLICIT] DEC-0014. Supersede conflicting conversational-workflow proposals\nConfidence: 1.00\nSummary: The final 0.6 design marks conversational-workflow sections 4.3 and 5.3 superseded by digest-based local confirmation and canonical-record guard lookup.\nSource refs:\n  - docs/design/conversational-workflow.md\n  - .slim/deepwork/sduck-coding-agent.md\nRationale:\n  - The prior proposal treats a client permission prompt as approval and caches status in ignored state, both rejected by review.\nApplies to:\n  - docs/design/conversational-workflow.md\n  - decision references\nAvoids:\n  - ambiguous recall of conflicting designs\n\n[EXPLICIT] DEC-0015. Which exact versioned projection and digest contract should bind confirmation?\nConfidence: 1.00\nSummary: Use canonical JSON v1 plus SHA-256\nSource refs:\n  - USER_ANSWER:Q-0001\n  - EVD-0010\nRationale:\n  - User answered Q-0001.\n\n[EXPLICIT] DEC-0016. What stale-confirmation revision token should 0.6 use in addition to the brief digest?\nConfidence: 1.00\nSummary: Digest only\nSource refs:\n  - USER_ANSWER:Q-0002\n  - EVD-0011\nRationale:\n  - User answered Q-0002.\n\n[EXPLICIT] DEC-0017. What canonical idempotency receipt contract should all 0.6 mutations use?\nConfidence: 1.00\nSummary: Canonical receipt events\nSource refs:\n  - USER_ANSWER:Q-0003\n  - EVD-0012\nRationale:\n  - User answered Q-0003.\n\n[EXPLICIT] DEC-0018. What source-schema migration policy should apply to 0.6 canonical records?\nConfidence: 1.00\nSummary: Versioned additive envelope\nSource refs:\n  - USER_ANSWER:Q-0004\n  - EVD-0013\nRationale:\n  - User answered Q-0004.\n\n[EXPLICIT] DEC-0019. What trace data and CI semantics should sduck verify require?\nConfidence: 1.00\nSummary: Bind trace to Git and brief digest\nSource refs:\n  - USER_ANSWER:Q-0005\n  - EVD-0014\nRationale:\n  - User answered Q-0005.\n\n[EXPLICIT] DEC-0020. What exact BriefDigestProjectionV1 and canonical serializer should sduck use?\nConfidence: 1.00\nSummary: RFC 8785 projection v1 (recommended)\nSource refs:\n  - USER_ANSWER:Q-0006\n  - EVD-0015\nRationale:\n  - User answered Q-0006.\n\n[EXPLICIT] DEC-0021. How should 0.6 migrate legacy canonical source without rewriting history unexpectedly?\nConfidence: 1.00\nSummary: Explicit atomic migration (recommended)\nSource refs:\n  - USER_ANSWER:Q-0007\n  - EVD-0016\nRationale:\n  - User answered Q-0007.\n\n[EXPLICIT] DEC-0022. What exact idempotency and protocol entity-ID algorithm should 0.6 use?\nConfidence: 1.00\nSummary: Canonical receipts plus prefixed ULIDs (recommended)\nSource refs:\n  - USER_ANSWER:Q-0008\n  - EVD-0017\nRationale:\n  - User answered Q-0008.\n\n[EXPLICIT] DEC-0023. What exact Git-bound trace and sduck verify algorithm should 0.6 use?\nConfidence: 1.00\nSummary: Merge-base CI verifier (recommended)\nSource refs:\n  - USER_ANSWER:Q-0009\n  - EVD-0018\nRationale:\n  - User answered Q-0009.\n\n[EXPLICIT] DEC-0024. Should 0.6 expose a state-changing MCP confirm operation?\nConfidence: 1.00\nSummary: Omit MCP confirm in 0.6 (recommended)\nSource refs:\n  - USER_ANSWER:Q-0010\n  - EVD-0019\nRationale:\n  - User answered Q-0010.\n\n[EXPLICIT] DEC-0025. What may refresh_context persist automatically in 0.6?\nConfidence: 1.00\nSummary: References and hashes only (recommended)\nSource refs:\n  - USER_ANSWER:Q-0011\n  - EVD-0020\nRationale:\n  - User answered Q-0011.\n\nB. Inferred decisions\n  - none\n\nC. Carried decisions\n  - none\n\nD. Conflicts\n  - none\n\nE. Open decisions\n  - none\n\nScope expected:\n  - 0.6a canonical schema, typed operations, digest, provenance, and idempotency\n  - 0.6b privacy-safe context and sduck verify\n  - 0.6c stdio MCP adapter and protocol E2E\n  - 0.6d optional advisory integration, docs supersession, and release smoke checks\n  - 0.7 RFC interfaces and threat model only\nScope avoided:\n  - 0.7 agent or execution implementation\n  - remote execution\n  - messaging/scheduling\n  - general personal-agent capabilities\n  - security claims based on hooks or MCP permission dialogs\nOpen questions: 0\nEvidence:\n  - [CODE] src/core/v2/task-lifecycle.ts (0.95): Confirmation blocks unanswered questions and OPEN or CONFLICT decisions, so unresolved architecture must be represented in canonical task data.\n  - [CODE] src/core/v2/draft.ts (0.95): Draft submission appends new entities and has no amendment or supersession operation.\n  - [CODE] src/core/v2/brief.ts (0.95): Current confirmation accepts no expected digest or structured provenance.\n  - [CODE] src/core/v2/trace.ts (0.95): Current traces do not bind file mappings to a target Git tree or confirmation digest.\n  - [CODE] src/core/v2/context.ts (0.95): Current indexing samples tracked and untracked files and persists content excerpts, requiring privacy changes before MCP context exposure.\n  - [DECISION_DOC] docs/design/conversational-workflow.md (0.95): Sections 4.3 and 5.3 conflict with the reviewed digest-confirmation and canonical-record guard direction.\n  - [USER_ANSWER] Q-0001 (1): Use canonical JSON v1 plus SHA-256\n  - [USER_ANSWER] Q-0002 (1): Digest only\n  - [USER_ANSWER] Q-0003 (1): Canonical receipt events\n  - [USER_ANSWER] Q-0004 (1): Versioned additive envelope\n  - [USER_ANSWER] Q-0005 (1): Bind trace to Git and brief digest\n  - [USER_ANSWER] Q-0006 (1): RFC 8785 projection v1 (recommended)\n  - [USER_ANSWER] Q-0007 (1): Explicit atomic migration (recommended)\n  - [USER_ANSWER] Q-0008 (1): Canonical receipts plus prefixed ULIDs (recommended)\n  - [USER_ANSWER] Q-0009 (1): Merge-base CI verifier (recommended)\n  - [USER_ANSWER] Q-0010 (1): Omit MCP confirm in 0.6 (recommended)\n  - [USER_ANSWER] Q-0011 (1): References and hashes only (recommended)\n────────────────────────────────────────",
      "gitBaseline": {
        "head": "4fb70744ee432a5801242673de38551bf9109826",
        "dirtyFileHashes": {
          ".ignore": "d848d497c18118c6142a789e167a989adbc2c2227e371b0164480a6206bab443",
          "docs/design/conversational-workflow.md": "0e4ea088c8848340fe041051930a7c20e6ccb3ba59138cd4aca7c91486d9fcec"
        }
      },
      "createdAt": "2026-07-15T09:18:26.464Z"
    }
  ],
  "events": [
    {
      "id": "EVT-0050",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "TASK_CREATED",
      "payload": {
        "description": "Implement the 0.6 MCP control plane",
        "policy": {
          "grillMeRequired": false
        }
      },
      "createdAt": "2026-07-15T06:56:44.449Z"
    },
    {
      "id": "EVT-0051",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "CONTEXT_INDEXED",
      "payload": {
        "itemCount": 26
      },
      "createdAt": "2026-07-15T06:56:44.519Z"
    },
    {
      "id": "EVT-0052",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
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
      "createdAt": "2026-07-15T06:56:45.054Z"
    },
    {
      "id": "EVT-0053",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0009"
      },
      "createdAt": "2026-07-15T06:58:44.027Z"
    },
    {
      "id": "EVT-0054",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0010"
      },
      "createdAt": "2026-07-15T06:58:44.027Z"
    },
    {
      "id": "EVT-0055",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0011"
      },
      "createdAt": "2026-07-15T06:58:44.027Z"
    },
    {
      "id": "EVT-0056",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0012"
      },
      "createdAt": "2026-07-15T06:58:44.027Z"
    },
    {
      "id": "EVT-0057",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0013"
      },
      "createdAt": "2026-07-15T06:58:44.027Z"
    },
    {
      "id": "EVT-0058",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0014"
      },
      "createdAt": "2026-07-15T06:58:44.027Z"
    },
    {
      "id": "EVT-0059",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 6,
        "questions": 5,
        "evidence": 0,
        "expectedScope": [
          "0.6a canonical schema, typed operations, digest, provenance, and idempotency",
          "0.6b privacy-safe context and sduck verify",
          "0.6c stdio MCP adapter and protocol E2E",
          "0.6d optional advisory integration, docs supersession, and release smoke checks",
          "0.7 RFC interfaces and threat model only"
        ],
        "avoidScope": [
          "0.7 agent or execution implementation",
          "remote execution",
          "messaging/scheduling",
          "general personal-agent capabilities",
          "security claims based on hooks or MCP permission dialogs"
        ]
      },
      "createdAt": "2026-07-15T06:58:44.027Z"
    },
    {
      "id": "EVT-0060",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 0,
        "questions": 0,
        "evidence": 6,
        "expectedScope": [
          "0.6a canonical schema, typed operations, digest, provenance, and idempotency",
          "0.6b privacy-safe context and sduck verify",
          "0.6c stdio MCP adapter and protocol E2E",
          "0.6d optional advisory integration, docs supersession, and release smoke checks",
          "0.7 RFC interfaces and threat model only"
        ],
        "avoidScope": [
          "0.7 agent or execution implementation",
          "remote execution",
          "messaging/scheduling",
          "general personal-agent capabilities",
          "security claims based on hooks or MCP permission dialogs"
        ]
      },
      "createdAt": "2026-07-15T06:58:56.974Z"
    },
    {
      "id": "EVT-0061",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0015"
      },
      "createdAt": "2026-07-15T07:13:24.636Z"
    },
    {
      "id": "EVT-0062",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "QUESTION_ANSWERED",
      "payload": {
        "questionId": "Q-0001",
        "answer": "Use canonical JSON v1 plus SHA-256"
      },
      "createdAt": "2026-07-15T07:13:24.636Z"
    },
    {
      "id": "EVT-0063",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0016"
      },
      "createdAt": "2026-07-15T07:14:05.560Z"
    },
    {
      "id": "EVT-0064",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "QUESTION_ANSWERED",
      "payload": {
        "questionId": "Q-0002",
        "answer": "Digest only"
      },
      "createdAt": "2026-07-15T07:14:05.560Z"
    },
    {
      "id": "EVT-0065",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0017"
      },
      "createdAt": "2026-07-15T07:14:38.915Z"
    },
    {
      "id": "EVT-0066",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "QUESTION_ANSWERED",
      "payload": {
        "questionId": "Q-0003",
        "answer": "Canonical receipt events"
      },
      "createdAt": "2026-07-15T07:14:38.915Z"
    },
    {
      "id": "EVT-0067",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0018"
      },
      "createdAt": "2026-07-15T07:15:59.910Z"
    },
    {
      "id": "EVT-0068",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "QUESTION_ANSWERED",
      "payload": {
        "questionId": "Q-0004",
        "answer": "Versioned additive envelope"
      },
      "createdAt": "2026-07-15T07:15:59.910Z"
    },
    {
      "id": "EVT-0069",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0019"
      },
      "createdAt": "2026-07-15T07:48:37.885Z"
    },
    {
      "id": "EVT-0070",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "QUESTION_ANSWERED",
      "payload": {
        "questionId": "Q-0005",
        "answer": "Bind trace to Git and brief digest"
      },
      "createdAt": "2026-07-15T07:48:37.886Z"
    },
    {
      "id": "EVT-0071",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 0,
        "questions": 6,
        "evidence": 0,
        "expectedScope": [
          "0.6a canonical schema, typed operations, digest, provenance, and idempotency",
          "0.6b privacy-safe context and sduck verify",
          "0.6c stdio MCP adapter and protocol E2E",
          "0.6d optional advisory integration, docs supersession, and release smoke checks",
          "0.7 RFC interfaces and threat model only"
        ],
        "avoidScope": [
          "0.7 agent or execution implementation",
          "remote execution",
          "messaging/scheduling",
          "general personal-agent capabilities",
          "security claims based on hooks or MCP permission dialogs"
        ]
      },
      "createdAt": "2026-07-15T07:52:35.850Z"
    },
    {
      "id": "EVT-0072",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0020"
      },
      "createdAt": "2026-07-15T08:09:36.381Z"
    },
    {
      "id": "EVT-0073",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "QUESTION_ANSWERED",
      "payload": {
        "questionId": "Q-0006",
        "answer": "RFC 8785 projection v1 (recommended)"
      },
      "createdAt": "2026-07-15T08:09:36.381Z"
    },
    {
      "id": "EVT-0074",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0021"
      },
      "createdAt": "2026-07-15T08:10:13.862Z"
    },
    {
      "id": "EVT-0075",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "QUESTION_ANSWERED",
      "payload": {
        "questionId": "Q-0007",
        "answer": "Explicit atomic migration (recommended)"
      },
      "createdAt": "2026-07-15T08:10:13.862Z"
    },
    {
      "id": "EVT-0076",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0022"
      },
      "createdAt": "2026-07-15T08:10:48.664Z"
    },
    {
      "id": "EVT-0077",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "QUESTION_ANSWERED",
      "payload": {
        "questionId": "Q-0008",
        "answer": "Canonical receipts plus prefixed ULIDs (recommended)"
      },
      "createdAt": "2026-07-15T08:10:48.664Z"
    },
    {
      "id": "EVT-0078",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0023"
      },
      "createdAt": "2026-07-15T08:19:09.350Z"
    },
    {
      "id": "EVT-0079",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "QUESTION_ANSWERED",
      "payload": {
        "questionId": "Q-0009",
        "answer": "Merge-base CI verifier (recommended)"
      },
      "createdAt": "2026-07-15T08:19:09.350Z"
    },
    {
      "id": "EVT-0080",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0024"
      },
      "createdAt": "2026-07-15T08:20:10.646Z"
    },
    {
      "id": "EVT-0081",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "QUESTION_ANSWERED",
      "payload": {
        "questionId": "Q-0010",
        "answer": "Omit MCP confirm in 0.6 (recommended)"
      },
      "createdAt": "2026-07-15T08:20:10.646Z"
    },
    {
      "id": "EVT-0082",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0025"
      },
      "createdAt": "2026-07-15T09:07:26.907Z"
    },
    {
      "id": "EVT-0083",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "QUESTION_ANSWERED",
      "payload": {
        "questionId": "Q-0011",
        "answer": "References and hashes only (recommended)"
      },
      "createdAt": "2026-07-15T09:07:26.907Z"
    },
    {
      "id": "EVT-0084",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "BRIEF_CONFIRMED",
      "payload": {
        "snapshotId": "BRF-0005"
      },
      "createdAt": "2026-07-15T09:18:26.464Z"
    },
    {
      "id": "EVT-0085",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "TRACE_CREATED",
      "payload": {
        "traceId": "IMPL-0005",
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
        ]
      },
      "createdAt": "2026-07-15T09:28:04.792Z"
    },
    {
      "id": "EVT-0086",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "EXPORT_WRITTEN",
      "payload": {
        "created": [
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/DECISION_REPORT.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/decision-graph.json"
        ]
      },
      "createdAt": "2026-07-15T09:28:08.428Z"
    },
    {
      "id": "EVT-0087",
      "taskId": "TASK-20260715-implement-the-0-6-mcp-control-plane",
      "type": "TASK_CLOSED",
      "payload": {},
      "createdAt": "2026-07-15T09:28:13.811Z"
    }
  ]
}
```
