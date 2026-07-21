---
id: TASK-20260720-correct-retrospective-skill-guidance
type: task
status: CLOSED
title: Correct retrospective skill guidance
created_at: '2026-07-20T02:16:20.842Z'
updated_at: '2026-07-20T02:23:38.296Z'
---
# TASK-20260720-correct-retrospective-skill-guidance: Correct retrospective skill guidance

Correct retrospective skill guidance

## Sduck source

```json sduck-source
{
  "task": {
    "id": "TASK-20260720-correct-retrospective-skill-guidance",
    "title": "Correct retrospective skill guidance",
    "description": "Correct retrospective skill guidance",
    "status": "CLOSED",
    "expectedScope": [
      "Correct SKILL.md evaluation syntax and classification guidance.",
      "Update the matching skill regression assertion.",
      "Increase only the observed flaky locale E2E timeout budget."
    ],
    "avoidScope": [
      "retrospective skill redesign",
      "new CLI options",
      "runtime behavior changes",
      "unrelated test changes"
    ],
    "guided": true,
    "createdAt": "2026-07-20T02:16:20.842Z",
    "updatedAt": "2026-07-20T02:23:38.296Z",
    "implementationPlan": [
      "Update the three incorrect skill lines and targeted assertion.",
      "Adjust the single E2E timeout with no test-logic changes.",
      "Run targeted and full verification."
    ],
    "verificationPlan": [
      "Run the skill asset regression tests and locale E2E test.",
      "Run the full suite to verify the timeout is stable.",
      "Review the final skill text against evaluate help and classification rule."
    ]
  },
  "questions": [],
  "evidence": [
    {
      "id": "EVD-0045",
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/cli.ts:566-577",
      "summary": "evaluate accepts check, limitation, and JSON options; it has no stdin interface.",
      "confidence": 1,
      "createdAt": "2026-07-20T02:16:49.081Z"
    },
    {
      "id": "EVD-0046",
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "decisionId": null,
      "sourceType": "DISCOVERY",
      "sourceRef": "npm test",
      "summary": "The representative localized v2 output test exceeded its five-second budget only during a full-suite run.",
      "confidence": 0.9,
      "createdAt": "2026-07-20T02:16:49.081Z"
    }
  ],
  "contextItems": [
    {
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
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
      "id": "CTX-0359",
      "createdAt": "2026-07-20T02:16:20.955Z"
    },
    {
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0026",
      "summary": "Prior decision: Correct Phase 0 fixtures into executable contracts — Strengthen the digest fixture with out-of-order entities and canonical/source equality; replace permissive envelope examples with explicit contract schemas for source envelopes, confirmation, receipts, traces, verifier output, and MCP tool I/O.",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0360",
      "createdAt": "2026-07-20T02:16:20.955Z"
    },
    {
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0028",
      "summary": "Prior decision: Keep exact trace boundaries for corrective work — The correction trace must map only its precise files; it must not aggregate directories or include abandoned-task records and unrelated workspace artifacts.",
      "metadata": {
        "type": "decision",
        "kind": "INFERRED",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0361",
      "createdAt": "2026-07-20T02:16:20.955Z"
    },
    {
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
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
      "id": "CTX-0362",
      "createdAt": "2026-07-20T02:16:20.955Z"
    },
    {
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0049",
      "summary": "Prior decision: Treat LLM handoff and Git evidence differently — The skill classifies decisions directly stated in the LLM handoff as EXPLICIT only when corroborated by the user or durable source; patch-only conclusions stay INFERRED with conservative confidence. It asks follow-up questions for unsupported rationale.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0363",
      "createdAt": "2026-07-20T02:16:20.955Z"
    },
    {
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "sourceType": "MEMORY",
      "sourceRef": "v2-workflow-is-primary",
      "summary": "Prior decision: Make v2 the single primary documented workflow — Reorganize public documentation, installed agent rules, and v2 next-step guidance around one canonical flow: init → work → context → grill-me → submit → ask/answer → brief/confirm → implement → trace → remember/recall → close.",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0364",
      "createdAt": "2026-07-20T02:16:20.955Z"
    },
    {
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
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
      "id": "CTX-0365",
      "createdAt": "2026-07-20T02:16:20.955Z"
    },
    {
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0009",
      "summary": "Decision applies to relevant file docs/agents/domain.md: Authorize only the 0.6 MCP control plane",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "files": [
          "docs/agents/domain.md"
        ],
        "reason": "matched by appliesTo glob",
        "score": 0.85
      },
      "id": "CTX-0366",
      "createdAt": "2026-07-20T02:16:20.955Z"
    },
    {
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
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
      "id": "CTX-0367",
      "createdAt": "2026-07-20T02:16:20.955Z"
    },
    {
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/unit/sdd-core-regression.test.ts",
      "summary": "File evidence: 'skills',",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "'skills',",
        "line": 95
      },
      "id": "CTX-0368",
      "createdAt": "2026-07-20T02:16:20.955Z"
    },
    {
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "sourceType": "DISCOVERY",
      "sourceRef": "AGENTS.md",
      "summary": "File evidence: For decision inventory requests, read `.sduck/sduck-assets/agent-rules/skills/sduck-codebase-decisions/SKILL.md`.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "For decision inventory requests, read `.sduck/sduck-assets/agent-rules/skills/sduck-codebase-decisions/SKILL.md`.",
        "line": 47
      },
      "id": "CTX-0369",
      "createdAt": "2026-07-20T02:16:20.956Z"
    },
    {
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "sourceType": "DISCOVERY",
      "sourceRef": "CLAUDE.md",
      "summary": "File evidence: For decision inventory requests, read `.sduck/sduck-assets/agent-rules/skills/sduck-codebase-decisions/SKILL.md`.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "For decision inventory requests, read `.sduck/sduck-assets/agent-rules/skills/sduck-codebase-decisions/SKILL.md`.",
        "line": 41
      },
      "id": "CTX-0370",
      "createdAt": "2026-07-20T02:16:20.956Z"
    },
    {
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/assets.ts",
      "summary": "File evidence: join('agent-rules', 'skills', 'sduck-codebase-decisions', 'SKILL.md'),",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "join('agent-rules', 'skills', 'sduck-codebase-decisions', 'SKILL.md'),",
        "line": 38
      },
      "id": "CTX-0371",
      "createdAt": "2026-07-20T02:16:20.956Z"
    },
    {
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/init.ts",
      "summary": "File evidence: CLAUDE_CODE_SKILLS_PATH,",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "CLAUDE_CODE_SKILLS_PATH,",
        "line": 17
      },
      "id": "CTX-0372",
      "createdAt": "2026-07-20T02:16:20.956Z"
    },
    {
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/e2e/sdd-cli-reachability.test.ts",
      "summary": "File evidence: 'skills',",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "'skills',",
        "line": 89
      },
      "id": "CTX-0373",
      "createdAt": "2026-07-20T02:16:20.956Z"
    },
    {
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
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
      "id": "CTX-0374",
      "createdAt": "2026-07-20T02:16:20.956Z"
    },
    {
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/agents/issue-tracker.md",
      "summary": "File evidence: ## When a skill says \"publish to the issue tracker\"",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "## When a skill says \"publish to the issue tracker\"",
        "line": 18
      },
      "id": "CTX-0375",
      "createdAt": "2026-07-20T02:16:20.956Z"
    },
    {
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
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
      "id": "CTX-0376",
      "createdAt": "2026-07-20T02:16:20.956Z"
    },
    {
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/agent-rules.ts",
      "summary": "File evidence: export const CLAUDE_CODE_SKILLS_PATH = join('.claude', 'skills');",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "export const CLAUDE_CODE_SKILLS_PATH = join('.claude', 'skills');",
        "line": 10
      },
      "id": "CTX-0377",
      "createdAt": "2026-07-20T02:16:20.956Z"
    },
    {
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/ui/v2/messages.ts",
      "summary": "File evidence: checklist: 'Skill-backed checklist',",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "checklist: 'Skill-backed checklist',",
        "line": 320
      },
      "id": "CTX-0378",
      "createdAt": "2026-07-20T02:16:20.956Z"
    },
    {
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/e2e/v2-cli.test.ts",
      "summary": "File evidence: expect(context.stdout).toContain('Skill-backed checklist:');",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "expect(context.stdout).toContain('Skill-backed checklist:');",
        "line": 83
      },
      "id": "CTX-0379",
      "createdAt": "2026-07-20T02:16:20.956Z"
    },
    {
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/e2e/v2-locale-cli.test.ts",
      "summary": "File evidence: it('localizes corrected v2 validation failures without English expected prose', async () => {",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "it('localizes corrected v2 validation failures without English expected prose', async () => {",
        "line": 326
      },
      "id": "CTX-0380",
      "createdAt": "2026-07-20T02:16:20.956Z"
    }
  ],
  "briefSnapshots": [
    {
      "id": "BRF-0011",
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "snapshot": {
        "task": {
          "id": "TASK-20260720-correct-retrospective-skill-guidance",
          "title": "Correct retrospective skill guidance",
          "description": "Correct retrospective skill guidance",
          "status": "CONFIRMED",
          "expectedScope": [
            "Correct SKILL.md evaluation syntax and classification guidance.",
            "Update the matching skill regression assertion.",
            "Increase only the observed flaky locale E2E timeout budget."
          ],
          "avoidScope": [
            "retrospective skill redesign",
            "new CLI options",
            "runtime behavior changes",
            "unrelated test changes"
          ],
          "guided": true,
          "createdAt": "2026-07-20T02:16:20.842Z",
          "updatedAt": "2026-07-20T02:16:49.425Z",
          "implementationPlan": [
            "Update the three incorrect skill lines and targeted assertion.",
            "Adjust the single E2E timeout with no test-logic changes.",
            "Run targeted and full verification."
          ],
          "verificationPlan": [
            "Run the skill asset regression tests and locale E2E test.",
            "Run the full suite to verify the timeout is stable.",
            "Review the final skill text against evaluate help and classification rule."
          ]
        },
        "decisions": {
          "EXPLICIT": [
            {
              "id": "DEC-0050",
              "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
              "title": "Correct retrospective skill to use the supported evaluation interface",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "The retrospective skill must use evaluate check and limitation flags, never unsupported stdin input. Its regression assertion must match the executable command form.",
              "rationale": [
                "Code review found that evaluate has no stdin interface."
              ],
              "appliesTo": [
                ".sduck/sduck-assets/agent-rules/skills/sduck-retrospective-capture/SKILL.md",
                "tests/unit/sdd-core-regression.test.ts"
              ],
              "avoids": [],
              "sourceRefs": [],
              "createdAt": "2026-07-20T02:16:49.081Z",
              "updatedAt": "2026-07-20T02:16:49.425Z"
            },
            {
              "id": "DEC-0051",
              "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
              "title": "Require corroboration before retrospective EXPLICIT classification",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "An active LLM handoff alone is not proof of user intent. Mark a decision EXPLICIT only when a user statement or durable source corroborates it; otherwise use INFERRED or record an OPEN question.",
              "rationale": [
                "Retrospective accounts can be incomplete or mistaken."
              ],
              "appliesTo": [
                ".sduck/sduck-assets/agent-rules/skills/sduck-retrospective-capture/SKILL.md"
              ],
              "avoids": [],
              "sourceRefs": [],
              "createdAt": "2026-07-20T02:16:49.081Z",
              "updatedAt": "2026-07-20T02:16:49.425Z"
            }
          ],
          "INFERRED": [
            {
              "id": "DEC-0052",
              "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
              "title": "Widen an observed locale E2E timing budget without changing behavior",
              "kind": "INFERRED",
              "status": "CONFIRMED",
              "confidence": 0.7,
              "summary": "The representative localized-output matrix exceeded its 5-second cap during the full suite but passes alone. Raise only that test budget to avoid a concurrency-sensitive CI flake.",
              "rationale": [
                "The timeout does not signal a runtime behavior defect."
              ],
              "appliesTo": [
                "tests/e2e/v2-locale-cli.test.ts"
              ],
              "avoids": [
                "test logic changes",
                "runtime behavior changes"
              ],
              "sourceRefs": [],
              "createdAt": "2026-07-20T02:16:49.081Z",
              "updatedAt": "2026-07-20T02:16:49.425Z"
            }
          ],
          "CARRIED": [],
          "CONFLICT": [],
          "OPEN": []
        },
        "questions": [],
        "evidence": [
          {
            "id": "EVD-0045",
            "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
            "decisionId": null,
            "sourceType": "CODE",
            "sourceRef": "src/cli.ts:566-577",
            "summary": "evaluate accepts check, limitation, and JSON options; it has no stdin interface.",
            "confidence": 1,
            "createdAt": "2026-07-20T02:16:49.081Z"
          },
          {
            "id": "EVD-0046",
            "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
            "decisionId": null,
            "sourceType": "DISCOVERY",
            "sourceRef": "npm test",
            "summary": "The representative localized v2 output test exceeded its five-second budget only during a full-suite run.",
            "confidence": 0.9,
            "createdAt": "2026-07-20T02:16:49.081Z"
          }
        ],
        "expectedScope": [
          "Correct SKILL.md evaluation syntax and classification guidance.",
          "Update the matching skill regression assertion.",
          "Increase only the observed flaky locale E2E timeout budget."
        ],
        "avoidScope": [
          "retrospective skill redesign",
          "new CLI options",
          "runtime behavior changes",
          "unrelated test changes"
        ],
        "implementationPlan": [
          "Update the three incorrect skill lines and targeted assertion.",
          "Adjust the single E2E timeout with no test-logic changes.",
          "Run targeted and full verification."
        ],
        "verificationPlan": [
          "Run the skill asset regression tests and locale E2E test.",
          "Run the full suite to verify the timeout is stable.",
          "Review the final skill text against evaluate help and classification rule."
        ],
        "openQuestionCount": 0
      },
      "renderedMarkdown": "────────────────────────────────────────\nImplementation Brief\n────────────────────────────────────────\nTask: TASK-20260720-correct-retrospective-skill-guidance\nCorrect retrospective skill guidance\n\nA. Explicit decisions\n[EXPLICIT] DEC-0050. Correct retrospective skill to use the supported evaluation interface\nConfidence: 1.00\nSummary: The retrospective skill must use evaluate check and limitation flags, never unsupported stdin input. Its regression assertion must match the executable command form.\nRationale:\n  - Code review found that evaluate has no stdin interface.\nApplies to:\n  - .sduck/sduck-assets/agent-rules/skills/sduck-retrospective-capture/SKILL.md\n  - tests/unit/sdd-core-regression.test.ts\n\n[EXPLICIT] DEC-0051. Require corroboration before retrospective EXPLICIT classification\nConfidence: 1.00\nSummary: An active LLM handoff alone is not proof of user intent. Mark a decision EXPLICIT only when a user statement or durable source corroborates it; otherwise use INFERRED or record an OPEN question.\nRationale:\n  - Retrospective accounts can be incomplete or mistaken.\nApplies to:\n  - .sduck/sduck-assets/agent-rules/skills/sduck-retrospective-capture/SKILL.md\n\nB. Inferred decisions\n[INFERRED] DEC-0052. Widen an observed locale E2E timing budget without changing behavior\nConfidence: 0.70\nSummary: The representative localized-output matrix exceeded its 5-second cap during the full suite but passes alone. Raise only that test budget to avoid a concurrency-sensitive CI flake.\nRationale:\n  - The timeout does not signal a runtime behavior defect.\nApplies to:\n  - tests/e2e/v2-locale-cli.test.ts\nAvoids:\n  - test logic changes\n  - runtime behavior changes\n\nC. Carried decisions\n  - none\n\nD. Conflicts\n  - none\n\nE. Open decisions\n  - none\n\nProblem:\n  Correct retrospective skill guidance\nImplementation plan:\n  - Update the three incorrect skill lines and targeted assertion.\n  - Adjust the single E2E timeout with no test-logic changes.\n  - Run targeted and full verification.\nVerification plan:\n  - Run the skill asset regression tests and locale E2E test.\n  - Run the full suite to verify the timeout is stable.\n  - Review the final skill text against evaluate help and classification rule.\nScope expected:\n  - Correct SKILL.md evaluation syntax and classification guidance.\n  - Update the matching skill regression assertion.\n  - Increase only the observed flaky locale E2E timeout budget.\nScope avoided:\n  - retrospective skill redesign\n  - new CLI options\n  - runtime behavior changes\n  - unrelated test changes\nOpen questions: 0\nEvidence:\n  - [CODE] src/cli.ts:566-577 (1): evaluate accepts check, limitation, and JSON options; it has no stdin interface.\n  - [DISCOVERY] npm test (0.9): The representative localized v2 output test exceeded its five-second budget only during a full-suite run.\n────────────────────────────────────────",
      "gitBaseline": {
        "head": "4fb70744ee432a5801242673de38551bf9109826",
        "dirtyFileHashes": {
          ".ignore": "d848d497c18118c6142a789e167a989adbc2c2227e371b0164480a6206bab443",
          ".prettierignore": "c0efdf6a8bebcb6f2d5f390eadaad516b16239b1b83914f3005b9efe3f6f0a94",
          "AGENTS.md": "d994e93914bb9f76b8a97016f42c7bb2f0e16c69a2f19f5905a060517a1814f1",
          "CLAUDE.md": "6edc056cf4264e38f07dfe44173e6ea57edee77c92add2958f7ab77131439a56",
          "README.ko.md": "1e7714acd17ce70bf8e3577529dd6899e5c533c8b7b449b59d2a21b3f5d085ba",
          "README.md": "50ccc9279145c8d7687370986daa646697c3c868306ecfe2bce5f7ae8c8b0959",
          "docs/design/conversational-workflow.md": "39393af5444abee5a4146ba56421ec6c39c69856654ec1fd5b5ecae9f81e5809",
          "docs/design/mcp-control-plane-0.6-contract.md": "54e436b84bcfffcc61c7639e758e40023431f602f09f3bb6dd78e5902a6dfad1",
          "src/cli.ts": "4d6c4c3a60e05c8497978a30c78686263bee8e654268e2ca7edf8ea719a80fd7",
          "src/commands/v2/index.ts": "ab1b35f610cd69737e7673219d9bac5ff5f53f3297b3e8fe806f9dab43a6eed7",
          "src/core/assets.ts": "5eca9ef19e2eba94caba8bbe92ed30e1a6793e553e67f8ca673ff3915c1dd0ba",
          "src/core/init.ts": "377eb6e8459da55b30e8c08aea148ed6336289a1a89a636a960976a5bf914e8d",
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
          "tests/e2e/sdd-cli-reachability.test.ts": "3c76a399282daafc5a5bacaa37382df1d380156cbd2bf6a0020730e3fc22d98f",
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
          "tests/unit/sdd-core-regression.test.ts": "c88de4d83619250456155b6a49d1b31217c96d18cc0f9eb6a5792b71f49890f9",
          "tests/unit/v2-contract-fixtures.test.ts": "af9b602764822d89578de375ef3c50c86c38a24d20f6c7502ef212a743e396de",
          "tests/unit/v2-lifecycle.test.ts": "8db8733496048ff2c2f58728de5f770ed3fa916156c1451a5be260ce4ff2b618",
          "tests/unit/v2-messages.test.ts": "d17e92613d455c9c6149d5f161cc2c38aa7e848167b8ed72356c8f1843cf892b"
        }
      },
      "createdAt": "2026-07-20T02:16:49.488Z"
    }
  ],
  "events": [
    {
      "id": "EVT-0171",
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "type": "TASK_CREATED",
      "payload": {
        "description": "Correct retrospective skill guidance",
        "policy": {
          "grillMeRequired": false
        }
      },
      "createdAt": "2026-07-20T02:16:20.842Z"
    },
    {
      "id": "EVT-0172",
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "type": "GRILL_STARTED",
      "payload": {
        "automatic": true
      },
      "createdAt": "2026-07-20T02:16:20.842Z"
    },
    {
      "id": "EVT-0173",
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "type": "CONTEXT_INDEXED",
      "payload": {
        "itemCount": 22
      },
      "createdAt": "2026-07-20T02:16:20.956Z"
    },
    {
      "id": "EVT-0174",
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "type": "GRILL_COMPLETED",
      "payload": {
        "reason": "Correct the reviewed retrospective skill command and evidence-classification guidance, plus the observed locale E2E timing flake, without changing runtime behavior.",
        "carried": []
      },
      "createdAt": "2026-07-20T02:16:21.578Z"
    },
    {
      "id": "EVT-0175",
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0050"
      },
      "createdAt": "2026-07-20T02:16:49.082Z"
    },
    {
      "id": "EVT-0176",
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0051"
      },
      "createdAt": "2026-07-20T02:16:49.082Z"
    },
    {
      "id": "EVT-0177",
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0052"
      },
      "createdAt": "2026-07-20T02:16:49.082Z"
    },
    {
      "id": "EVT-0178",
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 3,
        "questions": 0,
        "evidence": 2,
        "expectedScope": [
          "Correct SKILL.md evaluation syntax and classification guidance.",
          "Update the matching skill regression assertion.",
          "Increase only the observed flaky locale E2E timeout budget."
        ],
        "avoidScope": [
          "retrospective skill redesign",
          "new CLI options",
          "runtime behavior changes",
          "unrelated test changes"
        ],
        "implementationPlan": [
          "Update the three incorrect skill lines and targeted assertion.",
          "Adjust the single E2E timeout with no test-logic changes.",
          "Run targeted and full verification."
        ],
        "verificationPlan": [
          "Run the skill asset regression tests and locale E2E test.",
          "Run the full suite to verify the timeout is stable.",
          "Review the final skill text against evaluate help and classification rule."
        ]
      },
      "createdAt": "2026-07-20T02:16:49.082Z"
    },
    {
      "id": "EVT-0179",
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "type": "BRIEF_CONFIRMED",
      "payload": {
        "snapshotId": "BRF-0011"
      },
      "createdAt": "2026-07-20T02:16:49.488Z"
    },
    {
      "id": "EVT-0180",
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "type": "TRACE_CREATED",
      "payload": {
        "traceId": "IMPL-0014",
        "filesChanged": [
          "tests/e2e/v2-locale-cli.test.ts",
          "tests/unit/sdd-core-regression.test.ts"
        ]
      },
      "createdAt": "2026-07-20T02:23:37.369Z"
    },
    {
      "id": "EVT-0181",
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "type": "EVALUATION_RECORDED",
      "payload": {
        "evaluationId": "EVAL-0002",
        "traceId": "IMPL-0014"
      },
      "createdAt": "2026-07-20T02:23:37.678Z"
    },
    {
      "id": "EVT-0182",
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
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
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260720-correct-retrospective-skill-guidance.md",
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
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/DECISION_REPORT.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/decision-graph.json"
        ]
      },
      "createdAt": "2026-07-20T02:23:37.985Z"
    },
    {
      "id": "EVT-0183",
      "taskId": "TASK-20260720-correct-retrospective-skill-guidance",
      "type": "TASK_CLOSED",
      "payload": {},
      "createdAt": "2026-07-20T02:23:38.296Z"
    }
  ]
}
```
