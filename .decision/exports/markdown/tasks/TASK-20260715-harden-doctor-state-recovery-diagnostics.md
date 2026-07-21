---
id: TASK-20260715-harden-doctor-state-recovery-diagnostics
type: task
status: CLOSED
title: Harden doctor state recovery diagnostics
created_at: '2026-07-15T10:33:23.065Z'
updated_at: '2026-07-15T10:45:37.784Z'
---
# TASK-20260715-harden-doctor-state-recovery-diagnostics: Harden doctor state recovery diagnostics

Harden doctor state recovery diagnostics

## Sduck source

```json sduck-source
{
  "task": {
    "id": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
    "title": "Harden doctor state recovery diagnostics",
    "description": "Harden doctor state recovery diagnostics",
    "status": "CLOSED",
    "expectedScope": [
      "doctor diagnostics and safe terminal-pointer repair",
      "localized doctor messages",
      "unit regression tests",
      "documentation if command behavior needs disclosure"
    ],
    "avoidScope": [
      "canonical source changes",
      "cache rewrites",
      "Phase 1 source-envelope implementation",
      "automatic repair of non-terminal invalid state"
    ],
    "createdAt": "2026-07-15T10:33:23.065Z",
    "updatedAt": "2026-07-15T10:45:37.784Z"
  },
  "questions": [],
  "evidence": [
    {
      "id": "EVD-0024",
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/state.ts",
      "summary": "State validation distinguishes terminal, missing-task, and malformed state conditions.",
      "confidence": 0.95,
      "createdAt": "2026-07-15T10:34:37.409Z"
    },
    {
      "id": "EVD-0025",
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "decisionId": null,
      "sourceType": "CODE",
      "sourceRef": "src/core/v2/doctor.ts",
      "summary": "Current doctor detects only terminal pointers and otherwise may return healthy after invalid state validation errors.",
      "confidence": 0.95,
      "createdAt": "2026-07-15T10:34:37.409Z"
    },
    {
      "id": "EVD-0026",
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "decisionId": null,
      "sourceType": "USER_ANSWER",
      "sourceRef": "conversation:break-glass-recovery",
      "summary": "User authorized a narrow CLI recovery patch instead of manual state editing.",
      "confidence": 1,
      "createdAt": "2026-07-15T10:34:37.409Z"
    }
  ],
  "contextItems": [
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
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
      "id": "CTX-0180",
      "createdAt": "2026-07-15T10:33:23.153Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
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
      "id": "CTX-0181",
      "createdAt": "2026-07-15T10:33:23.153Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
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
      "id": "CTX-0182",
      "createdAt": "2026-07-15T10:33:23.153Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "sourceType": "MEMORY",
      "sourceRef": "DEC-0024",
      "summary": "Prior decision: Should 0.6 expose a state-changing MCP confirm operation? — Omit MCP confirm in 0.6 (recommended)",
      "metadata": {
        "type": "decision",
        "kind": "EXPLICIT",
        "reason": "matched by recall result",
        "score": 0.7
      },
      "id": "CTX-0183",
      "createdAt": "2026-07-15T10:33:23.153Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
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
      "id": "CTX-0184",
      "createdAt": "2026-07-15T10:33:23.153Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
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
      "id": "CTX-0185",
      "createdAt": "2026-07-15T10:33:23.153Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
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
      "id": "CTX-0186",
      "createdAt": "2026-07-15T10:33:23.153Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
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
      "id": "CTX-0187",
      "createdAt": "2026-07-15T10:33:23.153Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/v2/doctor.ts",
      "summary": "File evidence: import { readState, setCurrentTaskId, validateDecisionState } from './state.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { readState, setCurrentTaskId, validateDecisionState } from './state.js';",
        "line": 8
      },
      "id": "CTX-0188",
      "createdAt": "2026-07-15T10:33:23.153Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/unit/v2-messages.test.ts",
      "summary": "File evidence: import { renderDoctorResult } from '../../src/ui/v2/render.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { renderDoctorResult } from '../../src/ui/v2/render.js';",
        "line": 4
      },
      "id": "CTX-0189",
      "createdAt": "2026-07-15T10:33:23.153Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/design/mcp-control-plane-0.6-contract.md",
      "summary": "File evidence: - MCP permission prompt나 tool annotation은 승인 증거가 아니다. 0.6 MCP에는 state-changing confirm tool이 없다.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "- MCP permission prompt나 tool annotation은 승인 증거가 아니다. 0.6 MCP에는 state-changing confirm tool이 없다.",
        "line": 15
      },
      "id": "CTX-0190",
      "createdAt": "2026-07-15T10:33:23.153Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "sourceType": "DISCOVERY",
      "sourceRef": "README.ko.md",
      "summary": "File evidence: | `sduck doctor [--repair]`                                   | malformed source, DB-only cache, interrupted journal, stale cache 진단 |",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "| `sduck doctor [--repair]`                                   | malformed source, DB-only cache, interrupted journal, stale cache 진단 |",
        "line": 141
      },
      "id": "CTX-0191",
      "createdAt": "2026-07-15T10:33:23.153Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "sourceType": "DISCOVERY",
      "sourceRef": "README.md",
      "summary": "File evidence: | `sduck doctor [--repair]`                                   | Diagnose malformed source, DB-only cache, interrupted journal, and cache consistency issues. |",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "| `sduck doctor [--repair]`                                   | Diagnose malformed source, DB-only cache, interrupted journal, and cache consistency issues. |",
        "line": 140
      },
      "id": "CTX-0192",
      "createdAt": "2026-07-15T10:33:23.153Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/state.ts",
      "summary": "File evidence: import { getProjectSduckStatePath } from './project-paths.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { getProjectSduckStatePath } from './project-paths.js';",
        "line": 4
      },
      "id": "CTX-0193",
      "createdAt": "2026-07-15T10:33:23.153Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/v2/state.ts",
      "summary": "File evidence: import { statePath } from './paths.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { statePath } from './paths.js';",
        "line": 4
      },
      "id": "CTX-0194",
      "createdAt": "2026-07-15T10:33:23.153Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/ui/v2/messages.ts",
      "summary": "File evidence: doctor: {",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "doctor: {",
        "line": 168
      },
      "id": "CTX-0195",
      "createdAt": "2026-07-15T10:33:23.153Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/unit/decision-workspace.test.ts",
      "summary": "File evidence: import { readState, setCurrentTaskId } from '../../src/core/v2/state.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { readState, setCurrentTaskId } from '../../src/core/v2/state.js';",
        "line": 14
      },
      "id": "CTX-0196",
      "createdAt": "2026-07-15T10:33:23.153Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/design/conversational-workflow.md",
      "summary": "File evidence: - **동시성**: 모든 mutation은 `DecisionWorkspace.mutate()` → `withDecisionWorkspaceLock` 직렬화. 장수명 MCP 프로세스 + CLI 동시 실행 안전. 상태는 매 호출 디스크에서 읽으므로 서버는 stateless.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "- **동시성**: 모든 mutation은 `DecisionWorkspace.mutate()` → `withDecisionWorkspaceLock` 직렬화. 장수명 MCP 프로세스 + CLI 동시 실행 안전. 상태는 매 호출 디스크에서 읽으므로 서버는 stateless.",
        "line": 30
      },
      "id": "CTX-0197",
      "createdAt": "2026-07-15T10:33:23.153Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "sourceType": "DISCOVERY",
      "sourceRef": "docs/migration.md",
      "summary": "File evidence: `.decision/exports/markdown/{tasks,decisions,implementations}/` is the Git-tracked decision source of truth. New v2 installs also track `.decision/policy.json`, which records project policy such as the required grill-me gate. `db.sqlite`, s",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "`.decision/exports/markdown/{tasks,decisions,implementations}/` is the Git-tracked decision source of truth. New v2 installs also track `.decision/policy.json`, which records project policy such as the required grill-me gate. `db.sqlite`, s",
        "line": 5
      },
      "id": "CTX-0198",
      "createdAt": "2026-07-15T10:33:23.153Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/commands/v2/index.ts",
      "summary": "File evidence: import { doctorDecisionWorkspace } from '../../core/v2/doctor.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { doctorDecisionWorkspace } from '../../core/v2/doctor.js';",
        "line": 8
      },
      "id": "CTX-0199",
      "createdAt": "2026-07-15T10:33:23.153Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/core/v2/decision-workspace.ts",
      "summary": "File evidence: statePath,",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "statePath,",
        "line": 13
      },
      "id": "CTX-0200",
      "createdAt": "2026-07-15T10:33:23.154Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "sourceType": "DISCOVERY",
      "sourceRef": "src/ui/v2/render.ts",
      "summary": "File evidence: import type { DoctorResult } from '../../core/v2/doctor.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import type { DoctorResult } from '../../core/v2/doctor.js';",
        "line": 5
      },
      "id": "CTX-0201",
      "createdAt": "2026-07-15T10:33:23.154Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/e2e/v2-locale-cli.test.ts",
      "summary": "File evidence: const doctor = await runCli(['doctor'], { cliRoot, cwd: workspace, env });",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "const doctor = await runCli(['doctor'], { cliRoot, cwd: workspace, env });",
        "line": 282
      },
      "id": "CTX-0202",
      "createdAt": "2026-07-15T10:33:23.154Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "sourceType": "DISCOVERY",
      "sourceRef": "tests/unit/sdd-core-regression.test.ts",
      "summary": "File evidence: import { readCurrentWorkId } from '../../src/core/state.js';",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "import { readCurrentWorkId } from '../../src/core/state.js';",
        "line": 14
      },
      "id": "CTX-0203",
      "createdAt": "2026-07-15T10:33:23.154Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "sourceType": "DISCOVERY",
      "sourceRef": ".backup/AGENT.md",
      "summary": "File evidence: - Respect `meta.yml` state transitions and update step completion immediately.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "- Respect `meta.yml` state transitions and update step completion immediately.",
        "line": 96
      },
      "id": "CTX-0204",
      "createdAt": "2026-07-15T10:33:23.154Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "sourceType": "DISCOVERY",
      "sourceRef": ".backup/CLAUDE.md",
      "summary": "File evidence: - Respect `meta.yml` state transitions and update step completion immediately.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "- Respect `meta.yml` state transitions and update step completion immediately.",
        "line": 18
      },
      "id": "CTX-0205",
      "createdAt": "2026-07-15T10:33:23.154Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "sourceType": "DISCOVERY",
      "sourceRef": ".gitignore",
      "summary": "File evidence: .sduck/sduck-state.yml",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": ".sduck/sduck-state.yml",
        "line": 10
      },
      "id": "CTX-0206",
      "createdAt": "2026-07-15T10:33:23.154Z"
    },
    {
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "sourceType": "DISCOVERY",
      "sourceRef": "AGENTS.md",
      "summary": "File evidence: - Use the CLI for lifecycle changes; do not hand-edit state or cache files.",
      "metadata": {
        "reason": "weak substring fallback",
        "score": 0.3,
        "attached": false,
        "excerpt": "- Use the CLI for lifecycle changes; do not hand-edit state or cache files.",
        "line": 12
      },
      "id": "CTX-0207",
      "createdAt": "2026-07-15T10:33:23.154Z"
    }
  ],
  "briefSnapshots": [
    {
      "id": "BRF-0007",
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "snapshot": {
        "task": {
          "id": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
          "title": "Harden doctor state recovery diagnostics",
          "description": "Harden doctor state recovery diagnostics",
          "status": "CONFIRMED",
          "expectedScope": [
            "doctor diagnostics and safe terminal-pointer repair",
            "localized doctor messages",
            "unit regression tests",
            "documentation if command behavior needs disclosure"
          ],
          "avoidScope": [
            "canonical source changes",
            "cache rewrites",
            "Phase 1 source-envelope implementation",
            "automatic repair of non-terminal invalid state"
          ],
          "createdAt": "2026-07-15T10:33:23.065Z",
          "updatedAt": "2026-07-15T10:39:24.692Z"
        },
        "decisions": {
          "EXPLICIT": [
            {
              "id": "DEC-0030",
              "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
              "title": "Record the break-glass recovery as a normal traced fix",
              "kind": "EXPLICIT",
              "status": "CONFIRMED",
              "confidence": 1,
              "summary": "The stale terminal-pointer recovery and its diagnostics are completed under this separately confirmed task with source/test trace coverage.",
              "rationale": [
                "The initial emergency patch was authorized before a new task could be created and was absent from Phase 0 trace."
              ],
              "appliesTo": [
                "doctor recovery implementation trace"
              ],
              "avoids": [
                "folding production recovery behavior into Phase 0 fixture trace"
              ],
              "sourceRefs": [
                ".slim/deepwork/sduck-coding-agent.md"
              ],
              "createdAt": "2026-07-15T10:34:37.409Z",
              "updatedAt": "2026-07-15T10:39:24.692Z"
            }
          ],
          "INFERRED": [
            {
              "id": "DEC-0029",
              "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
              "title": "Diagnose every invalid state pointer without over-repairing",
              "kind": "INFERRED",
              "status": "CONFIRMED",
              "confidence": 0.7,
              "summary": "doctor validates state against canonical source and reports terminal, missing, and malformed current-task state as non-healthy; --repair clears only a revalidated terminal pointer and leaves every other invalid state untouched.",
              "rationale": [
                "The current recovery test proves non-terminal/missing/malformed state is not cleared but doctor can incorrectly report it healthy.",
                "Recovery must remain narrowly safe while diagnosis is complete."
              ],
              "appliesTo": [
                "src/core/v2/doctor.ts",
                "src/ui/v2/messages.ts",
                "tests/unit/decision-workspace.test.ts",
                "tests/unit/v2-messages.test.ts"
              ],
              "avoids": [
                "repairing missing task IDs",
                "repairing malformed JSON",
                "rewriting canonical source or cache"
              ],
              "sourceRefs": [
                "src/core/v2/doctor.ts",
                "src/core/v2/state.ts"
              ],
              "createdAt": "2026-07-15T10:34:37.409Z",
              "updatedAt": "2026-07-15T10:39:24.692Z"
            }
          ],
          "CARRIED": [],
          "CONFLICT": [],
          "OPEN": []
        },
        "questions": [],
        "evidence": [
          {
            "id": "EVD-0024",
            "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
            "decisionId": null,
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/state.ts",
            "summary": "State validation distinguishes terminal, missing-task, and malformed state conditions.",
            "confidence": 0.95,
            "createdAt": "2026-07-15T10:34:37.409Z"
          },
          {
            "id": "EVD-0025",
            "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
            "decisionId": null,
            "sourceType": "CODE",
            "sourceRef": "src/core/v2/doctor.ts",
            "summary": "Current doctor detects only terminal pointers and otherwise may return healthy after invalid state validation errors.",
            "confidence": 0.95,
            "createdAt": "2026-07-15T10:34:37.409Z"
          },
          {
            "id": "EVD-0026",
            "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
            "decisionId": null,
            "sourceType": "USER_ANSWER",
            "sourceRef": "conversation:break-glass-recovery",
            "summary": "User authorized a narrow CLI recovery patch instead of manual state editing.",
            "confidence": 1,
            "createdAt": "2026-07-15T10:34:37.409Z"
          }
        ],
        "expectedScope": [
          "doctor diagnostics and safe terminal-pointer repair",
          "localized doctor messages",
          "unit regression tests",
          "documentation if command behavior needs disclosure"
        ],
        "avoidScope": [
          "canonical source changes",
          "cache rewrites",
          "Phase 1 source-envelope implementation",
          "automatic repair of non-terminal invalid state"
        ],
        "openQuestionCount": 0
      },
      "renderedMarkdown": "────────────────────────────────────────\nImplementation Brief\n────────────────────────────────────────\nTask: TASK-20260715-harden-doctor-state-recovery-diagnostics\nHarden doctor state recovery diagnostics\n\nA. Explicit decisions\n[EXPLICIT] DEC-0030. Record the break-glass recovery as a normal traced fix\nConfidence: 1.00\nSummary: The stale terminal-pointer recovery and its diagnostics are completed under this separately confirmed task with source/test trace coverage.\nSource refs:\n  - .slim/deepwork/sduck-coding-agent.md\nRationale:\n  - The initial emergency patch was authorized before a new task could be created and was absent from Phase 0 trace.\nApplies to:\n  - doctor recovery implementation trace\nAvoids:\n  - folding production recovery behavior into Phase 0 fixture trace\n\nB. Inferred decisions\n[INFERRED] DEC-0029. Diagnose every invalid state pointer without over-repairing\nConfidence: 0.70\nSummary: doctor validates state against canonical source and reports terminal, missing, and malformed current-task state as non-healthy; --repair clears only a revalidated terminal pointer and leaves every other invalid state untouched.\nSource refs:\n  - src/core/v2/doctor.ts\n  - src/core/v2/state.ts\nRationale:\n  - The current recovery test proves non-terminal/missing/malformed state is not cleared but doctor can incorrectly report it healthy.\n  - Recovery must remain narrowly safe while diagnosis is complete.\nApplies to:\n  - src/core/v2/doctor.ts\n  - src/ui/v2/messages.ts\n  - tests/unit/decision-workspace.test.ts\n  - tests/unit/v2-messages.test.ts\nAvoids:\n  - repairing missing task IDs\n  - repairing malformed JSON\n  - rewriting canonical source or cache\n\nC. Carried decisions\n  - none\n\nD. Conflicts\n  - none\n\nE. Open decisions\n  - none\n\nScope expected:\n  - doctor diagnostics and safe terminal-pointer repair\n  - localized doctor messages\n  - unit regression tests\n  - documentation if command behavior needs disclosure\nScope avoided:\n  - canonical source changes\n  - cache rewrites\n  - Phase 1 source-envelope implementation\n  - automatic repair of non-terminal invalid state\nOpen questions: 0\nEvidence:\n  - [CODE] src/core/v2/state.ts (0.95): State validation distinguishes terminal, missing-task, and malformed state conditions.\n  - [CODE] src/core/v2/doctor.ts (0.95): Current doctor detects only terminal pointers and otherwise may return healthy after invalid state validation errors.\n  - [USER_ANSWER] conversation:break-glass-recovery (1): User authorized a narrow CLI recovery patch instead of manual state editing.\n────────────────────────────────────────",
      "gitBaseline": {
        "head": "4fb70744ee432a5801242673de38551bf9109826",
        "dirtyFileHashes": {
          ".ignore": "d848d497c18118c6142a789e167a989adbc2c2227e371b0164480a6206bab443",
          ".prettierignore": "c0efdf6a8bebcb6f2d5f390eadaad516b16239b1b83914f3005b9efe3f6f0a94",
          "docs/design/conversational-workflow.md": "39393af5444abee5a4146ba56421ec6c39c69856654ec1fd5b5ecae9f81e5809",
          "docs/design/mcp-control-plane-0.6-contract.md": "54e436b84bcfffcc61c7639e758e40023431f602f09f3bb6dd78e5902a6dfad1",
          "src/core/v2/doctor.ts": "79ea253f2ac42fc1c932b2c6a41fb787934e5df8081cb98fa5124c6e5bb828d9",
          "src/ui/v2/messages.ts": "10d0fcc3b0e123b57fca81a8527d62547280b74a04850b9b587039d455436517",
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
          "tests/unit/decision-workspace.test.ts": "090255f9a6da0ba5a5248a366832eaf128ffbc0cd7cc8c1284d8c32ca8d098f6",
          "tests/unit/v2-contract-fixtures.test.ts": "af9b602764822d89578de375ef3c50c86c38a24d20f6c7502ef212a743e396de",
          "tests/unit/v2-messages.test.ts": "b31bd9e664b7e68414daca43b52e2e4736df14ec02815b7a553ebd2bfb1491d2"
        }
      },
      "createdAt": "2026-07-15T10:39:24.753Z"
    }
  ],
  "events": [
    {
      "id": "EVT-0104",
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "type": "TASK_CREATED",
      "payload": {
        "description": "Harden doctor state recovery diagnostics",
        "policy": {
          "grillMeRequired": false
        }
      },
      "createdAt": "2026-07-15T10:33:23.065Z"
    },
    {
      "id": "EVT-0105",
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "type": "CONTEXT_INDEXED",
      "payload": {
        "itemCount": 28
      },
      "createdAt": "2026-07-15T10:33:23.154Z"
    },
    {
      "id": "EVT-0106",
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
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
      "createdAt": "2026-07-15T10:33:23.976Z"
    },
    {
      "id": "EVT-0107",
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0029"
      },
      "createdAt": "2026-07-15T10:34:37.410Z"
    },
    {
      "id": "EVT-0108",
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "type": "DECISION_CREATED",
      "payload": {
        "decisionId": "DEC-0030"
      },
      "createdAt": "2026-07-15T10:34:37.410Z"
    },
    {
      "id": "EVT-0109",
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "type": "DRAFT_SUBMITTED",
      "payload": {
        "decisions": 2,
        "questions": 0,
        "evidence": 3,
        "expectedScope": [
          "doctor diagnostics and safe terminal-pointer repair",
          "localized doctor messages",
          "unit regression tests",
          "documentation if command behavior needs disclosure"
        ],
        "avoidScope": [
          "canonical source changes",
          "cache rewrites",
          "Phase 1 source-envelope implementation",
          "automatic repair of non-terminal invalid state"
        ]
      },
      "createdAt": "2026-07-15T10:34:37.410Z"
    },
    {
      "id": "EVT-0110",
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "type": "BRIEF_CONFIRMED",
      "payload": {
        "snapshotId": "BRF-0007"
      },
      "createdAt": "2026-07-15T10:39:24.753Z"
    },
    {
      "id": "EVT-0111",
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "type": "TRACE_CREATED",
      "payload": {
        "traceId": "IMPL-0010",
        "filesChanged": [
          "src/core/v2/doctor.ts",
          "src/ui/v2/messages.ts",
          "tests/unit/decision-workspace.test.ts",
          "tests/unit/v2-messages.test.ts"
        ]
      },
      "createdAt": "2026-07-15T10:44:15.722Z"
    },
    {
      "id": "EVT-0112",
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "type": "EXPORT_WRITTEN",
      "payload": {
        "created": [
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260714-organize-the-complete-workflow-and-update-the-re.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260714-require-a-grill-me-gate-before-new-work-for-all-.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-bump-the-release-version-and-restore-ci-coverage.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-correct-phase-0-contract-fixtures-and-trace.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-design-a-repository-scoped-coding-agent-runtime.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-harden-doctor-state-recovery-diagnostics.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-implement-the-0-6-mcp-control-plane.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/markdown/tasks/TASK-20260715-isolate-nested-git-fixture-tests-from-pre-commit.md",
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
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/DECISION_REPORT.md",
          "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.decision/exports/graphify/decision-graph.json"
        ]
      },
      "createdAt": "2026-07-15T10:44:16.030Z"
    },
    {
      "id": "EVT-0113",
      "taskId": "TASK-20260715-harden-doctor-state-recovery-diagnostics",
      "type": "TASK_CLOSED",
      "payload": {},
      "createdAt": "2026-07-15T10:45:37.785Z"
    }
  ]
}
```
